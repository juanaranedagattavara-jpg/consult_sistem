import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Find profile by userId (not email, since email is not in JWT)
    const userId = identity.subject.split("|")[0];
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId as Id<"users">))
      .first();

    if (!profile) return null;

    // For Phase 1, return placeholder stats
    // These will be calculated from real data in Phase 3
    return {
      appointmentsToday: 0,
      appointmentsWeek: 0,
      confirmationRate: 0,
      hoursRecovered: 0,
    };
  },
});
