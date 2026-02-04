import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return null;

    const clinic = await ctx.db.get(user.clinicId);

    return {
      ...user,
      clinic,
    };
  },
});

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Email ya registrado");
    }

    // Create clinic draft
    const clinicId = await ctx.db.insert("clinics", {
      name: `Clinica de ${args.name}`,
      slug: args.name.toLowerCase().replace(/\s+/g, "-"),
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

    // Create user (password hashing handled by Convex Auth)
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.password, // Convex Auth will hash this
      name: args.name,
      role: "admin",
      clinicId,
      active: true,
      createdAt: Date.now(),
    });

    return { userId, clinicId };
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    await ctx.db.patch(user._id, {
      name: args.name,
      avatar: args.avatar,
    });
  },
});
