import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function CampoTexto({ label, error, style, ...resto }: Props) {
  return (
    <div>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%', padding: '8px 12px',
          border: `1px solid ${error ? '#DC0202' : '#D1D3D4'}`,
          borderRadius: 6, fontSize: 13, color: '#000000', outline: 'none', boxSizing: 'border-box',
          ...style,
        }}
        {...resto}
      />
      {error && <p style={{ fontSize: 12, color: '#DC0202', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}
