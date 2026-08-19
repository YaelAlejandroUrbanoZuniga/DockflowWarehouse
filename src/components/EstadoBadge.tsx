import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ESTADO_UI } from '@/lib/ui-map';
import { ESTADOS } from '@/lib/constants';
import { Insignia } from '@/kit/componentes/Insignia/Insignia';
import type { EstadoKey } from '@/lib/types';

export function EstadoBadge({
  estadoKey,
  size = 'md',
  delay = false,
}: {
  estadoKey: EstadoKey;
  size?: 'sm' | 'md' | 'lg';
  delay?: boolean;
}) {
  const ui = ESTADO_UI[estadoKey];
  const cfg = ESTADOS[estadoKey];

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

  return (
    <Insignia estado={ui.insignia}>
      <FontAwesomeIcon
        icon={ui.icon}
        style={{ fontSize: iconSize, color: ui.color, marginRight: 4 }}
      />
      {cfg.nombre}
      {delay && estadoKey === 7 && (
        <span
          className="animate-pulse-soft"
          style={{
            marginLeft: 4,
            borderRadius: 3,
            backgroundColor: '#DC0202',
            padding: '0 4px',
            fontSize: 9,
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          DELAY
        </span>
      )}
    </Insignia>
  );
}

export function EstadoIcon({
  estadoKey,
  className,
}: {
  estadoKey: EstadoKey;
  className?: string;
}) {
  const ui = ESTADO_UI[estadoKey];
  return (
    <FontAwesomeIcon
      icon={ui.icon}
      className={className}
      style={{ color: ui.color, fontSize: 18 }}
    />
  );
}
