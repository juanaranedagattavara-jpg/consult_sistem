import { query } from "./_generated/server";
import { getCurrentProfile } from "./lib/auth";

export const getStats = query({
  handler: async (ctx) => {
    const profile = await getCurrentProfile(ctx);
    if (!profile) return null;

    // Phase 1: placeholder stats
    // Real calculations will be added in Phase 3
    return {
      appointmentsToday: 0,
      appointmentsWeek: 0,
      confirmationRate: 0,
      hoursRecovered: 0,
    };
  },
});
