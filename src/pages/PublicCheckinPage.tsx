import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { motion, useReducedMotion } from 'motion/react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faLocationDot,
  faClock,
  faCalendarDays,
  faCircleCheck,
  faArrowRight,
  faQrcode,
  faXmark,
  faBoxOpen,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { citasAtom } from '@/lib/store';
import { ESTADOS, NEXTEER_ADDRESS } from '@/lib/constants';
import { ESTADO_UI } from '@/lib/ui-map';
import type { Cita, EstadoKey } from '@/lib/types';
import { verifyToken } from '@/lib/qr';
import { EstadoBadge } from '@/components/EstadoBadge';

const BRAND_RED = '#DC0202';
const TEXT_PRIMARY = '#000000';
const TEXT_SECONDARY = '#808285';
const CARD_BG = '#FFFFFF';
const CARD_SHADOW = '0 1px 4px rgba(0,0,0,0.08)';
const CARD_RADIUS = 8;
const INPUT_RADIUS = 6;

const cardStyle = {
  backgroundColor: CARD_BG,
  borderRadius: CARD_RADIUS,
  boxShadow: CARD_SHADOW,
} as const;

export function PublicCheckinPage() {
  const toast = useToast();
  const { tokenId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [citas, setCitas] = useAtom(citasAtom);
  const reduceMotion = useReducedMotion();
  const [scanning, setScanning] = useState(false);
  const [scannedCita, setScannedCita] = useState<Cita | null>(null);
  const [scanMode, setScanMode] = useState<'entry' | 'exit'>('entry');
  const [extraData, setExtraData] = useState({
    numeroCaja: '',
    conductor: '',
    placas: '',
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Try to find cita from URL params
  const urlCita = tokenId ? citas.find((c) => c.id === tokenId) : null;

  useEffect(() => {
    if (urlCita) {
      setScannedCita(urlCita);
      setExtraData({
        numeroCaja: urlCita.numerocaja || '',
        conductor: urlCita.nombreconductor || '',
        placas: urlCita.placascamin || '',
      });
    }
  }, [urlCita]);

  const startScanner = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanLoop();
      }
    } catch {
      toast.systemError('No se pudo acceder a la cámara');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const scanLoop = () => {
    if (!scanning && !streamRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Try BarcodeDetector
        if ('BarcodeDetector' in window) {
          const bd = new (window as unknown as { BarcodeDetector: new (opts: unknown) => { detect: (s: unknown) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({ formats: ['qr_code'] });
          bd.detect(canvas).then((results) => {
            if (results.length > 0) {
              handleScanResult(results[0].rawValue);
              return;
            }
          }).catch(() => {});
        }
      }
    }
    requestAnimationFrame(scanLoop);
  };

  const handleScanResult = (text: string) => {
    // Extract cita ID from URL
    try {
      const url = new URL(text);
      const parts = url.pathname.split('/');
      const citaId = parts[parts.length - 1];
      const cita = citas.find((c) => c.id === citaId);
      if (cita) {
        const token = url.searchParams.get('token');
        if (token) {
          verifyToken(token).then((valid) => {
            if (valid) {
              setScannedCita(cita);
              setExtraData({
                numeroCaja: cita.numerocaja || '',
                conductor: cita.nombreconductor || '',
                placas: cita.placascamin || '',
              });
              stopScanner();
            }
          });
        } else {
          setScannedCita(cita);
          stopScanner();
        }
      } else {
        toast.systemError('Cita no encontrada en el QR');
      }
    } catch {
      toast.systemError('QR inválido');
    }
  };

  const handleConfirmTransition = () => {
    if (!scannedCita) return;

    if (scanMode === 'entry' && !extraData.numeroCaja) {
      toast.validationError('Número de caja es requerido');
      return;
    }

    setCitas((prev) =>
      prev.map((c) => {
        if (c.id !== scannedCita.id) return c;
        const now = new Date().toISOString();
        if (scanMode === 'entry') {
          return {
            ...c,
            estadoKey: 7,
            actualstarttime: now,
            autorizacionTimestamp: now,
            numerocaja: extraData.numeroCaja || c.numerocaja,
            nombreconductor: extraData.conductor || c.nombreconductor,
            placascamin: extraData.placas || c.placascamin,
            historial: [
              ...c.historial,
              { estadoKey: 1, estadoNombre: ESTADOS[1].nombre, timestamp: now, usuarioNombre: 'Vigilancia (QR)' },
              { estadoKey: 7, estadoNombre: ESTADOS[7].nombre, timestamp: now, usuarioNombre: 'Sistema', nota: 'Auto-transición tras Llegada' },
            ],
          };
        } else {
          return {
            ...c,
            estadoKey: 6,
            historial: [
              ...c.historial,
              { estadoKey: 6, estadoNombre: ESTADOS[6].nombre, timestamp: now, usuarioNombre: 'Vigilancia (QR)' },
            ],
          };
        }
      }),
    );
    toast.success(scanMode === 'entry' ? 'Check-in registrado' : 'Check-out registrado');
    setScannedCita(null);
    setScanning(false);
    setTimeout(() => navigate('/'), 1500);
  };

  const po = searchParams.get('po');
  const dock = searchParams.get('dock');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: BRAND_RED, padding: '20px 16px', color: '#FFFFFF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              color: BRAND_RED,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            DF
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>DockFlow — Check-In</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>Nexteer Automotive Querétaro</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>
        {/* Address */}
        <div
          style={{
            ...cardStyle,
            padding: 16,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FontAwesomeIcon icon={faLocationDot} style={{ color: BRAND_RED, fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 400, color: TEXT_SECONDARY }}>{NEXTEER_ADDRESS}</span>
        </div>

        {/* Scan mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setScanMode('entry')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 48,
              borderRadius: INPUT_RADIUS,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s ease',
              backgroundColor: scanMode === 'entry' ? BRAND_RED : CARD_BG,
              color: scanMode === 'entry' ? '#FFFFFF' : TEXT_PRIMARY,
              boxShadow: scanMode === 'entry' ? 'none' : CARD_SHADOW,
            }}
          >
            <FontAwesomeIcon icon={faTruck} style={{ fontSize: 14 }} />
            Entrada (Check-In)
          </button>
          <button
            onClick={() => setScanMode('exit')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 48,
              borderRadius: INPUT_RADIUS,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s ease',
              backgroundColor: scanMode === 'exit' ? BRAND_RED : CARD_BG,
              color: scanMode === 'exit' ? '#FFFFFF' : TEXT_PRIMARY,
              boxShadow: scanMode === 'exit' ? 'none' : CARD_SHADOW,
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 14 }} />
            Salida (Check-Out)
          </button>
        </div>

        {/* Scanner */}
        {!scannedCita && (
          <div style={{ ...cardStyle, padding: 24, marginBottom: 16 }}>
            {!scanning ? (
              <button
                onClick={startScanner}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  padding: '32px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'rgba(220,2,2,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesomeIcon icon={faQrcode} style={{ fontSize: 28, color: BRAND_RED }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>
                  Escanear QR {scanMode === 'entry' ? 'de Entrada' : 'de Salida'}
                </span>
              </button>
            ) : (
              <div>
                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: CARD_RADIUS,
                    backgroundColor: '#000000',
                  }}
                >
                  <video
                    ref={videoRef}
                    style={{ width: '100%', height: 256, objectFit: 'cover', display: 'block' }}
                    playsInline
                    muted
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: 8,
                        border: '4px solid rgba(255,255,255,0.7)',
                      }}
                    />
                  </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button
                  onClick={stopScanner}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 12,
                    minHeight: 44,
                    borderRadius: INPUT_RADIUS,
                    border: '1px solid #E0E0E0',
                    backgroundColor: CARD_BG,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT_SECONDARY,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
                  Cancelar
                </button>
              </div>
            )}

            {/* URL params info */}
            {urlCita && (
              <div
                style={{
                  marginTop: 16,
                  borderRadius: INPUT_RADIUS,
                  backgroundColor: '#F5F5F5',
                  padding: 12,
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600, color: TEXT_PRIMARY }}>Cita desde enlace:</div>
                <div style={{ color: TEXT_SECONDARY, marginTop: 2 }}>{po} · {dock}</div>
              </div>
            )}
          </div>
        )}

        {/* Scanned cita info */}
        {scannedCita && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : undefined}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ ...cardStyle, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, margin: 0 }}>Cita Encontrada</h2>
                <EstadoBadge estadoKey={scannedCita.estadoKey} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoRow icon={faBoxOpen} label="PO:" value={scannedCita.nmeropo} bold />
                <InfoRow icon={faTruck} label="Transportista:" value={scannedCita.transportista.nombrecompaa} />
                <InfoRow icon={faLocationDot} label="Dock:" value={scannedCita.dock.nombredock} />
                <InfoRow icon={faCalendarDays} label="Fecha:" value={scannedCita.fechaprogramada} />
                <InfoRow icon={faClock} label="Ventana:" value={`${scannedCita.inicioventana} - ${scannedCita.finventana}`} />
              </div>
            </div>

            {/* State transition arrow */}
            <TransitionIndicator
              currentKey={scannedCita.estadoKey}
              targetKey={scanMode === 'entry' ? 1 : 6}
            />

            {/* Extra data for entry */}
            {scanMode === 'entry' && (
              <div style={{ ...cardStyle, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, margin: '0 0 12px' }}>Datos de Entrada</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <FieldInput
                    label="Número de Caja"
                    required
                    value={extraData.numeroCaja}
                    onChange={(v) => setExtraData({ ...extraData, numeroCaja: v })}
                    placeholder="CAJA-XXX"
                  />
                  <FieldInput
                    label="Conductor"
                    value={extraData.conductor}
                    onChange={(v) => setExtraData({ ...extraData, conductor: v })}
                    placeholder="Nombre del conductor"
                  />
                  <FieldInput
                    label="Placas"
                    value={extraData.placas}
                    onChange={(v) => setExtraData({ ...extraData, placas: v })}
                    placeholder="Placas del camión"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmTransition}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
                borderRadius: INPUT_RADIUS,
                border: 'none',
                backgroundColor: BRAND_RED,
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'background-color 0.15s ease',
              }}
            >
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />
              Confirmar {scanMode === 'entry' ? 'Check-In' : 'Check-Out'}
            </button>

            <button
              onClick={() => setScannedCita(null)}
              style={{
                width: '100%',
                minHeight: 44,
                borderRadius: INPUT_RADIUS,
                border: '1px solid #E0E0E0',
                backgroundColor: CARD_BG,
                fontSize: 13,
                fontWeight: 600,
                color: TEXT_SECONDARY,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Escanear otro QR
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  bold,
}: {
  icon: typeof faTruck;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <FontAwesomeIcon icon={icon} style={{ color: TEXT_SECONDARY, fontSize: 13, width: 16, flexShrink: 0 }} />
      <span style={{ color: TEXT_SECONDARY, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color: TEXT_PRIMARY, wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function TransitionIndicator({
  currentKey,
  targetKey,
}: {
  currentKey: EstadoKey;
  targetKey: EstadoKey;
}) {
  const reduceMotion = useReducedMotion();
  const currentCfg = ESTADOS[currentKey];
  const targetCfg = ESTADOS[targetKey];
  const currentUI = ESTADO_UI[currentKey];
  const targetUI = ESTADO_UI[targetKey];

  return (
    <div
      style={{
        ...cardStyle,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: 'rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesomeIcon icon={currentUI.icon} style={{ fontSize: 20, color: currentUI.color }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SECONDARY }}>{currentCfg.nombre}</span>
      </div>
      <motion.div animate={reduceMotion ? {} : { x: [0, 8, 0] }} transition={reduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 1.2 }}>
        <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 18, color: '#C0C0C0' }} />
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: 'rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesomeIcon icon={targetUI.icon} style={{ fontSize: 20, color: targetUI.color }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SECONDARY }}>{targetCfg.nombre}</span>
      </div>
    </div>
  );
}

function FieldInput({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: TEXT_SECONDARY,
          marginBottom: 4,
        }}
      >
        {label} {required && <span style={{ color: BRAND_RED }}>*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: 44,
          borderRadius: INPUT_RADIUS,
          border: '1px solid #E0E0E0',
          padding: '0 12px',
          fontSize: 14,
          fontWeight: 400,
          color: TEXT_PRIMARY,
          fontFamily: "'Inter', sans-serif",
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
