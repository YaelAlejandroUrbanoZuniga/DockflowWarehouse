import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  icon: IconDefinition;
  color: string;
  label: string;
  value: number | string;
  sub?: string;
}

export function TarjetaKPI({ icon, color, label, value, sub }: Props) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#808285', display: 'block' }}>{label}</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: '#000000', display: 'block', marginTop: 4 }}>{value}</span>
          {sub && <span style={{ fontSize: 11, color: '#808285', display: 'block', marginTop: 4 }}>{sub}</span>}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: `${color}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FontAwesomeIcon icon={icon} style={{ fontSize: 20, color }} />
        </div>
      </div>
    </div>
  );
}
