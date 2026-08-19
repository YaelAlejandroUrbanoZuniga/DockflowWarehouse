import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faClock,
  faTruck,
  faShieldHalved,
  faTruckRampBox,
  faBoxOpen,
  faCircleCheck,
  faRightFromBracket,
  faTriangleExclamation,
  faCircleXmark,
  faUserShield,
  faUserGear,
  faUserTie,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import type { EstadoKey, Role } from './types';

type EstadoInsignia = 'active' | 'pending' | 'warning' | 'error' | 'info' | 'archived';

export interface EstadoUI {
  icon: IconDefinition;
  insignia: EstadoInsignia;
  color: string;
}

export const ESTADO_UI: Record<EstadoKey, EstadoUI> = {
  0: { icon: faClock,               insignia: 'info',     color: '#02B3E1' },
  1: { icon: faTruck,               insignia: 'pending',  color: '#D4A017' },
  7: { icon: faShieldHalved,        insignia: 'pending',  color: '#D4A017' },
  8: { icon: faTruckRampBox,        insignia: 'info',     color: '#02B3E1' },
  2: { icon: faBoxOpen,             insignia: 'info',     color: '#02B3E1' },
  3: { icon: faCircleCheck,         insignia: 'active',   color: '#6ABF4B' },
  6: { icon: faRightFromBracket,    insignia: 'archived', color: '#6B7280' },
  4: { icon: faTriangleExclamation, insignia: 'warning',  color: '#E3650B' },
  5: { icon: faCircleXmark,         insignia: 'archived', color: '#6B7280' },
};

export const ROL_UI: Record<Role, { icon: IconDefinition; color: string }> = {
  superuser:   { icon: faUserShield, color: '#DC0202' },
  coordinador: { icon: faUserTie,    color: '#0084C0' },
  vigilancia:  { icon: faUserGear,   color: '#6ABF4B' },
  warehouse:   { icon: faWarehouse,  color: '#D4A017' },
};
