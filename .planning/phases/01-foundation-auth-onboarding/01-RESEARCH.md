# Phase 01 Research: Foundation + Auth + Onboarding

## Research Question
What do I need to know to implement authentication, onboarding wizard, dashboard, and white label theming with Convex?

---

## 1. Convex Auth

### Setup
- Use `@convex-dev/auth` package with Password provider
- bcrypt hashing built-in (salt factor 10)
- Session management automatic

### Implementation Pattern
```typescript
// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
});
```

### Key Features
- Email/password out of the box
- Password reset via email supported
- Email verification optional
- No MFA/SSO support (acceptable for v1)

### Sources
- https://docs.convex.dev/auth/convex-auth
- https://labs.convex.dev/auth/config/passwords

---

## 2. Onboarding Wizard Pattern

### Stack
- React Hook Form for form state
- Zustand for wizard state persistence
- Zod for validation schemas
- shadcn/ui for UI components

### State Management
```typescript
// lib/stores/onboarding-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStore {
  currentStep: number;
  data: {
    account: AccountData | null;
    clinic: ClinicData | null;
    branding: BrandingData | null;
    schedule: ScheduleData | null;
    setup: SetupData | null;
  };
  setStep: (step: number) => void;
  setStepData: (step: string, data: any) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: { account: null, clinic: null, branding: null, schedule: null, setup: null },
      setStep: (step) => set({ currentStep: step }),
      setStepData: (step, data) => set((state) => ({
        data: { ...state.data, [step]: data }
      })),
      reset: () => set({ currentStep: 1, data: { account: null, clinic: null, branding: null, schedule: null, setup: null } }),
    }),
    { name: 'onboarding-storage' }
  )
);
```

### Validation Per Step
- Each step has its own Zod schema
- Validate before allowing navigation to next step
- zodResolver with React Hook Form

### Sources
- https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps

---

## 3. White Label / Theming

### CSS Variables Approach
```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 9% 46%;
}
```

### Dynamic Injection
```typescript
// Apply clinic colors dynamically
function applyTheme(colors: { primary: string; secondary: string }) {
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
}
```

### Dark Mode
- Use `next-themes` ThemeProvider
- System preference detection
- Toggle component in settings

### Sources
- https://ui.shadcn.com/docs/theming

---

## 4. Convex File Storage

### Upload Flow
1. Client calls mutation to get upload URL
2. Client POSTs file to URL
3. Client saves returned storageId

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

### Client Upload
```typescript
const uploadUrl = await generateUploadUrl();
const result = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": file.type },
  body: file,
});
const { storageId } = await result.json();
```

### Serving Files
```typescript
const url = await ctx.storage.getUrl(storageId);
```

### Limits
- Upload URL expires after 1 hour
- No file size limit
- Upload timeout 2 minutes

### Sources
- https://docs.convex.dev/file-storage/upload-files

---

## 5. Architecture Decisions

### File Structure (Fase 1)
```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (dashboard)/dashboard/page.tsx
│   ├── (dashboard)/settings/[...]/page.tsx
│   ├── onboarding/page.tsx
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── onboarding/
│   ├── dashboard/
│   ├── settings/
│   └── ui/
├── lib/
│   ├── stores/
│   └── validators/
├── hooks/
└── convex/
    ├── schema.ts
    ├── auth.ts
    ├── users.ts
    ├── clinics.ts
    └── dashboard.ts
```

### Schema Design
- `clinics` table: all clinic config including botConfig, timing, colors
- `users` table: linked to clinic via clinicId
- Indexes on email and slug for fast lookups

### UI Patterns
- Desktop: horizontal navigation (tabs/header)
- Mobile: hamburger menu
- Toast notifications with Sonner
- Forms with React Hook Form + Zod

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Convex Auth complexity | Use official docs patterns exactly |
| Onboarding state loss | Zustand persist to localStorage |
| Theme flashing | next-themes handles SSR properly |
| Large file uploads | Validate client-side before upload |

---

## RESEARCH COMPLETE
