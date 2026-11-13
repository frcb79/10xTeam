import catalogue from "./translations-en.json";

type Language = "es" | "en";
const ENGLISH = catalogue as Record<string, string>;

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function translateText(value: string): string {
  const key = normalize(value);
  const translated = ENGLISH[key];
  if (!translated || translated === key) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  return leading + translated + trailing;
}

function translateStaticMarkup(html: string): string {
  // Do not change inline scripts, styles, markup attributes or business data.
  return html
    .split(/(<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>)/gi)
    .map((part, index) => {
      if (index % 2 === 1) return part;
      return part
        .replace(/>([^<>]+)</g, (_match, value: string) => ">" + translateText(value) + "<")
        .replace(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g, (_match, name: string, value: string) =>
          name + '="' + (ENGLISH[normalize(value)] ?? value).replace(/"/g, "&quot;") + '"');
    })
    .join("");
}

const LANGUAGE_STYLES = [
  "<style>",
  "#growth-language-switch{display:inline-flex;align-items:center;gap:4px;flex-shrink:0;margin-right:3px;font-size:11px;line-height:1;font-family:var(--tx-font-body);color:#9da6b8;white-space:nowrap}",
  "#growth-language-switch .growth-lang{color:#9da6b8;text-decoration:none;padding:6px 2px;transition:color .15s}",
  "#growth-language-switch .growth-lang:hover{color:#fff}",
  '#growth-language-switch .growth-lang[aria-current="true"]{color:#f4f5f7;font-weight:700}',
  "@media(max-width:620px){.tx-nav-logo img{height:36px}.tx-nav-inner{gap:8px}#growth-language-switch{font-size:10px;gap:2px}.tx-nav-actions{gap:6px}.tx-nav-cta{font-size:10px;padding:9px 10px}}",
  "</style>",
].join("\n");

function languageControl(lang: Language): string {
  const es = lang === "es" ? ' aria-current="true"' : "";
  const en = lang === "en" ? ' aria-current="true"' : "";
  return '<span id="growth-language-switch" role="group" aria-label="Language / Idioma">' +
    '<span aria-hidden="true">🌐</span><a class="growth-lang" href="/?lang=es" lang="es"' + es +
    '>ES</a><span aria-hidden="true">|</span><a class="growth-lang" href="/?lang=en" lang="en"' + en +
    '>EN</a></span>';
}

const DYNAMIC_TRANSLATIONS: Record<string, string> = {
  "Todo lo que incluye 10x Growth": "Everything included in 10x Growth",
  "Todo lo que incluye 10x Scale": "Everything included in 10x Scale",
  "Marca blanca disponible (logo, colores, dominio)": "White-label available (logo, colors, domain)",
  "MXN / mes": "MXN / month",
  "USD / mes": "USD / month",
  "MXN precio regular": "MXN regular price",
  "Incluye $200 MXN de crédito de IA": "Includes $200 MXN in AI credit",
  "Reservando tu lugar…": "Reserving your spot…",
  "Quiero asegurar mi lugar →": "Secure my spot →",
  "No pudimos registrar tu lugar.": "We couldn't complete your registration.",
};

const ENGLISH_RUNTIME = [
  "<script>",
  "(function(){",
  "  var translations=" + JSON.stringify(DYNAMIC_TRANSLATIONS) + ";",
  "  function translate(node){",
  "    if(!node)return;",
  "    if(node.nodeType===3){",
  "      var old=node.nodeValue||'';",
  "      var key=old.replace(/\\s+/g,' ').trim();",
  "      var next=translations[key];",
  "      if(next&&next!==key)node.nodeValue=old.replace(key,next);",
  "      else {",
  "        var m=key.match(/^(\\d+) (persona se registró|personas se registraron) en las últimas 24 horas\\.$/);",
  "        if(m)node.nodeValue=m[1]+(m[1]==='1'?' person signed up':' people signed up')+' in the last 24 hours.';",
  "      }",
  "    } else if(node.nodeType===1 && node.tagName!=='SCRIPT' && node.tagName!=='STYLE'){",
  "      var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);",
  "      while(walker.nextNode())translate(walker.currentNode);",
  "    }",
  "  }",
  "  new MutationObserver(function(records){records.forEach(function(r){",
  "    if(r.type==='characterData')translate(r.target);",
  "    else r.addedNodes.forEach(translate);",
  "  });}).observe(document.body,{subtree:true,childList:true,characterData:true});",
  "})();",
  "</script>",
].join("\n");

const PREFERENCE_RUNTIME = [
  "<script>",
  "(function(){",
  "try {",
  " var q=new URLSearchParams(location.search).get('lang');",
  " if(q==='en'||q==='es'){localStorage.setItem('growthPreferredLanguage',q);return;}",
  " if(localStorage.getItem('growthPreferredLanguage')==='en'){",
  "   var url=new URL(location.href);url.searchParams.set('lang','en');location.replace(url.href);",
  " }",
  "} catch(_){}",
  "})();",
  "</script>",
].join("\n");

export function localizeGrowthHtml(source: string, lang: Language): string {
  let html = source;
  html = html.replace('<a href="#">Aviso de privacidad</a>', '<a href="https://10xteam.com.mx/legal/aviso">Aviso de privacidad</a>');
  html = html.replace('<a href="#">Términos y condiciones</a>', '<a href="https://10xteam.com.mx/legal/terminos">Términos y condiciones</a>');
  if (lang === "en") {
    html = translateStaticMarkup(html);
    html = html.replace('<html lang="es-MX">', '<html lang="en">');
    html = html.replace(/<title>[^<]*<\/title>/, '<title>10xTeam Growth | CRM, WhatsApp, Sales Automation &amp; AI</title>');
    html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="10xTeam Growth combines strategy, CRM, WhatsApp, prospecting, sales automation, content and AI to generate and convert more opportunities.">');
    html = html.replaceAll('href="https://10xteam.com.mx/legal/aviso"', 'href="https://10xteam.com.mx/legal/privacy"');
    html = html.replaceAll('href="https://10xteam.com.mx/legal/terminos"', 'href="https://10xteam.com.mx/legal/terms"');
  }
  html = html.replace("</head>", LANGUAGE_STYLES +
    '\n<link rel="alternate" hreflang="es-MX" href="https://growth.10xteam.com.mx/?lang=es">' +
    '\n<link rel="alternate" hreflang="en" href="https://growth.10xteam.com.mx/?lang=en">' +
    '\n<link rel="canonical" href="https://growth.10xteam.com.mx/?lang=' + lang + '">' +
    '\n</head>');
  html = html.replace('<div class="tx-nav-actions">', '<div class="tx-nav-actions">' + languageControl(lang));
  html = html.replace("</body>", PREFERENCE_RUNTIME + (lang === "en" ? "\n" + ENGLISH_RUNTIME : "") + "\n</body>");
  return html;
}
