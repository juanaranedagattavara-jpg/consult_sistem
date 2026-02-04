import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentProfile, requireAuth, requireProfile } from "./lib/auth";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const profile = await getCurrentProfile(ctx);
    if (!profile) return null;

    const clinic = await ctx.db.get(profile.clinicId);
    return { ...profile, clinic };
  },
});

export const createClinicForUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if profile already exists (prevent duplicates)
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { profileId: existing._id, clinicId: existing.clinicId };
    }

    // Find auth account by email (providerAccountId for password provider)
    const authAccount = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("providerAccountId"), args.email))
      .first();

    if (!authAccount) {
      throw new Error("Usuario de autenticación no encontrado. Intenta de nuevo.");
    }

    const authUser = await ctx.db.get(authAccount.userId);
    if (!authUser) {
      throw new Error("Usuario no encontrado.");
    }

    // Create clinic with defaults
    const clinicId = await ctx.db.insert("clinics", {
      name: `Clinica de ${args.name}`,
      slug: `${args.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      taxId: "",
      address: "",
      phone: "",
      email: args.email,
      timezone: "America/Santiago",
      colors: { primary: "#2563eb", secondary: "#64748b" },
      hours: { open: "09:00", close: "18:00" },
      workDays: [1, 2, 3, 4, 5],
      defaultSlotDuration: 30,
      botConfig: {
        tone: "amigable",
        customPrompts: [],
        faqs: [],
        welcomeMessage: "Hola! Soy el asistente de la clinica.",
        afterHoursMessage: "Estamos fuera de horario.",
      },
      timing: {
        confirmationHours: 24,
        reminderHours: 2,
        retries: 3,
        waitlistTimeout: 30,
      },
      waitlistConfig: {
        priorityWeights: { urgency: 30, history: 25, waitTime: 25, fifo: 20 },
        notificationMethod: "sequential",
        broadcastLimit: 3,
        responseTimeout: 30,
        urgentTimeout: 15,
        onReject: "next",
      },
      customPatientFields: [],
      onboardingCompleted: false,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create profile linked to auth user and clinic
    const profileId = await ctx.db.insert("profiles", {
      userId: authUser._id,
      email: args.email,
      name: args.name,
      role: "admin",
      clinicId,
      active: true,
      createdAt: Date.now(),
    });

    return { profileId, clinicId };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const profile = await requireProfile(ctx);

    await ctx.db.patch(profile._id, {
      name: args.name,
      avatar: args.avatar,
    });
  },
});
