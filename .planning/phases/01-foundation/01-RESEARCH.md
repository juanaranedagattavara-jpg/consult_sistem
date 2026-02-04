# Phase 1: Foundation - Research Document

## Overview

This document contains research findings for implementing the foundation phase of the clinic management SaaS, including authentication, authorization, and clinic configuration.

**Stack:** Next.js 15 (App Router) + Convex + shadcn/ui + Tailwind CSS

---

## 1. Convex Authentication with Email/Password

### Key Findings

Convex Auth is an official library (`@convex-dev/auth`) that runs directly on Convex deployments. It supports:
- Password authentication with Scrypt hashing
- Email verification (OTP or magic links)
- Password reset flows
- OAuth providers (GitHub, Google, Apple)

### Code Pattern: Basic Password Setup

```typescript
// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
```

### Code Pattern: Password with Custom Validation

```typescript
// convex/CustomPassword.ts
import { ConvexError } from "convex/values";
import { Password } from "@convex-dev/auth/providers/Password";

export default Password({
  validatePasswordRequirements: (password: string) => {
    if (
      password.length < 8 ||
      !/\d/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password)
    ) {
      throw new ConvexError("Password must be at least 8 characters with uppercase, lowercase, and number.");
    }
  },
});
```

### Dependencies Required

```bash
npm install @convex-dev/auth resend @oslojs/crypto
```

### Gotchas

1. **No UI Components**: Convex Auth doesn't provide UI - you must build forms yourself
2. **Beta Status**: Library may change in backward-incompatible ways
3. **Email Provider Required**: For verification/reset, you need Resend, SendGrid, etc.
4. **Domain Verification**: Before verifying email domain with provider, emails may go to spam

### Documentation

