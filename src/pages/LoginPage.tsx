import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { usersAtom, currentUserAtom, activeAlmacenIdAtom } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';
import { ROL_UI } from '@/lib/ui-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Login } from '@/kit/componentes/Login/Login';
import type { Role } from '@/lib/types';

const QUICK_LOGINS: { role: Role; email: string; password: string; label: string }[] = [
  { role: 'superuser',   email: 'super@nexteer.com',        password: 'super123', label: 'Super Usuario' },
  { role: 'coordinador', email: 'coordinador@nexteer.com',  password: 'admin123', label: 'Coordinador' },
  { role: 'vigilancia',  email: 'vigilancia@nexteer.com',   password: 'watch123', label: 'Vigilancia' },
  { role: 'warehouse',   email: 'warehouse@nexteer.com',    password: 'wh123',    label: 'Almacén' },
];

export function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [users] = useAtom(usersAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setActiveAlmacenId = useSetAtom(activeAlmacenIdAtom);

  const doLogin = (em: string, pw: string) => {
    const user = users.find(
      (u) => u.email.toLowerCase() === em.toLowerCase() && u.password === pw,
    );
    if (!user) {
      toast.validationError('Credenciales incorrectas');
      return;
    }
    if (!user.estactivo) {
      toast.validationError('Usuario inactivo. Contacta al administrador.');
      return;
    }
    setCurrentUser(user);
    toast.success(`Bienvenido, ${user.nombrecompleto}`);
    if (user.role === 'superuser' || user.role === 'coordinador') {
      navigate('/select-almacen');
    } else {
      setActiveAlmacenId(user.almacenId);
      navigate('/');
    }
  };

  const handleSubmit = (email: string, password: string): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(() => {
        doLogin(email, password);
        resolve();
      }, 400);
    });

  return (
    <Login
      categoria="NEXTEER AUTOMOTIVE QUERÉTARO"
      tituloSistema="DockFlow"
      descripcion="Gestión de patio y andenes. Programación, check-in y trazabilidad de citas de transportistas."
      onSubmit={handleSubmit}
    >
      {/* Quick-access role buttons */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#808285',
          marginBottom: 10,
        }}>
          Acceso rápido
        </div>
        <div className="grid grid-cols-2" style={{ gap: 8 }}>
          {QUICK_LOGINS.map((ql) => (
            <QuickLoginButton
              key={ql.role}
              role={ql.role}
              label={ql.label}
              onClick={() => doLogin(ql.email, ql.password)}
            />
          ))}
        </div>
      </div>
    </Login>
  );
}

function QuickLoginButton({ role, label, onClick }: { role: Role; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const rolUi = ROL_UI[role];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center"
      style={{
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid ${hover ? '#DC0202' : '#D1D3D4'}`,
        backgroundColor: hover ? '#DC02020A' : '#FFFFFF',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.12s, background-color 0.12s',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: `${rolUi.color}1A`,
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={rolUi.icon} style={{ fontSize: 14, color: rolUi.color }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#000000' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#808285' }}>{ROLE_LABELS[role]}</div>
      </div>
    </button>
  );
}
