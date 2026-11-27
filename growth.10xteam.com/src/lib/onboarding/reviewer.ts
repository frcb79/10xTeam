import type { Actor } from "./model";

type Assignment = { session_id: string; user_id: string } | null;

// Ownership permits customer actions; verification additionally requires an
// operator allowlist entry AND a server-managed assignment to this exact BA.
export async function scopeReviewer(
  actor: Actor,
  sessionId: string,
  lookup: (sessionId: string, userId: string) => Promise<Assignment>,
): Promise<Actor> {
  if (!actor.operator || !actor.userId) return { ...actor, operator: false };
  const assignment = await lookup(sessionId, actor.userId);
  return {
    ...actor,
    operator: assignment?.session_id === sessionId && assignment.user_id === actor.userId,
  };
}
