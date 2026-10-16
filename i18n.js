(() => {
  const KEY = 'timeshift-language';
  const saved = localStorage.getItem(KEY);
  const detected = (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  let lang = saved === 'es' || saved === 'en' ? saved : detected;

  const en = {
    'Detectando zona...': 'Detecting time zone...',
    'CONVERTIDOR DE ZONAS HORARIAS': 'TIME ZONE CONVERTER',
    '¿A qué hora es': 'What time is it',
    'para mí?': 'for me?',
    'Escribe una hora como te la mandarían por chat. La convertimos a tu zona local automáticamente.': 'Type a time the way someone would send it in chat. We convert it to your local time zone automatically.',
    'Ej. 9:00 AM ET': 'Ex. 9:00 AM ET',
    'Convertir': 'Convert',
    'Prueba:': 'Try:',
    'ORIGEN': 'SOURCE',
    'TU HORA': 'YOUR TIME',
    'AHORA MISMO': 'RIGHT NOW',
    'Reloj mundial': 'World clock',
    'Se actualiza automáticamente': 'Updates automatically',
    'RECIENTES': 'RECENT',
    'Tus conversiones': 'Your conversions',
    'Limpiar': 'Clear',
    'Hecha para ser simple': 'Made to be simple',
    'Esta página fue vibecodeada por diversión. No tiene anuncios, popups, cuentas, cookies raras ni botones falsos. Solo existe para convertir horarios rápido y sin páginas llenas de anuncios XD.': 'This page was vibecoded for fun. It has no ads, popups, accounts, weird cookies, or fake buttons. It only exists to convert times quickly without ad-filled websites XD.',
    'La zona local se detecta en tu dispositivo. No usamos GPS.': 'Your local time zone is detected on your device. We do not use GPS.',
    'Tu hora': 'Your time',
    'Nueva York': 'New York',
    'Londres': 'London',
    'Tokio': 'Tokyo',
    'Seúl': 'Seoul',
    'Ciudad de México': 'Mexico City',
    'España': 'Spain',
    'Japón': 'Japan',
    'Escribe una hora, por ejemplo: 9:00 AM ET': 'Type a time, for example: 9:00 AM ET',
    'No reconocí la zona horaria. Prueba con ET, PT, JST, España, Tokyo, London, etc.': 'I could not recognize that time zone. Try ET, PT, JST, Spain, Tokyo, London, etc.',
    'No pude entender la hora. Prueba algo como 9:00 AM ET o 18:30 España.': 'I could not understand that time. Try something like 9:00 AM ET or 18:30 Spain.',
    'No pude convertir esa hora.': 'I could not convert that time.',
    'Detectado por tu navegador': 'Detected by your browser',
    'Hora a convertir': 'Time to convert',
    'TimeShift inicio': 'TimeShift home'
  };

  function t(value) {
    if (lang !== 'en') return value;
    return en[value] || value;
  }

  function translateText(node) {
    const raw = node.nodeValue || '';
    const trimmed = raw.trim();
    if (!trimmed) return;
    const translated = t(trimmed);
    if (translated !== trimmed) {
      const lead = raw.match(/^\s*/)?.[0] || '';
      const trail = raw.match(/\s*$/)?.[0] || '';
      node.nodeValue = lead + translated + trail;
    }
  }

  function translateElement(el) {
    if (!(el instanceof Element)) return;
    ['placeholder', 'title', 'aria-label'].forEach(attr => {
      const v = el.getAttribute(attr);
      if (v) {
        const tr = t(v);
        if (tr !== v) el.setAttribute(attr, tr);
      }
    });
    el.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) translateText(child);
    });
  }

  function translateTree(root = document.body) {
    if (!root) return;
    if (root instanceof Element) translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) translateText(node);
      else translateElement(node);
    }
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'TimeShift — Time Zone Converter' : 'TimeShift';
  }

  function addStyles() {
    if (document.getElementById('language-switcher-style')) return;
    const style = document.createElement('style');
    style.id = 'language-switcher-style';
    style.textContent = `.language-switcher{margin-left:auto;display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);border-radius:10px;color:inherit;font:600 12px/1 Inter,system-ui,sans-serif;outline:none;cursor:pointer}.language-switcher:focus{border-color:rgba(167,139,250,.55)}.topbar{gap:12px}.zone-badge{margin-left:0!important}@media(max-width:560px){.language-switcher{padding:7px 8px;max-width:112px}}`;
    document.head.appendChild(style);
  }

  function ensureSelector() {
    const header = document.querySelector('.topbar');
    if (!header || document.getElementById('languageSwitcher')) return;
    addStyles();
    const select = document.createElement('select');
    select.id = 'languageSwitcher';
    select.className = 'language-switcher';
    select.setAttribute('aria-label', lang === 'en' ? 'Language' : 'Idioma');
    select.innerHTML = '<option value="es">🌐 Español</option><option value="en">🌐 English</option>';
    select.value = lang;
    select.addEventListener('change', () => {
      localStorage.setItem(KEY, select.value);
      location.reload();
    });
    const badge = header.querySelector('.zone-badge');
    header.insertBefore(select, badge || null);
  }

  window.PageI18n = { get lang() { return lang; }, t };

  const start = () => {
    ensureSelector();
    translateTree();
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(n => {
          if (n.nodeType === Node.ELEMENT_NODE) translateTree(n);
          else if (n.nodeType === Node.TEXT_NODE) translateText(n);
        });
        if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) translateText(m.target);
      }
      ensureSelector();
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
