import { readFile } from "node:fs/promises";
import path from "node:path";

function applyGrowthPatches(html: string): string {
  let out = html;

  // CTAs de prueba/early-adopter apuntaban a anclas inexistentes (#trial, #prueba, #) -> mandarlos al wizard real
  out = out.replace('<a class="tx-nav-login" href="#trial">Acceder</a>', '<a class="tx-nav-login" href="/wizard">Acceder</a>');
  out = out.replace('<a class="tx-nav-cta" href="#trial">Empieza gratis</a>', '<a class="tx-nav-cta" href="/wizard">Empieza gratis</a>');
  out = out.replace(
    '<a href="#prueba" class="tx-cta-btn" style="margin-top:0;">Quiero mi lugar Early Adopter</a>',
    '<a href="/wizard" class="tx-cta-btn" style="margin-top:0;">Quiero mi lugar Early Adopter</a>',
  );
  out = out.replace('<a href="#prueba" class="txbtn-primary">', '<a href="/wizard" class="txbtn-primary">');
  out = out.replace('<a href="#trial" class="cta violet">Iniciar prueba de 14 días</a>', '<a href="/wizard" class="cta violet">Iniciar prueba de 14 días</a>');
  out = out.replace('<a href="#trial" class="cta primary">Iniciar prueba de 14 días</a>', '<a href="/wizard" class="cta primary">Iniciar prueba de 14 días</a>');
  out = out.replace('<a href="#" class="cta primary">Iniciar mi prueba gratuita</a>', '<a href="/wizard" class="cta primary">Iniciar mi prueba gratuita</a>');
  out = out.replace('<a href="#prueba" class="tx-cta-btn">', '<a href="/wizard" class="tx-cta-btn">');
  out = out.replace(
    '<a href="#prueba" class="tx-cta-secondary">¿Tienes dudas? Agenda una llamada gratuita de 15 min</a>',
    '<a href="/wizard" class="tx-cta-secondary">¿Tienes dudas? Agenda una llamada gratuita de 15 min</a>',
  );
  out = out.replace('<a href="#trial">Prueba de 14 días</a>', '<a href="/wizard">Prueba de 14 días</a>');
  out = out.replace('<a href="#trial">Iniciar prueba</a>', '<a href="/wizard">Iniciar prueba</a>');

  // White-label: no mencionar la plataforma de terceros sobre la que corre la automatizacion
  out = out.replace(
    '<b>Estrategia Growth 10xTeam</b> — metodologías probadas sobre GHL',
    '<b>Estrategia Growth 10xTeam</b> — metodologías probadas para escalar tu negocio',
  );

  return out;
}

export async function GET() {
  const filePath = path.join(process.cwd(), "growth.10xteam_website.html");
  const html = await readFile(filePath, "utf8");
  const patchedHtml = applyGrowthPatches(html);

  return new Response(patchedHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}