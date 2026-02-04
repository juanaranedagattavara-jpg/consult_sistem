import { Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Extract userId from Convex Auth identity subject
 * Format: "userId|sessionId"
 */
export function getUserIdFromIdentity(identity: { subject: string }): Id<"users"> {
  return identity.subject.split("|")[0] as Id<"users">;
}

/**
 * Get current user's profile with clinic data
 */
export async function getCurrentProfile(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const userId = getUserIdFromIdentity(identity);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  return profile;
}

/**
 * Get current user's profile or throw if not found
 */
export async function requireProfile(ctx: QueryCtx | MutationCtx) {
  const profile = await getCurrentProfile(ctx);
  if (!profile) throw new Error("Perfil no encontrado");
  return profile;
}

/**
 * Require authentication or throw
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("No autenticado");
  return identity;
}
