'use client';

import React, { useEffect, useRef } from 'react';

interface CinematicLibraryCinemagraphProps {
  className?: string;
  intensity?: number;
  showMapHologram?: boolean;
}

export default function CinematicLibraryCinemagraph({
  className = '',
  intensity = 1,
  showMapHologram = true,
}: CinematicLibraryCinemagraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulação de Partículas Vivas em 60fps (Poeira Dourada & Brasas Celestes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -(Math.random() * 0.6 + 0.2), // Ascensão suave de poeira dourada
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.3 ? '#f59e0b' : '#38bdf8', // Dourado e Ciano
    }));

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Partículas em movimento
      particles.forEach((p) => {
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulsePhase) * 0.4) * intensity;

        p.x += p.speedX;
        p.y += p.speedY;

        // Reposicionar se sair do ecrã
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none select-none bg-[#030611] ${className}`}>
      {/* 1. IMAGEM BASE CINEMATOGRÁFICA COM MOVIMENTO DE CÂMARA (KEN BURNS LENTO) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 animate-[pulse_12s_ease-in-out_infinite]"
        style={{
          backgroundImage: `url('/arenas/biblioteca-sagrada.jpg')`,
          filter: 'brightness(0.75) contrast(1.15) saturate(1.25)',
          animation: 'subtle-drift 24s ease-in-out infinite alternate',
        }}
      />

      {/* 2. FEIXES DE LUZ DOURADA VOLUMÉTRICA A EMANAR DO LIVRO E ALTAR */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[550px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 65%, rgba(245,158,11,0.45) 0%, rgba(217,119,6,0.2) 40%, rgba(3,6,17,0) 75%)',
          animation: 'holy-glow 4.5s ease-in-out infinite alternate',
        }}
      />

      {/* 3. AURA CELESTE & BRILHO DA ESFERA ARMILAR E BRASÃO DE PORTUGAL */}
      <div
        className="absolute top-[28%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(245,158,11,0.25) 50%, transparent 75%)',
          filter: 'blur(25px)',
          animation: 'shield-pulse 3.8s ease-in-out infinite alternate',
        }}
      />

      {/* 4. ONDAS DE ENERGIA HOLOGRÁFICA NO MAPA DE PORTUGAL (DIREITA) */}
      {showMapHologram && (
        <div
          className="absolute top-[20%] right-[8%] w-[260px] h-[560px] pointer-events-none hidden lg:block"
          style={{
            animation: 'map-hover 6s ease-in-out infinite alternate',
          }}
        >
          {/* Varredura Laser de Norte a Sul */}
          <div
            className="absolute inset-0 w-full h-24 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
            style={{
              animation: 'scanline-down 3.5s linear infinite',
            }}
          />

          {/* Brilho de Contorno Holográfico */}
          <div className="absolute inset-0 bg-cyan-400/10 rounded-3xl blur-2xl animate-pulse" />
        </div>
      )}

      {/* 5. CÍRCULO ASTROLÓGICO E RÚNICO NO CHÃO COM ENERGIA DINÂMICA */}
      <div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[750px] h-[350px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.3) 0%, rgba(6,182,212,0.15) 50%, transparent 75%)',
          filter: 'blur(30px)',
          animation: 'floor-glow 5s ease-in-out infinite alternate',
        }}
      />

      {/* 6. CANVAS DE PARTÍCULAS EM TEMPO REAL (POEIRA DOURADA & CENTELHAS MÍSTICAS) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 7. VINHETA CINEMATOGRÁFICA & CONTRASTE DE FOCO */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,6,17,0.75)_100%)] pointer-events-none" />

      {/* 8. ESTILOS DE ANIMAÇÃO KEYFRAMES */}
      <style jsx>{`
        @keyframes subtle-drift {
          0% {
            transform: scale(1.03) translate(0px, 0px);
          }
          50% {
            transform: scale(1.06) translate(-6px, -4px);
          }
          100% {
            transform: scale(1.04) translate(4px, -2px);
          }
        }

        @keyframes holy-glow {
          0% {
            opacity: 0.7;
            transform: translate(-50%, -33%) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -33%) scale(1.05);
          }
        }

        @keyframes shield-pulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes map-hover {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(0.5deg);
          }
          100% {
            transform: translateY(4px) rotate(-0.3deg);
          }
        }

        @keyframes scanline-down {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(450%);
            opacity: 0;
          }
        }

        @keyframes floor-glow {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
