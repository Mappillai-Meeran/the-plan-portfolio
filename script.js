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
    accent: '#c83c36',
    keypadCode: '2468', // Replace with your preferred four-digit code.
    clockTimeZone: 'Asia/Kolkata'
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

  // Optional case-file screenshots: provide a local path in data-case-image.
  // Empty paths remain hidden and never create broken-image placeholders.
  $$('[data-case-image]').forEach((image) => {
    const path = (image.dataset.caseImage || '').trim();
    if (!path) return;
    image.src = path;
    image.closest('.case-screenshot')?.removeAttribute('hidden');
  });

  // Typewriter intro: the line and name are typed in sequence.
  const typeTargets = $('[data-typewriter]');
  if (typeTargets.length) {
    if (reduceMotion) {
      typeTargets.forEach(el => { el.textContent = el.dataset.typewriter; });
    } else {
      const typeOne = (el, startDelay = 0) => {
        const fullText = el.dataset.typewriter || el.textContent;
        el.setAttribute('aria-label', fullText);
        el.textContent = '';
        el.classList.add('typing');
        let index = 0;
        window.setTimeout(function writeNext() {
          el.textContent = fullText.slice(0, index + 1);
          index += 1;
          if (index < fullText.length) {
            window.setTimeout(writeNext, 42 + Math.random() * 34);
          } else {
            el.classList.remove('typing');
          }
        }, startDelay);
      };
      typeTargets.forEach((el, index) => typeOne(el, index * 1150 + 450));
    }
  }

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

    if (!window.gsap) { apply(); return; }
    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const supportsViewTransition = typeof document.startViewTransition === 'function';

    if (supportsViewTransition) {
      const transition = document.startViewTransition(apply);
      transition.ready.then(() => {
        gsap.to(wash, { opacity: .28, duration: .8, yoyo: true, repeat: 1, ease: 'sine.inOut' });
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
  if (!reduceMotion && window.gsap && matchMedia('(pointer:fine)').matches) {
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
    // A more visible opening sequence: board enters, evidence pins land, route draws.
    gsap.fromTo('.hero-board',
      { y: 48, opacity: 0, rotate: 3, scale: .94 },
      { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.35, delay: .25, ease: 'power3.out' }
    );
    gsap.fromTo('.plan-card, .mini-file',
      { y: 22, opacity: 0, rotate: -3 },
      { y: 0, opacity: 1, rotate: 0, duration: .8, delay: .85, stagger: .18, ease: 'back.out(1.35)' }
    );
    gsap.fromTo('.pin',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: .48, delay: 1.35, stagger: .22, ease: 'back.out(2.2)' }
    );
    gsap.fromTo('.hero-title',
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.05, delay: .12, ease: 'power2.out' }
    );
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

  
  // PHASES 2–6: ambient details and skippable section interactions.
  const clock = $('#missionClock');
  function updateMissionClock() {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: CONFIG.clockTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  }
  updateMissionClock();
  const clockTimer = window.setInterval(updateMissionClock, 1000);

  // Optional four-digit vault easter egg. No content is gated by it.
  const keypad = $('.vault-keypad'), keypadDisplay = $('#keypadDisplay'), keypadFeedback = $('#keypadFeedback');
  let keypadEntry = '';
  if (keypad) keypad.addEventListener('click', (event) => {
    const key = event.target.closest('[data-key]');
    if (!key || keypad.classList.contains('unlocked')) return;
    const value = key.dataset.key;
    if (value === 'clear') keypadEntry = '';
    else if (value === 'enter') {
      if (keypadEntry === CONFIG.keypadCode) {
        keypad.classList.add('unlocked');
        keypadFeedback.textContent = 'Vault unlocked. The archive was open all along.';
        if (!reduceMotion && window.gsap) gsap.fromTo('.vault-celebration', { scale: .8, opacity: 0 }, { scale: 1, opacity: 1, duration: .65, ease: 'back.out(1.8)' });
      } else { keypadFeedback.textContent = 'Not quite. Try again, or skip this optional check.'; keypadEntry = ''; }
    } else if (keypadEntry.length < 4) keypadEntry += value;
    keypadDisplay.textContent = keypadEntry.padEnd(4, '_').split('').join(' ');
  });

  // Case-file safe dials: click or tap to reveal a stamp.
  $$('.case-file').forEach((card) => {
    const dial = $('.safe-dial', card);
    if (!dial) return;
    dial.addEventListener('click', () => {
      const opened = card.classList.toggle('is-open');
      dial.setAttribute('aria-expanded', String(opened));
      const stamp = $('.case-open-stamp', card);
      if (stamp) stamp.textContent = opened ? 'CLEARED' : 'CASE OPEN';
      dial.setAttribute('aria-label', opened ? 'Close this case file' : 'Open this case file');
    });
  });

  const countdown = $('#finalCountdown');
  if (countdown) {
    const updateCountdown = () => {
      const range = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / range));
      countdown.textContent = String(Math.max(0, Math.ceil(10 * (1 - progress))));
    };
    window.addEventListener('scroll', updateCountdown, { passive: true });
    updateCountdown();
  }

  // One GSAP ticker remains the only Lenis driver. These timelines subscribe
  // to ScrollTrigger and animate transforms, opacity and SVG stroke offsets.
  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.to('.security-door-panel', { rotateY: -72, ease: 'power2.inOut', scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=65%', scrub: CONFIG.scrub } });
    gsap.to('.security-door', { opacity: .15, y: 35, ease: 'sine.inOut', scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=80%', scrub: CONFIG.scrub } });
    gsap.to('.security-camera', { rotate: 24, ease: 'sine.inOut', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: CONFIG.scrub } });
    gsap.to('.notebook-page-edge', { rotateY: -24, transformOrigin: 'right center', ease: 'power2.inOut', scrollTrigger: { trigger: '.profile-section', start: 'top 70%', end: 'bottom 45%', scrub: CONFIG.scrub } });
    gsap.to('.redaction-stack span', { scaleX: 0, opacity: .25, stagger: .2, ease: 'power2.inOut', scrollTrigger: { trigger: '.redaction-stack', start: 'top 80%', end: 'bottom 40%', scrub: CONFIG.scrub } });
    gsap.to('.timeline-string', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.mastermind-timeline', start: 'top 90%', end: 'bottom 50%', scrub: CONFIG.scrub } });
    gsap.to('.laser-grid', { x: 35, y: -20, ease: 'none', scrollTrigger: { trigger: '.crew-section', start: 'top bottom', end: 'bottom top', scrub: CONFIG.scrub } });
    gsap.to('.case-strings path', { strokeDashoffset: -120, ease: 'none', scrollTrigger: { trigger: '.case-board', start: 'top 85%', end: 'bottom 20%', scrub: CONFIG.scrub } });
    gsap.to('.safe-dial span', { rotate: 360, ease: 'none', scrollTrigger: { trigger: '.case-board', start: 'top 85%', end: 'bottom 20%', scrub: CONFIG.scrub } });
    gsap.to('.field-route-draw', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.field-map', start: 'top 90%', end: 'bottom 35%', scrub: CONFIG.scrub } });
    gsap.to('.route-marker', { x: () => Math.max(0, $('.field-map').clientWidth - 45), y: -58, ease: 'none', scrollTrigger: { trigger: '.field-map', start: 'top 90%', end: 'bottom 35%', scrub: CONFIG.scrub } });
    gsap.to('.vault-door', { rotate: 162, ease: 'power2.inOut', scrollTrigger: { trigger: '.vault-door-wrap', start: 'top 80%', end: 'center center', scrub: CONFIG.scrub } });
    gsap.to('.vault-bolt', { x: (index) => index % 2 ? 10 : -10, opacity: .25, stagger: .04, ease: 'power2.inOut', scrollTrigger: { trigger: '.vault-door-wrap', start: 'top 65%', end: 'center 35%', scrub: CONFIG.scrub } });
    gsap.to('.getaway-route-draw', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.getaway-route', start: 'top 90%', end: 'bottom 55%', scrub: CONFIG.scrub } });
    gsap.to('.vault-door', { rotate: 0, ease: 'power2.inOut', scrollTrigger: { trigger: '.getaway-section', start: 'top 80%', end: 'top 25%', scrub: CONFIG.scrub } });
    gsap.fromTo('.contact-actions', { y: 18, opacity: .35 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.getaway-section', start: 'top 78%', end: 'top 28%', scrub: CONFIG.scrub } });
    gsap.to('.mission-complete', { y: -12, rotate: 0, ease: 'sine.inOut', scrollTrigger: { trigger: '.getaway-section', start: 'top 80%', end: 'bottom bottom', scrub: CONFIG.scrub } });
  } else {
    $$('.case-file').forEach(card => card.classList.add('is-static'));
    $$('.field-route-draw,.timeline-string,.getaway-route-draw').forEach(path => { path.style.strokeDashoffset = '0'; });
  }

  // Clean up if this page is ever embedded and removed by a navigation framework.
  window.addEventListener('pagehide', () => {
    window.clearInterval(clockTimer);
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