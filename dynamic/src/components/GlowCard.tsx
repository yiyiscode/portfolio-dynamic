import React, { useRef, useState } from 'react';

interface GlowCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

// Cursor-following spotlight card (pattern from mohan.is-a.dev, MIT).
export const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', ...rest }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setCoords({ x: e.clientX - r.left, y: e.clientY - r.top });
    setOpacity(1);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setOpacity(0)}
      {...rest}
      className={`relative overflow-hidden rounded-xl transition-all duration-300 border dark:border-white/10 dark:bg-slate-950/80 dark:hover:border-white/20 border-[#0c101c]/[0.05] bg-gradient-to-b from-white to-white/95 dark:bg-none hover:border-slate-300 hover:bg-white shadow-[0_10px_24px_rgba(8,12,24,0.06),0_2px_6px_rgba(8,12,24,0.04)] backdrop-blur-sm ${className}`}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300" style={{ opacity }}>
        <div
          className="absolute inset-0 dark:bg-gradient-to-r dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-teal-500/20 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 blur-xl"
          style={{
            maskImage: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
            WebkitMaskImage: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
          }}
        />
      </div>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
