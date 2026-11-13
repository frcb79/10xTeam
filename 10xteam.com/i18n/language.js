/* 10xTeam corporate website - ES-first, client-side EN option.
   The cinematic video/timing and business links are intentionally untouched. */
(() => {
  'use strict';
  const translations = Object.freeze({
  "Saltar a soluciones": "Skip to solutions",
  "CERO FRICCIÓN · RESULTADOS 10X": "LOW FRICTION · 10X RESULTS",
  "Captamos demanda.": "We Capture Demand.",
  "INGENIERÍA & SOFTWARE 10X": "10X ENGINEERING & SOFTWARE",
  "Construimos tecnología.": "We Build Technology.",
  "SISTEMA 10XTEAM": "10XTEAM SYSTEM",
  "Escalamos negocios.": "We Scale Businesses.",
  "Saltar intro →": "Skip intro →",
  "Para empresas y negocios que quieren escalar.": "For businesses ready to scale.",
  "10xTeam combina Growth y Dev: un sistema para generar y convertir oportunidades, y tecnología para automatizar, operar y construir lo que el negocio necesita para crecer.": "10xTeam combines Growth and Dev: a system to generate and convert opportunities, and technology to automate, operate, and build what businesses need to grow.",
  "Explora nuestras soluciones": "Explore our solutions",
  "Dos líneas. Una misma compañía.": "Two divisions. One company.",
  "Growth convierte oportunidades.": "Growth Converts Opportunities.",
  "Dev construye capacidad.": "Dev Builds Capabilities.",
  "Un frente mueve demanda, ventas y seguimiento. El otro diseña productos, automatizaciones e integraciones. Juntos cubren lo que normalmente vive separado.": "One drives demand, sales, and follow-up. The other designs products, automations, and integrations. Together, they connect what businesses usually manage separately.",
  "Un sistema para generar, gestionar y convertir demanda.": "A system to generate, manage, and convert demand.",
  "Desde entender con precisión quién es tu cliente ideal hasta crear materiales, prospectar, dar seguimiento, operar conversaciones, medir resultados y priorizar qué hacer después.": "From clearly defining your ideal customer to creating assets, prospecting, following up, managing conversations, measuring results, and deciding what to do next.",
  "Estrategia e ICP": "Strategy & ICP",
  "Contenido y materiales": "Content & creative assets",
  "Prospección multicanal": "Multichannel prospecting",
  "CRM y pipelines": "CRM & pipelines",
  "Automatización y seguimiento": "Automation & follow-up",
  "IA e inteligencia": "AI & insights",
  "Y mucho más: una capa integrada para aprender, operar y mejorar continuamente.": "And much more: an integrated system to learn, operate, and continuously improve.",
  "Descubre dónde puede crecer tu negocio.": "Discover Where Your Business Can Grow.",
  "Identifica oportunidades para conseguir más prospectos, mejorar tu seguimiento comercial y automatizar procesos con inteligencia artificial.": "Identify opportunities to attract more prospects, improve your sales follow-up, and automate processes with artificial intelligence.",
  "Comienza con un diagnóstico inicial sin costo.": "Start with a free initial assessment.",
  "Conoce 10xTeam Growth": "Explore 10xTeam Growth",
  "Tecnología construida alrededor del negocio, no al revés.": "Technology built around your business, not the other way around.",
  "Diseñamos y desarrollamos productos digitales, aplicaciones, automatizaciones e integraciones con enfoque de negocio, velocidad y eficiencia desde el día cero.": "We design and build digital products, applications, automations, and integrations with a business-first approach, speed, and efficiency from day one.",
  "Productos digitales": "Digital products",
  "Apps y plataformas": "Apps & platforms",
  "MVPs": "MVPs",
  "Automatización": "Automation",
  "Integraciones": "Integrations",
  "Equipos de desarrollo": "Development teams",
  "Desde una idea hasta una plataforma en producción o un equipo que evoluciona lo que ya existe.": "From an idea to a live platform, or a team to evolve what you have already built.",
  "Evaluación estratégica gratuita": "Free strategic assessment",
  "Cuéntanos tu proyecto. Te contactaremos dentro de 24 horas para conocerlo y explorar cómo podemos ayudarte.": "Tell us about your project. We'll reach out within 24 hours to learn about it and explore how we can help.",
  "Sin costo. Sin compromiso.": "No cost. No obligation.",
  "Conoce 10xTeam Dev": "Explore 10xTeam Dev",
  "Tecnología para crecer, construir y escalar negocios.": "Technology to grow, build, and scale businesses.",
  "Soluciones": "Solutions",
  "Contacto": "Contact",
  "Legal": "Legal",
  "Términos y Condiciones": "Terms & Conditions",
  "Aviso de Privacidad": "Privacy Notice",
  "Operado por CR Mexico Educativo, S.A. de C.V.": "Operated by CR Mexico Educativo, S.A. de C.V.",
  "10xTeam. Todos los derechos reservados.": "10xTeam. All rights reserved."
});
  const langSwitch = document.getElementById('siteLangSwitch');
  if (!langSwitch) return;
  const originalNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, noscript')) return NodeFilter.FILTER_REJECT;
      const value = node.textContent || '';
      return Object.prototype.hasOwnProperty.call(translations, value.trim())
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    }
  });
  let node;
  while ((node = walker.nextNode())) {
    const original = node.textContent || '';
    const trimmed = original.trim();
    const offset = original.indexOf(trimmed);
    originalNodes.push({ node, trimmed, prefix: original.slice(0, offset), suffix: original.slice(offset + trimmed.length) });
  }
  const metaText = {
    es: {
      title: '10xTeam | Growth, Inteligencia y Desarrollo Tecnológico',
      description: '10xTeam combina Growth, inteligencia y desarrollo tecnológico para ayudar a empresas a captar demanda, convertir oportunidades, automatizar operaciones y construir productos digitales.',
      socialTitle: '10xTeam | Growth, Inteligencia y Desarrollo Tecnológico',
      socialDescription: 'Para empresas y negocios que quieren escalar. Captamos demanda, construimos tecnología y escalamos negocios.',
      twitterDescription: 'Captamos demanda. Construimos tecnología. Escalamos negocios.'
    },
    en: {
      title: '10xTeam | Growth, AI & Software Development',
      description: '10xTeam brings together Growth, AI, and software development to help businesses generate demand, convert opportunities, automate operations, and build digital products.',
      socialTitle: '10xTeam | Growth, AI & Software Development',
      socialDescription: 'For businesses ready to scale. We capture demand, build technology, and help businesses grow.',
      twitterDescription: 'We capture demand. We build technology. We scale businesses.'
    }
  };
  const setMeta = (selector, content) => {
    const tag = document.querySelector(selector);
    if (tag) tag.setAttribute('content', content);
  };
  function setLanguage(lang, persist) {
    const english = lang === 'en';
    const locale = english ? 'en' : 'es-MX';
    document.documentElement.lang = locale;
    originalNodes.forEach(item => {
      item.node.textContent = item.prefix + (english ? translations[item.trimmed] : item.trimmed) + item.suffix;
    });
    langSwitch.querySelectorAll('[data-lang-code]').forEach(el => {
      el.classList.toggle('is-active', el.getAttribute('data-lang-code') === (english ? 'en' : 'es'));
    });
    langSwitch.title = english ? 'Switch to Spanish' : 'Cambiar a inglés';
    langSwitch.setAttribute('aria-label', english ? 'Cambiar a español' : 'Switch to English');
    langSwitch.setAttribute('aria-pressed', english ? 'true' : 'false');
    const meta = metaText[english ? 'en' : 'es'];
    document.title = meta.title;
    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[property="og:title"]', meta.socialTitle);
    setMeta('meta[property="og:description"]', meta.socialDescription);
    setMeta('meta[name="twitter:title"]', meta.socialTitle);
    setMeta('meta[name="twitter:description"]', meta.twitterDescription);
    document.querySelectorAll('[data-site-aria-es][data-site-aria-en]').forEach(el =>
      el.setAttribute('aria-label', el.getAttribute(english ? 'data-site-aria-en' : 'data-site-aria-es') || '')
    );
    document.querySelectorAll('a[data-site-url-en][data-site-url-es]').forEach(el =>
      el.setAttribute('href', el.getAttribute(english ? 'data-site-url-en' : 'data-site-url-es') || '')
    );
    if (persist) {
      try { localStorage.setItem('10x_corporate_lang', english ? 'en' : 'es'); } catch {}
    }
  }
  let initial = 'es';
  try { if (localStorage.getItem('10x_corporate_lang') === 'en') initial = 'en'; } catch {}
  setLanguage(initial, false);
  langSwitch.addEventListener('click', () => {
    setLanguage(document.documentElement.lang === 'en' ? 'es' : 'en', true);
  });
})();
