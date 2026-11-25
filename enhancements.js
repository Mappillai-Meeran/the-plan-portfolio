/* ═══════════════════════════════════════════════════════════
   THE PLAN — enhancements.js v2.0
   Cinematic Money Heist interactive modules:
   1. Dynamic Audio Synthesis (Web Audio API - Clicks, Drones, Decryption blips)
   2. Cinematic Terminal Intro Screen with Progress Simulation
   3. Custom Crosshair / Target Cursor System
   4. Parallax Depth for Hero Blueprint Elements
   5. Animated Evidence Strings (SVG draw on scroll)
   6. Vault Door Interactive Scroll / Spin Dynamics
   7. Dalí Mask Easter Eggs & Intercepted Transmission
   8. Title Glitch & Quick-Nav Spy Tracker
═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ─────────────────────────────────────────────────────────
     1. SOUND SYSTEM (WEB AUDIO API — NO EXTERNAL ASSETS NEEDED)
  ───────────────────────────────────────────────────────── */
  class SoundDirector {
    constructor() {
      this.ctx = null;
      this.ambientGain = null;
      this.ambientOsc = null;
      this.ambientSubOsc = null;
      this.isEnabled = false;
      this.soundToggle = document.getElementById('soundToggle');
      this.initToggle();
    }

    initCtx() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    initToggle() {
      if (!this.soundToggle) return;
      this.soundToggle.addEventListener('click', () => {
        this.initCtx();
        if (!this.isEnabled) {
          this.startAmbient();
          this.isEnabled = true;
          this.soundToggle.setAttribute('aria-pressed', 'true');
          const label = this.soundToggle.querySelector('.sound-label');
          if (label) label.textContent = 'TRANSMITTING';
          this.playBeep(880, 0.08, 'sine', 0.15);
        } else {
          this.stopAmbient();
          this.isEnabled = false;
          this.soundToggle.setAttribute('aria-pressed', 'false');
          const label = this.soundToggle.querySelector('.sound-label');
          if (label) label.textContent = 'SILENCE';
        }
      });
    }

    startAmbient() {
      if (!this.ctx) return;
      try {
        // Low tension heist drone (55Hz + 110Hz sub)
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 2.5);

        this.ambientOsc = this.ctx.createOscillator();
        this.ambientOsc.type = 'sawtooth';
        this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

        // Low-pass filter to make it an ominous drone
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, this.ctx.currentTime);

        this.ambientSubOsc = this.ctx.createOscillator();
        this.ambientSubOsc.type = 'sine';
        this.ambientSubOsc.frequency.setValueAtTime(110, this.ctx.currentTime);

        this.ambientOsc.connect(filter);
        this.ambientSubOsc.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        this.ambientOsc.start();
        this.ambientSubOsc.start();
      } catch (_) {}
    }

    stopAmbient() {
      if (!this.ambientGain || !this.ctx) return;
      try {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.ambientOsc) { this.ambientOsc.stop(); this.ambientOsc.disconnect(); }
          if (this.ambientSubOsc) { this.ambientSubOsc.stop(); this.ambientSubOsc.disconnect(); }
        }, 850);
      } catch (_) {}
    }

    playBeep(freq = 600, duration = 0.05, type = 'sine', volume = 0.08) {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (_) {}
    }

    playDecryptBlip() {
      if (!this.isEnabled) return;
      const pitches = [520, 640, 780, 920, 1100];
      const freq = pitches[Math.floor(Math.random() * pitches.length)];
      this.playBeep(freq, 0.04, 'triangle', 0.04);
    }
  }

  const sound = new SoundDirector();

  /* ─────────────────────────────────────────────────────────
     2. CINEMATIC INTRO SCREEN ORCHESTRATION
  ───────────────────────────────────────────────────────── */
  const introScreen = document.getElementById('introScreen');
  const introBarFill = document.getElementById('introBarFill');
  const introPercent = document.getElementById('introPercent');
  const introCode = document.getElementById('introCode');
  const introSkip = document.getElementById('introSkip');

  function dismissIntro() {
    if (!introScreen || introScreen.classList.contains('done')) return;
    introScreen.classList.add('done');
    document.body.style.overflow = '';
    try { sessionStorage.setItem('the-plan-intro-seen', 'true'); } catch (_) {}
  }

  const hasSeenIntro = sessionStorage.getItem('the-plan-intro-seen') === 'true';

  if (introScreen && !hasSeenIntro && !prefersReducedMotion) {
    document.body.style.overflow = 'hidden';

    let progress = 0;
    const stages = [
      { at: 15, text: 'AUTHENTICATING TELEMETRY...' },
      { at: 45, text: 'BYPASSING PERIMETER FIREWALL...' },
      { at: 75, text: 'EXTRACTING CASE FILE MM—001...' },
      { at: 95, text: 'CHANNEL SECURED · THE PLAN ACTIVE' }
    ];

    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 3;
      if (progress > 100) progress = 100;

      if (introBarFill) introBarFill.style.width = progress + '%';
      if (introPercent) introPercent.textContent = progress + '%';

      for (let s of stages) {
        if (progress >= s.at && introCode) {
          introCode.textContent = s.text;
        }
      }

      if (progress % 12 === 0) {
        sound.playDecryptBlip();
      }

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(dismissIntro, 500);
      }
    }, 55);

    if (introSkip) {
      introSkip.addEventListener('click', () => {
        clearInterval(timer);
        dismissIntro();
      });
    }
  } else if (introScreen) {
    introScreen.classList.add('done');
  }

  /* ─────────────────────────────────────────────────────────
     3. TACTICAL TARGET / CROSSHAIR CURSOR
  ───────────────────────────────────────────────────────── */
  const cursor = document.getElementById('customCursor');
  const dot = document.getElementById('cursorDot');

  if (cursor && dot && isFinePointer && !prefersReducedMotion) {
    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    // Smooth lag loop for cursor ring
    function renderCursor() {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.transform = `translate(${curX}px, ${curY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Interactive element expansions
    const interactiveSelectors = 'a, button, input, .crew-card, .case-file, .obstacle-card, .vault-door';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        sound.playBeep(1200, 0.02, 'sine', 0.02);
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    window.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    window.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
  }

  /* ─────────────────────────────────────────────────────────
     4. HERO BLUEPRINT MULTI-DEPTH PARALLAX
  ───────────────────────────────────────────────────────── */
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion && !window.matchMedia('(max-width: 768px)').matches) {
    gsap.to('.pin-one', {
      y: -50,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });
    gsap.to('.pin-two', {
      y: -75,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
    });
    gsap.to('.pin-three', {
      y: -40,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.9 }
    });
    gsap.to('.plan-card', {
      y: -30,
      rotate: -3.5,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
    gsap.to('.mini-file', {
      y: -60,
      rotate: 7,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.3 }
    });
    gsap.to('.blueprint-mask-wm', {
      y: 25,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }

  /* ─────────────────────────────────────────────────────────
     5. PROGRESSIVE DRAW FOR EVIDENCE STRINGS (.case-strings)
  ───────────────────────────────────────────────────────── */
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    const stringPaths = document.querySelectorAll('.case-strings path');
    stringPaths.forEach((path, idx) => {
      try {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = length;

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.case-board',
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: 1.4,
            delay: idx * 0.2
          }
        });
      } catch (_) {}
    });
  }

  /* ─────────────────────────────────────────────────────────
     6. VAULT DOOR ROTATIONAL MOMENTUM ON SCROLL
  ───────────────────────────────────────────────────────── */
  const vaultDoor = document.getElementById('vaultDoor');
  if (vaultDoor && window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.to(vaultDoor, {
      rotate: 160,
      ease: 'none',
      scrollTrigger: {
        trigger: '.vault-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.8
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     7. DALÍ MASK EASTER EGGS & INTERCEPT ALERT
  ───────────────────────────────────────────────────────── */
  const maskOverlay = document.getElementById('maskOverlay');
  const heroTitle = document.getElementById('heroTitle');
  const missionStamp = document.getElementById('missionStamp');

  function triggerMaskOverlay() {
    if (!maskOverlay) return;
    maskOverlay.classList.add('show');
    sound.playBeep(330, 0.4, 'sawtooth', 0.1);
  }

  if (maskOverlay) {
    maskOverlay.addEventListener('click', () => maskOverlay.classList.remove('show'));
  }

  if (heroTitle) {
    let clickCount = 0;
    let clickTimer = null;
    heroTitle.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        triggerMaskOverlay();
        clickCount = 0;
      } else {
        clickTimer = setTimeout(() => { clickCount = 0; }, 600);
      }
    });
  }

  if (missionStamp) {
    missionStamp.addEventListener('mouseenter', () => {
      const titleMain = document.querySelector('.title-main');
      if (titleMain) {
        titleMain.classList.add('is-glitching');
        setTimeout(() => titleMain.classList.remove('is-glitching'), 500);
      }
    });
  }

  // Intercept Alert notification simulation
  const interceptAlert = document.getElementById('interceptAlert');
  const interceptClose = document.getElementById('interceptClose');

  if (interceptAlert) {
    setTimeout(() => {
      interceptAlert.classList.add('show');
      sound.playBeep(740, 0.15, 'square', 0.05);
      setTimeout(() => {
        interceptAlert.classList.remove('show');
      }, 7000);
    }, 6500);

    if (interceptClose) {
      interceptClose.addEventListener('click', () => interceptAlert.classList.remove('show'));
    }
  }

  // Konami Code Easter Egg (↑ ↑ ↓ ↓ ← → ← → B A)
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        triggerMaskOverlay();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });

  /* ─────────────────────────────────────────────────────────
     8. CINEMATIC SECTION TRANSITION FLASH & ACTIVE NAV TRACKING
  ───────────────────────────────────────────────────────── */
  const sectionWipe = document.getElementById('sectionWipe');
  const sections = document.querySelectorAll('.scene');
  const quickLinks = document.querySelectorAll('.quick-nav a');

  if (window.ScrollTrigger) {
    sections.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          sec.classList.add('in-view');
          updateActiveNav(sec.id);
          flashSectionWipe();
        },
        onEnterBack: () => {
          updateActiveNav(sec.id);
        }
      });
    });
  }

  function updateActiveNav(id) {
    if (!id) return;
    quickLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('is-active', href === `#${id}`);
    });
  }

  function flashSectionWipe() {
    if (!sectionWipe || prefersReducedMotion) return;
    if (window.gsap) {
      gsap.fromTo(sectionWipe, 
        { opacity: 0.18, scaleX: 0 },
        { opacity: 0, scaleX: 1, duration: 0.45, ease: 'power2.out' }
      );
    }
  }

})();
