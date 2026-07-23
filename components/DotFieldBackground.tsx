'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Full-screen canvas dot-grid that sits behind all page content.
 *
 * - Dots idly breathe (soft opacity pulse) so the page never feels static.
 * - Jab mouse pass karta hai, nearby dots glow karte hain aur halka sa
 *   cursor se door "push" ho jate hain — phir smoothly wapas apni grid
 *   position par lauttate hain. Ye "Antigravity"-style dot effect hai,
 *   lekin thoda better: dots sirf move nahi hote, size + glow bhi badhta hai.
 * - `prefers-reduced-motion` respect karta hai — us case me sirf static
 *   faint dots dikhte hain, koi animation nahi chalti.
 */
export default function DotFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SPACING = 34; // px between dots
    const BASE_RADIUS = 1.2;
    const MAX_RADIUS = 3.2;
    const INFLUENCE_RADIUS = 140; // how far the mouse effect reaches
    const REPEL_STRENGTH = 10; // max px a dot shifts away from the cursor

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let points: { x: number; y: number; phase: number }[] = [];

    const mouse = { x: -9999, y: -9999, active: false };

    function buildGrid() {
      points = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          points.push({ x: c * SPACING, y: r * SPACING, phase: Math.random() * Math.PI * 2 });
        }
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function onPointerMove(e: PointerEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }

    function onPointerLeave() {
      mouse.active = false;
    }

    let rafId = 0;
    let t = 0;

    function draw() {
      t += 0.016;
      ctx!.clearRect(0, 0, width, height);

      for (const p of points) {
        let x = p.x;
        let y = p.y;
        let radius = BASE_RADIUS;
        let opacity = 0.28 + Math.sin(t * 0.6 + p.phase) * 0.1; // idle breathing

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < INFLUENCE_RADIUS) {
            const strength = 1 - dist / INFLUENCE_RADIUS; // 0..1, closer = stronger
            const angle = Math.atan2(dy, dx);
            x = p.x + Math.cos(angle) * REPEL_STRENGTH * strength;
            y = p.y + Math.sin(angle) * REPEL_STRENGTH * strength;
            radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * strength;
            opacity = Math.min(0.85, opacity + strength * 0.7);
          }
        }

        ctx!.beginPath();
        ctx!.arc(x, y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(41, 211, 192, ${opacity})`;
        ctx!.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);

    // Ek frame ke baad "ready" set karte hain taake canvas fade-in (opacity
    // 0 -> 1 CSS transition) smoothly chale, abrupt pop-in na ho.
    requestAnimationFrame(() => setReady(true));

    if (!prefersReducedMotion) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerleave', onPointerLeave);
      rafId = requestAnimationFrame(draw);
    } else {
      // Static single frame, no loop, no listeners — respects reduced motion.
      ctx.clearRect(0, 0, width, height);
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, BASE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(41, 211, 192, 0.24)';
        ctx.fill();
      }
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={[
        'pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1200ms] ease-out',
        ready ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    />
  );
}
