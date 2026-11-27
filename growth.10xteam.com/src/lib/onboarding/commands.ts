import { serviceSchema } from "./connections";
import { z } from "zod";
import { draftSchema, moduleIdSchema, modeSchema } from "./schema";

const base = { id: z.string().uuid(), version: z.number().int().positive() };
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("open") }).strict(),
  z
    .object({
      ...base,
      action: z.literal("save"),
      autosave: z.literal(true).optional(),
      draft: draftSchema,
    })
    .strict(),
  z
    .object({
      ...base,
      action: z.literal("plan"),
      draft: draftSchema.optional(),
    })
    .strict(),
  z.object({
    ...base,
    action: z.literal("quick_plan"),
    goal: z.enum(["leads", "sales"]),
    acceptedAssumptions: z.literal(true),
  }).strict(),
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
  z
    .object({
      ...base,
      action: z.literal("bind_lab"),
      locationId: z.string().regex(/^[a-zA-Z0-9_-]{5,100}$/),
      reference: z.string().regex(/^[a-zA-Z0-9_-]{4,80}$/),
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
  z
    .object({
      ...base,
      action: z.literal("connection"),
      service: serviceSchema,
      state: z.enum(["authorized", "connected", "tested", "failed", "revoked"]),
      locationId: z.string().regex(/^[a-zA-Z0-9_-]{5,100}$/),
      planVersion: z.number().int().positive(),
      scopes: z
        .array(z.string().regex(/^[a-zA-Z0-9_.:-]{1,60}$/))
        .min(1)
        .max(20),
      reference: z
        .string()
        .regex(
          /^[a-zA-Z0-9_-]{4,80}$/,
          "Usa la referencia del comprobante interno.",
        ),
    })
    .strict(),
  z.object({ ...base, action: z.literal("ready") }).strict(),
]);
export type Command = z.infer<typeof commandSchema>;
