import type { ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Tarjeta({ children, style, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 20,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
        ...style,
      }}
      onMouseEnter={e => {
        if (!onClick) return;
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.13)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        if (!onClick) return;
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </div>
  );
}
