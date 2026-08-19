import type { CSSProperties } from 'react';

export const hoverElevadoEstiloBase: CSSProperties = {
  transition: 'transform 0.15s, box-shadow 0.15s',
  cursor: 'pointer',
};

export const hoverElevadoProps = {
  style: hoverElevadoEstiloBase,
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.13)';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
  },
};

export const hoverFondoProps = {
  style: { transition: 'background-color 0.12s', cursor: 'pointer' } as CSSProperties,
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = '#F5F5F5';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  },
};
