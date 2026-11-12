import { createHash, verify } from "node:crypto";
export const highLevelSigningKey =
  "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAi2HR1srL4o18O8BRa7gVJY7G7bupbN3H9AwJrHCDiOg=\n-----END PUBLIC KEY-----";
export function verifiedEvent(
  raw: Buffer,
  signature: string | null,
  publicKey = highLevelSigningKey,
) {
  if (
    !signature ||
    !verify(null, raw, publicKey, Buffer.from(signature, "base64"))
  )
    return null;
  const event = JSON.parse(raw.toString("utf8"));
  if (
    !event ||
    typeof event !== "object" ||
    ![
      "AppointmentCreate",
      "ContactCreate",
      "OpportunityCreate",
      "INSTALL",
      "UNINSTALL",
    ].includes(event.type) ||
    typeof event.locationId !== "string"
  )
    return { ignored: true } as const;
  return {
    ignored: false,
    type: String(event.type),
    locationId: String(event.locationId),
    companyId: typeof event.companyId === "string" ? event.companyId : null,
    digest: createHash("sha256")
      .update(
        typeof event.webhookId === "string"
          ? event.locationId + ":" + event.webhookId
          : raw,
      )
      .digest("hex"),
  } as const;
}
