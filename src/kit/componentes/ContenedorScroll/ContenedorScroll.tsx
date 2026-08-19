import type { ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  maxHeight?: string;
  style?: CSSProperties;
}

export function ContenedorScroll({ children, maxHeight, style }: Props) {
  return (
    <div style={{ overflowY: 'auto', minHeight: 0, maxHeight, ...style }}>
      {children}
    </div>
  );
}
