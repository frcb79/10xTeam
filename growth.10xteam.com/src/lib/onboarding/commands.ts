import { z } from "zod";
import { draftSchema, moduleIdSchema, modeSchema } from "./schema";

const base = { id: z.string().uuid(), version: z.number().int().positive() };
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("open") }).strict(),
  z.object({ ...base, action: z.literal("save"), draft: draftSchema }).strict(),
  z.object({ ...base, action: z.literal("plan") }).strict(),
  z
    .object({
      ...base,
      action: z.literal("module"),
      module: moduleIdSchema,
      mode: modeSchema,
    })
    .strict(),
  z
    .object({
      ...base,
      action: z.literal("approve_core"),
      accepted: z.literal(true),
    })
    .strict(),
  z
    .object({
      ...base,
      action: z.literal("authorize_module"),
      module: moduleIdSchema,
      accepted: z.literal(true),
    })
    .strict(),
  z.object({ ...base, action: z.literal("provision") }).strict(),
  z
    .object({
      ...base,
      action: z.literal("reconcile"),
      locationId: z.string().regex(/^[a-zA-Z0-9_-]{5,100}$/),
      reference: z.string().min(8).max(500),
    })
    .strict(),
  z
    .object({
      ...base,
      action: z.literal("evidence"),
      gate: z.string().max(80),
      outcome: z.enum(["pass", "fail"]),
      kind: z.enum(["real", "simulation"]),
      reference: z.string().min(8).max(500),
    })
    .strict(),
  z.object({ ...base, action: z.literal("ready") }).strict(),
]);
export type Command = z.infer<typeof commandSchema>;
