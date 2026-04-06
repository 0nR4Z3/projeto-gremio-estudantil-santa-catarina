gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
const isMob = () => window.innerWidth <= 768 || !window.matchMedia('(hover: hover)').matches;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const ANO_FUNDACAO = 1968;
const anosAtuais = new Date().getFullYear() - ANO_FUNDACAO;

document.querySelectorAll('[data-t="57"]').forEach(el => { el.dataset.t = anosAtuais; });
const badgeEl = document.getElementById('badgeAnos');
if (badgeEl) badgeEl.textContent = anosAtuais;
document.querySelectorAll('.anos-dynamic').forEach(el => { el.textContent = anosAtuais; });

// ═══════ INTRO ═══════
(function initIntro() {
  const introEl = document.getElementById('intro');
  if (!introEl) return;

  // ── VIDEO BACKGROUND ──
  // COMO ADICIONAR SEU VÍDEO:
  // Opção 1: Coloque "intro-video.mp4" na mesma pasta e descomente as linhas abaixo
  // Opção 2: Troque a URL por um link direto do seu vídeo
  
  const videoURL = 'intro-video.mp4'; // ← MUDE AQUI para o caminho do seu vídeo
  let videoEl = null;
  
  if (videoURL) {
    videoEl = document.createElement('video');
    videoEl.id = 'introVideo';
    videoEl.src = videoURL;
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;z-index:2;pointer-events:none;';
    introEl.insertBefore(videoEl, introEl.firstChild);
    
    videoEl.addEventListener('canplay', () => {
      gsap.to(videoEl, { opacity: 0.35, duration: 1.5 });
    });
    
    videoEl.addEventListener('error', () => {
      // Se o vídeo não carregar, remove sem quebrar
      if (videoEl && videoEl.parentNode) videoEl.parentNode.removeChild(videoEl);
      videoEl = null;
    });
  }

  // ── 3D YELLOW STAR + BLUE INNER ──
  const c3d = document.getElementById('intro3d');
  let r3d, cam3d, starMesh, innerMesh, starMat, innerMat;
  let s3d;
  
  if (c3d) {
    r3d = new THREE.WebGLRenderer({ canvas: c3d, antialias: true, alpha: true });
    r3d.setSize(window.innerWidth, window.innerHeight);
    r3d.setPixelRatio(Math.min(devicePixelRatio, 2));
    cam3d = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    cam3d.position.z = 6;

    // Outer star — AMARELA
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 2 : 0.8;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    starShape.closePath();
    starMat = new THREE.MeshPhysicalMaterial({
      color: 0xF5C200, metalness: 0.7, roughness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.1,
      emissive: 0xF5C200, emissiveIntensity: 0.3,
      transparent: true, opacity: 0
    });
    starMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(starShape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4 }),
      starMat
    );
    s3d = new THREE.Scene();
    starMesh.position.set(0, 0, 0);
    s3d.add(starMesh);

    // Inner star — AZUL
    const innerShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 1.2 : 0.5;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) innerShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else innerShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    innerShape.closePath();
    innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x1565C0, metalness: 0.6, roughness: 0.3,
      clearcoat: 0.8, emissive: 0x1565C0, emissiveIntensity: 0.2,
      transparent: true, opacity: 0
    });
    innerMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(innerShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }),
      innerMat
    );
    innerMesh.position.set(0, 0, 0.2);
    s3d.add(innerMesh);

    // Lights
    s3d.add(new THREE.AmbientLight(0x404040, 0.5));
    const pl1 = new THREE.PointLight(0xF5C200, 2, 20); pl1.position.set(3, 3, 5); s3d.add(pl1);
    const pl2 = new THREE.PointLight(0x1565C0, 1.5, 20); pl2.position.set(-3, -2, 4); s3d.add(pl2);
    const dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(0, 5, 5); s3d.add(dl);

    function loop() {
      if (!document.getElementById('intro')) return;
      starMesh.rotation.y += 0.008;
      starMesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
      innerMesh.rotation.y = starMesh.rotation.y;
      innerMesh.rotation.x = starMesh.rotation.x;
      r3d.render(s3d, cam3d);
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', () => {
      cam3d.aspect = window.innerWidth / window.innerHeight;
      cam3d.updateProjectionMatrix();
      r3d.setSize(window.innerWidth, window.innerHeight);
    });
  }

  window.addEventListener('load', () => {
    const uEl = document.getElementById('iU');
    const sA = document.getElementById('iSA');
    const sB = document.getElementById('iSB');
    if (uEl && sA && sB) {
      const uRect = uEl.getBoundingClientRect();
      const midY = uRect.top + uRect.height * 0.58;
      sA.style.top = (midY - 7) + 'px';
      sB.style.top = (midY + 14) + 'px';
    }
    const pctEl = document.getElementById('iPct');
    const barEl = document.getElementById('iBar');
    const num = { v: 0 };

    const tl = gsap.timeline();
    tl.to('.i-corner', { opacity: 1, duration: 0.5, stagger: 0.07 }, 0)
      .set('#iScan', { opacity: 0.8, top: 0 })
      .to('#iScan', { top: '100%', duration: 0.75, ease: 'none', opacity: 0 }, 0.12)
      .set([sA, sB], { scaleX: 0, opacity: 1 })
      .to(sA, { scaleX: 1, transformOrigin: 'left center', duration: 0.85, ease: 'power4.inOut' }, 0.48)
      .to(sB, { scaleX: 1, transformOrigin: 'right center', duration: 0.85, ease: 'power4.inOut' }, 0.6)
      .to(starMat, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.2)
      .to(innerMat, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.35)
      .to('#iP', { y: 0, duration: 0.98, ease: 'power4.out' }, 0.36)
      .to('#iU', { y: 0, duration: 0.98, ease: 'power4.out' }, 0.54)
      .to('#iEye', { y: 0, duration: 0.7, ease: 'power3.out' }, 0.7)
      .to('#iSub', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.05)
      .to(num, {
        v: 100, duration: 2.5, ease: 'power2.inOut',
        onUpdate: () => {
          if (pctEl) pctEl.textContent = String(Math.round(num.v)).padStart(3, '0');
          if (barEl) barEl.style.width = num.v + '%';
        }
      }, 0)
      .to('#introContent', { scale: 0.95, opacity: 0, duration: 0.5, ease: 'power2.in' }, 2.5)
      .to([starMat, innerMat], { opacity: 0, duration: 0.4 }, 2.5)
      .to(videoEl, { opacity: 0, duration: 0.3 }, 2.5)
      .to('#intro', {
        yPercent: -100, duration: 1.1, ease: 'power4.inOut',
        onComplete: () => { introEl.style.display = 'none'; initMain(); }
      }, 2.8);
  });
})();

