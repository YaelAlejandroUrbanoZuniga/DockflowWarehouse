import { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { faGauge, faCalendarDays, faChartColumn, faTruck, faTableColumns, faUsers, faWarehouse, faGear, faKeyboard, faQrcode, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { currentUserAtom, manualCheckInOpenAtom, qrScannerOpenAtom, activeAlmacenIdAtom } from '@/lib/store';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '@/lib/constants';
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED, MAIN_PADDING_TOP, MAIN_PADDING_X, MAIN_PADDING_BOTTOM } from '@/kit/tokens/layout';
import { GlobalHeader } from '@/kit/componentes/GlobalHeader/GlobalHeader';
import { Sidebar, type SidebarNavItem } from '@/kit/componentes/Sidebar/Sidebar';
import { ManualCheckInModal } from '@/components/ManualCheckInModal';
import { QrScannerModal } from '@/components/QrScannerModal';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { DelayAlertOverlay } from '@/components/DelayAlertOverlay';
import { AlmacenSwitcherDialog } from '@/components/AlmacenSwitcherDialog';
import type { Role } from '@/lib/types';

const NAV_ITEMS: (SidebarNavItem & { roles: Role[] })[] = [
  { path: '/',              icon: faGauge,        label: 'Dashboard',      roles: ['superuser', 'coordinador', 'vigilancia', 'warehouse'] },
  { path: '/citas',         icon: faCalendarDays, label: 'Citas',          roles: ['superuser', 'coordinador', 'warehouse'] },
  { path: '/analytics',     icon: faChartColumn,  label: 'Analytics',      roles: ['superuser', 'coordinador', 'warehouse'] },
  { path: '/transportistas',icon: faTruck,        label: 'Transportistas', roles: ['superuser', 'coordinador'] },
  { path: '/operador',      icon: faTableColumns, label: 'Operador',       roles: ['superuser', 'warehouse'] },
  { path: '/usuarios',      icon: faUsers,        label: 'Usuarios',       roles: ['superuser', 'coordinador'] },
  { path: '/almacenes',     icon: faWarehouse,    label: 'Almacenes',      roles: ['superuser'] },
  { path: '/configuracion', icon: faGear,         label: 'Configuración',  roles: ['superuser', 'coordinador', 'warehouse'] },
];

const ROLES_CON_SWITCHER: Role[] = ['superuser', 'coordinador'];

export function AppLayout() {
  const currentUser = useAtomValue(currentUserAtom);
  const [manualCheckInOpen, setManualCheckInOpen] = useAtom(manualCheckInOpenAtom);
  const [qrScannerOpen, setQrScannerOpen] = useAtom(qrScannerOpenAtom);
  const activeAlmacenId = useAtomValue(activeAlmacenIdAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const navigate = useNavigate();
  const [colapsado, setColapsado] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!activeAlmacenId) {
    return <Navigate to="/select-almacen" replace />;
  }

  const perms = ROLE_PERMISSIONS[currentUser.role];
  const itemsFiltrados = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  const accionesExtra = [];
  if (ROLES_CON_SWITCHER.includes(currentUser.role)) {
    accionesExtra.push({ label: 'Cambiar de almacén', icon: faBuilding, onClick: () => setSwitcherOpen(true) });
  }
  if (perms.canCheckIn) {
    accionesExtra.push({ label: 'Check-In Manual', icon: faKeyboard, onClick: () => setManualCheckInOpen(true) });
    accionesExtra.push({ label: 'Escanear QR', icon: faQrcode, onClick: () => setQrScannerOpen(true) });
  }

  const handleCerrarSesion = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="app-escritorio" style={{ backgroundColor: '#EEEEEE', minHeight: '100vh' }}>
      <GlobalHeader titulo="DOCKFLOW" />
      <Sidebar
        collapsed={colapsado}
        onToggle={() => setColapsado(v => !v)}
        items={itemsFiltrados}
        usuario={{ displayName: currentUser.nombrecompleto, role: ROLE_LABELS[currentUser.role] }}
        onCerrarSesion={handleCerrarSesion}
        accionesExtra={accionesExtra}
      />
      <main style={{
        marginLeft: colapsado ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
        paddingTop: MAIN_PADDING_TOP,
        paddingLeft: MAIN_PADDING_X,
        paddingRight: MAIN_PADDING_X,
        paddingBottom: MAIN_PADDING_BOTTOM,
        minHeight: '100vh',
        transition: 'margin-left 0.3s',
      }}>
        <Outlet />
      </main>
      <ManualCheckInModal open={manualCheckInOpen} onOpenChange={setManualCheckInOpen} />
      <QrScannerModal open={qrScannerOpen} onOpenChange={setQrScannerOpen} />
      <AlmacenSwitcherDialog open={switcherOpen} onOpenChange={setSwitcherOpen} />
      <CelebrationOverlay />
      <DelayAlertOverlay />
    </div>
  );
}
