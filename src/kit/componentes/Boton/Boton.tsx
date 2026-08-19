import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

type Variante = 'primario' | 'secundario' | 'peligro';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variante?: Variante;
  cargando?: boolean;
}

const estilosPorVariante: Record<Variante, { fondo: string; texto: string; borde?: string }> = {
  primario:   { fondo: '#DC0202', texto: '#FFFFFF' },
  secundario: { fondo: '#FFFFFF', texto: '#000000', borde: '1px solid #D1D3D4' },
  peligro:    { fondo: '#DC0202', texto: '#FFFFFF' },
};

export function Boton({ children, variante = 'primario', cargando = false, disabled, style, ...resto }: Props) {
  const v = estilosPorVariante[variante];
  return (
    <button
      disabled={disabled || cargando}
      style={{
        padding: '8px 16px', fontSize: 14, fontWeight: 700, borderRadius: 8,
        border: v.borde ?? 'none', backgroundColor: v.fondo, color: v.texto,
        cursor: disabled || cargando ? 'not-allowed' : 'pointer',
        opacity: disabled || cargando ? 0.6 : 1,
        transition: 'box-shadow 0.15s ease-out',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled && !cargando) e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)'; }}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      {...resto}
    >
      {cargando && <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 13 }} />}
      {children}
    </button>
  );
}