- [Convex Auth Main Docs](https://labs.convex.dev/auth)
- [Password Provider Config](https://labs.convex.dev/auth/config/passwords)
- [Convex Auth API Reference](https://labs.convex.dev/auth/api_reference/providers/Password)

---

## 2. Email Verification Implementation

### Key Findings

Email verification in Convex Auth uses the `verify` option on the Password provider. It sends an OTP (6-8 digits) via email and validates before completing sign-up.

### Code Pattern: OTP Email Provider with Resend

```typescript
// convex/ResendOTP.ts
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    const length = 6; // 6-digit code as per requirements
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "ClinicApp <noreply@yourapp.com>",
      to: [email],
      subject: "Verify your email - ClinicApp",
      text: `Your verification code is: ${token}`,
      html: `<p>Your verification code is: <strong>${token}</strong></p>`,
    });
    if (error) {
      throw new Error("Could not send verification email");
    }
  },
});
```

### Code Pattern: Password with Email Verification

```typescript
// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ verify: ResendOTP })],
});
```

### Code Pattern: Client-Side Verification Flow

```tsx
// components/auth/SignUpForm.tsx
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | { email: string }>("signUp");

  if (step === "signUp") {
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        signIn("password", formData).then(() =>
          setStep({ email: formData.get("email") as string })
        );
      }}>
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <input name="flow" value="signUp" type="hidden" />
        <button type="submit">Sign Up</button>
      </form>
    );
  }

  // Verification step
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      signIn("password", formData);
    }}>
      <p>Enter the 6-digit code sent to {step.email}</p>
      <input name="code" placeholder="000000" maxLength={6} required />
      <input name="flow" type="hidden" value="email-verification" />
      <input name="email" value={step.email} type="hidden" />
      <button type="submit">Verify</button>
    </form>
  );
}
```

### Gotchas

1. **Trust Levels**: Password accounts without email verification are "untrusted" and can't link with OAuth accounts
2. **Token Security**: Convex Auth automatically validates that the email matches the original sign-in attempt
3. **Resend Free Tier**: Limited to 100 emails/day - consider for dev/testing

### Documentation

- [Email Verification Config](https://labs.convex.dev/auth/config/passwords#email-verification)
- [Magic Links Reference](https://labs.convex.dev/auth/config/email)

---

## 3. Invitation System for Staff

### Key Findings

Staff invitation should use a combination of:
1. Admin creates invitation record with email and role
2. System sends email with unique token/link
3. Staff clicks link, completes registration with preset role

### Code Pattern: Invitation Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  invitations: defineTable({
    clinicId: v.id("clinics"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
    token: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired")
    ),
    expiresAt: v.number(),
    invitedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_clinic_status", ["clinicId", "status"]),
});
```

### Code Pattern: Create Invitation Mutation

```typescript
// convex/invitations.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

export const createInvitation = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
    clinicId: v.id("clinics"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify user is admin of this clinic
    const membership = await ctx.db
      .query("clinicMemberships")
      .withIndex("by_clinic_user", (q) =>
        q.eq("clinicId", args.clinicId).eq("userId", identity.subject)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can invite staff");
    }

    const token = nanoid(32);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const invitationId = await ctx.db.insert("invitations", {
      ...args,
      token,
      status: "pending",
      expiresAt,
      invitedBy: identity.subject as Id<"users">,
      createdAt: Date.now(),
    });

    // Trigger email sending via action
    await ctx.scheduler.runAfter(0, internal.emails.sendInvitation, {
      invitationId,
      email: args.email,
      token,
    });

    return invitationId;
  },
});
```

### Code Pattern: Accept Invitation

```typescript
// convex/invitations.ts
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) throw new Error("Invalid invitation");
    if (invitation.status !== "pending") throw new Error("Invitation already used");
    if (invitation.expiresAt < Date.now()) throw new Error("Invitation expired");

    // Create clinic membership
    await ctx.db.insert("clinicMemberships", {
      clinicId: invitation.clinicId,
      userId: args.userId,
      role: invitation.role,
      status: "active",
      joinedAt: Date.now(),
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, { status: "accepted" });

    return invitation.clinicId;
  },
});
```

### Gotchas

1. **Token Security**: Use cryptographically secure random tokens (nanoid, crypto.randomUUID)
2. **Expiration**: Always set and enforce expiration on invitations
3. **Email Validation**: Ensure invited email matches the email used during signup
4. **Rate Limiting**: Consider limiting invitations per clinic to prevent abuse

### Documentation

- [Convex Authorization Guide](https://stack.convex.dev/authorization)
- [Custom User Creation](https://labs.convex.dev/auth/advanced)

---

## 4. Multi-Tenant Schema Structure

### Key Findings

For multi-tenant SaaS in Convex, the recommended pattern is **shared database with tenant isolation via `clinicId`** field. This provides:
- Cost efficiency (single database)
- Easy querying with indexes
- Real-time subscriptions work naturally
- Row-level security through function logic

### Code Pattern: Complete Multi-Tenant Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Reusable validators
const roleValidator = v.union(v.literal("admin"), v.literal("staff"));
const membershipStatusValidator = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("invited")
);

export default defineSchema({
  // Users - global, not tenant-specific
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    emailVerified: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Clinics (Tenants)
  clinics: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    timezone: v.string(),
    createdAt: v.number(),
    createdBy: v.id("users"),
  }),

  // Clinic Memberships (User-Tenant relationship)
  clinicMemberships: defineTable({
    clinicId: v.id("clinics"),
    userId: v.id("users"),
    role: roleValidator,
    status: membershipStatusValidator,
    joinedAt: v.number(),
  })
    .index("by_clinic", ["clinicId"])
    .index("by_user", ["userId"])
    .index("by_clinic_user", ["clinicId", "userId"])
    .index("by_clinic_role", ["clinicId", "role"]),

  // Clinic Settings - Bot Configuration
  clinicBotSettings: defineTable({
    clinicId: v.id("clinics"),
    enabled: v.boolean(),
    welcomeMessage: v.optional(v.string()),
    autoResponseEnabled: v.boolean(),
    businessHoursOnly: v.boolean(),
    language: v.string(),
  }).index("by_clinic", ["clinicId"]),

  // Clinic Settings - Time Configuration
  clinicTimeSettings: defineTable({
    clinicId: v.id("clinics"),
    defaultAppointmentDuration: v.number(), // minutes
    bufferBetweenAppointments: v.number(), // minutes
    workingHours: v.object({
      monday: v.optional(v.object({ start: v.string(), end: v.string() })),
      tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
      wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
      thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
      friday: v.optional(v.object({ start: v.string(), end: v.string() })),
      saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
      sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
    }),
    reminderTimes: v.array(v.number()), // minutes before appointment
  }).index("by_clinic", ["clinicId"]),

  // Clinic Settings - Configurable Patient Fields
  clinicPatientFields: defineTable({
    clinicId: v.id("clinics"),
    fields: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("date"),
          v.literal("select"),
          v.literal("multiselect"),
          v.literal("boolean")
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())), // for select/multiselect
        order: v.number(),
        enabled: v.boolean(),
      })
    ),
  }).index("by_clinic", ["clinicId"]),

  // Invitations
  invitations: defineTable({
    clinicId: v.id("clinics"),
    email: v.string(),
    role: roleValidator,
    token: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired")
    ),
    expiresAt: v.number(),
    invitedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_clinic_status", ["clinicId", "status"]),
});
```

