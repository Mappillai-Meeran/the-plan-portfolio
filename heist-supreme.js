/* ══════════════════════════════════════════════════════════════════════
   HEIST SUPREME SCRIPT ENGINE (heist-supreme.js)
   - Real-time Bella Ciao Theme Chiptune Synthesizer via Web Audio API
   - Interactive Falling Euro Banknotes & Gold Particles
   - Red Laser Tripwires with Security Breach Sirens & Screen Alerts
   - CCTV Camera Monitor Channel Switcher (Visual Filters + SFX)
   - 3D Project Dossier Flip Cards
   - Classified Redaction Scanner with Sound Feedback
══════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. BELLA CIAO SYNTHESIZER ENGINE (Web Audio API)
     Plays the iconic Money Heist revolution anthem melody
  ───────────────────────────────────────────────────────────── */
  class BellaCiaoSynthesizer {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.timer = null;
      this.anthemBtn = document.getElementById('anthemBtn');
      this.init();
    }

    init() {
      if (!this.anthemBtn) return;
      this.anthemBtn.addEventListener('click', () => {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        if (!this.isPlaying) {
          this.startAnthem();
        } else {
          this.stopAnthem();
        }
      });
    }

    // Note frequencies in Hz
    getNote(name) {
      const notes = {
        'E4': 329.63, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
        'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
        'REST': 0
      };
      return notes[name] || 440;
    }

    playTone(freq, duration, time) {
      if (freq === 0 || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      // Lowpass filter for vintage gramophone / radio warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    }

    startAnthem() {
      this.isPlaying = true;
      this.anthemBtn.classList.add('playing');
      const label = this.anthemBtn.querySelector('.anthem-label');
      if (label) label.textContent = 'PLAYING: BELLA CIAO';

      // Money Heist Bella Ciao opening bar melody
      const melody = [
        { note: 'E4', dur: 0.28 }, { note: 'A4', dur: 0.28 }, { note: 'B4', dur: 0.28 }, { note: 'C5', dur: 0.45 },
        { note: 'A4', dur: 0.35 }, { note: 'REST', dur: 0.1 },
        { note: 'E4', dur: 0.28 }, { note: 'A4', dur: 0.28 }, { note: 'B4', dur: 0.28 }, { note: 'C5', dur: 0.45 },
        { note: 'A4', dur: 0.35 }, { note: 'REST', dur: 0.1 },
        { note: 'E4', dur: 0.28 }, { note: 'A4', dur: 0.28 }, { note: 'B4', dur: 0.28 }, { note: 'C5', dur: 0.3 },
        { note: 'B4', dur: 0.25 }, { note: 'A4', dur: 0.25 }, { note: 'C5', dur: 0.3 }, { note: 'B4', dur: 0.25 },
        { note: 'A4', dur: 0.25 }, { note: 'E5', dur: 0.75 }, { note: 'REST', dur: 0.2 },
        // Chorus phrase
        { note: 'E5', dur: 0.3 }, { note: 'D5', dur: 0.25 }, { note: 'E5', dur: 0.3 }, { note: 'F5', dur: 0.55 },
        { note: 'F5', dur: 0.4 }, { note: 'REST', dur: 0.1 },
        { note: 'F5', dur: 0.3 }, { note: 'E5', dur: 0.25 }, { note: 'D5', dur: 0.25 }, { note: 'F5', dur: 0.3 },
        { note: 'E5', dur: 0.7 }, { note: 'REST', dur: 0.15 },
        { note: 'C5', dur: 0.28 }, { note: 'B4', dur: 0.28 }, { note: 'E4', dur: 0.35 }, { note: 'B4', dur: 0.35 },
        { note: 'A4', dur: 0.95 }
      ];

      const playLoop = () => {
        if (!this.isPlaying) return;
        let now = this.ctx.currentTime + 0.05;
        let totalDur = 0;

        melody.forEach(item => {
          this.playTone(this.getNote(item.note), item.dur, now + totalDur);
          totalDur += item.dur + 0.04;
        });

        // Trigger money rain while anthem plays!
        if (window.heistMoneyRain) window.heistMoneyRain.burst();

        this.timer = setTimeout(() => {
          if (this.isPlaying) playLoop();
        }, totalDur * 1000);
      };

      playLoop();
    }

    stopAnthem() {
      this.isPlaying = false;
      clearTimeout(this.timer);
      this.anthemBtn.classList.remove('playing');
      const label = this.anthemBtn.querySelector('.anthem-label');
      if (label) label.textContent = 'BELLA CIAO';
    }
  }

  /* ─────────────────────────────────────────────────────────────
     2. FALLING EURO BANKNOTES & GOLD CONFETTI CANVAS
  ───────────────────────────────────────────────────────────── */
  class MoneyRainEffect {
    constructor() {
      this.canvas = document.getElementById('moneyCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.isRunning = false;
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initTriggers();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    initTriggers() {
      window.heistMoneyRain = this;
      // Trigger whenever user submits vault code or clicks mission stamp
      const missionStamp = document.getElementById('missionStamp');
      if (missionStamp) {
        missionStamp.addEventListener('click', () => this.burst(45));
      }
    }

    burst(count = 35) {
      const symbols = ['€50', '€100', '€500', 'GOLD', 'MM', '💰', '💵'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: -40 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2.5,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08,
          w: Math.random() * 25 + 35,
          h: 22,
          text: symbols[Math.floor(Math.random() * symbols.length)],
          color: Math.random() > 0.4 ? '#c83c36' : '#d4af37',
          opacity: 1
        });
      }
      if (!this.isRunning) {
        this.isRunning = true;
        this.animate();
      }
    }

    animate() {
      if (!this.isRunning) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;

        if (p.y > this.canvas.height + 50) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.globalAlpha = p.opacity;

        // Bill background
        this.ctx.fillStyle = p.color === '#d4af37' ? '#332a10' : '#1a1010';
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 1.2;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);

        // Bill text
        this.ctx.fillStyle = p.color;
        this.ctx.font = 'bold 9px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.text, 0, 0);

        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        requestAnimationFrame(() => this.animate());
      } else {
        this.isRunning = false;
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────
     3. INTERACTIVE RED LASER TRIPWIRES WITH SECURITY SIREN
  ───────────────────────────────────────────────────────────── */
  function initLaserTripwires() {
    const beams = document.querySelectorAll('.laser-beam');
    const banner = document.getElementById('alarmBanner');

    function triggerBreachSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } catch (_) {}
    }

    beams.forEach(beam => {
      beam.addEventListener('mouseenter', () => {
        triggerBreachSound();
        document.body.classList.add('alarm-active');
        if (banner) banner.classList.add('active');

        setTimeout(() => {
          document.body.classList.remove('alarm-active');
          if (banner) banner.classList.remove('active');
        }, 3200);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     4. CCTV SECURITY CAMERA MULTI-VIEW SWITCHER
  ───────────────────────────────────────────────────────────── */
  function initCctvSwitcher() {
    const camBtns = document.querySelectorAll('.cam-btn');
    const camName = document.getElementById('cctvCamName');
    const filters = [
      'none',
      'sepia(0.6) hue-rotate(320deg) contrast(1.2)',
      'contrast(1.4) brightness(0.9) grayscale(0.5)',
      'invert(0.15) hue-rotate(180deg)'
    ];

    camBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        camBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (camName) camName.textContent = btn.getAttribute('data-cam') || `CAM 0${idx + 1}`;
        document.body.style.filter = filters[idx] || 'none';

        // Play CCTV camera switch click
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1400, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch (_) {}
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5. 3D DOSSIER FLIP CARDS
  ───────────────────────────────────────────────────────────── */
  function init3dDossierCards() {
    const safeDials = document.querySelectorAll('.safe-dial');
    safeDials.forEach(dial => {
      dial.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = dial.closest('.case-file-card');
        if (card) {
          card.classList.toggle('flipped');
        }
      });
    });

    const flipBackBtns = document.querySelectorAll('.flip-back-btn');
    flipBackBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.case-file-card');
        if (card) card.classList.remove('flipped');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     6. INITIALIZE SUPREME FEATURES ON LOAD
  ───────────────────────────────────────────────────────────── */
  window.addEventListener('DOMContentLoaded', () => {
    new BellaCiaoSynthesizer();
    new MoneyRainEffect();
    initLaserTripwires();
    initCctvSwitcher();
    init3dDossierCards();
  });

})();
