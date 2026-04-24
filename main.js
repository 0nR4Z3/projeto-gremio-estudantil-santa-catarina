/* ═══════════════════════════════════════════════════════════
   UNIÃO PESC — main.js v2
   GSAP + Three.js + ScrollTrigger
   ═══════════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const isMob = () => window.innerWidth <= 768 || !window.matchMedia('(hover: hover)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const ANO_FUNDACAO = 1968;
const anosAtuais = new Date().getFullYear() - ANO_FUNDACAO;

/* dynamic year values */
document.querySelectorAll('[data-t="57"]').forEach(el => { el.dataset.t = anosAtuais; });
const badgeEl = document.getElementById('badgeAnos');
if (badgeEl) badgeEl.textContent = anosAtuais;
document.querySelectorAll('.anos-dynamic').forEach(el => { el.textContent = anosAtuais; });

/* ─── util: split words ─────────────────────────────── */
function splitWords(root) {
  if (!root) return [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const out = [];
  nodes.forEach(n => {
    const frag = document.createDocumentFragment();
    n.nodeValue.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      const w = document.createElement('span');
      w.className = 'rv-w';
      const i = document.createElement('i');
      i.textContent = part;
      w.appendChild(i);
      frag.appendChild(w);
      out.push(i);
    });
    n.parentNode.replaceChild(frag, n);
  });
  return out;
}

/* ─── util: split letters ──────────────────────────── */
function splitLetters(el) {
  if (!el) return [];
  const text = el.textContent;
  el.innerHTML = '';
  const frag = document.createDocumentFragment();
  const chars = [];
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'i-char' + (ch === ' ' ? ' space' : '');
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    frag.appendChild(s);
    chars.push(s);
  });
  el.appendChild(frag);
  return chars;
}