### Code Pattern: Tenant-Aware Query Helper

```typescript
// convex/lib/tenantHelpers.ts
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function ensureClinicAccess(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  clinicId: Id<"clinics">,
  requiredRole?: "admin" | "staff"
) {
  const membership = await ctx.db
    .query("clinicMemberships")
    .withIndex("by_clinic_user", (q) =>
      q.eq("clinicId", clinicId).eq("userId", userId)
    )
    .unique();

  if (!membership || membership.status !== "active") {
    throw new Error("Access denied: not a member of this clinic");
  }

  if (requiredRole === "admin" && membership.role !== "admin") {
    throw new Error("Access denied: admin role required");
  }

  return membership;
}

export async function getUserClinics(ctx: QueryCtx, userId: Id<"users">) {
  const memberships = await ctx.db
    .query("clinicMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("status"), "active"))
    .collect();

  const clinics = await Promise.all(
    memberships.map(async (m) => {
      const clinic = await ctx.db.get(m.clinicId);
      return clinic ? { ...clinic, role: m.role } : null;
    })
  );

  return clinics.filter(Boolean);
}
```

### Gotchas

1. **Always Filter by clinicId**: Every tenant-specific query MUST include clinicId filter
2. **Indexes Are Critical**: Add composite indexes for clinicId + other fields for performance
3. **Real-time Updates**: Convex queries are subscriptions - permission checks re-run on data changes
4. **No Direct Database Access**: All access goes through functions, making authorization easier

### Documentation

