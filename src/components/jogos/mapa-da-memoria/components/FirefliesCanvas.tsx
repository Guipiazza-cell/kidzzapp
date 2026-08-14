import React, { useEffect, useRef } from 'react';

interface Firefly { x: number; y: number; vx: number; vy: number; radius: number; baseAlpha: number; phase: number; speed: number; color: string; }

export const FirefliesCanvas: React.FC<{ count?: number; colorTheme?: string }> = ({ count = 24, colorTheme = 'gold' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = colorTheme === 'blue' ? ['rgba(147, 197, 253,', 'rgba(191, 219, 254,', 'rgba(253, 224, 71,'] : colorTheme === 'green' ? ['rgba(134, 239, 172,', 'rgba(253, 224, 71,', 'rgba(254, 240, 138,'] : ['rgba(253, 224, 71,', 'rgba(251, 191, 36,', 'rgba(254, 243, 199,', 'rgba(245, 158, 11,'];

    const fireflies: Firefly[] = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.35 - 0.1,
      radius: Math.random() * 2.2 + 1.2, baseAlpha: Math.random() * 0.5 + 0.3, phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.03 + 0.015,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      fireflies.forEach((f) => {
        f.x += f.vx; f.y += f.vy; f.phase += f.speed;
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;
        if (f.y < -10) f.y = height + 10;
        if (f.y > height + 10) f.y = -10;
        const currentAlpha = f.baseAlpha * (0.4 + 0.6 * Math.sin(f.phase));
        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 3.5);
        gradient.addColorStop(0, `${f.color} ${currentAlpha})`);
        gradient.addColorStop(0.4, `${f.color} ${currentAlpha * 0.4})`);
        gradient.addColorStop(1, `${f.color} 0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.9})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationFrameId); };
  }, [count, colorTheme]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-80" />;
};