/* ═══════ INTRO v2 — CINEMATIC ═══════ */
(function initIntro() {
  const introEl = document.getElementById('intro');
  if (!introEl) return;

  /* skip if already seen this session — faster subsequent nav */
  const SEEN_KEY = 'pesc_intro_seen_v2';
  if (sessionStorage.getItem(SEEN_KEY) === '1' || reduceMotion) {
    introEl.style.display = 'none';
    requestAnimationFrame(() => initMain(true));
    return;
  }

  /* inject new intro scaffolding */
  const grid = document.createElement('div'); grid.className = 'i-grid'; introEl.appendChild(grid);
  const vign = document.createElement('div'); vign.className = 'i-vignette'; introEl.appendChild(vign);

  const meta = document.createElement('div');
  meta.className = 'i-meta';
  meta.innerHTML = '<span class="dot"></span> Carregando · Grêmio União PESC';
  introEl.appendChild(meta);

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const date = document.createElement('div');
  date.className = 'i-date';
  date.textContent = `CXS · RS · ${dateStr}`;
  introEl.appendChild(date);

  const skip = document.createElement('button');
  skip.className = 'i-skip';
  skip.type = 'button';
  skip.innerHTML = 'Pular intro <span class="kbd">ESC</span>';
  introEl.appendChild(skip);

  /* video background (optional) */
  const videoURL = 'intro-video.mp4';
  let videoEl = null;
  if (videoURL) {
    videoEl = document.createElement('video');
    videoEl.id = 'introVideo';
    videoEl.src = videoURL;
    videoEl.autoplay = true; videoEl.muted = true; videoEl.loop = true; videoEl.playsInline = true;
    videoEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;z-index:2;pointer-events:none;filter:contrast(1.1) saturate(.7)';
    introEl.insertBefore(videoEl, introEl.firstChild);
    videoEl.addEventListener('canplay', () => gsap.to(videoEl, { opacity: 0.22, duration: 1.6 }));
    videoEl.addEventListener('error', () => { if (videoEl && videoEl.parentNode) videoEl.parentNode.removeChild(videoEl); videoEl = null; });
  }

  /* ── Three.js yellow star + inner blue ── */
  const c3d = document.getElementById('intro3d');
  let r3d, cam3d, starMesh, innerMesh, starMat, innerMat, s3d;

  if (c3d && window.THREE) {
    r3d = new THREE.WebGLRenderer({ canvas: c3d, antialias: true, alpha: true });
    r3d.setSize(window.innerWidth, window.innerHeight);
    r3d.setPixelRatio(Math.min(devicePixelRatio, 2));
    cam3d = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    cam3d.position.z = 6;

    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 2 : 0.8;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    starShape.closePath();
    starMat = new THREE.MeshPhysicalMaterial({
      color: 0xF5C200, metalness: 0.7, roughness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.1,
      emissive: 0xF5C200, emissiveIntensity: 0.35,
      transparent: true, opacity: 0
    });
    starMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(starShape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4 }),
      starMat
    );
    s3d = new THREE.Scene();
    starMesh.position.set(0, 0, 0);
    starMesh.scale.set(0.1, 0.1, 0.1);
    s3d.add(starMesh);

    const innerShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 1.2 : 0.5;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) innerShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else innerShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    innerShape.closePath();
    innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x1565C0, metalness: 0.6, roughness: 0.3,
      clearcoat: 0.8, emissive: 0x1565C0, emissiveIntensity: 0.25,
      transparent: true, opacity: 0
    });
    innerMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(innerShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }),
      innerMat
    );
    innerMesh.position.set(0, 0, 0.2);
    innerMesh.scale.set(0.1, 0.1, 0.1);
    s3d.add(innerMesh);

    s3d.add(new THREE.AmbientLight(0x404040, 0.5));
    const pl1 = new THREE.PointLight(0xF5C200, 2.2, 20); pl1.position.set(3, 3, 5); s3d.add(pl1);
    const pl2 = new THREE.PointLight(0x1565C0, 1.6, 20); pl2.position.set(-3, -2, 4); s3d.add(pl2);
    const dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(0, 5, 5); s3d.add(dl);

    function loop() {
      if (!document.getElementById('intro')) return;
      if (starMesh) {
        starMesh.rotation.y += 0.008;
        starMesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
      }
      if (innerMesh) {
        innerMesh.rotation.y = starMesh.rotation.y * 0.8;
        innerMesh.rotation.x = starMesh.rotation.x * 0.8;
      }
      r3d.render(s3d, cam3d);
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', () => {
      if (!cam3d) return;
      cam3d.aspect = window.innerWidth / window.innerHeight;
      cam3d.updateProjectionMatrix();
      r3d.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* split intro letters */
  const uEl = document.getElementById('iU');
  const pEl = document.getElementById('iP');
  const uChars = splitLetters(uEl);
  const pChars = splitLetters(pEl);

  /* stripe positioning */
  function positionStripes() {
    const sA = document.getElementById('iSA');
    const sB = document.getElementById('iSB');
    if (!uEl || !sA || !sB) return;
    const r = uEl.getBoundingClientRect();
    const midY = r.top + r.height * 0.58;
    sA.style.top = (midY - 7) + 'px';
    sB.style.top = (midY + 14) + 'px';
  }

  /* the timeline */
  let masterTL;
  function runIntro() {
    positionStripes();
    const pctEl = document.getElementById('iPct');
    const barEl = document.getElementById('iBar');
    const sA = document.getElementById('iSA');
    const sB = document.getElementById('iSB');
    const num = { v: 0 };

    masterTL = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(SEEN_KEY, '1');
        introEl.style.display = 'none';
        initMain(false);
      }
    });

    /* STAGE 1 — frame + atmosphere */
    masterTL
      .to(grid, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
      .to(vign, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .to('.i-corner', { opacity: 1, duration: 0.45, stagger: 0.07 }, 0.05)
      .to(meta, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.15)
      .to(date, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.22)
      .to(skip, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.35)
      .set('#iScan', { opacity: 0.85, top: 0 }, 0.15)
      .to('#iScan', { top: '100%', duration: 0.85, ease: 'none', opacity: 0 }, 0.18);

    /* STAGE 2 — stripes carve the center */
    masterTL
      .set([sA, sB], { scaleX: 0, opacity: 1 }, 0.45)
      .to(sA, { scaleX: 1, transformOrigin: 'left center', duration: 0.95, ease: 'power4.inOut' }, 0.5)
      .to(sB, { scaleX: 1, transformOrigin: 'right center', duration: 0.95, ease: 'power4.inOut' }, 0.62);

    /* STAGE 3 — star reveal + scale */
    if (starMesh) {
      masterTL
        .to(starMat, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.3)
        .to(innerMat, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.45)
        .to(starMesh.scale, { x: 1, y: 1, z: 1, duration: 1.3, ease: 'back.out(1.4)' }, 0.3)
        .to(innerMesh.scale, { x: 1, y: 1, z: 1, duration: 1.3, ease: 'back.out(1.4)' }, 0.42);
    }

    /* STAGE 4 — kinetic typography, PESC then UNIÃO */
    masterTL
      .to(pChars, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.04, ease: 'power4.out' }, 0.55)
      .to(uChars, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.035, ease: 'power4.out' }, 0.78)
      .to('#iEye', { y: 0, duration: 0.7, ease: 'power3.out' }, 0.95)
      .to('#iSub', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.25);

    /* STAGE 5 — percentage counter + bar */
    masterTL.to(num, {
      v: 100, duration: 2.4, ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(num.v);
        if (pctEl) pctEl.textContent = String(v).padStart(3, '0');
        if (barEl) barEl.style.setProperty('--p', v + '%');
      }
    }, 0.1);

    /* STAGE 6 — camera push-in + exit wipe */
    if (cam3d) masterTL.to(cam3d.position, { z: 2.2, duration: 1.1, ease: 'power3.inOut' }, 2.45);
    masterTL
      .to('#introContent', { scale: 1.06, opacity: 0, filter: 'blur(6px)', duration: 0.7, ease: 'power2.in' }, 2.5)
      .to([meta, date, skip, grid, vign, '.i-corner'], { opacity: 0, duration: 0.45 }, 2.55)
      .to([starMat, innerMat].filter(Boolean), { opacity: 0, duration: 0.5 }, 2.6);
    if (videoEl) masterTL.to(videoEl, { opacity: 0, duration: 0.35 }, 2.6);
    masterTL.to(introEl, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' }, 2.85);
  }

  /* skip controls */
  function skipIntro() {
    if (!masterTL) return;
    masterTL.timeScale(4.5);
  }
  skip.addEventListener('click', skipIntro);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter') { skipIntro(); document.removeEventListener('keydown', onKey); }
  });

  /* kick off */
  if (document.readyState === 'complete') runIntro();
  else window.addEventListener('load', runIntro);
})();

