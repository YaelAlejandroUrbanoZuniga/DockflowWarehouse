import type { CSSProperties } from 'react';

const ESTILO_SELECT: CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #D1D3D4',
  borderRadius: 6, fontSize: 13, color: '#000000', outline: 'none',
  boxSizing: 'border-box', backgroundColor: '#FFFFFF',
};

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  style?: CSSProperties;
}

export function SelectCatalogo({ value, onChange, options, placeholder = 'Seleccionar', style }: Props) {
  const estaEnCatalogo = value === '' || options.includes(value);
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...ESTILO_SELECT, ...style }}>
      <option value="">{placeholder}</option>
      {!estaEnCatalogo && <option value={value}>{value}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
