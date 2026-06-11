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
  out = out.replace('href="#" class="nav-login"', 'href="/wizard/step/1" class="nav-login"');
  out = out.replace(
    'href="#demo" class="btn btn-primary btn-sm">Empieza gratis →</a>',
    'href="/wizard/step/1" class="btn btn-primary btn-sm">Empieza gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-primary btn-lg">Empieza 14 días gratis →</a>',
    'href="/wizard/step/1" class="btn btn-primary btn-lg">Empieza 14 días gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
    'href="/wizard/step/1" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
  );

  out = out.replaceAll(
    'href="#demo" class="btn btn-primary">Empieza 14 días gratis →</a>',
    'href="/wizard/step/1" class="btn btn-primary">Empieza 14 días gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-outline pricing-cta">Empezar →</a>',
    'href="/wizard/step/1" class="btn btn-outline pricing-cta">Empezar →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-primary pricing-cta">Empezar 14 días gratis →</a>',
    'href="/wizard/step/1" class="btn btn-primary pricing-cta">Empezar 14 días gratis →</a>',
  );
  out = out.replace(
    'href="#demo" class="btn btn-outline pricing-cta">Contactar →</a>',
    'href="/wizard/step/1" class="btn btn-outline pricing-cta">Contactar →</a>',
  );
  out = out.replace(
    'href="#demo" style="color:var(--blue-l);font-weight:600;margin-left:4px">Pregúntanos por el plan de reventa →</a>',
    'href="/wizard/step/1" style="color:var(--blue-l);font-weight:600;margin-left:4px">Pregúntanos por el plan de reventa →</a>',
  );
  out = out.replace(
    'href="#" class="btn btn-primary btn-lg">Empieza tu prueba gratuita →</a>',
    'href="/wizard/step/1" class="btn btn-primary btn-lg">Empieza tu prueba gratuita →</a>',
  );
  out = out.replace(
    'href="#" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
    'href="/wizard/step/1" class="btn btn-outline btn-lg">Ver demo en vivo</a>',
  );

  out = out.replace('<span class="badge badge-blue">México 🇲🇽</span>', '');
  out = out.replace('href="#" class="footer-link">10xTeam Dev</a>', 'href="https://dev.10xteam.com.mx" class="footer-link">10xTeam Dev</a>');
  out = out.replace('href="#" class="footer-link">Para agencias</a>', 'href="/wizard/step/1" class="footer-link">Para agencias</a>');
  out = out.replace('href="#demo" class="footer-link">Agendar demo</a>', 'href="/wizard/step/1" class="footer-link">Agendar demo</a>');
  out = out.replace(
    /\s*<div>\s*<div class="footer-col-title">Empresa<\/div>[\s\S]*?<\/div>\s*<\/div>\s*/,
    '\n',
  );

  if (!out.includes('id="leadModal"')) {
    out = out.replace(
      '</footer>',
      `</footer>

<div id="leadModal" class="lead-modal" aria-hidden="true">
  <div class="lead-backdrop js-close-modal"></div>
  <div class="lead-card">
    <button type="button" class="lead-close js-close-modal" aria-label="Cerrar">×</button>
    <h3>Registrate y te contactamos</h3>
    <p>Deja tus datos y el equipo de 10xTeam te contacta hoy.</p>
    <form id="leadForm" class="lead-form">
      <input type="hidden" id="leadSource" value="cta" />
      <input type="hidden" id="leadInterest" value="Demo" />
      <input type="text" id="leadName" placeholder="Nombre completo" required />
      <input type="email" id="leadEmail" placeholder="Correo electronico" required />
      <input type="text" id="leadWhatsApp" placeholder="WhatsApp" required />
      <textarea id="leadMessage" placeholder="Cuentanos brevemente que necesitas"></textarea>
      <button type="submit" class="btn btn-primary btn-sm">Enviar registro</button>
    </form>
  </div>
</div>`,
    );
  }

  if (!out.includes('.lead-modal')) {
    out = out.replace(
      '</style>',
      `
.lead-modal { position: fixed; inset: 0; display: none; z-index: 1000; }
.lead-modal.is-open { display: block; }
.lead-backdrop { position: absolute; inset: 0; background: rgba(5,8,15,.72); }
.lead-card { position: relative; width: min(520px, calc(100% - 32px)); margin: 7vh auto 0; background: var(--surface); border: 1px solid var(--border2); border-radius: var(--r); padding: 24px; z-index: 2; box-shadow: 0 24px 42px rgba(0,0,0,.35); }
.lead-close { position: absolute; top: 10px; right: 12px; background: transparent; border: none; color: var(--muted); font-size: 28px; cursor: pointer; }
.lead-form { display: grid; gap: 10px; }
.lead-form input, .lead-form textarea { width: 100%; background: rgba(255,255,255,.03); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-family: 'Instrument Sans', sans-serif; font-size: 14px; padding: 11px 12px; }

</style>`,
    );
  }

  out = out.replace(
    "const target = document.querySelector(a.getAttribute('href'));",
    "const href = a.getAttribute('href');\n    if (href === '#') return;\n    const target = document.querySelector(href);",
  );

  if (!out.includes("const leadModal = document.getElementById('leadModal');")) {
    out = out.replace(
      '// Animate stats on scroll',
      `const leadModal = document.getElementById('leadModal');
const leadForm = document.getElementById('leadForm');
const leadSource = document.getElementById('leadSource');
const leadInterest = document.getElementById('leadInterest');

function openLeadModal(source, interest) {
  leadSource.value = source || 'cta';
  leadInterest.value = interest || 'Demo';
  leadModal.classList.add('is-open');
}

function closeLeadModal() {
  leadModal.classList.remove('is-open');
}

document.querySelectorAll('.js-open-modal').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    openLeadModal(el.dataset.source, el.dataset.interest);
  });
});

document.querySelectorAll('.js-close-modal').forEach(el => {
  el.addEventListener('click', closeLeadModal);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLeadModal();
});

leadForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('leadName').value.trim();
  const email = document.getElementById('leadEmail').value.trim();
  const whatsapp = document.getElementById('leadWhatsApp').value.trim();
  const message = document.getElementById('leadMessage').value.trim();
  const subject = \`Nuevo registro Growth (\${leadSource.value})\`;
  const body = [
    \`Nombre: \${name}\`,
    \`Email: \${email}\`,
    \`WhatsApp: \${whatsapp}\`,
    \`Interes: \${leadInterest.value}\`,
    \`Fuente: \${leadSource.value}\`,
    \`Mensaje: \${message || 'N/A'}\`
  ].join('\\n');

  window.location.href = \`mailto:hola@10xteam.com.mx?subject=\${encodeURIComponent(subject)}&body=\${encodeURIComponent(body)}\`;
  leadForm.reset();
  closeLeadModal();
});

// Animate stats on scroll`,
    );
  }

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