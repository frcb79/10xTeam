import { readFile } from "node:fs/promises";
import path from "node:path";

function applyGrowthPatches(html: string): string {
  let out = html;

  out = out.replace(
    /\.trust-bar \{[\s\S]*?\}/,
    `.trust-bar {
  padding: 28px 0;
  border-top: 1px solid rgba(59,130,246,.26);
  border-bottom: 1px solid rgba(59,130,246,.26);
  background: linear-gradient(180deg, #09101f 0%, #070c18 55%, #05080f 100%);
  box-shadow: inset 0 1px 0 rgba(59,130,246,.15), inset 0 -1px 0 rgba(59,130,246,.12), 0 14px 28px rgba(0,0,0,.28);
}`,
  );

  out = out.replace('href="#" class="nav-logo"', 'href="https://10xteam.com.mx" class="nav-logo"');
  out = out.replaceAll('href="/wizard/step/1"', 'href="/wizard"');
  out = out.replace('href="#" class="nav-login"', 'href="/wizard" class="nav-login"');
  out = out.replace(
    'href="#demo" class="btn btn-primary btn-sm">Empieza gratis →</a>',
    'href="/wizard" class="btn btn-primary btn-sm">Empieza gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-primary btn-lg">Empieza 14 días gratis →</a>',
    'href="/wizard" class="btn btn-primary btn-lg">Empieza 14 días gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
    'href="/wizard" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
  );

  out = out.replaceAll(
    'href="#demo" class="btn btn-primary">Empieza 14 días gratis →</a>',
    'href="/wizard" class="btn btn-primary">Empieza 14 días gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-outline pricing-cta">Empezar →</a>',
    'href="/wizard" class="btn btn-outline pricing-cta">Empezar →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-primary pricing-cta">Empezar 14 días gratis →</a>',
    'href="/wizard" class="btn btn-primary pricing-cta">Empezar 14 días gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-outline pricing-cta">Contactar →</a>',
    'href="/wizard" class="btn btn-outline pricing-cta">Contactar →</a>',
  );
  out = out.replace(
    'href="#demo" style="color:var(--blue-l);font-weight:600;margin-left:4px">Pregúntanos por el plan de reventa →</a>',
    'href="/wizard" style="color:var(--blue-l);font-weight:600;margin-left:4px">Pregúntanos por el plan de reventa →</a>',
  );
  out = out.replace(
    'href="#" class="btn btn-primary btn-lg">Empieza tu prueba gratuita →</a>',
    'href="/wizard" class="btn btn-primary btn-lg">Empieza tu prueba gratuita →</a>',
  );
  out = out.replace(
    'href="#" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
    'href="/wizard" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
  );

  out = out.replace('<span class="badge badge-blue">México 🇲🇽</span>', '');
  out = out.replace('href="#" class="footer-link">10xTeam Dev</a>', 'href="https://dev.10xteam.com.mx" class="footer-link">10xTeam Dev</a>');
  out = out.replace('href="#" class="footer-link">Para agencias</a>', 'href="/wizard" class="footer-link">Para agencias</a>');
  out = out.replace('href="#demo" class="footer-link">Agendar demo</a>', 'href="/wizard" class="footer-link">Agendar demo</a>');
  out = out.replace(
    /\s*<div>\s*<div class="footer-col-title">Empresa<\/div>[\s\S]*?<\/div>\s*<\/div>\s*/,
    '\n',
  );

  out = out.replace(
    "const target = document.querySelector(a.getAttribute('href'));",
    "const href = a.getAttribute('href');\n    if (href === '#') return;\n    const target = document.querySelector(href);",
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