- [Building Multi-Module Backends](https://stack.convex.dev/tables-convex-modules-rest-apis)
- [Convex Schemas](https://docs.convex.dev/database/schemas)

---

## 5. shadcn/ui Components for Auth & Settings

### Key Findings

shadcn/ui provides:
- 5 pre-built login form blocks (login-01 through login-05)
- Tabs component for settings pages
- Form components with React Hook Form + Zod integration
- Card components for form containers

### Recommended Components for This Project

```bash
# Auth forms
npx shadcn@latest add button input label card form
npx shadcn@latest add login-01  # Simple centered login form

# Settings pages
npx shadcn@latest add tabs sheet dialog
npx shadcn@latest add switch checkbox select
npx shadcn@latest add table  # For staff list
npx shadcn@latest add avatar badge  # User display
npx shadcn@latest add toast sonner  # Notifications
```

### Code Pattern: Auth Form with shadcn/ui

```tsx
// components/auth/LoginForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginFormValues) => void }) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your clinic</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@clinic.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Remember me for 30 days
                  </FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

### Code Pattern: Settings Page with Tabs

```tsx
// app/(dashboard)/settings/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicInfoForm } from "@/components/settings/ClinicInfoForm";
import { BotSettingsForm } from "@/components/settings/BotSettingsForm";
import { TimeSettingsForm } from "@/components/settings/TimeSettingsForm";
import { PatientFieldsForm } from "@/components/settings/PatientFieldsForm";
import { StaffManagement } from "@/components/settings/StaffManagement";

export default function SettingsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Clinic Settings</h1>

      <Tabs defaultValue="clinic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="clinic">Clinic Info</TabsTrigger>
          <TabsTrigger value="bot">Bot Config</TabsTrigger>
          <TabsTrigger value="time">Schedule</TabsTrigger>
          <TabsTrigger value="fields">Patient Fields</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="mt-6">
          <ClinicInfoForm />
        </TabsContent>

        <TabsContent value="bot" className="mt-6">
          <BotSettingsForm />
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <TimeSettingsForm />
        </TabsContent>

        <TabsContent value="fields" className="mt-6">
          <PatientFieldsForm />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Gotchas

1. **Form State in Tabs**: Use controlled tabs to preserve form state when switching
2. **Loading States**: Use skeleton components while fetching settings
3. **Optimistic Updates**: shadcn doesn't handle this - use Convex's optimistic updates
4. **Dark Mode**: All components support dark mode via CSS variables

### Documentation

- [shadcn/ui Forms](https://ui.shadcn.com/docs/forms)
- [shadcn/ui Blocks - Login](https://ui.shadcn.com/blocks/login)
- [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/radix/tabs)
- [Better Auth UI](https://better-auth-ui.com/) - Alternative pre-built auth components

---

## 6. Next.js 15 App Router Protected Routes

### Key Findings

For Convex Auth with Next.js, use `convexAuthNextjsMiddleware` for route protection. This runs before page rendering, preventing unauthorized access at the edge.

### Code Pattern: Middleware Setup

```typescript
// middleware.ts
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/invitation/(.*)",
]);

// Routes only for authenticated users
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/patients(.*)",
  "/appointments(.*)",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth") && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/auth/login");
  }
});

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
```

### Code Pattern: Provider Setup

```tsx
// app/providers.tsx
"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
```

### Code Pattern: Layout with Auth Check

```tsx
// app/(dashboard)/layout.tsx
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();

  if (!token) {
    redirect("/auth/login");
  }

  // Preload user data for SSR
  const preloadedUser = await preloadQuery(
    api.users.getCurrentUser,
    {},
    { token }
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header preloadedUser={preloadedUser} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Code Pattern: Session Persistence (Remember Me)

```tsx
// app/providers.tsx
"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider
      client={convex}
      // 30-day session when "Remember Me" is checked
      cookieConfig={{ maxAge: 60 * 60 * 24 * 30 }}
    >
      {children}
    </ConvexAuthNextjsProvider>
  );
}
```

### Code Pattern: Client-Side Auth Hook

```tsx
// components/auth/useAuth.ts
"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
```

### Gotchas

1. **CSRF Protection**: Only use Convex queries (not mutations) in Server Components and GET handlers
2. **Edge Runtime**: Middleware uses Edge runtime - some Node.js APIs unavailable
3. **Token Refresh**: Convex Auth handles refresh automatically via localStorage
4. **Known Issue**: `isAuthenticated()` can return false in middleware even when authenticated - check GitHub issues
5. **Cookie Duration**: Without `cookieConfig`, cookies are session-based (expire on browser close)

### Documentation

- [Convex Auth Next.js Server-Side](https://labs.convex.dev/auth/authz/nextjs)
- [Convex Auth Security](https://labs.convex.dev/auth/security)
- [Next.js Authentication Best Practices](https://nextjs.org/learn/dashboard-app/adding-authentication)

---

## 7. Role-Based Access Control (RBAC)

### Key Findings

Convex recommends tracking roles in a database table (clinicMemberships) rather than in JWTs. This allows:
- Real-time role updates without re-authentication
- Easy role changes via admin UI
- Composite queries for authorization

### Code Pattern: Role Constants and Helpers

```typescript
// convex/lib/roles.ts
export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Role hierarchy for permission checks
const roleHierarchy: Record<Role, number> = {
  staff: 0,
  admin: 1,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
```

### Code Pattern: Authorization Middleware

```typescript
// convex/lib/auth.ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { Role, hasMinimumRole } from "./roles";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return user;
}

export async function requireClinicRole(
  ctx: QueryCtx | MutationCtx,
  clinicId: Id<"clinics">,
  minimumRole: Role
) {
  const user = await requireAuth(ctx);

  const membership = await ctx.db
    .query("clinicMemberships")
    .withIndex("by_clinic_user", (q) =>
      q.eq("clinicId", clinicId).eq("userId", user._id)
    )
    .unique();

  if (!membership || membership.status !== "active") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Not a member of this clinic"
    });
  }

  if (!hasMinimumRole(membership.role as Role, minimumRole)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: `Requires ${minimumRole} role or higher`,
    });
  }

  return { user, membership };
}
```

### Code Pattern: Protected Mutation

```typescript
// convex/clinics.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireClinicRole } from "./lib/auth";
import { ROLES } from "./lib/roles";