// ═══════ MAIN ═══════
function initMain() {
  gsap.to('#main', { opacity: 1, duration: 0.5 });

  // Hero
  const hBand = document.getElementById('hBand');
  if (hBand) gsap.to('#hBand', { opacity: 1, duration: 0.7 }, 0.1);
  const hPL = document.getElementById('hPL');
  if (hPL) gsap.to('#hPL', { scaleX: 1, duration: 0.65, ease: 'power3.out' }, 0.15);
  gsap.to('.h-pre span', { y: 0, duration: 0.75, ease: 'power3.out' }, 0.2);
  gsap.to('.h-title span', { y: 0, stagger: 0.13, duration: 1.05, ease: 'power4.out' }, 0.3);
  gsap.to('.hm', { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }, 0.85);
  gsap.to('#hBadge', { opacity: 1, duration: 0.6 }, 0.95);
  gsap.to('#nBrand', { opacity: 1, duration: 0.6 }, 0.5);
  gsap.to('#nLinks a', { opacity: 1, stagger: 0.08, duration: 0.6 }, 0.6);
  gsap.to('#nCta', { opacity: 1, duration: 0.5 }, 0.88);
  gsap.to('#hScrl', { opacity: 1, duration: 0.5 }, 1.1);
  gsap.to('#hSL', { height: 70, duration: 0.85, ease: 'power2.out' }, 1.2);

  // Page headers
  const phLabel = document.querySelector('.ph-label');
  if (phLabel) gsap.fromTo(phLabel, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0.2);
  gsap.to('.page-header h1 span', { y: 0, stagger: 0.12, duration: 1.05, ease: 'power4.out' }, 0.3);
  const phDesc = document.querySelector('.ph-desc');
  if (phDesc) gsap.fromTo(phDesc, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8);
  const phLine = document.querySelector('.ph-line');
  if (phLine) gsap.to(phLine, { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out' }, 1);

  // Scroll
  window.addEventListener('scroll', () => {
    const prog = document.getElementById('prog');
    const nav = document.getElementById('navBar');
    if (prog) prog.style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
    if (nav) nav.classList.toggle('scrolled', scrollY > 50);
  }, { passive: true });

  // Stripes
  document.querySelectorAll('.sdiv').forEach(el => {
    const parts = el.querySelectorAll('div');
    if (parts.length >= 2) ScrollTrigger.create({ trigger: el, start: 'top 92%', onEnter: () => {
      gsap.to(parts[0], { scaleX: 1, duration: 1.2, ease: 'power3.out' });
      gsap.to(parts[1], { scaleX: 1, duration: 1.4, delay: 0.1, ease: 'power3.out' });
    }});
  });

  // About
  if (document.getElementById('sobre')) {
    gsap.to('#sobre .ln', { y: 0, stagger: 0.12, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#sobre', start: 'top 73%' } });
    ScrollTrigger.create({ trigger: '#sobre', start: 'top 68%', onEnter: () => {
      gsap.to('#aSt', { opacity: 1 }); gsap.to('#aSa', { width: '100%', duration: 1, ease: 'power3.out' });
      gsap.to('#aSb', { width: '72%', duration: 1.2, delay: 0.1, ease: 'power3.out' });
      gsap.to('.a-body', { opacity: 1, duration: 0.9, delay: 0.3 });
      gsap.to('#aFounded', { opacity: 1, duration: 0.8, delay: 0.5 });
    }});
  }

  // Counters
  document.querySelectorAll('.ctr').forEach((el, i) => {
    const n = el.querySelector('.ctr-n'); if (!n) return;
    const target = +n.dataset.t, suf = n.dataset.s;
    gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.1, scrollTrigger: { trigger: el, start: 'top 84%' } });
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 84%' },
      onUpdate: () => { n.textContent = Math.round(o.v).toLocaleString() + suf; } });
  });

  // History
  gsap.to('.hist-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#history', start: 'top 73%' } });
  gsap.to('.tl-item', { opacity: 1, x: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.timeline', start: 'top 78%' } });

  // Features
  gsap.to('.feat', { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '#features', start: 'top 78%' } });

  // Atividades
  gsap.to('.at-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#atividades', start: 'top 73%' } });
  gsap.to('.at-card', { opacity: 1, y: 0, stagger: 0.08, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: '.at-grid', start: 'top 80%' } });

  // Cursos
  gsap.to('.c-title .ln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#cursos', start: 'top 73%' } });
  gsap.to('.c-ct', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#cursos', start: 'top 73%' } });
  gsap.to('.cr', { opacity: 1, x: 0, stagger: 0.1, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: '.cr', start: 'top 84%' } });

  // Eventos
  gsap.to('.ev-tln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#eventos', start: 'top 73%' } });
  gsap.to('.ev-row', { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.ev-list', start: 'top 82%' } });

  // Galeria
  const galWrap = document.getElementById('galWrap');
  const galDots = document.querySelectorAll('.gal-dot');
  const numP = 5;
  if (galWrap) gsap.to(galWrap, {
    xPercent: -(100 * (numP - 1) / numP), ease: 'none',
    scrollTrigger: { trigger: '#galeria-section', pin: true, scrub: 1,
      end: '+=' + ((window.innerWidth * numP) / window.innerHeight * 1.5),
      onUpdate: self => { const idx = Math.round(self.progress * (numP - 1)); galDots.forEach((d, i) => d.classList.toggle('active', i === idx)); }
    }
  });

  // Manifesto
  const mEl = document.getElementById('mnTxt');
  if (mEl) {
    function wrapW(node) {
      if (node.nodeType === 3) { const s = document.createElement('span'); s.innerHTML = node.textContent.replace(/(\S+)/g, w => `<span class="word"><span>${w}</span></span>`); node.parentNode.replaceChild(s, node); }
      else if (node.nodeType === 1 && !['EM', 'SPAN'].includes(node.nodeName)) [...node.childNodes].forEach(wrapW);
    }
    wrapW(mEl);
    gsap.to('#mnLbl', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#manifesto', start: 'top 76%' } });
    gsap.to('#mnTxt .word span', { y: 0, stagger: 0.023, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '#mnTxt', start: 'top 78%' } });
  }

  // Valores
  gsap.to('.v-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#valores', start: 'top 73%' } });
  gsap.to('.v-card', { opacity: 1, y: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.v-grid', start: 'top 80%' } });

  // Instagram
  gsap.to('.insta-title .ln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#insta', start: 'top 73%' } });
  gsap.to('.insta-desc', { opacity: 1, duration: 0.9, scrollTrigger: { trigger: '#insta', start: 'top 68%' } });
  gsap.to('.insta-btn', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#insta', start: 'top 65%' } });

  // Depoimentos
  gsap.to('.d-title', { y: 0, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#depoimentos', start: 'top 73%' } });
  gsap.to('.d-card', { opacity: 1, y: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.d-grid', start: 'top 80%' } });

  // Contato
  gsap.to('.ct-head .ln', { y: 0, stagger: 0.1, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: '#contato', start: 'top 73%' } });
  gsap.to('.ct-body', { opacity: 1, duration: 0.9, scrollTrigger: { trigger: '#contato', start: 'top 68%' } });
  gsap.to('.ct-map', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#contato', start: 'top 68%' } });
  gsap.to('#ctItems', { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '#ctItems', start: 'top 80%' } });

  // CTA
  gsap.to('#ctaPre', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#cta', start: 'top 76%' } });
  gsap.to('.cta-head .ln', { y: 0, stagger: 0.13, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '#cta', start: 'top 73%' } });
  gsap.to('#ctaActs', { opacity: 1, duration: 0.8, scrollTrigger: { trigger: '#ctaActs', start: 'top 88%' } });

  // Hero parallax
  const hTitle = document.querySelector('.h-title');
  if (hTitle) gsap.to(hTitle, { y: -60, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); const t = document.querySelector(a.getAttribute('href'));
    if (t) gsap.to(window, { scrollTo: { y: t, offsetY: 80 }, duration: 1.2, ease: 'power3.inOut' });
  }));

  // Cursor
  if (!isMob()) {
    const dot = document.getElementById('cur'), ring = document.getElementById('cring'), spot = document.getElementById('spotlight');
    if (dot && ring) {
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
      (function tick() { fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12; ring.style.transform = `translate(${fx - 19}px, ${fy - 19}px)`; requestAnimationFrame(tick); })();
      document.querySelectorAll('a,button,.cr,.ev-row,.d-card,.v-card,.ctr,.feat,.at-card,.tl-item,.cta-bp,.cta-bs,.insta-btn,.gal-panel-visual,.h-badge,.ct-item').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hov'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
      });
    }
  }

  // Menu
  const b = document.getElementById('burger'), m = document.getElementById('mOv');
  if (b && m) {
    let open = false;
    b.addEventListener('click', () => { open = !open; b.classList.toggle('open', open); m.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; });
    document.querySelectorAll('[data-mob]').forEach(a => a.addEventListener('click', () => {
      open = false; b.classList.remove('open'); m.classList.remove('open'); document.body.style.overflow = '';
    }));
  }

  // 3D Tilt
  if (!isMob()) document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.transform = `perspective(1000px) rotateX(${((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -5}deg) rotateY(${((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 5}deg) scale3d(1.02,1.02,1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });

  // Magnetic
  if (!isMob()) document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
  });

  // Scramble
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

  // Three.js BG
  (function initBg() {
    const c = document.getElementById('webgl'); if (!c) return;
    const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    r.setSize(window.innerWidth, window.innerHeight); r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const s = new THREE.Scene(), cam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100); cam.position.z = 6;
    const tk = new THREE.Mesh(new THREE.TorusKnotGeometry(1.6, 0.42, 220, 22), new THREE.MeshBasicMaterial({ color: 0x1565C0, wireframe: true, transparent: true, opacity: 0.03 })); s.add(tk);
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 2), new THREE.MeshBasicMaterial({ color: 0xF5C200, wireframe: true, transparent: true, opacity: 0.01 })); s.add(ico);
    const mkP = (n, c2, s2, o, r) => { const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * r; p[i * 3 + 1] = (Math.random() - 0.5) * r; p[i * 3 + 2] = (Math.random() - 0.5) * r; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: c2, size: s2, transparent: true, opacity: o })); };
    s.add(mkP(900, 0xffffff, 0.02, 0.28, 26)); s.add(mkP(150, 0x1565C0, 0.04, 0.35, 20));
    let tgX = 0, tgY = 0, sY = 0;
    document.addEventListener('mousemove', e => { tgX = (e.clientY / window.innerHeight - 0.5) * 0.5; tgY = (e.clientX / window.innerWidth - 0.5) * 0.5; }, { passive: true });
    window.addEventListener('scroll', () => { sY = scrollY / (document.body.scrollHeight - window.innerHeight); }, { passive: true });
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) r.setAnimationLoop(null); else r.setAnimationLoop(render); }, { threshold: 0 }).observe(document.getElementById('gl'));
    function render() { tk.rotation.x += 0.0013; tk.rotation.y += 0.0019; ico.rotation.y += 0.0006; ico.rotation.x -= 0.0004; if (!isMob()) { tk.rotation.x += (tgX - tk.rotation.x) * 0.016; tk.rotation.y += (tgY - tk.rotation.y) * 0.016; } cam.position.y = -sY * 2; tk.material.opacity = Math.max(0.01, 0.03 - sY * 0.025); r.render(s, cam); }
    r.setAnimationLoop(render);
    window.addEventListener('resize', () => { cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); r.setSize(window.innerWidth, window.innerHeight); });
  })();
}