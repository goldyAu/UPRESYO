// Makes the five blobs orbit along the gold ellipse.
// Hovering any blob pauses the orbit so it's easy to point at.
(() => {
  const stage = document.querySelector('.stage');
  const blobs = Array.from(document.querySelectorAll('.blob'));
  if (!stage || blobs.length === 0) return;

  const SECONDS_PER_LAP = 40; // lower = faster
  // Spread the blobs evenly around the ring, starting from the top.
  // Works for any number of blobs (360 / count degrees apart).
  const startAngles = blobs.map((_, i) => -90 + (360 / blobs.length) * i);

  // The gold ring, as fractions of the stage size
  const ring = { cx: 0.5, cy: 0.5, rx: 0.41, ry: 0.35 };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let offset = 0;
  let last = null;
  let paused = false;

  function place() {
    const W = stage.offsetWidth;
    const H = stage.offsetHeight;
    blobs.forEach((blob, i) => {
      const angle = (startAngles[i] + offset) * Math.PI / 180;
      const x = ring.cx * W + ring.rx * W * Math.cos(angle);
      const y = ring.cy * H + ring.ry * H * Math.sin(angle);
      blob.style.left = ((x - blob.offsetWidth / 2) / W * 100) + '%';
      blob.style.top = ((y - blob.offsetHeight / 2) / H * 100) + '%';
    });
  }

  function tick(now) {
    if (last !== null && !paused && !reduceMotion.matches) {
      offset += (now - last) / 1000 * (360 / SECONDS_PER_LAP);
    }
    last = now;
    place();
    requestAnimationFrame(tick);
  }

  blobs.forEach((blob) => {
    blob.addEventListener('mouseenter', () => { paused = true; });
    blob.addEventListener('mouseleave', () => { paused = false; });
    blob.addEventListener('focus', () => { paused = true; });
    blob.addEventListener('blur', () => { paused = false; });
  });

  requestAnimationFrame(tick);
})();