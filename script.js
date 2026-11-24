/* THE PLAN — motion and interaction controller
   Edit the values in CONFIG to tune the experience. */
(() => {
  'use strict';

  const CONFIG = {
    smoothWheel: true,
    lerp: 0.085,
    scrub: 1.25,
    themeDuration: 1.9,
    revealY: 22,
    mobileBreakpoint: 720,
    accent: '#c83c36'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia(`(max-width: ${CONFIG.mobileBreakpoint}px)`).matches;

  const root = document.documentElement;
  const toggle = $('#themeToggle');
  const toggleLabel = $('.toggle-label');
  const wash = $('.transition-wash');
  const cursorGlow = $('.cursor-glow');
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');

  // Theme preference: explicit visitor choice wins over system preference.
  function syncThemeLabel() {
    const day = root.dataset.theme === 'day';
    toggleLabel.textContent = day ? 'BLUEPRINT DAY' : 'NIGHT JOB';
    toggle.setAttribute('aria-label', day ? 'Switch to Night Job theme' : 'Switch to Blueprint Day theme');
    $('.toggle-orb').style.background = day ? '#6f9bb7' : '#e9a75d';
    $('.toggle-orb').style.boxShadow = day ? '0 0 12px #6f9bb7' : '0 0 12px #e9a75d';
  }
  syncThemeLabel();

  function setTheme(nextTheme) {
    const apply = () => {
      root.dataset.theme = nextTheme;
      try { localStorage.setItem('the-plan-theme', nextTheme); } catch (_) {}
      syncThemeLabel();
    };

    if (reduceMotion) {
      apply();
      return;
    }

    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const supportsViewTransition = typeof document.startViewTransition === 'function';

    if (supportsViewTransition) {
      const transition = document.startViewTransition(apply);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: CONFIG.themeDuration * 1000, easing: 'cubic-bezier(.22,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => {});
    } else {
      gsap.to(wash, { opacity: 1, duration: .65, ease: 'sine.inOut', onComplete: () => {
        apply();
        gsap.to(wash, { opacity: 0, duration: 1.25, ease: 'sine.inOut' });
      }});
    }
  }

  toggle.addEventListener('click', () => setTheme(root.dataset.theme === 'night' ? 'day' : 'night'));

  // Cursor spotlight is decorative only; disabled on touch and reduced-motion devices.
  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      gsap.to(cursorGlow, { x: event.clientX, y: event.clientY, duration: .7, ease: 'power2.out', overwrite: 'auto' });
    }, { passive: true });
  }

  // Mobile navigation.
  function closeMenu() {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle.addEventListener('click', () => {
    const open = !mobileNav.classList.contains('open');
    mobileNav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#mobileNav a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (!isMobile()) closeMenu(); }, { passive: true });

  $('#skipIntro').addEventListener('click', () => {
    const destination = isMobile() ? '#jobs' : '#jobs';
    if (window.lenisInstance) window.lenisInstance.scrollTo(destination, { offset: -30, duration: 1.35 });
    else document.querySelector(destination).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // Motion system: one GSAP ticker drives Lenis. ScrollTrigger only listens to Lenis updates.
  let lenis = null;
  let tickerCallback = null;
  if (!reduceMotion && window.Lenis && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({
      lerp: CONFIG.lerp,
      smoothWheel: CONFIG.smoothWheel,
      wheelMultiplier: .9,
      touchMultiplier: 1.15,
      normalizeWheel: true
    });
    window.lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
    tickerCallback = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
  } else if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Scroll-linked visual storytelling. All animated properties are transform/opacity.
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.utils.toArray('.reveal').forEach((element) => {
      gsap.to(element, {
        y: 0, opacity: 1, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true }
      });
    });

    // The blueprint route draws as the visitor leaves the briefing.
    gsap.to('.route-draw', {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-board', start: 'top 75%', end: 'bottom 25%', scrub: CONFIG.scrub }
    });

    // The opening scene has a restrained pinned camera-like transition.
    if (!isMobile()) {
      const heroTimeline = gsap.timeline({
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=75%', scrub: CONFIG.scrub, pin: true, pinSpacing: true }
      });
      heroTimeline
        .to('.hero-copy', { y: -34, opacity: .45, ease: 'power2.inOut' }, 0)
        .to('.hero-board', { y: -54, rotate: -1.5, scale: .96, ease: 'power2.inOut' }, 0)
        .to('.door-frame', { x: 35, opacity: 0, ease: 'power2.inOut' }, 0)
        .to('.hero-grid', { opacity: .25, ease: 'sine.inOut' }, 0);
    }

    // Section entrances: measured movement, no layout properties animated.
    $$('.crew-card').forEach((card, index) => {
      gsap.fromTo(card, { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: .85, ease: 'power2.out', delay: index * .07,
        scrollTrigger: { trigger: card, start: 'top 92%', once: true }
      });
    });
    $$('.case-file').forEach((card, index) => {
      gsap.fromTo(card, { y: 35, opacity: 0, rotate: index % 2 ? 1.8 : -1.8 }, {
        y: 0, opacity: 1, rotate: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true }
      });
    });
    $$('.operation-item, .vault-record').forEach((item, index) => {
      gsap.fromTo(item, { x: index % 2 ? 18 : -18, opacity: 0 }, {
        x: 0, opacity: 1, duration: .9, ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 90%', once: true }
      });
    });

    // Vault dial turns as the archive is reached; it is decorative, never a gate.
    gsap.to('.vault-door', {
      rotate: 0, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.vault-door-wrap', start: 'top 80%', end: 'center center', scrub: CONFIG.scrub }
    });

    // One global reading-progress indicator.
    gsap.to('.scroll-progress span', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .2 }
    });

    // Refresh after fonts settle; this is the single explicit refresh.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    } else {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  } else {
    $$('.reveal').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    $('.scroll-progress span').style.transform = 'scaleX(1)';
  }

  // Keep navigation usable when smooth scrolling is active.
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      if (lenis) {
        event.preventDefault();
        lenis.scrollTo(target, { offset: -22, duration: 1.2 });
      }
    });
  });

  // Clean up if this page is ever embedded and removed by a navigation framework.
  window.addEventListener('pagehide', () => {
    if (lenis) {
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      window.lenisInstance = null;
    }
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, { once: true });

  // Avoid a flash of unstyled content if a CDN is unavailable.
  document.body.classList.add('ready');
})();