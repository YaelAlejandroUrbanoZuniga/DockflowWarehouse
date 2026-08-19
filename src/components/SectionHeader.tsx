import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: IconDefinition;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#DC0202', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FontAwesomeIcon icon={icon} style={{ fontSize: 18, color: '#FFFFFF' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#000000' }}>{title}</h2>
          {subtitle && <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#808285' }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
