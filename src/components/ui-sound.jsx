'use client';

import { useEffect } from 'react';

// Site-wide hover sounds, synthesized with the Web Audio API (no audio files).
// Mounted once in the root layout.
//
// Design language: one restrained family of short, quiet metal ticks —
// variations in weight and brightness, never in character. No cascades,
// no bells, no double-hits.
//
//   tick — header icon buttons (cart, user, admin, menu): small and bright
//   nav  — header text links: same tick, a touch softer and lower
//   logo — the center logo: the deepest, most dampened of the family
//   firm — primary CTA buttons (결제, 검색 …): slightly fuller, still one hit
//   soft — footer links: the faintest, most distant tick
//
// Sound plays ONLY where it feels intentional: header, footer, primary CTAs,
// and anything explicitly tagged data-sound="tick|nav|logo|firm|soft".
// Plain text links, product cards, form labels etc. stay silent.
//
// Browser autoplay policy: audio unlocks on the first click/keypress of the
// session, so the very first hover may be silent — everything after plays.

const INTERACTIVE_SELECTOR = 'a, button, [role="button"]';
const MIN_INTERVAL_MS = 70; // rapid sweeps across a menu shouldn't machine-gun

let ctx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

// One dampened metallic tick. Everything below is a variation of this:
// a couple of decaying sine partials plus a tiny high-passed noise transient.
function tickSound(ac, { volume, partials, noise }) {
  const now = ac.currentTime;
  const out = ac.createGain();
  out.gain.setValueAtTime(volume, now);
  out.connect(ac.destination);

  const pitch = 0.97 + Math.random() * 0.06; // never sounds sampled
  for (const p of partials) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(p.f * pitch, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(p.g, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, now + p.d);
    osc.connect(g);
    g.connect(out);
    osc.start(now);
    osc.stop(now + p.d + 0.02);
  }

  if (noise) {
    const len = Math.max(1, Math.floor(ac.sampleRate * noise.dur));
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(noise.freq, now);
    const g = ac.createGain();
    g.gain.setValueAtTime(noise.gain, now);
    src.connect(hp);
    hp.connect(g);
    g.connect(out);
    src.start(now);
  }
}

// All five are siblings: single short hit, sine partials, subtle transient.
// They differ only in register (frequency), weight (volume/decay) and how
// much "contact" noise they carry.
const PRESETS = {
  // The liked original — header icon buttons.
  tick(ac) {
    tickSound(ac, {
      volume: 0.05,
      partials: [
        { f: 5200, g: 1.0, d: 0.045 },
        { f: 7800, g: 0.3, d: 0.03 },
      ],
      noise: { dur: 0.003, freq: 6000, gain: 0.45 },
    });
  },

  // Header text links — same tick, slightly lower and softer so sweeping
  // across the menu reads as a quiet row of taps, not alarms.
  nav(ac) {
    tickSound(ac, {
      volume: 0.038,
      partials: [
        { f: 4300, g: 1.0, d: 0.05 },
        { f: 6500, g: 0.25, d: 0.035 },
      ],
      noise: { dur: 0.003, freq: 5000, gain: 0.35 },
    });
  },

  // Logo — deepest of the family, well dampened, still short.
  logo(ac) {
    tickSound(ac, {
      volume: 0.045,
      partials: [
        { f: 2900, g: 1.0, d: 0.08 },
        { f: 4400, g: 0.3, d: 0.05 },
      ],
      noise: { dur: 0.004, freq: 3500, gain: 0.3 },
    });
  },

  // Primary CTAs — a touch fuller and lower than tick, one single hit.
  firm(ac) {
    tickSound(ac, {
      volume: 0.05,
      partials: [
        { f: 3400, g: 1.0, d: 0.07 },
        { f: 5100, g: 0.35, d: 0.045 },
      ],
      noise: { dur: 0.004, freq: 4000, gain: 0.4 },
    });
  },

  // The liked footer sound — faint, distant, no transient at all.
  soft(ac) {
    tickSound(ac, {
      volume: 0.022,
      partials: [
        { f: 3050, g: 1.0, d: 0.06 },
        { f: 4600, g: 0.25, d: 0.04 },
      ],
      noise: null,
    });
  },
};

// Allowlist: returns a preset name only for elements where a sound feels
// intentional; everything else returns null and stays silent.
function pickPreset(el) {
  const forced = el.dataset && el.dataset.sound;
  if (forced) return PRESETS[forced] ? forced : null;

  if (el.closest('footer')) return 'soft';

  if (el.closest('header')) {
    if (el.matches('a[href="/"]')) return 'logo';
    // Icon-only controls (cart, user, admin, hamburger): svg but no text.
    if (el.querySelector('svg') && !el.textContent.trim()) return 'tick';
    return 'nav';
  }

  // Primary CTA buttons in the body (결제, 검색, 로그인 제출 …) — real
  // <button>s styled as filled/outlined blocks. Links and cards stay silent.
  if (el.tagName === 'BUTTON') {
    const cls = typeof el.className === 'string' ? el.className : '';
    if (cls.includes('bg-black') || cls.includes('border-black')) return 'firm';
  }

  return null;
}

export default function UISound() {
  useEffect(() => {
    // Hover sounds only make sense with a real pointer — skip touch devices,
    // where mouseover fires on tap and would double up with the tap itself.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let lastEl = null;
    let lastPlayed = 0;

    const unlock = () => {
      const ac = getContext();
      if (ac && ac.state === 'suspended') ac.resume();
    };

    const onMouseOver = (e) => {
      const el = e.target instanceof Element ? e.target.closest(INTERACTIVE_SELECTOR) : null;
      if (!el || el === lastEl) return;
      lastEl = el;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
      const preset = pickPreset(el);
      if (!preset) return;
      const now = performance.now();
      if (now - lastPlayed < MIN_INTERVAL_MS) return;
      lastPlayed = now;
      const ac = getContext();
      if (ac && ac.state === 'running') PRESETS[preset](ac);
    };

    const onMouseOut = (e) => {
      // Clear the de-dupe only when the pointer fully leaves the element,
      // not when moving between its children.
      if (lastEl && !(e.relatedTarget instanceof Element && lastEl.contains(e.relatedTarget))) {
        lastEl = null;
      }
    };

    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return null;
}

// Exposed for quick tuning from the browser console:
//   __uiSoundPreview('logo')  — audition any preset by name
//   __uiSoundPick(element)    — see which preset an element resolves to (null = silent)
if (typeof window !== 'undefined') {
  window.__uiSoundPreview = (name) => {
    const ac = getContext();
    if (!ac) return 'no AudioContext';
    if (ac.state === 'suspended') ac.resume();
    if (!PRESETS[name]) return `unknown preset — one of: ${Object.keys(PRESETS).join(', ')}`;
    PRESETS[name](ac);
    return name;
  };
  window.__uiSoundPick = (el) => (el instanceof Element ? pickPreset(el) : null);
}
