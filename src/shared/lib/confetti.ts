type Piece = {
  x: number;
  y: number;
  r: number;
  c: string;
  vx: number;
  vy: number;
  rot: number;
  rv: number;
};

export function launchConfettiCanvas(
  canvas: HTMLCanvasElement,
  colors: string[],
  pieceCount = 120,
  durationMs = 4500,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces: Piece[] = Array.from({ length: pieceCount }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 7 + 3,
    c: colors[Math.floor(Math.random() * colors.length)] ?? '#5d5fef',
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    rot: Math.random() * 360,
    rv: (Math.random() - 0.5) * 8,
  }));

  let frame = 0;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rv;
      p.vy += 0.06;
    });
    if (pieces.some((p) => p.y < canvas.height)) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  draw();
  const stop = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, durationMs);

  return () => {
    clearTimeout(stop);
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
