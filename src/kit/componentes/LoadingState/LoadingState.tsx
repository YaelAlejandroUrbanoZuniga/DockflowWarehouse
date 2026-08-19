import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { MAIN_PADDING_TOP, MAIN_PADDING_BOTTOM, zIndex } from '../../tokens/layout';

interface Props {
  mensaje?: string;
  submensaje?: string;
  icon?: IconDefinition;
  fullScreen?: boolean;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function LoadingState({ mensaje = 'Cargando elementos…', submensaje, icon = faChartLine, fullScreen, fill, style }: Props) {
  const base: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 };
  const contenedor: React.CSSProperties = fullScreen
    ? { ...base, position: 'fixed', inset: 0, backgroundColor: '#FFFFFF', zIndex: zIndex.loadingFullScreen }
    : fill
      ? { ...base, width: '100%', height: `calc(100vh - ${MAIN_PADDING_TOP}px - ${MAIN_PADDING_BOTTOM}px)` }
      : { ...base, width: '100%', padding: '64px 0' };

  return (
    <div role="status" aria-live="polite" style={{ ...contenedor, ...style }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <svg width={72} height={72} viewBox="0 0 72 72" className="nexteer-loading-ring">
          <circle cx={36} cy={36} r={32} fill="none" stroke="#F3D6D6" strokeWidth={5} />
          <circle cx={36} cy={36} r={32} fill="none" stroke="#DC0202" strokeWidth={5} strokeLinecap="round" strokeDasharray="60 141" />
        </svg>
        <FontAwesomeIcon icon={icon} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 22, color: '#DC0202' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#000000', margin: 0 }}>{mensaje}</p>
        {submensaje && <p style={{ fontSize: 13, color: '#808285', margin: '4px 0 0' }}>{submensaje}</p>}
      </div>
    </div>
  );
}
