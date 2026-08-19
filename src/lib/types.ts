export type Role = 'superuser' | 'coordinador' | 'vigilancia' | 'warehouse';

export interface Almacen {
  id: string;
  nombre: string;
  ubicacion?: string;
  activo: boolean;
}

export interface User {
  id: string;
  nombrecompleto: string;
  email: string;
  role: Role;
  password: string;
  estactivo: boolean;
  almacenId: string | null;
}

export interface Dock {
  id: string;
  nombredock: string;
  descripcion: string;
  estactivo: boolean;
  capacidaddiaria: number;
  almacenId: string;
}

export interface Transportista {
  id: string;
  nombrecompaa: string;
  rfc: string;
  nombrecontacto: string;
  emailcontacto: string;
  telefonocontacto: string;
  estactivo: boolean;
  horasLibres: number;
  tarifadetencion: number;
}

export type EstadoKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface EventoHistorial {
  estadoKey: EstadoKey;
  estadoNombre: string;
  timestamp: string;
  usuarioNombre: string;
  nota?: string;
}

export interface Cita {
  id: string;
  nmeropo: string;
  almacenId: string;
  dock: { id: string; nombredock: string };
  transportista: {
    id: string;
    nombrecompaa: string;
    emailcontacto: string;
  };
  creadopor: { id: string; nombrecompleto: string };
  estadoKey: EstadoKey;
  fechaprogramada: string;
  inicioventana: string;
  finventana: string;
  actualstarttime?: string;
  actualendtime?: string;
  autorizacionTimestamp?: string;
  autorizacionDelay?: number;
  nombreconductor?: string;
  telfonoconductor?: string;
  placascamin?: string;
  numerocaja: string;
  mercanca?: string;
  notas?: string;
  islate: boolean;
  historial: EventoHistorial[];
  qrToken?: string;
}

export interface CitaInput {
  nmeropo: string;
  numerocaja: string;
  transportistaId: string;
  dockId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreconductor?: string;
  placascamin?: string;
  sello?: string;
  mercanca?: string;
  notas?: string;
}
