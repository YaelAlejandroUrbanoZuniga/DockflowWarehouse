import type { Almacen, Cita, Dock, Transportista, User } from './types';
import { ESTADOS } from './constants';

export const ALMACEN_PLANTA69_ID = 'alm-69';

export const SEED_ALMACENES: Almacen[] = [
  {
    id: ALMACEN_PLANTA69_ID,
    nombre: 'Nexteer Querétaro — Planta 69',
    ubicacion: 'Av. Fuentes #12 Parque Ind. Finsa, Querétaro C.P. 76246',
    activo: true,
  },
  {
    id: 'alm-65',
    nombre: 'Planta 65 Querétaro',
    ubicacion: 'Querétaro, Qro.',
    activo: true,
  },
  {
    id: 'alm-66',
    nombre: 'Planta 66 Querétaro',
    ubicacion: 'Querétaro, Qro.',
    activo: true,
  },
  {
    id: 'alm-63',
    nombre: 'Planta 63 Querétaro',
    ubicacion: 'Querétaro, Qro.',
    activo: true,
  },
];

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    nombrecompleto: 'Carlos Mendoza',
    email: 'super@nexteer.com',
    role: 'superuser',
    password: 'super123',
    estactivo: true,
    almacenId: null,
  },
  {
    id: 'u2',
    nombrecompleto: 'Ana Martínez',
    email: 'coordinador@nexteer.com',
    role: 'coordinador',
    password: 'admin123',
    estactivo: true,
    almacenId: null,
  },
  {
    id: 'u3',
    nombrecompleto: 'Jorge Ruiz',
    email: 'vigilancia@nexteer.com',
    role: 'vigilancia',
    password: 'watch123',
    estactivo: true,
    almacenId: ALMACEN_PLANTA69_ID,
  },
  {
    id: 'u4',
    nombrecompleto: 'María López',
    email: 'warehouse@nexteer.com',
    role: 'warehouse',
    password: 'wh123',
    estactivo: true,
    almacenId: ALMACEN_PLANTA69_ID,
  },
];

export const SEED_DOCKS: Dock[] = [
  {
    id: 'd1',
    nombredock: 'Dock A',
    descripcion: 'Andén principal — mercancía de producción',
    estactivo: true,
    capacidaddiaria: 8,
    almacenId: ALMACEN_PLANTA69_ID,
  },
  {
    id: 'd2',
    nombredock: 'Dock B',
    descripcion: 'Andén secundario — contenedores grandes',
    estactivo: true,
    capacidaddiaria: 8,
    almacenId: ALMACEN_PLANTA69_ID,
  },
];

