import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useAtomValue } from 'jotai';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { citasAtom, currentUserAtom, activeAlmacenIdAtom } from '@/lib/store';
import { useCitaActions } from '@/hooks/use-cita-actions';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { verifyToken } from '@/lib/qr';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { Boton } from '@/kit/componentes/Boton/Boton';
import jsQR from 'jsqr';

export function QrScannerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const citas = useAtomValue(citasAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const activeAlmacenId = useAtomValue(activeAlmacenIdAtom);
  const { updateCitaEstado } = useCitaActions();
  const toast = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const stopScanner = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleScanResult = useCallback(
    (rawData: string) => {
      if (lastScannedRef.current === rawData) return;
      lastScannedRef.current = rawData;

      try {
        const url = new URL(rawData);
        const parts = url.pathname.split('/');
        const citaId = parts[parts.length - 1];
        const cita = citas.find(c => c.id === citaId);
        if (!cita) {
          toast.systemError('Cita no encontrada en el QR');
          return;
        }
        if (currentUser.almacenId && cita.almacenId !== (activeAlmacenId ?? currentUser.almacenId)) {
          toast.systemError('Esta cita pertenece a otro almacén');
          return;
        }
        const token = url.searchParams.get('token');
        const doCheckIn = () => {
          stopScanner();
          updateCitaEstado(cita.id, 1, currentUser.nombrecompleto);
          onOpenChange(false);
        };
        if (token) {
          verifyToken(token).then(valid => {
            if (valid) doCheckIn();
          });
        } else {
          doCheckIn();
        }
      } catch {
        toast.systemError('QR inválido');
      }
    },
    [citas, currentUser, activeAlmacenId, onOpenChange, stopScanner, updateCitaEstado, toast],
  );

  const handleScanResultRef = useRef(handleScanResult);
  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  }, [handleScanResult]);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      if (result) {
        handleScanResultRef.current(result.data);
      }
    } catch (err) {
      console.debug('QR detection frame failed:', err);
    }
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError(false);
    lastScannedRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);

        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = window.setInterval(() => {
          scanFrame();
        }, 200);
      }
    } catch {
      setCameraError(true);
      setScanning(false);
    }
  }, [scanFrame]);

  const startScannerRef = useRef(startScanner);
  const stopScannerRef = useRef(stopScanner);
  useEffect(() => {
    startScannerRef.current = startScanner;
  }, [startScanner]);
  useEffect(() => {
    stopScannerRef.current = stopScanner;
  }, [stopScanner]);

  useEffect(() => {
    if (open) {
      void startScannerRef.current();
    } else {
      stopScannerRef.current();
    }
    return () => stopScannerRef.current();
  }, [open]);

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={480}>
        <DialogTitle style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Escanear QR de Cita
        </DialogTitle>
        <ModalHeader
          title="Escanear QR de Cita"
          subtitle="Coloca el código QR frente a la cámara"
          accentColor="#DC0202"
          onClose={handleClose}
        />

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Camera view */}
          <div style={{ position: 'relative', aspectRatio: '1', width: '100%', overflow: 'hidden', borderRadius: 12, backgroundColor: '#1A1A1A' }}>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Scan frame overlay */}
            {scanning && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: 192, height: 192, borderRadius: 12, border: '2px solid rgba(255,255,255,0.8)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 24, height: 24, borderLeft: '4px solid #DC0202', borderTop: '4px solid #DC0202', borderTopLeftRadius: 8 }} />
                  <div style={{ position: 'absolute', right: 0, top: 0, width: 24, height: 24, borderRight: '4px solid #DC0202', borderTop: '4px solid #DC0202', borderTopRightRadius: 8 }} />
                  <div style={{ position: 'absolute', left: 0, bottom: 0, width: 24, height: 24, borderLeft: '4px solid #DC0202', borderBottom: '4px solid #DC0202', borderBottomLeftRadius: 8 }} />
                  <div style={{ position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRight: '4px solid #DC0202', borderBottom: '4px solid #DC0202', borderBottomRightRadius: 8 }} />
                </div>
              </div>
            )}

            {/* Idle state */}
            {!scanning && !cameraError && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'rgba(255,255,255,0.6)' }}>
                <FontAwesomeIcon icon={faQrcode} style={{ fontSize: 48 }} />
                <Boton onClick={() => void startScanner()}>
                  Iniciar Cámara
                </Boton>
              </div>
            )}

            {/* Camera error */}
            {cameraError && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
                <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: 40, color: '#D4A017' }} />
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  No se pudo acceder a la cámara. Verifica los permisos e intenta de nuevo.
                </p>
                <Boton variante="secundario" onClick={() => void startScanner()}>
                  Reintentar
                </Boton>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#808285', margin: 0 }}>
            Apunta al código QR de la cita
          </p>

          <Boton variante="secundario" onClick={handleClose} style={{ width: '100%', justifyContent: 'center' }}>
            Cerrar
          </Boton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
