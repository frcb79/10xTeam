import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { request } from "node:https";
const blocked = new BlockList();
for (const [network, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blocked.addSubnet(network, bits, "ipv4");
export const publicIPv4 = (ip: string) =>
  isIP(ip) === 4 && !blocked.check(ip, "ipv4");
export async function publicWebsite(raw: string): Promise<string> {
  const url = new URL(raw);
  if (
    url.protocol !== "https:" ||
    url.port ||
    url.username ||
    url.password ||
    isIP(url.hostname) ||
    !url.hostname.includes(".")
  )
    throw new Error("Usa un sitio público HTTPS.");
  const results = await lookup(url.hostname, { all: true, family: 4 });
  if (!results.length || results.some((r) => !publicIPv4(r.address)))
    throw new Error("Dirección de sitio no permitida.");
  // Pin the resolved address and verify TLS for the original hostname. Never follow redirects.
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: results[0].address,
        servername: url.hostname,
        path: url.pathname,
        headers: {
          Host: url.hostname,
          Accept: "text/html",
          "Accept-Encoding": "identity",
        },
        signal: AbortSignal.timeout(8000),
      },
      (res) => {
        if (
          res.statusCode !== 200 ||
          !res.headers["content-type"]?.includes("text/html")
        ) {
          res.destroy();
          reject(new Error("Sitio no disponible."));
          return;
        }
        const parts: Buffer[] = [];
        let bytes = 0;
        res.on("data", (part: Buffer) => {
          bytes += part.length;
          if (bytes > 512000) {
            res.destroy();
            reject(new Error("Sitio demasiado grande."));
          } else parts.push(part);
        });
        res.on("error", reject);
        res.on("end", () => resolve(Buffer.concat(parts).toString("utf8")));
      },
    );
    req.on("error", reject);
    req.end();
  });
}
