import type { ReactNode } from 'react';

type Estado = 'active' | 'pending' | 'warning' | 'error' | 'info' | 'archived';

interface Props {
  children: ReactNode;
  estado: Estado;
}

const colorPorEstado: Record<Estado, string> = {
  active: '#6ABF4B', pending: '#D4A017', warning: '#E3650B',
  error: '#DC0202', info: '#02B3E1', archived: '#6B7280',
};

export function Insignia({ children, estado }: Props) {
  const color = colorPorEstado[estado];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
      borderRadius: 4, fontSize: 12, fontWeight: 600, color,
      backgroundColor: `${color}26`,
    }}>
      {children}
    </span>
  );
}
