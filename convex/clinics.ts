import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getClinic = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clinicId);
  },
});

export const updateClinicGeneral = mutation({
  args: {
    clinicId: v.id("clinics"),
    name: v.string(),
    taxId: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { clinicId, ...updates } = args;
    await ctx.db.patch(clinicId, { ...updates, updatedAt: Date.now() });
  },
});

export const updateClinicBot = mutation({
  args: {
    clinicId: v.id("clinics"),
    botConfig: v.object({
      tone: v.string(),
      customPrompts: v.optional(v.array(v.string())),
      faqs: v.optional(
        v.array(
          v.object({
            question: v.string(),
            answer: v.string(),
          })
        )
      ),
      welcomeMessage: v.string(),
      afterHoursMessage: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clinicId, {
      botConfig: args.botConfig,
      updatedAt: Date.now(),
    });
  },
});

export const updateClinicTiming = mutation({
  args: {
    clinicId: v.id("clinics"),
    timing: v.object({
      confirmationHours: v.number(),
      reminderHours: v.number(),
      retries: v.number(),
      waitlistTimeout: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clinicId, {
      timing: args.timing,
      updatedAt: Date.now(),
    });
  },
});

export const updateClinicAppearance = mutation({
  args: {
    clinicId: v.id("clinics"),
    logo: v.optional(v.id("_storage")),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { clinicId, ...updates } = args;
    await ctx.db.patch(clinicId, { ...updates, updatedAt: Date.now() });
  },
});

export const createClinicDraft = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const clinicId = await ctx.db.insert("clinics", {
      name: args.name,
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
        afterHoursMessage: "Estamos fuera de horario. Te contactaremos pronto.",
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
    return clinicId;
  },
});