export const SEED_TRANSPORTISTAS: Transportista[] = [
  {
    id: 't1',
    nombrecompaa: 'Express Cargo MX',
    rfc: 'ECM950101AB1',
    nombrecontacto: 'Pedro García',
    emailcontacto: 'logistica@expresscargo.mx',
    telefonocontacto: '+52 55 1234 5600',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
  {
    id: 't2',
    nombrecompaa: 'Logística Avanzada',
    rfc: 'LA020315XY2',
    nombrecontacto: 'Laura Sánchez',
    emailcontacto: 'ops@logisticaavanzada.com',
    telefonocontacto: '+52 55 2345 6700',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
  {
    id: 't3',
    nombrecompaa: 'HH Transportes',
    rfc: 'HHT880909CD3',
    nombrecontacto: 'Denisse Tovar',
    emailcontacto: 'denisse.tovar@hhtransportes.com',
    telefonocontacto: '+52 1229 1340606',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
  {
    id: 't4',
    nombrecompaa: 'TROB Transportes SA DE CV',
    rfc: 'TROB790412MN4',
    nombrecontacto: 'Juan Viveros',
    emailcontacto: 'juan.viveros@trob.com.mx',
    telefonocontacto: '+52 811 2392266',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
  {
    id: 't5',
    nombrecompaa: 'Fletes México',
    rfc: 'FM010722PQ5',
    nombrecontacto: 'Luis Angel Aguila Ramos',
    emailcontacto: 'laguila@fletes-mexico.com',
    telefonocontacto: '+52 656 408 0354',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
  {
    id: 't6',
    nombrecompaa: 'CORPORATIVO ALPEÑASA, S. DE R...',
    rfc: '',
    nombrecontacto: 'Florencio Salvador',
    emailcontacto: 'gerencia.general@transportesalpenasa.com',
    telefonocontacto: '+52 144 233 82969',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
  {
    id: 't7',
    nombrecompaa: 'LOGISTICA LEMA DE QUERETARO...',
    rfc: 'LRHC',
    nombrecontacto: 'Patricia Navarro',
    emailcontacto: 'pnavarro@lematransport.com.mx',
    telefonocontacto: '+52 1442 4244340',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
  {
    id: 't8',
    nombrecompaa: 'Nexteer',
    rfc: '',
    nombrecontacto: 'Nexteer',
    emailcontacto: '',
    telefonocontacto: '+52 442 4714800',
    estactivo: true,
    horasLibres: 2,
    tarifadetencion: 500,
  },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoNow(offsetMin = 0): string {
  return new Date(Date.now() + offsetMin * 60000).toISOString();
}

function makeCita(
  idx: number,
  po: string,
  transportistaId: string,
  transportistaName: string,
  transportistaEmail: string,
  dockId: string,
  dockName: string,
  estadoKey: Cita['estadoKey'],
  inicio: string,
  fin: string,
  conductor: string,
  caja: string,
  creador: { id: string; nombrecompleto: string },
  extras: Partial<Cita> = {},
): Cita {
  const fecha = todayStr();
  const base: Cita = {
    id: `c${idx}`,
    nmeropo: po,
    almacenId: ALMACEN_PLANTA69_ID,
    dock: { id: dockId, nombredock: dockName },
    transportista: {
      id: transportistaId,
      nombrecompaa: transportistaName,
      emailcontacto: transportistaEmail,
    },
    creadopor: creador,
    estadoKey,
    fechaprogramada: fecha,
    inicioventana: inicio,
    finventana: fin,
    numerocaja: caja,
    nombreconductor: conductor,
    islate: false,
    historial: [
      {
        estadoKey: 0,
        estadoNombre: ESTADOS[0].nombre,
        timestamp: isoNow(-180),
        usuarioNombre: creador.nombrecompleto,
      },
    ],
    qrToken: `tok_${po}_${idx}`,
  };
  return { ...base, ...extras };
}

export function buildSeedCitas(): Cita[] {
  const fecha = todayStr();
  const c = (n: number, po: string, tIdx: number, dIdx: number, ek: Cita['estadoKey'], ini: string, fin: string, cond: string, caja: string, extras?: Partial<Cita>) => {
    const t = SEED_TRANSPORTISTAS[tIdx];
    const d = SEED_DOCKS[dIdx];
    const creador = { id: 'u2', nombrecompleto: 'Ana Martínez' };
    return makeCita(n, po, t.id, t.nombrecompaa, t.emailcontacto, d.id, d.nombredock, ek, ini, fin, cond, caja, creador, extras);
  };

  const citas: Cita[] = [
    // Programada
    c(1, 'PO-2024-1001', 0, 0, 0, '10:00', '11:00', 'Miguel Torres', 'CAJA-001'),
    c(2, 'PO-2024-1002', 1, 1, 0, '11:00', '12:00', 'Rosa Vela', 'CAJA-002'),
    // Llegada
    c(3, 'PO-2024-1003', 2, 0, 1, '09:00', '10:00', 'Juan Pérez', 'CAJA-003', {
      actualstarttime: isoNow(-20),
      historial: [
        { estadoKey: 0, estadoNombre: ESTADOS[0].nombre, timestamp: isoNow(-200), usuarioNombre: 'Ana Martínez' },
        { estadoKey: 1, estadoNombre: ESTADOS[1].nombre, timestamp: isoNow(-20), usuarioNombre: 'Jorge Ruiz' },
      ],
    }),
    // Esp. Autorización (pending, recent)
    c(4, 'PO-2024-1004', 3, 1, 7, '08:30', '09:30', 'Luis Ramírez', 'CAJA-004', {
      actualstarttime: isoNow(-15),
      autorizacionTimestamp: isoNow(-15),
      historial: [
        { estadoKey: 0, estadoNombre: ESTADOS[0].nombre, timestamp: isoNow(-220), usuarioNombre: 'Ana Martínez' },
        { estadoKey: 1, estadoNombre: ESTADOS[1].nombre, timestamp: isoNow(-15), usuarioNombre: 'Jorge Ruiz' },
        { estadoKey: 7, estadoNombre: ESTADOS[7].nombre, timestamp: isoNow(-15), usuarioNombre: 'Sistema' },
      ],
    }),
    // Esp. Autorización (delayed >30min)
    c(5, 'PO-2024-1005', 4, 0, 7, '07:00', '08:00', 'Carmen Díaz', 'CAJA-005', {
      actualstarttime: isoNow(-45),
      autorizacionTimestamp: isoNow(-45),
      autorizacionDelay: 45,
      islate: true,
      historial: [
        { estadoKey: 0, estadoNombre: ESTADOS[0].nombre, timestamp: isoNow(-260), usuarioNombre: 'Ana Martínez' },
        { estadoKey: 1, estadoNombre: ESTADOS[1].nombre, timestamp: isoNow(-45), usuarioNombre: 'Jorge Ruiz' },
        { estadoKey: 7, estadoNombre: ESTADOS[7].nombre, timestamp: isoNow(-45), usuarioNombre: 'Sistema' },
      ],
    }),
    // En Rampa
    c(6, 'PO-2024-1006', 0, 1, 8, '09:30', '10:30', 'Fernando Cruz', 'CAJA-006', {
      actualstarttime: isoNow(-60),
      autorizacionTimestamp: isoNow(-30),
      historial: [
        { estadoKey: 0, estadoNombre: ESTADOS[0].nombre, timestamp: isoNow(-240), usuarioNombre: 'Ana Martínez' },
        { estadoKey: 1, estadoNombre: ESTADOS[1].nombre, timestamp: isoNow(-60), usuarioNombre: 'Jorge Ruiz' },
        { estadoKey: 7, estadoNombre: ESTADOS[7].nombre, timestamp: isoNow(-60), usuarioNombre: 'Sistema' },
        { estadoKey: 8, estadoNombre: ESTADOS[8].nombre, timestamp: isoNow(-30), usuarioNombre: 'María López' },
      ],
    }),
    // Descargando
    c(7, 'PO-2024-1007', 1, 0, 2, '08:00', '09:00', 'Patricia Núñez', 'CAJA-007', {
      actualstarttime: isoNow(-25),
      autorizacionTimestamp: isoNow(-20),
      historial: [
        { estadoKey: 0, estadoNombre: ESTADOS[0].nombre, timestamp: isoNow(-200), usuarioNombre: 'Ana Martínez' },
        { estadoKey: 1, estadoNombre: ESTADOS[1].nombre, timestamp: isoNow(-25), usuarioNombre: 'Jorge Ruiz' },
        { estadoKey: 7, estadoNombre: ESTADOS[7].nombre, timestamp: isoNow(-25), usuarioNombre: 'Sistema' },
        { estadoKey: 8, estadoNombre: ESTADOS[8].nombre, timestamp: isoNow(-20), usuarioNombre: 'María López' },
        { estadoKey: 2, estadoNombre: ESTADOS[2].nombre, timestamp: isoNow(-10), usuarioNombre: 'María López' },
      ],
    }),
    // Finalizada
    c(8, 'PO-2024-1008', 2, 1, 3, '07:30', '08:30', 'Eduardo Salas', 'CAJA-008', {
      actualstarttime: isoNow(-180),
      actualendtime: isoNow(-60),
      autorizacionTimestamp: isoNow(-165),
      historial: [
        { estadoKey: 0, estadoNombre: ESTADOS[0].nombre, timestamp: isoNow(-300), usuarioNombre: 'Ana Martínez' },
        { estadoKey: 1, estadoNombre: ESTADOS[1].nombre, timestamp: isoNow(-180), usuarioNombre: 'Jorge Ruiz' },
        { estadoKey: 7, estadoNombre: ESTADOS[7].nombre, timestamp: isoNow(-180), usuarioNombre: 'Sistema' },
        { estadoKey: 8, estadoNombre: ESTADOS[8].nombre, timestamp: isoNow(-165), usuarioNombre: 'María López' },
        { estadoKey: 2, estadoNombre: ESTADOS[2].nombre, timestamp: isoNow(-120), usuarioNombre: 'María López' },
        { estadoKey: 3, estadoNombre: ESTADOS[3].nombre, timestamp: isoNow(-60), usuarioNombre: 'María López' },
      ],
    }),
  ];

  void fecha;
  return citas;
}
