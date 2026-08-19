import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
  title: string;
  subtitle?: string;
  accentColor: string;
  onClose: () => void;
  rounded?: boolean;
}

export function ModalHeader({ title, subtitle, accentColor, onClose, rounded = true }: Props) {
  return (
    <div style={{ position: 'relative', backgroundColor: accentColor, padding: '20px 32px', borderTopLeftRadius: rounded ? 12 : 0, borderTopRightRadius: rounded ? 12 : 0, flexShrink: 0 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em', paddingRight: 28 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', paddingRight: 28 }}>{subtitle}</p>}
      <button onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
        <FontAwesomeIcon icon={faTimes} style={{ fontSize: 16, color: '#FFFFFF' }} />
      </button>
    </div>
  );
}
