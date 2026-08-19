import QRCode from 'qrcode';
import type { Cita } from './types';
import { NEXTEER_ADDRESS } from './constants';

const QR_SECRET = 'nexteer-dockflow-secret-2024';

function base64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
}

async function sha256Hash(input: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  } catch {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
}

export async function generateSignedToken(cita: Cita): Promise<string> {
  const payload = JSON.stringify({
    citaId: cita.id,
    po: cita.nmeropo,
    dock: cita.dock.nombredock,
    t: Date.now(),
  });
  const b64 = base64Encode(payload);
  const hash = await sha256Hash(payload + QR_SECRET);
  return `${b64}.${hash}`;
}

export async function verifyToken(token: string): Promise<boolean> {
  const [b64, hash] = token.split('.');
  if (!b64 || !hash) return false;
  try {
    const payload = decodeURIComponent(escape(atob(b64)));
    const expectedHash = await sha256Hash(payload + QR_SECRET);
    return hash === expectedHash;
  } catch {
    return false;
  }
}

export function buildPublicCheckinUrl(cita: Cita): string {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    po: cita.nmeropo,
    dock: cita.dock.nombredock,
    fecha: cita.fechaprogramada,
    ventana: `${cita.inicioventana}-${cita.finventana}`,
    transportista: cita.transportista.nombrecompaa,
    token: cita.qrToken || '',
  });
  return `${baseUrl}/checkin-public/${cita.id}?${params.toString()}`;
}

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 320,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}

export function buildWhatsAppMessage(cita: Cita): string {
  const fecha = cita.fechaprogramada;
  return (
    `🔴 NEXTEER AUTOMOTIVE\n` +
    `📍 ${NEXTEER_ADDRESS}\n` +
    `✅ CONFIRMACIÓN DE CITA\n` +
    `Ref: ${cita.nmeropo}\n` +
    `Fecha: ${fecha}\n` +
    `Horario: ${cita.inicioventana}-${cita.finventana}\n` +
    `Dock: ${cita.dock.nombredock}\n` +
    `Transportista: ${cita.transportista.nombrecompaa}\n` +
    `📎 QR descargado — adjúntelo`
  );
}

export function buildReminderMessage(cita: Cita): string {
  return (
    `⏰ RECORDATORIO DE CITA\n` +
    `🔴 NEXTEER AUTOMOTIVE\n` +
    `Ref: ${cita.nmeropo}\n` +
    `Fecha: ${cita.fechaprogramada}\n` +
    `Horario: ${cita.inicioventana}-${cita.finventana}\n` +
    `Dock: ${cita.dock.nombredock}\n` +
    `Conductor: ${cita.nombreconductor || 'N/A'}\n` +
    `Caja: ${cita.numerocaja}\n` +
    `Por favor arrive 15 min antes.`
  );
}

export function buildQrCheckInMessage(cita: Cita): string {
  return (
    `📲 CHECK-IN POR QR\n` +
    `🔴 NEXTEER AUTOMOTIVE\n` +
    `Ref: ${cita.nmeropo}\n` +
    `Presente este QR en caseta de vigilancia.\n` +
    `Fecha: ${cita.fechaprogramada}\n` +
    `Horario: ${cita.inicioventana}-${cita.finventana}\n` +
    `Dock: ${cita.dock.nombredock}`
  );
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function openEmail(to: string, subject: string, body: string): void {
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
}
