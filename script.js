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
    keypadCode: '2468', // Playful frontend easter egg only; never use as real access control.
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
  const typeTargets = $$('[data-typewriter]');
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

  // Resolve each intro glyph once for a short scramble effect without flicker.
  if (!reduceMotion) {
    const scrambleAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $$('[data-scramble]').forEach((element) => {
      const fullText = element.dataset.scramble || element.textContent;
      const heading = element.closest('h1');
      if (heading) heading.setAttribute('aria-label', fullText);
      element.textContent = '';
      const glyphs = [];
      fullText.split(/(\s+)/).forEach((part) => {
        if (/^\s+$/.test(part)) {
          element.append(document.createTextNode(part));
          return;
        }
        const word = document.createElement('span');
        word.className = 'scramble-word';
        Array.from(part).forEach((character) => {
          const glyph = document.createElement('span');
          glyph.className = 'scramble-char';
          glyph.textContent = scrambleAlphabet[Math.floor(Math.random() * scrambleAlphabet.length)];
          word.append(glyph);
          glyphs.push({ glyph, character });
        });
        element.append(word);
      });
      let index = 0;
      const resolveNext = () => {
        if (index >= glyphs.length) return;
        glyphs[index].glyph.textContent = glyphs[index].character;
        glyphs[index].glyph.classList.add('is-decoded');
        index += 1;
        window.setTimeout(resolveNext, 42);
      };
      window.setTimeout(resolveNext, 260);
    });
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

  const skipIntro = $('#skipIntro');
  const updateSkipIntroVisibility = () => {
    skipIntro.classList.toggle('is-hidden', window.scrollY > $('.hero').offsetHeight * .65);
  };
  window.addEventListener('scroll', updateSkipIntroVisibility, { passive: true });
  updateSkipIntroVisibility();
  skipIntro.addEventListener('click', () => {
    const destination = '#featured';
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
        .to('.hero-grid', { opacity: .25, ease: 'sine.inOut' }, 0);
    }

    // Section entrances: measured movement, no layout properties animated.
    $$('.featured-card').forEach((card, index) => {
      gsap.fromTo(card, { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: .8, ease: 'power2.out', delay: index * .1,
        scrollTrigger: { trigger: card, start: 'top 90%', once: true }
      });
    });
    $$('.obstacle-card').forEach((card, index) => {
      gsap.fromTo(card, { y: 34, opacity: 0, rotate: index % 2 ? 1.5 : -1.5 }, {
        y: 0, opacity: 1, rotate: 0, duration: .9, ease: 'power2.out', delay: index * .12,
        scrollTrigger: { trigger: card, start: 'top 88%', once: true }
      });
    });
    gsap.fromTo('.obstacle-route', { scaleX: 0 }, {
      scaleX: 1, transformOrigin: 'left center', ease: 'none',
      scrollTrigger: { trigger: '.obstacle-route', start: 'top 85%', end: 'bottom 60%', scrub: CONFIG.scrub }
    });
    $$('.case-file').forEach((card, index) => {
      gsap.fromTo(card, { y: 35, opacity: 0, rotate: index % 2 ? 1.8 : -1.8 }, {
        y: 0, opacity: 1, rotate: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true }
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

  // This frontend-only puzzle is optional; the portfolio stays fully readable without it.
  const keypad = $('#vaultKeypad');
  const keypadInput = $('#keypadInput');
  const keypadFeedback = $('#keypadFeedback');
  const celebration = $('#vaultCelebration');
  let keypadEntry = '';
  let keypadObserver = null;
  if (keypad) {
    if ('IntersectionObserver' in window) {
      keypadObserver = new IntersectionObserver(([entry]) => {
        document.body.classList.toggle('keypad-in-view', entry.isIntersecting);
      }, { threshold: .05 });
      keypadObserver.observe(keypad);
    }

    keypadInput.addEventListener('input', () => {
      keypadEntry = keypadInput.value.replace(/\D/g, '').slice(0, 4);
      keypadInput.value = keypadEntry;
      keypadInput.removeAttribute('aria-invalid');
    });

    keypad.addEventListener('click', (event) => {
      const key = event.target.closest('[data-key]');
      if (!key || keypad.classList.contains('unlocked')) return;
      const value = key.dataset.key;
      keypadInput.removeAttribute('aria-invalid');
      if (value === 'clear') {
        keypadEntry = '';
        keypadFeedback.textContent = 'Code cleared. Enter the four digits from the clue.';
      } else if (/^\d$/.test(value) && keypadEntry.length < 4) {
        keypadEntry += value;
        keypadFeedback.textContent = `${keypadEntry.length} of 4 digits entered.`;
      }
      keypadInput.value = keypadEntry;
    });

    keypad.addEventListener('submit', (event) => {
      event.preventDefault();
      if (keypad.classList.contains('unlocked')) return;
      if (keypadEntry !== CONFIG.keypadCode) {
        keypadFeedback.textContent = keypadEntry
          ? 'That sequence is not quite right. Re-read the personnel-file clue and try again.'
          : 'Enter the four digits from the personnel-file clue.';
        keypadInput.setAttribute('aria-invalid', 'true');
        keypadEntry = '';
        keypadInput.value = '';
        keypadInput.focus();
        return;
      }

      keypad.classList.add('unlocked');
      keypadFeedback.textContent = 'Secret note unlocked. The rest of the portfolio was always open.';
      keypad.querySelectorAll('button, input').forEach((control) => { control.disabled = true; });
      celebration.hidden = false;
      if (!reduceMotion && window.gsap) {
        gsap.fromTo(celebration, { scale: .88, opacity: 0, y: 12 }, {
          scale: 1, opacity: 1, y: 0, duration: .75, ease: 'back.out(1.7)'
        });
      }
      $('#secretTitle').focus();
    });
  }

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
    gsap.to('.field-route-draw', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.field-map', start: 'top 90%', end: 'bottom 35%', scrub: CONFIG.scrub } });
    gsap.to('.route-marker', { x: () => Math.max(0, $('.field-map').clientWidth - 45), y: -58, ease: 'none', scrollTrigger: { trigger: '.field-map', start: 'top 90%', end: 'bottom 35%', scrub: CONFIG.scrub } });
    gsap.to('.getaway-route-draw', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.getaway-route', start: 'top 90%', end: 'bottom 55%', scrub: CONFIG.scrub } });
  } else {
    $$('.case-file').forEach(card => card.classList.add('is-static'));
    $$('.field-route-draw,.timeline-string,.getaway-route-draw').forEach(path => { path.style.strokeDashoffset = '0'; });
  }

  // Clean up if this page is ever embedded and removed by a navigation framework.
  window.addEventListener('pagehide', () => {
    window.clearInterval(clockTimer);
    if (keypadObserver) keypadObserver.disconnect();
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