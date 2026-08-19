export const HEADER_HEIGHT = 55;
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 60;
export const MAIN_PADDING_TOP = HEADER_HEIGHT + 32;
export const MAIN_PADDING_X = 32;
export const MAIN_PADDING_BOTTOM = 32;
export const CONTENT_HEIGHT_CSS = `calc(100vh - ${MAIN_PADDING_TOP}px - ${MAIN_PADDING_BOTTOM}px)`;
export const NOTIFICATION_PANEL_MAX_WIDTH = 420;
export const NOTIFICATION_PANEL_MIN_WIDTH = 300;
export const SIDE_PANEL_HEIGHT = '75vh';
export const ANCHO_MINIMO = 1280;
export const zIndex = {
  sidebar: 30,
  header: 50,
  dropdown: 50,
  panelOverlay: 98,
  panel: 99,
  loadingFullScreen: 200,
  tooltip: 300,
  modal: 10001,
  toast: 10002,
} as const;
