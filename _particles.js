/* AMPHICLASH 2.0 — Particle System
   Auto-injects: canvas (z:0) + frosted blur overlay (z:1)
   App shell sits at z-index:2 above both.
*/
(function () {
  'use strict';

  function inject() {
    /* ── Canvas ── */
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      zIndex: '0', pointerEvents: 'none',
      display: 'block'
    });
    document.body.insertBefore(canvas, document.body.firstChild);

    /* ── Frosted blur overlay ── */
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0',
      zIndex: '1', pointerEvents: 'none',
      background: 'rgba(255,255,255,0.60)',
      WebkitBackdropFilter: 'blur(54px)',
      backdropFilter: 'blur(54px)'
    });
    document.body.insertBefore(overlay, document.body.firstChild);

    /* ── Animation ── */
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Blue / indigo palette: [r, g, b, baseAlpha] */
    const PAL = [
      [59,  130, 246, 0.58],   /* blue-500    */
      [99,  102, 241, 0.50],   /* indigo-500  */
      [147, 197, 253, 0.68],   /* blue-300    */
      [165, 180, 252, 0.54],   /* indigo-300  */
      [96,  165, 250, 0.62],   /* blue-400    */
      [129, 140, 248, 0.46],   /* indigo-400  */
      [37,  99,  235, 0.40],   /* blue-600    */
      [224, 231, 255, 0.72],   /* indigo-100  */
    ];

    const N = 52;
    const pts = [];

    function mk(fresh) {
      const c = PAL[Math.floor(Math.random() * PAL.length)];
      return {
        x:    Math.random() * W,
        y:    fresh ? Math.random() * H : H + 6,
        r:    Math.random() * 3.4 + 1.2,
        dx:   (Math.random() - 0.5) * 0.30,
        dy:   -(Math.random() * 0.44 + 0.07),
        c,
        life: Math.random() * 300 + 140,
        age:  fresh ? Math.random() * 300 : 0,
      };
    }

    for (let i = 0; i < N; i++) pts.push(mk(true));

    function frame() {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.age++;

        if (p.age > p.life) { pts[i] = mk(false); continue; }

        p.x += p.dx;
        p.y += p.dy;

        /* horizontal wrap */
        if (p.x < -8)  p.x = W + 8;
        if (p.x > W+8) p.x = -8;

        /* fade envelope */
        const t = p.age / p.life;
        const env = t < 0.15 ? t / 0.15
                  : t > 0.82 ? (1 - t) / 0.18
                  : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${+(p.c[3] * env).toFixed(3)})`;
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    frame();
  }

  /* Init after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