/* ═══════ MAIN ═══════ */
function initMain(fromCache) {
  /* Ensure pageTransition element exists synchronously if fromCache so it can cover before #main appears */
  let pt = document.getElementById('pageTransition');
  if (fromCache && !pt) {
    pt = document.createElement('div');
    pt.id = 'pageTransition';
    pt.innerHTML = `
      <div class="pt-band"></div><div class="pt-band"></div><div class="pt-band"></div><div class="pt-band"></div><div class="pt-band"></div>
      <div class="pt-label"><span><i>UNIÃO PESC</i></span></div>
      <div class="pt-sub">Carregando</div>
    `;
    document.body.appendChild(pt);
    const bands0 = pt.querySelectorAll('.pt-band');
    gsap.set(bands0, { scaleY: 1, transformOrigin: 'bottom' });
    gsap.set(pt.querySelector('.pt-label i'), { y: 0 });
    gsap.set(pt.querySelector('.pt-sub'), { opacity: 1 });
    /* reveal #main behind curtain immediately */
    gsap.set('#main', { opacity: 1 });
  } else {
    gsap.to('#main', { opacity: 1, duration: fromCache ? 0.25 : 0.5 });
  }

  /* Universal word-reveal wiring for key headlines */
  const rvSelectors = ['.h-title span', '.page-header h1 span', '.a-head .ln', '.hist-title', '.at-title', '.v-title', '.d-title', '.c-title .ln', '.ev-tln', '.cta-head .ln', '.ct-head .ln', '.insta-title .ln'];
  rvSelectors.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    /* these are already block-lines used by existing CSS, leave alone */
  }));

  /* Add split-word reveals to descriptive text */
  document.querySelectorAll('.ph-desc,.a-body,.at-desc,.tl-desc,.feat-desc,.ct-body,.insta-desc,.d-quote').forEach(el => {
    splitWords(el);
  });

  /* Hero */
  const hBand = document.getElementById('hBand');
  if (hBand) gsap.to('#hBand', { opacity: 1, duration: 0.8 }, 0.05);
  const hPL = document.getElementById('hPL');
  if (hPL) gsap.to('#hPL', { scaleX: 1, duration: 0.7, ease: 'power3.out' }, 0.1);
  gsap.to('.h-pre span', { y: 0, duration: 0.8, ease: 'power3.out' }, 0.18);
  gsap.to('.h-title span', { y: 0, stagger: 0.12, duration: 1.1, ease: 'power4.out' }, 0.25);
  gsap.to('.hm', { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }, 0.8);
  gsap.to('#hBadge', { opacity: 1, duration: 0.6 }, 0.9);
  gsap.to('#nBrand', { opacity: 1, duration: 0.6 }, 0.45);
  gsap.to('#nLinks a', { opacity: 1, stagger: 0.07, duration: 0.55 }, 0.55);
  gsap.to('#nCta', { opacity: 1, duration: 0.5 }, 0.82);
  gsap.to('#hScrl', { opacity: 1, duration: 0.5 }, 1.05);
  gsap.to('#hSL', { height: 60, duration: 0.9, ease: 'power2.out' }, 1.15);

  /* Page headers */
  const phLabel = document.querySelector('.ph-label');
  if (phLabel) gsap.fromTo(phLabel, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.2 });
  gsap.to('.page-header h1 span', { y: 0, stagger: 0.12, duration: 1.05, ease: 'power4.out', delay: 0.3 });
  const phDesc = document.querySelector('.ph-desc');
  if (phDesc) gsap.fromTo(phDesc, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.75 });
  const phLine = document.querySelector('.ph-line');
  if (phLine) gsap.to(phLine, { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.95 });
  /* blur words inside ph-desc */
  if (phDesc) gsap.to(phDesc.querySelectorAll('.rv-w > i'), { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.02, duration: 0.8, ease: 'power3.out', delay: 0.85 });

  /* Scroll */
  window.addEventListener('scroll', () => {
    const prog = document.getElementById('prog');
    const nav = document.getElementById('navBar');
    if (prog) prog.style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
    if (nav) nav.classList.toggle('scrolled', scrollY > 50);
  }, { passive: true });

  /* Section stripe dividers */
  document.querySelectorAll('.sdiv').forEach(el => {
    const parts = el.querySelectorAll('div');
    if (parts.length >= 2) ScrollTrigger.create({
      trigger: el, start: 'top 92%',
      onEnter: () => {
        gsap.to(parts[0], { scaleX: 1, duration: 1.2, ease: 'power3.out' });
        gsap.to(parts[1], { scaleX: 1, duration: 1.4, delay: 0.1, ease: 'power3.out' });
      }
    });
  });

  /* About */
  if (document.getElementById('sobre')) {
    gsap.to('#sobre .ln', { y: 0, stagger: 0.12, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#sobre', start: 'top 73%' } });
    ScrollTrigger.create({
      trigger: '#sobre', start: 'top 68%',
      onEnter: () => {
        gsap.to('#aSt', { opacity: 1 });
        gsap.to('#aSa', { width: '100%', duration: 1, ease: 'power3.out' });
        gsap.to('#aSb', { width: '72%', duration: 1.2, delay: 0.1, ease: 'power3.out' });
        gsap.to('.a-body', { opacity: 1, duration: 0.9, delay: 0.3 });
        const body = document.querySelector('.a-body');
        if (body) gsap.to(body.querySelectorAll('.rv-w > i'), { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.018, duration: 0.7, ease: 'power3.out', delay: 0.35 });
        gsap.to('#aFounded', { opacity: 1, duration: 0.8, delay: 0.5 });
      }
    });
  }

  /* Counters */
  document.querySelectorAll('.ctr').forEach((el, i) => {
    const n = el.querySelector('.ctr-n'); if (!n) return;
    const target = +n.dataset.t, suf = n.dataset.s;
    gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.1, scrollTrigger: { trigger: el, start: 'top 84%' } });
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 84%' },
      onUpdate: () => { n.textContent = Math.round(o.v).toLocaleString() + suf; } });
  });

  /* History */
  gsap.to('.hist-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#history', start: 'top 73%' } });
  gsap.to('.tl-item', {
    opacity: 1, x: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.timeline', start: 'top 78%' }
  });
  document.querySelectorAll('.tl-item .tl-desc').forEach(desc => {
    gsap.to(desc.querySelectorAll('.rv-w > i'), { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.015, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: desc, start: 'top 88%' } });
  });

  /* Features */
  gsap.to('.feat', { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '#features', start: 'top 78%' } });

  /* Atividades */
  gsap.to('.at-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#atividades', start: 'top 73%' } });
  gsap.to('.at-card', { opacity: 1, y: 0, stagger: 0.08, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: '.at-grid', start: 'top 80%' } });

  /* Cursos */
  gsap.to('.c-title .ln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#courses, #cursos', start: 'top 73%' } });
  gsap.to('.c-ct', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#courses, #cursos', start: 'top 73%' } });
  gsap.to('.cr', { opacity: 1, x: 0, stagger: 0.1, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: '.cr', start: 'top 84%' } });

  /* Eventos */
  gsap.to('.ev-tln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#eventos', start: 'top 73%' } });
  gsap.to('.ev-row', { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.ev-list', start: 'top 82%' } });

  /* Galeria */
  const galWrap = document.getElementById('galWrap');
  const galDots = document.querySelectorAll('.gal-dot');
  const numP = 5;
  if (galWrap) gsap.to(galWrap, {
    xPercent: -(100 * (numP - 1) / numP), ease: 'none',
    scrollTrigger: {
      trigger: '#galeria-section', pin: true, scrub: 1,
      end: '+=' + ((window.innerWidth * numP) / window.innerHeight * 1.5),
      onUpdate: self => { const idx = Math.round(self.progress * (numP - 1)); galDots.forEach((d, i) => d.classList.toggle('active', i === idx)); }
    }
  });

  /* Manifesto */
  const mEl = document.getElementById('mnTxt');
  if (mEl) {
    function wrapW(node) {
      if (node.nodeType === 3) {
        const s = document.createElement('span');
        s.innerHTML = node.textContent.replace(/(\S+)/g, w => `<span class="word"><span>${w}</span></span>`);
        node.parentNode.replaceChild(s, node);
      } else if (node.nodeType === 1 && !['EM', 'SPAN'].includes(node.nodeName)) {
        [...node.childNodes].forEach(wrapW);
      }
    }
    wrapW(mEl);
    gsap.to('#mnLbl', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#manifesto', start: 'top 76%' } });
    gsap.to('#mnTxt .word span', { y: 0, stagger: 0.023, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '#mnTxt', start: 'top 78%' } });
  }

  /* Valores */
  gsap.to('.v-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#valores', start: 'top 73%' } });
  gsap.to('.v-card', { opacity: 1, y: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.v-grid', start: 'top 80%' } });

  /* Instagram */
  gsap.to('.insta-title .ln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#insta', start: 'top 73%' } });
  gsap.to('.insta-desc', { opacity: 1, duration: 0.9, scrollTrigger: { trigger: '#insta', start: 'top 68%' } });
  gsap.to('.insta-btn', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#insta', start: 'top 65%' } });

  /* Depoimentos */
  gsap.to('.d-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#depoimentos', start: 'top 73%' } });
  gsap.to('.d-card', { opacity: 1, y: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.d-grid', start: 'top 80%' } });

  /* Contato */
  gsap.to('.ct-head .ln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#contato', start: 'top 73%' } });
  gsap.to('.ct-body', { opacity: 1, duration: 0.9, scrollTrigger: { trigger: '#contato', start: 'top 68%' } });
  gsap.to('.ct-map', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#contato', start: 'top 68%' } });
  gsap.to('#ctItems', { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '#ctItems', start: 'top 80%' } });

  /* CTA */
  gsap.to('#ctaPre', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#cta', start: 'top 76%' } });
  gsap.to('.cta-head .ln', { y: 0, stagger: 0.13, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '#cta', start: 'top 73%' } });
  gsap.to('#ctaActs', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#ctaActs', start: 'top 88%' } });

  /* Footer accent */
  ScrollTrigger.create({ trigger: 'footer', start: 'top 90%', onEnter: () => document.querySelector('footer')?.classList.add('seen') });

  /* Hero parallax */
  const hTitle = document.querySelector('.h-title');
  if (hTitle) gsap.to(hTitle, { y: -60, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  /* Smooth scroll for anchors */
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) gsap.to(window, { scrollTo: { y: t, offsetY: 80 }, duration: 1.2, ease: 'power3.inOut' });
  }));

  /* Cursor + label */
  if (!isMob()) {
    const dot = document.getElementById('cur'), ring = document.getElementById('cring'), spot = document.getElementById('spotlight');
    if (dot && ring) {
      /* inject label node */
      const lbl = document.createElement('span'); lbl.className = 'c-label'; ring.appendChild(lbl);

      dot.style.opacity = '0'; ring.style.opacity = '0'; if (spot) spot.style.opacity = '0';
      let mx = window.innerWidth / 2, my = window.innerHeight / 2, fx = mx, fy = my, first = false;
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
        if (spot) { spot.style.left = mx + 'px'; spot.style.top = my + 'px'; }
        if (!first) { first = true; dot.style.opacity = '1'; ring.style.opacity = '1'; if (spot) spot.style.opacity = '1'; fx = mx; fy = my; }
      });
      document.addEventListener('mousedown', () => dot.classList.add('click'));
      document.addEventListener('mouseup', () => dot.classList.remove('click'));
      (function tick() {
        fx += (mx - fx) * 0.14; fy += (my - fy) * 0.14;
        const half = ring.classList.contains('hov-lbl') ? 36 : (ring.classList.contains('hov') ? 32 : 19);
        ring.style.transform = `translate(${fx - half}px, ${fy - half}px)`;
        requestAnimationFrame(tick);
      })();

      document.querySelectorAll('a,button,.cr,.ev-row,.d-card,.v-card,.ctr,.feat,.at-card,.tl-item,.cta-bp,.cta-bs,.insta-btn,.gal-panel-visual,.h-badge,.ct-item').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hov'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
      });

      /* labelled hover targets */
      document.querySelectorAll('[data-ch]').forEach(el => {
        el.addEventListener('mouseenter', () => { lbl.textContent = el.dataset.ch; ring.classList.add('hov-lbl'); });
        el.addEventListener('mouseleave', () => { ring.classList.remove('hov-lbl'); });
      });
    }
  }

  /* Mobile menu */
  const b = document.getElementById('burger'), m = document.getElementById('mOv');
  if (b && m) {
    let open = false;
    b.addEventListener('click', () => {
      open = !open;
      b.classList.toggle('open', open);
      m.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('[data-mob]').forEach(a => a.addEventListener('click', () => {
      open = false; b.classList.remove('open'); m.classList.remove('open'); document.body.style.overflow = '';
    }));
  }

  /* 3D tilt */
  if (!isMob()) document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -5;
      const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });

  /* Magnetic buttons */
  if (!isMob()) document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
  });

  /* Scramble */
  const st = document.querySelector('.scramble-target');
  if (st) {
    class Scramble {
      constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.update = this.update.bind(this); }
      setText(newT) {
        const old = this.el.innerText, len = Math.max(old.length, newT.length);
        this.queue = [];
        for (let i = 0; i < len; i++) this.queue.push({ from: old[i] || '', to: newT[i] || '', start: Math.floor(Math.random() * 40), end: Math.floor(Math.random() * 40) + 40 });
        cancelAnimationFrame(this.req); this.frame = 0;
        return new Promise(resolve => { this.resolve = resolve; this.update(); });
      }
      update() {
        let out = '', done = 0;
        for (let i = 0; i < this.queue.length; i++) {
          const q = this.queue[i];
          if (this.frame >= q.end) { done++; out += q.to; }
          else if (this.frame >= q.start) {
            if (!q.ch || Math.random() < 0.28) q.ch = this.chars[Math.floor(Math.random() * this.chars.length)];
            out += `<span style="color:var(--blue);opacity:0.6">${q.ch}</span>`;
          } else out += q.from;
        }
        this.el.innerHTML = out;
        if (done === this.queue.length) this.resolve();
        else { this.req = requestAnimationFrame(this.update); this.frame++; }
      }
    }
    const fx = new Scramble(st);
    ScrollTrigger.create({ trigger: st, start: 'top 80%', onEnter: () => fx.setText(st.textContent), once: true });
  }

  /* Three.js BG */
  (function initBg() {
    const c = document.getElementById('webgl'); if (!c || !window.THREE) return;
    const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    r.setSize(window.innerWidth, window.innerHeight); r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const s = new THREE.Scene(), cam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100); cam.position.z = 6;
    const tk = new THREE.Mesh(new THREE.TorusKnotGeometry(1.6, 0.42, 220, 22), new THREE.MeshBasicMaterial({ color: 0x1565C0, wireframe: true, transparent: true, opacity: 0.03 })); s.add(tk);
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 2), new THREE.MeshBasicMaterial({ color: 0xF5C200, wireframe: true, transparent: true, opacity: 0.01 })); s.add(ico);
    const mkP = (n, c2, s2, o, r) => {
      const p = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * r; p[i * 3 + 1] = (Math.random() - 0.5) * r; p[i * 3 + 2] = (Math.random() - 0.5) * r; }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      return new THREE.Points(g, new THREE.PointsMaterial({ color: c2, size: s2, transparent: true, opacity: o }));
    };
    s.add(mkP(900, 0xffffff, 0.02, 0.28, 26));
    s.add(mkP(150, 0x1565C0, 0.04, 0.35, 20));
    let tgX = 0, tgY = 0, sY = 0;
    document.addEventListener('mousemove', e => { tgX = (e.clientY / window.innerHeight - 0.5) * 0.5; tgY = (e.clientX / window.innerWidth - 0.5) * 0.5; }, { passive: true });
    window.addEventListener('scroll', () => { sY = scrollY / (document.body.scrollHeight - window.innerHeight); }, { passive: true });
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) r.setAnimationLoop(null); else r.setAnimationLoop(render); }, { threshold: 0 }).observe(document.getElementById('gl'));
    function render() {
      tk.rotation.x += 0.0013; tk.rotation.y += 0.0019;
      ico.rotation.y += 0.0006; ico.rotation.x -= 0.0004;
      if (!isMob()) { tk.rotation.x += (tgX - tk.rotation.x) * 0.016; tk.rotation.y += (tgY - tk.rotation.y) * 0.016; }
      cam.position.y = -sY * 2;
      tk.material.opacity = Math.max(0.01, 0.03 - sY * 0.025);
      r.render(s, cam);
    }
    r.setAnimationLoop(render);
    window.addEventListener('resize', () => { cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); r.setSize(window.innerWidth, window.innerHeight); });
  })();

  /* ═══════ SIDE SCROLL DOTS ═══════ */
  (function initSideDots() {
    const sections = [
      { sel: '#hero', label: 'Início' },
      { sel: '#sobre', label: 'Sobre' },
      { sel: '#atividades', label: 'Atividades' },
      { sel: '#cta', label: 'Junte-se' }
    ].filter(s => document.querySelector(s.sel));
    if (sections.length < 3) return;
    const wrap = document.createElement('aside');
    wrap.id = 'sideDots';
    wrap.innerHTML = sections.map((s, i) => `<a class="sd" href="${s.sel}" data-i="${i}"><span class="sd-tip">${s.label}</span></a>`).join('');
    document.body.appendChild(wrap);
    setTimeout(() => wrap.classList.add('on'), 400);

    const dots = wrap.querySelectorAll('.sd');
    dots.forEach(d => d.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(d.getAttribute('href'));
      if (t) gsap.to(window, { scrollTo: { y: t, offsetY: 40 }, duration: 1, ease: 'power3.inOut' });
    }));

    sections.forEach((s, i) => {
      ScrollTrigger.create({
        trigger: s.sel, start: 'top 50%', end: 'bottom 50%',
        onToggle: self => { if (self.isActive) dots.forEach((d, j) => d.classList.toggle('active', j === i)); }
      });
    });
  })();

  /* ═══════ PAGE TRANSITION ═══════ */
  (function initPageTransition() {
    let pt = document.getElementById('pageTransition');
    if (!pt) {
      pt = document.createElement('div');
      pt.id = 'pageTransition';
      pt.innerHTML = `
        <div class="pt-band"></div><div class="pt-band"></div><div class="pt-band"></div><div class="pt-band"></div><div class="pt-band"></div>
        <div class="pt-label"><span><i>UNIÃO PESC</i></span></div>
        <div class="pt-sub">Carregando</div>
      `;
      document.body.appendChild(pt);
    }
    const bands = pt.querySelectorAll('.pt-band');
    const lblWrap = pt.querySelector('.pt-label');
    const lblI = pt.querySelector('.pt-label i');
    const sub = pt.querySelector('.pt-sub');

    /* entry reveal (when coming from another page or cache) */
    if (fromCache) {
      gsap.set(lblWrap, { opacity: 1 });
      const entryTL = gsap.timeline({ delay: 0.1 });
      entryTL
        .to(lblI, { y: '-110%', duration: 0.6, ease: 'power4.in' }, 0)
        .to(sub, { opacity: 0, duration: 0.35 }, 0)
        .to(bands, { scaleY: 0, duration: 0.9, stagger: 0.055, ease: 'power4.inOut' }, 0.15)
        .set(pt, { pointerEvents: 'none' });
    } else {
      /* first-visit: keep curtain hidden (bands collapsed) */
      gsap.set(bands, { scaleY: 0 });
      gsap.set(lblWrap, { opacity: 0 });
      gsap.set(sub, { opacity: 0 });
      gsap.set(pt, { pointerEvents: 'none' });
    }

    /* intercept same-origin nav links for outgoing transition */
    const internalLinks = document.querySelectorAll('a[href$=".html"]:not([target])');
    internalLinks.forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return;
      a.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        const url = new URL(a.href, location.href);
        if (url.pathname === location.pathname) return;
        e.preventDefault();
        gsap.set(pt, { pointerEvents: 'all' });
        gsap.set(bands, { scaleY: 0, transformOrigin: 'top' });
        gsap.set(lblWrap, { opacity: 1 });
        gsap.set(lblI, { y: '110%' });
        gsap.set(sub, { opacity: 0 });
        const tl = gsap.timeline({ onComplete: () => { location.href = url.href; } });
        tl
          .to(bands, { scaleY: 1, duration: 0.75, stagger: 0.05, ease: 'power4.inOut' }, 0)
          .to(lblI, { y: 0, duration: 0.55, ease: 'power4.out' }, 0.35)
          .to(sub, { opacity: 1, duration: 0.4 }, 0.4);
      });
    });
  })();
}
