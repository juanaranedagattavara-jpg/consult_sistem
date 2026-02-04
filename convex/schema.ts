import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clinics: defineTable({
    // Basic info
    name: v.string(),
    slug: v.string(),
    taxId: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    timezone: v.string(),

    // Branding
    logo: v.optional(v.id("_storage")),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
    }),

    // Schedule
    hours: v.object({
      open: v.string(),
      close: v.string(),
      lunch: v.optional(
        v.object({
          start: v.string(),
          end: v.string(),
        })
      ),
    }),
    workDays: v.array(v.number()), // 0-6, Sunday = 0
    defaultSlotDuration: v.number(), // minutes

    // Bot configuration
    botConfig: v.object({
      tone: v.string(), // e.g., "formal", "friendly", "professional"
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

    // Timing configuration
    timing: v.object({
      confirmationHours: v.number(), // hours before to send confirmation
      reminderHours: v.number(), // hours before to send reminder
      retries: v.number(), // number of retry attempts
      waitlistTimeout: v.number(), // minutes to wait for response
    }),

    // Waitlist configuration
    waitlistConfig: v.object({
      priorityWeights: v.object({
        urgency: v.number(),
        history: v.number(),
        waitTime: v.number(),
        fifo: v.number(),
      }),
      notificationMethod: v.union(v.literal("sequential"), v.literal("broadcast")),
      broadcastLimit: v.number(), // max patients to notify at once
      responseTimeout: v.number(), // minutes to respond
      urgentTimeout: v.number(), // minutes for urgent cases
      onReject: v.union(v.literal("next"), v.literal("end")),
    }),

    // Custom fields for patient intake
    customPatientFields: v.array(
      v.object({
        name: v.string(),
        type: v.union(v.literal("text"), v.literal("number"), v.literal("date"), v.literal("select")),
        required: v.boolean(),
        options: v.optional(v.array(v.string())), // for select type
      })
    ),

    // Status
    onboardingCompleted: v.boolean(),
    active: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_email", ["email"]),

  users: defineTable({
    // Basic info
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),

    // Clinic association
    clinicId: v.id("clinics"),

    // Profile
    avatar: v.optional(v.id("_storage")),

    // Status
    active: v.boolean(),
    lastLogin: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clinic", ["clinicId"]),
});