export const updateClinicSettings = mutation({
  args: {
    clinicId: v.id("clinics"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only admins can update clinic settings
    await requireClinicRole(ctx, args.clinicId, ROLES.ADMIN);

    const { clinicId, ...updates } = args;

    // Filter out undefined values
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(validUpdates).length > 0) {
      await ctx.db.patch(clinicId, validUpdates);
    }

    return await ctx.db.get(clinicId);
  },
});
```

### Gotchas

1. **Always Check Server-Side**: Never trust client-side role checks alone
2. **Real-time Re-evaluation**: Convex queries re-run when data changes, so permission checks update automatically
3. **Denormalize Carefully**: For performance, consider denormalizing role to frequently-accessed tables
4. **Audit Trail**: Consider logging role changes for compliance

### Documentation

- [Convex Auth Role-Based Permissions Example](https://github.com/get-convex/convex-auth-with-role-based-permissions)
- [Authorization Best Practices](https://stack.convex.dev/authorization)
- [Row Level Security](https://stack.convex.dev/row-level-security)

---

## Summary: Recommended Implementation Order

1. **Set up Convex Auth with Password provider**
   - Configure email verification with 6-digit OTP
   - Set up Resend for email delivery
   - Implement custom password validation

2. **Create multi-tenant schema**
   - Users, clinics, clinicMemberships tables
   - All settings tables with clinicId foreign key
   - Invitations table for staff onboarding

3. **Implement Next.js middleware**
   - Use `convexAuthNextjsMiddleware`
   - Define public vs protected routes
   - Configure 30-day session for "Remember Me"

4. **Build auth UI with shadcn/ui**
   - Sign up form with clinic name
   - Sign in form with "Remember Me"
   - Email verification step
   - Password reset flow

5. **Create RBAC helpers**
   - `requireAuth` and `requireClinicRole` helpers
   - Use in all mutations/queries

6. **Build settings pages**
   - Tabbed interface with shadcn Tabs
   - Forms for each configuration area
   - Staff invitation management

---

## Environment Variables Needed

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment

# Auth
AUTH_RESEND_KEY=re_xxxxx
SITE_URL=http://localhost:3000

# For production
CUSTOM_AUTH_SITE_URL=https://yourapp.com
```

---

## Dependencies to Install

```bash
# Core
npm install convex @convex-dev/auth

# Email
npm install resend @auth/core @oslojs/crypto

# UI
npx shadcn@latest init
npx shadcn@latest add button input label card form tabs checkbox select switch dialog sheet table avatar badge toast

# Forms
npm install react-hook-form @hookform/resolvers zod

# Utilities
npm install nanoid
```
