import { readFile } from "node:fs/promises";
import path from "node:path";

const EARLY_ACCESS_STYLES = `
<style>
#welcome-popup{display:none!important}#early-access-modal[hidden]{display:none!important}.fomo-count{visibility:hidden}
#early-access-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(4,6,12,.82);backdrop-filter:blur(12px)}
.ea-card{position:relative;width:min(560px,100%);max-height:min(760px,92vh);overflow:auto;border:1px solid rgba(123,92,255,.32);border-radius:20px;background:#11141c;box-shadow:0 28px 100px rgba(0,0,0,.55);padding:28px}
.ea-close{position:absolute;right:16px;top:14px;border:0;background:transparent;color:#8f98aa;font-size:22px;cursor:pointer}
.ea-kicker{margin:0 0 10px;color:#3ddc97;font-family:var(--tx-font-mono);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.ea-card h2{margin:0;color:#f2f4f8;font-family:var(--tx-font-display);font-size:clamp(26px,5vw,38px);line-height:1.08}
.ea-lead{margin:12px 0 18px;color:#a8b0bf;font-size:14px;line-height:1.65}
.ea-urgency{border:1px solid rgba(61,220,151,.20);border-radius:13px;background:rgba(61,220,151,.06);padding:14px;margin-bottom:18px}
.ea-count{display:flex;justify-content:space-between;gap:16px;color:#dce3ee;font-size:13px}.ea-count strong{color:#3ddc97;font-family:var(--tx-font-mono)}
.ea-bar{height:5px;margin-top:9px;border-radius:99px;background:#252a37;overflow:hidden}.ea-fill{height:100%;width:0;background:linear-gradient(90deg,#7b5cff,#3ddc97);transition:width .4s ease}
.ea-recent{margin:8px 0 0;color:#8e98aa;font-size:12px}
.ea-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ea-field{display:flex;flex-direction:column;gap:6px}.ea-field.ea-full{grid-column:1/-1}.ea-field label{color:#aab3c2;font-size:12px;font-weight:600}.ea-field input{width:100%;border:1px solid #2a3040;border-radius:10px;background:#0b0d12;color:#fff;padding:12px 13px;font:inherit;outline:none}.ea-field input:focus{border-color:#7b5cff;box-shadow:0 0 0 3px rgba(123,92,255,.12)}
.ea-consent{grid-column:1/-1;display:flex;align-items:flex-start;gap:9px;color:#7f899c;font-size:11px;line-height:1.5}.ea-consent input{margin-top:2px}.ea-consent a{color:#aab6ff}
.ea-submit{grid-column:1/-1;border:0;border-radius:11px;background:linear-gradient(90deg,#7b5cff,#6d5dfc);color:#fff;padding:14px 16px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 12px 36px rgba(123,92,255,.25)}.ea-submit:disabled{opacity:.6;cursor:wait}
.ea-note{grid-column:1/-1;margin:0;text-align:center;color:#697387;font-size:11px}.ea-error{grid-column:1/-1;margin:0;color:#ff9da8;font-size:12px;display:none}
@media(max-width:600px){.ea-card{padding:24px 18px}.ea-form{grid-template-columns:1fr}.ea-field,.ea-field.ea-full,.ea-consent,.ea-submit,.ea-note,.ea-error{grid-column:1}}
</style>`;

