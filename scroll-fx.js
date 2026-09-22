/* Polymath Wizard — scroll layer, "instrument" style
   Language: hairline rules that draw themselves, hard-edged mask reveals (no rounding,
   no tilt, no skew), a scroll ruler with a live readout, and one curtain moment at the hero.
   Loads after script.js. Does nothing if GSAP is missing or the visitor prefers reduced motion. */
(function () {
  'use strict';
  const CFG = { smooth: true, lerp: 0.11 };            // set smooth:false for native scrolling

  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.documentElement.classList.add('fx');

  const clamp = gsap.utils.clamp, pad = (n, l = 2) => String(n).padStart(l, '0');
  const EXPO = 'expo.out';

  /* 1 ─ Gentle inertial scroll ──────────────────────────────────────────── */
  let lenis = null;
  if (CFG.smooth && window.Lenis) {
    lenis = new Lenis({ lerp: CFG.lerp, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('textarea').forEach(t => t.setAttribute('data-lenis-prevent', ''));

  const goTo = (target, offset = 0) => {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4, easing: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) });
    else {
      const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY + offset;
      scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    if (id === '#top') { e.preventDefault(); goTo(0); return; }
    const t = $(id);
    if (!t) return;
    e.preventDefault(); goTo(t, -30);
  }));

  /* 2 ─ Header progress hairline + scroll ruler ─────────────────────────── */
  const prog = document.createElement('div');
  prog.className = 'fx-progress'; prog.setAttribute('aria-hidden', 'true'); prog.innerHTML = '<i></i>';
  document.body.appendChild(prog);

  const defs = [['.hero', 'Intro'], ['.statement', 'The Idea'], ['#difference', 'Pedagogy'], ['#ai', 'Adaptive AI'],
    ['#wizards', 'Wizards'], ['#philosophy', 'Philosophy'], ['.mindset', 'Mindset'], ['#contact', 'Contact']]
    .map(([s, l]) => ({ el: $(s), l })).filter(d => d.el);

  const ruler = document.createElement('aside');
  ruler.className = 'fx-ruler'; ruler.setAttribute('aria-label', 'Page sections');
  ruler.innerHTML = '<div class="fx-line"><i></i></div><div class="fx-readout"><small>01 / ' + pad(defs.length) + '</small><b>000%</b></div>';
  const line = $('.fx-line', ruler), fill = $('i', line), secTxt = $('small', ruler), pctTxt = $('b', ruler);
  const ticks = defs.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'fx-tick'; b.setAttribute('aria-label', 'Go to ' + d.l);
    b.innerHTML = '<span>' + pad(i + 1) + ' ' + d.l + '</span>';
    b.addEventListener('click', () => (i === 0 ? goTo(0) : goTo(d.el, -30)));
    line.appendChild(b);
    ScrollTrigger.create({
      trigger: d.el, start: 'top 55%', end: 'bottom 55%',
      onToggle: self => {
        if (!self.isActive) return;
        ticks.forEach(t => t.classList.remove('on')); b.classList.add('on');
        secTxt.textContent = pad(i + 1) + ' / ' + pad(defs.length);
      }
    });
    return b;
  });
  document.body.appendChild(ruler);

  const layoutTicks = () => {
    const max = ScrollTrigger.maxScroll(window) || 1;
    defs.forEach((d, i) => {
      const top = i === 0 ? 0 : d.el.getBoundingClientRect().top + scrollY;
      ticks[i].style.top = clamp(0, 1, top / max) * 100 + '%';
    });
  };
  ScrollTrigger.addEventListener('refresh', layoutTicks);
  layoutTicks();

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: s => {
      fill.style.transform = 'scaleY(' + s.progress + ')';
      prog.firstChild.style.transform = 'scaleX(' + s.progress + ')';
      pctTxt.textContent = pad(Math.round(s.progress * 100), 3) + '%';
    }
  });

  /* 3 ─ Masked type ─────────────────────────────────────────────────────── */
  function split(el, tag, masked) {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const o = document.createElement(tag);
          if (masked) { const i = document.createElement('pw-i'); i.textContent = part; o.appendChild(i); }
          else o.textContent = part;
          frag.appendChild(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
    return masked ? $$('pw-i', el) : $$(tag, el);
  }

  /* 4 ─ Hero: load-in, then the page slides over it ─────────────────────── */
  const hero = $('.hero');
  if (hero) {
    const shade = document.createElement('div');
    shade.className = 'fx-hero-shade'; hero.appendChild(shade);

    const words = split($('h1', hero), 'pw-w', true);
    const fades = ['.eyebrow', '.hero-sub', '.hero-actions'].map(s => $(s, hero));
    gsap.set(words, { yPercent: 105 });
    gsap.set(fades, { autoAlpha: 0, y: 18 });
    gsap.set($('.hero-footer', hero), { opacity: 0 });
    gsap.timeline({ delay: 0.2, defaults: { ease: EXPO } })
      .to(fades[0], { autoAlpha: 1, y: 0, duration: 1 }, 0)
      .to(words, { yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.1)
      .to([fades[1], fades[2]], { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.7)
      .to($('.hero-footer', hero), { opacity: 1, duration: 1.2 }, 1);

    const hs = { p: 0 };
    gsap.timeline({ scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'top top', scrub: true } })
      .to('.hero-copy', { yPercent: -12, ease: 'none' }, 0)
      .to('.hero-copy', { opacity: 0, ease: 'power2.in' }, 0)
      .to('.hero-grid', { yPercent: 6, ease: 'none' }, 0)
      .to(shade, { opacity: 0.9, ease: 'none' }, 0)
      .to(hs, { p: 1, ease: 'none', onUpdate: () => { window.__heroP = hs.p; } }, 0);   // script.js reads this for the camera
  }

  /* 5 ─ Headlines rise through a mask; hairline rules draw across ───────── */
  $$('.statement-main h2,.section-head h2,.ai-copy h2,.mindset-copy h2,.contact-intro h2').forEach(h => {
    const w = split(h, 'pw-w', true);
    gsap.fromTo(w, { yPercent: 105 }, { yPercent: 0, duration: 1.15, ease: EXPO, stagger: 0.045,
      scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  const draw = sel => gsap.utils.toArray(sel).forEach(el =>
    gsap.fromTo(el, { '--d': 0 }, { '--d': 1, duration: 1.5, ease: EXPO, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  draw('.section-head'); draw('.statement'); draw('.ai-points'); draw('.ai-points li');

  /* Body copy reads in with your scroll */
  [['.statement-main p', 'top 88%', 'bottom 58%'], ['.mindset-copy p:not(.eyebrow)', 'top 88%', 'bottom 60%']].forEach(([sel, start, end]) => {
    const el = $(sel); if (!el) return;
    const w = split(el, 'pw-r', false);
    gsap.fromTo(w, { opacity: 0.14 }, { opacity: 1, ease: 'none', duration: 0.4, stagger: 0.1, scrollTrigger: { trigger: el, start, end, scrub: true } });
  });

  /* 6 ─ Panels rise in with a hard-edged wipe (clip only — no scaling, canvases stay exact) */
  const wipe = (els, from, trigger, start, extra = {}) =>
    gsap.fromTo(els, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: EXPO, clearProps: 'clipPath',
      scrollTrigger: { trigger, start, once: true }, ...extra });

  const card = $('#pedagogy-card'), toggle = $('#pedagogy-toggle');
  if (card) {
    wipe(card, 'inset(100% 0% 0% 0%)', card, 'top 85%');
    if (toggle) {                                            // flips to Interact on its own; a real click/key wins forever
      let touched = false;
      toggle.addEventListener('click', e => { if (e.isTrusted) touched = true; });
      toggle.addEventListener('keydown', () => { touched = true; });
      const flip = to => { if (!touched && card.dataset.mode !== to) toggle.click(); };
      ScrollTrigger.create({
        trigger: card, start: 'top 42%', end: 'bottom 30%',
        onEnter: () => flip('simulation'), onEnterBack: () => flip('simulation'), onLeaveBack: () => flip('textbook')
      });
    }
  }
  if ($('#adaptive-mini')) {
    wipe('#adaptive-mini', 'inset(100% 0% 0% 0%)', '#adaptive-mini', 'top 88%');
    gsap.from('.ai-points li > *', { opacity: 0, y: 14, duration: 1, ease: EXPO, stagger: 0.08, scrollTrigger: { trigger: '.ai-points', start: 'top 85%', once: true } });
    gsap.from('.flow > *', { opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.07, scrollTrigger: { trigger: '.flow', start: 'top 92%', once: true } });
  }
  if ($('.wizard-grid')) wipe('.wizard-card', 'inset(100% 0% 0% 0%)', '.wizard-grid', 'top 82%', { stagger: 0.1 });
  if ($('#sim-panel')) wipe('#sim-panel', 'inset(0% 100% 0% 0%)', '#sim-panel', 'top 82%', { duration: 1.5 });
  gsap.from('.contact-form > *', { opacity: 0, y: 18, duration: 0.9, ease: EXPO, stagger: 0.07, scrollTrigger: { trigger: '.contact-form', start: 'top 85%', once: true } });

  /* 7 ─ Philosophy notebook: only a gentle entrance. Scrolling never turns pages (buttons, keys, taps and swipes do). */
  if ($('#nb-book')) wipe('#nb-book', 'inset(100% 0% 0% 0%)', '#nb-book', 'top 88%');

  /* 8 ─ Mindset: the network draws itself in — edges first, then nodes settle ── */
  if ($('#mn-mark')) {
    gsap.set('#mn-mark .mn-node', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
    gsap.set('#mn-mark .edge', { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.mindset', start: 'top 70%', once: true } });
    tl.to('#mn-mark .mn-node', { opacity: 1, scale: 1, duration: 0.7, ease: EXPO, stagger: 0.1 })
      .to('#mn-mark .edge', { opacity: 1, duration: 0.9, ease: 'power1.out', stagger: 0.06 }, 0.25);
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
