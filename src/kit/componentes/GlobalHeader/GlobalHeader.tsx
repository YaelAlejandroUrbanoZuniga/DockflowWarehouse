import { HEADER_HEIGHT, zIndex } from '../../tokens/layout';

interface Props { titulo: string; }

export function GlobalHeader({ titulo }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 flex items-center" style={{ height: HEADER_HEIGHT, backgroundColor: '#AA0202', paddingLeft: 24, paddingRight: 24, zIndex: zIndex.header }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.12em' }}>{titulo}</span>
    </header>
  );
}
