import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleDistance: number;
  wobbleOffset: number;
  opacity: number;
}

export const WaterBubblesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate 35 organic water bubbles
    const bubbleCount = Math.min(35, Math.floor(width / 35));
    const bubbles: Bubble[] = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 22 + 6, // 6px to 28px
      speed: Math.random() * 0.45 + 0.25,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      wobbleDistance: Math.random() * 25 + 10,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.28 + 0.15
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      bubbles.forEach((b) => {
        // Upward float with horizontal sinusoidal wobble
        b.y -= b.speed;
        const currentX = b.x + Math.sin(time * b.wobbleSpeed * 60 + b.wobbleOffset) * b.wobbleDistance;

        // Reset if float off top
        if (b.y + b.radius < -10) {
          b.y = height + b.radius + 10;
          b.x = Math.random() * width;
        }

        // Draw Water Bubble Body
        ctx.save();
        ctx.beginPath();
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);

        // Water bubble inner gradient
        const grad = ctx.createRadialGradient(
          currentX - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.1,
          currentX,
          b.y,
          b.radius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${b.opacity * 0.85})`);
        grad.addColorStop(0.3, `rgba(96, 165, 250, ${b.opacity * 0.35})`);
        grad.addColorStop(0.7, `rgba(37, 99, 235, ${b.opacity * 0.15})`);
        grad.addColorStop(1, `rgba(147, 197, 253, ${b.opacity * 0.05})`);

        ctx.fillStyle = grad;
        ctx.fill();

        // Water Bubble Outer Ring
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity * 0.55})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Specular White Highlight (Crescent shine on top-left)
        ctx.beginPath();
        ctx.arc(
          currentX - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.25,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 1.2})`;
        ctx.fill();

        // Bottom Refraction Arc (Secondary specular glow)
        ctx.beginPath();
        ctx.arc(
          currentX + b.radius * 0.25,
          b.y + b.radius * 0.25,
          b.radius * 0.18,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(191, 219, 254, ${b.opacity * 0.6})`;
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Ambient Gradient Mesh Orbs */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '15%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.03) 60%, transparent 80%)',
            filter: 'blur(70px)',
            transform: 'translateZ(0)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            right: '10%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(59, 130, 246, 0.04) 60%, transparent 80%)',
            filter: 'blur(90px)',
            transform: 'translateZ(0)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '25%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
            transform: 'translateZ(0)'
          }}
        />
      </div>

      {/* Floating Water Bubbles Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          width: '100vw',
          height: '100vh'
        }}
      />
    </>
  );
};
