export const duracion = { rapida: 120, media: 200, lenta: 300 } as const;
export const curva = { entrada: 'ease-out', salida: 'ease-in', continua: 'linear' } as const;
export const transiciones = {
  hoverFondo: 'background-color 120ms ease-out',
  hoverSombra: 'box-shadow 150ms ease-out',
  hoverElevacion: 'transform 150ms ease-out, box-shadow 150ms ease-out',
  sidebar: 'width 300ms ease-out',
  contenido: 'margin-left 300ms ease-out',
} as const;
export const EXIT_MS = duracion.media;
