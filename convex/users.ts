import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Extract userId from subject (format: "userId|sessionId")
    const userId = identity.subject.split("|")[0];

    // Get profile by userId (not email, since email is not in JWT)
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId as Id<"users">))
      .first();

    if (!profile) return null;

    const clinic = await ctx.db.get(profile.clinicId);

    return {
      ...profile,
      clinic,
    };
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
      // Profile already exists, return existing IDs
      return { profileId: existing._id, clinicId: existing.clinicId };
    }

    // Get the Convex Auth user ID from authAccounts table
    // The email is stored as providerAccountId for password provider
    const authAccounts = await ctx.db.query("authAccounts").collect();
    console.log("authAccounts found:", authAccounts.length);
    console.log("Looking for email:", args.email);
    console.log("authAccounts data:", JSON.stringify(authAccounts.map((a: Record<string, unknown>) => ({
      id: a._id,
      providerAccountId: a.providerAccountId,
      provider: a.provider
    }))));

    const authAccount = authAccounts.find(
      (a: { providerAccountId?: string }) => a.providerAccountId === args.email
    );

    if (!authAccount) {
      // User might not be created yet, throw retryable error
      throw new Error(`Usuario de autenticación no encontrado. Email buscado: ${args.email}. Cuentas disponibles: ${authAccounts.length}`);
    }

    // Get the user record linked to this auth account
    const authUser = await ctx.db.get(authAccount.userId);
    if (!authUser) {
      throw new Error("Usuario no encontrado en la base de datos.");
    }

    // Create clinic draft
    const clinicId = await ctx.db.insert("clinics", {
      name: `Clinica de ${args.name}`,
      slug: args.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const userId = identity.subject.split("|")[0];
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId as Id<"users">))
      .first();

    if (!profile) throw new Error("Perfil no encontrado");

    await ctx.db.patch(profile._id, {
      name: args.name,
      avatar: args.avatar,
    });
  },
});
