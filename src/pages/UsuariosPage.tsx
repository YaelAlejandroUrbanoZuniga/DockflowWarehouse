import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { motion, useReducedMotion } from 'motion/react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faPlus,
  faEnvelope,
  faUserCircle,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import { usersAtom, currentUserAtom, almacenesAtom } from '@/lib/store';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '@/lib/constants';
import { ROL_UI } from '@/lib/ui-map';
import type { User, Role, Almacen } from '@/lib/types';
import { SectionHeader } from '@/components/SectionHeader';
import { ConfirmDialog } from '@/kit/componentes/ConfirmDialog/ConfirmDialog';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { Insignia } from '@/kit/componentes/Insignia/Insignia';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { SelectCatalogo } from '@/kit/componentes/SelectCatalogo/SelectCatalogo';
import { EmptyState } from '@/kit/componentes/EmptyState/EmptyState';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';

export function UsuariosPage() {
  const toast = useToast();
  const [users, setUsers] = useAtom(usersAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const almacenes = useAtomValue(almacenesAtom);
  const perms = ROLE_PERMISSIONS[currentUser.role];
  const reduceMotion = useReducedMotion();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmandoToggle, setConfirmandoToggle] = useState<User | null>(null);

  if (!perms.canManageUsers) {
    return (
      <div>
        <Tarjeta style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 14, color: '#808285', margin: 0 }}>No tiene permisos para gestionar usuarios</p>
        </Tarjeta>
      </div>
    );
  }

  const handleSave = (u: User) => {
    if (editingId) {
      setUsers((prev) => prev.map((x) => (x.id === editingId ? u : x)));
      toast.success('Usuario actualizado');
    } else {
      setUsers((prev) => [...prev, { ...u, id: `u${Date.now()}` }]);
      toast.success('Usuario creado');
    }
    setShowForm(false);
    setEditingId(null);
  };

  const toggleActive = (id: string) => {
    const wasActive = users.find((u) => u.id === id)?.estactivo;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, estactivo: !u.estactivo } : u)));
    toast.success(wasActive ? 'Usuario desactivado' : 'Usuario reactivado');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Usuarios</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>{users.length} usuarios registrados</p>
        </div>
        <Boton onClick={() => { setEditingId(null); setShowForm(true); }}>
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />
          Nuevo Usuario
        </Boton>
      </div>

      <SectionHeader icon={faUsers} title="Administración de Usuarios" />

      {users.length === 0 ? (
        <EmptyState
          icon={faUsers}
          title="No hay usuarios"
          description="Crea un nuevo usuario para comenzar."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {users.map((u, i) => (
            <motion.div
              key={u.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { delay: i * 0.05 }}
            >
              <UserCard
                user={u}
                isSelf={u.id === currentUser.id}
                onEdit={() => { setEditingId(u.id); setShowForm(true); }}
                onToggleActive={() => setConfirmandoToggle(u)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {confirmandoToggle && (
        <ConfirmDialog
          title={confirmandoToggle.estactivo ? '¿Desactivar usuario?' : '¿Reactivar usuario?'}
          message={
            <>
              Estás a punto de {confirmandoToggle.estactivo ? 'desactivar' : 'reactivar'} a{' '}
              <strong style={{ color: '#000000' }}>{confirmandoToggle.nombrecompleto}</strong>.{' '}
              {confirmandoToggle.estactivo
                ? 'No podrá iniciar sesión hasta que se reactive.'
                : 'Volverá a tener acceso al sistema.'}
            </>
          }
          confirmLabel={confirmandoToggle.estactivo ? 'Desactivar' : 'Reactivar'}
          confirmColor={confirmandoToggle.estactivo ? '#DC0202' : '#6ABF4B'}
          onCancel={() => setConfirmandoToggle(null)}
          onConfirm={() => {
            toggleActive(confirmandoToggle.id);
            setConfirmandoToggle(null);
          }}
        />
      )}

      {showForm && (
        <UserForm
          user={editingId ? users.find((u) => u.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSave={handleSave}
          almacenes={almacenes}
        />
      )}
    </div>
  );
}

function UserCard({
  user,
  isSelf,
  onEdit,
  onToggleActive,
}: {
  user: User;
  isSelf: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const [editHover, setEditHover] = useState(false);
  const [toggleHover, setToggleHover] = useState(false);
  const rolUI = ROL_UI[user.role];

  return (
    <Tarjeta>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 12 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: user.estactivo ? '#DC02021A' : '#EEEEEE',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon
            icon={faUserCircle}
            style={{ fontSize: 20, color: user.estactivo ? '#DC0202' : '#808285' }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{user.nombrecompleto}</div>
          <div className="flex items-center" style={{ gap: 4, fontSize: 12, color: '#808285' }}>
            <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 11 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
        <FontAwesomeIcon icon={rolUI.icon} style={{ fontSize: 12, color: rolUI.color }} />
        <Insignia estado="info">{ROLE_LABELS[user.role]}</Insignia>
        <Insignia estado={user.estactivo ? 'active' : 'archived'}>
          {user.estactivo ? 'Activo' : 'Inactivo'}
        </Insignia>
      </div>

      <div className="flex" style={{ gap: 8 }}>
        <button
          onClick={onEdit}
          onMouseEnter={() => setEditHover(true)}
          onMouseLeave={() => setEditHover(false)}
          className="flex flex-1 items-center justify-center"
          style={{
            gap: 6,
            padding: '6px 0',
            fontSize: 12,
            fontWeight: 600,
            color: '#808285',
            border: '1px solid #D1D3D4',
            borderRadius: 6,
            backgroundColor: editHover ? '#F5F5F5' : '#FFFFFF',
            cursor: 'pointer',
            transition: 'background-color 0.12s',
          }}
        >
          <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 11 }} />
          Editar
        </button>
        {!isSelf && (
          <ToggleActiveButton active={user.estactivo} hover={toggleHover} setHover={setToggleHover} onClick={onToggleActive} />
        )}
      </div>
    </Tarjeta>
  );
}

function ToggleActiveButton({
  active,
  hover,
  setHover,
  onClick,
}: {
  active: boolean;
  hover: boolean;
  setHover: (v: boolean) => void;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex-1"
      style={{
        padding: '6px 0',
        fontSize: 12,
        fontWeight: 600,
        color: active ? '#DC0202' : '#6ABF4B',
        border: `1px solid ${active ? '#DC020240' : '#6ABF4B40'}`,
        borderRadius: 6,
        backgroundColor: hover ? (active ? '#DC02020D' : '#6ABF4B0D') : '#FFFFFF',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
      }}
    >
      {active ? 'Desactivar' : 'Activar'}
    </button>
  );
}

function UserForm({
  user,
  onClose,
  onSave,
  almacenes,
}: {
  user?: User;
  onClose: () => void;
  onSave: (u: User) => void;
  almacenes: Almacen[];
}) {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const [form, setForm] = useState<User>(
    user || {
      id: '',
      nombrecompleto: '',
      email: '',
      role: 'vigilancia',
      password: '',
      estactivo: true,
      almacenId: almacenes[0]?.id ?? null,
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombrecompleto || !form.email || !form.password) {
      toast.validationError('Complete los campos requeridos');
      return;
    }
    if ((form.role === 'vigilancia' || form.role === 'warehouse') && !form.almacenId) {
      toast.validationError('Debe seleccionar un almacén para este rol');
      return;
    }
    onSave(form);
  };

  const [checkHover, setCheckHover] = useState(false);

  return (
    <>
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.30)', zIndex: 40 }}
        onClick={onClose}
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : undefined}
        className="fixed"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        <ModalHeader
          title={user ? 'Editar Usuario' : 'Nuevo Usuario'}
          accentColor="#DC0202"
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} style={{ padding: '24px 32px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CampoTexto
            label="Nombre Completo *"
            type="text"
            value={form.nombrecompleto}
            onChange={(e) => setForm({ ...form, nombrecompleto: e.target.value })}
            required
          />
          <CampoTexto
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <CampoTexto
            label="Contraseña *"
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>Rol</label>
            <SelectCatalogo
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v as Role, almacenId: v === 'superuser' || v === 'coordinador' ? null : form.almacenId })}
              options={Object.keys(ROLE_LABELS) as Role[]}
              placeholder="Seleccionar rol"
            />
          </div>
          {(form.role === 'vigilancia' || form.role === 'warehouse') && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>Almacén *</label>
              <SelectCatalogo
                value={form.almacenId ?? ''}
                onChange={(v) => setForm({ ...form, almacenId: v })}
                options={almacenes.map((a) => a.id)}
                placeholder="Seleccionar almacén..."
              />
            </div>
          )}
          <label
            className="flex items-center"
            style={{ gap: 8, fontSize: 13, color: '#000000', cursor: 'pointer' }}
            onMouseEnter={() => setCheckHover(true)}
            onMouseLeave={() => setCheckHover(false)}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `2px solid ${form.estactivo ? '#DC0202' : '#D1D3D4'}`,
                backgroundColor: form.estactivo ? '#DC0202' : (checkHover ? '#F5F5F5' : '#FFFFFF'),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.12s, border-color 0.12s',
                flexShrink: 0,
              }}
            >
              {form.estactivo && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              checked={form.estactivo}
              onChange={(e) => setForm({ ...form, estactivo: e.target.checked })}
              style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
            />
            Activo
          </label>

          <Boton type="submit" style={{ width: '100%', justifyContent: 'center' }}>
            Guardar
          </Boton>
        </form>
      </motion.div>
    </>
  );
}
