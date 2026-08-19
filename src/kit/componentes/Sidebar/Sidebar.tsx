import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { HEADER_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED, zIndex } from '../../tokens/layout';

export interface SidebarNavItem { path: string; icon: IconDefinition; label: string; }

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  items: SidebarNavItem[];
  usuario: { displayName: string; role: string };
  onCerrarSesion: () => void;
  accionesExtra?: { label: string; icon: IconDefinition; onClick: () => void }[];
}

function inicialesDe(nombre: string): string {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export function Sidebar({ collapsed, onToggle, items, usuario, onCerrarSesion, accionesExtra = [] }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const anchoSidebar = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function alClicFuera(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && triggerRef.current && !triggerRef.current.contains(target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', alClicFuera);
    return () => document.removeEventListener('mousedown', alClicFuera);
  }, []);

  return (
    <aside className="fixed left-0 flex flex-col" style={{ width: anchoSidebar, backgroundColor: '#808285', top: HEADER_HEIGHT, bottom: 0, zIndex: zIndex.sidebar, transition: 'width 0.3s' }}>
      <button onClick={onToggle} className="absolute flex items-center justify-center" style={{ right: -12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', backgroundColor: '#AA0202', color: '#FFFFFF', border: 'none', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.28)', zIndex: 10 }} aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}>
        <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} style={{ fontSize: 10 }} />
      </button>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 8 }}>
        {items.map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '15px 15px', minHeight: 40, boxSizing: 'border-box', textDecoration: 'none', color: isActive ? '#000000' : '#FFFFFF', backgroundColor: isActive ? '#EEEEEE' : 'transparent', boxShadow: isActive ? 'inset 6px 0 0 #DC0202' : undefined, transition: 'background-color 0.15s, box-shadow 0.15s' })} onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)'; }} onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <FontAwesomeIcon icon={item.icon} style={{ fontSize: 18, width: 40, textAlign: 'center' }} />
            {!collapsed && <span style={{ fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="relative" style={{ backgroundColor: '#6B7280' }}>
        <button ref={triggerRef} onClick={() => setMenuAbierto(v => !v)} className="flex items-center w-full" style={{ gap: 10, padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
          <div className="flex items-center justify-center shrink-0 rounded-full text-white font-bold" style={{ width: 32, height: 32, backgroundColor: '#DC0202', fontSize: 11 }}>
            {inicialesDe(usuario.displayName)}
          </div>
          {!collapsed && (
            <div className="text-left overflow-hidden">
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>{usuario.displayName}</div>
              <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 12, whiteSpace: 'nowrap' }}>{usuario.role}</div>
            </div>
          )}
        </button>

        {menuAbierto && (
          <div ref={menuRef} className="absolute bg-white" style={{ bottom: collapsed ? 0 : '100%', left: collapsed ? anchoSidebar + 4 : 8, right: collapsed ? 'auto' : 8, marginBottom: collapsed ? 0 : 4, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.20)', paddingTop: 4, paddingBottom: 4, zIndex: 50, minWidth: 180 }}>
            <button className="flex items-center gap-3 w-full text-left" style={{ padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { navigate('/configuracion'); setMenuAbierto(false); }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <FontAwesomeIcon icon={faCog} style={{ color: '#808285', fontSize: 13, width: 14 }} /> Configuración
            </button>
            {accionesExtra.map(accion => (
              <button key={accion.label} className="flex items-center gap-3 w-full text-left" style={{ padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { accion.onClick(); setMenuAbierto(false); }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <FontAwesomeIcon icon={accion.icon} style={{ color: '#808285', fontSize: 13, width: 14 }} /> {accion.label}
              </button>
            ))}
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #E0E0E0' }} />
            <button className="flex items-center gap-3 w-full text-left" style={{ padding: '10px 16px', fontSize: 13, color: '#DC0202', background: 'none', border: 'none', cursor: 'pointer' }} onClick={onCerrarSesion} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <FontAwesomeIcon icon={faSignOutAlt} style={{ color: '#DC0202', fontSize: 13, width: 14 }} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
