import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { EstadoKey, Role } from './types';
import { ESTADO_UI } from './ui-map';

type EstadoInsignia = 'active' | 'pending' | 'warning' | 'error' | 'info' | 'archived';

export const NEXTEER_ADDRESS =
  'Av. Fuentes #12 Parque Ind. Finsa, Querétaro C.P. 76246';

export interface EstadoConfig {
  key: EstadoKey;
  nombre: string;
  animate?: 'pulse' | 'spin';
  iconFA: IconDefinition;
  insignia: EstadoInsignia;
}

export const ESTADOS: Record<EstadoKey, EstadoConfig> = {
  0: {
    key: 0,
    nombre: 'Programada',
    animate: 'pulse',
    iconFA: ESTADO_UI[0].icon,
    insignia: ESTADO_UI[0].insignia,
  },
  1: {
    key: 1,
    nombre: 'Llegada',
    animate: 'pulse',
    iconFA: ESTADO_UI[1].icon,
    insignia: ESTADO_UI[1].insignia,
  },
  7: {
    key: 7,
    nombre: 'Esp. Autorización',
    animate: 'pulse',
    iconFA: ESTADO_UI[7].icon,
    insignia: ESTADO_UI[7].insignia,
  },
  8: {
    key: 8,
    nombre: 'En Rampa',
    animate: 'pulse',
    iconFA: ESTADO_UI[8].icon,
    insignia: ESTADO_UI[8].insignia,
  },
  2: {
    key: 2,
    nombre: 'Descargando',
    animate: 'spin',
    iconFA: ESTADO_UI[2].icon,
    insignia: ESTADO_UI[2].insignia,
  },
  3: {
    key: 3,
    nombre: 'Finalizada',
    iconFA: ESTADO_UI[3].icon,
    insignia: ESTADO_UI[3].insignia,
  },
  6: {
    key: 6,
    nombre: 'Salida',
    iconFA: ESTADO_UI[6].icon,
    insignia: ESTADO_UI[6].insignia,
  },
  4: {
    key: 4,
    nombre: 'Retrasada',
    animate: 'pulse',
    iconFA: ESTADO_UI[4].icon,
    insignia: ESTADO_UI[4].insignia,
  },
  5: {
    key: 5,
    nombre: 'Cancelada',
    iconFA: ESTADO_UI[5].icon,
    insignia: ESTADO_UI[5].insignia,
  },
};

export const FLOW_ORDER: EstadoKey[] = [0, 1, 7, 8, 2, 3, 6];

export const ROLE_LABELS: Record<Role, string> = {
  superuser: 'Super Usuario',
  coordinador: 'Coordinador',
  vigilancia: 'Vigilancia',
  warehouse: 'Almacén',
};

export interface RolePermissions {
  canCreateCitas: boolean;
  canEditCitas: boolean;
  canManageTransportistas: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canViewOperador: boolean;
  canAuthorizeDescarga: boolean;
  canChangeEnRampa: boolean;
  canCancelCitas: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  superuser: {
    canCreateCitas: true,
    canEditCitas: true,
    canManageTransportistas: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canCheckIn: true,
    canCheckOut: true,
    canViewOperador: true,
    canAuthorizeDescarga: true,
    canChangeEnRampa: true,
    canCancelCitas: true,
  },
  coordinador: {
    canCreateCitas: true,
    canEditCitas: true,
    canManageTransportistas: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canCheckIn: false,
    canCheckOut: false,
    canViewOperador: false,
    canAuthorizeDescarga: false,
    canChangeEnRampa: false,
    canCancelCitas: true,
  },
  vigilancia: {
    canCreateCitas: false,
    canEditCitas: false,
    canManageTransportistas: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canCheckIn: true,
    canCheckOut: true,
    canViewOperador: false,
    canAuthorizeDescarga: false,
    canChangeEnRampa: false,
    canCancelCitas: false,
  },
  warehouse: {
    canCreateCitas: false,
    canEditCitas: true,
    canManageTransportistas: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canCheckIn: true,
    canCheckOut: false,
    canViewOperador: true,
    canAuthorizeDescarga: true,
    canChangeEnRampa: true,
    canCancelCitas: false,
  },
};

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 0; h <= 23; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();
