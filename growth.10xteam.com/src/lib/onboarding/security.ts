import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from "node:crypto";

export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function equalSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !==
      new URL(process.env.ONBOARDING_PUBLIC_ORIGIN || request.url).origin
  )
    throw new HttpError(403, "Origen no permitido.");
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function readJson(
  request: Request,
  maxBytes = 100_000,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new HttpError(415, "Se requiere JSON.");
  const raw = await readBytes(request, maxBytes);
  try {
    return JSON.parse(raw.toString("utf8"));
  } catch {
    throw new HttpError(400, "JSON inválido.");
  }
}
export async function readBytes(
  request: Request,
  maxBytes: number,
): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Solicitud vacía.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "Solicitud demasiado grande.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
function encryptionKey() {
  const key = Buffer.from(
    process.env.ONBOARDING_ENCRYPTION_KEY ?? "",
    "base64",
  );
  if (key.length !== 32)
    throw new HttpError(
      503,
      "La protección de conexiones requiere configuración.",
    );
  return key;
}
export function seal(value: unknown, context: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value)),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}
export function unseal<T>(value: string, context: string): T {
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1") throw new Error("Invalid ciphertext version");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(data, "base64url")),
      decipher.final(),
    ]).toString(),
  );
}
export function teamToken() {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expires}.${teamSignature(expires)}`;
}
function teamSignature(expires: string) {
  const secret = process.env.TEAM_ADMIN_PASSCODE;
  if (!secret) return "";
  return createHmac("sha256", secret).update(`team:${expires}`).digest("hex");
}
export function validTeamToken(token: string | undefined) {
  const [expires, signature] = (token ?? "").split(".");
  return Boolean(
    signature &&
      Number(expires) > Date.now() &&
      Number(expires) < Date.now() + 8 * 60 * 60 * 1000 + 5000 &&
      equalSecret(signature, teamSignature(expires)),
  );
}
