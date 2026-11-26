import { readFile } from "node:fs/promises";
import path from "node:path";
import { localizeGrowthHtml } from "./localize";

import { EARLY_ACCESS_STYLES, EARLY_ACCESS_MODAL } from "./early-access";

function applyGrowthPatches(html: string): string {
  let out = html;

  out = out.replace(
    "<title>10xTeam — La plataforma todo‑en‑uno para agencias</title>",
    '<title>10xTeam Growth | CRM, WhatsApp, Automatización de Ventas e IA</title><meta name="description" content="10xTeam Growth integra estrategia, CRM, WhatsApp, prospección, automatización de ventas, contenido e inteligencia para captar y convertir más oportunidades.">',
  );

  out = out.replace('<div class="modal-overlay open" id="welcome-popup">', '<div class="modal-overlay" id="welcome-popup" style="display:none!important">');

  out = out.replace('<a class="tx-nav-login" href="#trial">Acceder</a>', '<a class="tx-nav-login" href="/wizard">Acceder</a>');
  out = out.replace('<a class="tx-nav-cta" href="#trial">Empieza gratis</a>', '<a class="tx-nav-cta" href="#early-access">Únete al Early Access</a>');
  out = out.replaceAll('href="#prueba"', 'href="#early-access"');
  out = out.replaceAll('href="#trial"', 'href="#early-access"');
  out = out.replace('<a href="#" class="cta primary">Iniciar mi prueba gratuita</a>', '<a href="#early-access" class="cta primary">Solicitar Early Access</a>');
  out = out.replaceAll("Iniciar prueba de 14 días", "Solicitar Early Access");
  out = out.replaceAll("Iniciar mi prueba gratuita", "Solicitar Early Access");
  out = out.replaceAll("Quiero mi lugar Early Adopter", "Quiero asegurar mi lugar Early Adopter");

  out = out.replace(
    "<b>Estrategia Growth 10xTeam</b> — metodologías probadas sobre GHL",
    "<b>Estrategia Growth 10xTeam</b> — metodologías probadas para escalar tu negocio",
  );

  // Copy comercial autorizado: prueba de 14 días intacta, sin garantía de cita ni precio vitalicio.
  const commercialUpdates: Array<[string, string]> = [
    ["precio garantizado de por vida.", "precio Early Adopter durante el primer año."],
    ["El precio se queda congelado para siempre.", "Tu precio Early Adopter se mantiene durante los primeros 12 meses."],
    ["Primera cita agendada en menos de 5 días o te devolvemos tu inversión de setup — sin preguntas.", "Diagnóstico estratégico inicial gratuito y sin compromiso."],
    ["Primera cita agendada en menos de 5 días o te devolvemos tu inversión de setup", "Diagnóstico estratégico inicial gratuito y sin compromiso"],
    ["La primera cita con un prospecto calificado llega en menos de 5 días del inicio del servicio — eso está garantizado.", "Comenzamos con un diagnóstico estratégico inicial gratuito para identificar oportunidades y definir los siguientes pasos."],
    ["El plan Growth incluye garantía de primera cita en 5 días o se devuelve el fee de setup.", "Empezamos con un diagnóstico estratégico inicial gratuito y sin compromiso."],
    ["tu precio queda garantizado de por vida", "tu precio Early Adopter se mantiene durante los primeros 12 meses"],
    ["Precio garantizado de por vida</b> mientras mantengas tu suscripción", "Precio Early Adopter por 12 meses</b> desde el inicio de tu suscripción"],
    ["Los primeros en llegar tienen precio garantizado de por vida.", "Los primeros en llegar obtienen precio Early Adopter durante su primer año."],
    ["Estamos en fase de lanzamiento en México y LATAM. Si eres de los primeros en sumarte, tu precio actual queda congelado para siempre.", "Estamos en fase de lanzamiento en México y LATAM. Si te sumas como Early Adopter, tu precio especial se mantiene durante los primeros 12 meses."],
    ["Precio Early Adopter garantizado de por vida mientras mantengas tu suscripción activa. Si cancelas y regresas, el precio vigente en ese momento aplica.", "El precio Early Adopter se mantiene durante los primeros 12 meses de suscripción. Después aplica el precio regular vigente. Si cancelas y regresas, se aplica el precio vigente al reactivar."],
    ["Si cancelaste y quieres volver, regresas al precio vigente en ese momento — por eso conviene quedarse desde el inicio con el precio Early Adopter.", "Si cancelas y después vuelves, se aplica el precio vigente al reactivar. El precio Early Adopter sólo aplica durante los primeros 12 meses de suscripción."],
  ];
  for (const [before, after] of commercialUpdates) {
    out = out.replaceAll(before, after);
  }

  out = out.replace("</head>", EARLY_ACCESS_STYLES + "\n</head>");
  out = out.replace("</body>", EARLY_ACCESS_MODAL + "\n</body>");
  return out;
}

export async function GET(request: Request) {
  const filePath = path.join(process.cwd(), "growth.10xteam_website.html");
  const html = await readFile(filePath, "utf8");
  const requestedLang = new URL(request.url).searchParams.get("lang");
  const lang = requestedLang === "en" ? "en" : "es";
  return new Response(localizeGrowthHtml(applyGrowthPatches(html), lang).replaceAll('href="/pricing-canon#', 'href="/pricing-canon?lang=' + lang + '#'), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