const EARLY_ACCESS_MODAL = `
<div id="early-access-modal" hidden role="dialog" aria-modal="true" aria-labelledby="ea-title">
  <div class="ea-card">
    <button class="ea-close" type="button" aria-label="Cerrar Early Access">×</button>
    <p class="ea-kicker">Early Access · Cupo limitado</p>
    <h2 id="ea-title">Asegura las condiciones que después ya no estarán disponibles.</h2>
    <p class="ea-lead">Conoce 10xTeam Growth, reserva tu lugar Early Adopter y continúa directamente al wizard. El beneficio de lanzamiento termina cuando se agote el cupo.</p>
    <div class="ea-urgency">
      <div class="ea-count"><span>Lugares Early Adopter tomados</span><strong><span id="ea-taken">—</span> / 2,000</strong></div>
      <div class="ea-bar" aria-hidden="true"><div class="ea-fill" id="ea-fill"></div></div>
      <p class="ea-recent" id="ea-recent" hidden></p>
    </div>
    <form class="ea-form" id="early-access-form">
      <div class="ea-field"><label for="ea-name">Nombre</label><input id="ea-name" name="name" autocomplete="name" required></div>
      <div class="ea-field"><label for="ea-company">Empresa</label><input id="ea-company" name="company" autocomplete="organization" required></div>
      <div class="ea-field"><label for="ea-email">Email</label><input id="ea-email" name="email" type="email" autocomplete="email" required></div>
      <div class="ea-field"><label for="ea-phone">WhatsApp <span style="font-weight:400;color:#697387">(opcional)</span></label><input id="ea-phone" name="phone" type="tel" autocomplete="tel"></div>
      <label class="ea-consent"><input type="checkbox" required> <span>He leído el <a href="https://10xteam.com.mx/legal/aviso" target="_blank" rel="noopener">Aviso de Privacidad</a> y solicito acceso anticipado.</span></label>
      <p class="ea-error" id="ea-error"></p>
      <button class="ea-submit" id="ea-submit" type="submit">Quiero asegurar mi lugar →</button>
      <p class="ea-note">No necesitas esperar un correo: al registrarte entras inmediatamente al wizard.</p>
    </form>
  </div>
</div>
<script>
(function(){
  var modal=document.getElementById('early-access-modal');
  var form=document.getElementById('early-access-form');
  var closeBtn=modal&&modal.querySelector('.ea-close');
  var nameInput=document.getElementById('ea-name');
  var submit=document.getElementById('ea-submit');
  var errorEl=document.getElementById('ea-error');
  var takenEl=document.getElementById('ea-taken');
  var fillEl=document.getElementById('ea-fill');
  var recentEl=document.getElementById('ea-recent');

  function renderStats(data){
    if(!data)return;
    var total=Math.max(0,Number(data.total)||0);
    var capacity=Math.max(1,Number(data.capacity)||2000);
    if(takenEl)takenEl.textContent=total.toLocaleString('es-MX');
    if(fillEl)fillEl.style.width=Math.min(100,total/capacity*100)+'%';
    if(recentEl){
      var recent=Math.max(0,Number(data.recent24h)||0);
      recentEl.hidden=recent<1;
      if(recent>0)recentEl.textContent=recent+' '+(recent===1?'persona se registró':'personas se registraron')+' en las últimas 24 horas.';
    }
    var oldCount=document.getElementById('fomo-count');
    var oldFill=document.getElementById('fomo-fill');
    if(oldCount){oldCount.textContent=total.toLocaleString('es-MX');oldCount.style.visibility='visible';}
    if(oldFill)oldFill.style.width=Math.min(100,total/capacity*100)+'%';
  }

  async function loadStats(){
    try{var r=await fetch('/api/waitlist',{headers:{Accept:'application/json'}});if(r.ok)renderStats(await r.json());}catch(_){}
  }
  function openEarlyAccess(e){
    if(e)e.preventDefault();
    if(!modal)return;
    modal.hidden=false;document.body.style.overflow='hidden';loadStats();
    setTimeout(function(){if(nameInput)nameInput.focus();},40);
  }
  function closeEarlyAccess(){
    if(!modal)return;
    modal.hidden=true;document.body.style.overflow='';
  }

  document.querySelectorAll('a[href="#early-access"]').forEach(function(a){a.addEventListener('click',openEarlyAccess);});
  if(closeBtn)closeBtn.addEventListener('click',closeEarlyAccess);
  if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeEarlyAccess();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal&&!modal.hidden)closeEarlyAccess();});

  if(form)form.addEventListener('submit',async function(e){
    e.preventDefault();
    if(errorEl){errorEl.style.display='none';errorEl.textContent='';}
    if(submit){submit.disabled=true;submit.textContent='Reservando tu lugar…';}
    var fd=new FormData(form);
    try{
      var response=await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:fd.get('name'),company:fd.get('company'),email:fd.get('email'),phone:fd.get('phone')})});
      var data=await response.json();
      if(!response.ok)throw new Error(data.error||'No pudimos registrar tu lugar.');
      renderStats(data);
      window.location.href=data.nextUrl||'/wizard/step/1?early_access=1';
    }catch(err){
      if(errorEl){errorEl.textContent=err&&err.message?err.message:'No pudimos registrar tu lugar.';errorEl.style.display='block';}
      if(submit){submit.disabled=false;submit.textContent='Quiero asegurar mi lugar →';}
    }
  });
  loadStats();
})();
</script>`;

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

  out = out.replace("</head>", EARLY_ACCESS_STYLES + "\n</head>");
  out = out.replace("</body>", EARLY_ACCESS_MODAL + "\n</body>");
  return out;
}

export async function GET() {
  const filePath = path.join(process.cwd(), "growth.10xteam_website.html");
  const html = await readFile(filePath, "utf8");
  return new Response(applyGrowthPatches(html), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
