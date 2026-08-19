import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark, faClock } from '@fortawesome/free-solid-svg-icons';
import { useAtom } from 'jotai';
import { delayAlertAtom } from '@/lib/store';
import { zIndex } from '@/kit/tokens/layout';
import { EXIT_MS } from '@/kit/tokens/motion';

interface DelayAlertData {
  poNumber: string;
  minutes: number;
  dockName?: string;
}

function LogisticsWorker({ size = 120, reduceMotion = false }: { size?: number; reduceMotion?: boolean }) {
  const bobTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 2, repeat: Infinity, ease: 'easeInOut' as const };
  const swayTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const };
  const armTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: reduceMotion ? 0 : [0, -3, 0] }}
        transition={bobTransition}
      >
        <path
          d="M40 38 C40 22 52 16 60 16 C68 16 80 22 80 38 L80 42 L40 42 Z"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        <ellipse cx="60" cy="42" rx="24" ry="4" fill="#D97706" />
        <rect x="40" y="34" width="40" height="4" fill="#DC0202" rx="1" />
        <circle cx="60" cy="28" r="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
      </motion.g>

      <circle cx="60" cy="50" r="9" fill="#FBCFA0" stroke="#E8B884" strokeWidth="1" />

      <motion.g
        initial={{ rotate: 0 }}
        animate={{ rotate: reduceMotion ? 0 : [-1, 1, -1] }}
        transition={swayTransition}
        style={{ transformOrigin: '60px 70px' }}
      >
        <path
          d="M44 62 L40 100 L48 108 L72 108 L80 100 L76 62 L66 58 L54 58 Z"
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth="1.5"
        />
        <rect x="40" y="72" width="40" height="4" fill="#FFFFFF" opacity={0.9} />
        <rect x="40" y="82" width="40" height="4" fill="#FFFFFF" opacity={0.9} />
        <path d="M54 58 L60 64 L66 58" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
      </motion.g>

      <motion.g
        initial={{ rotate: 0 }}
        animate={{ rotate: reduceMotion ? 0 : [0, -8, 0] }}
        transition={armTransition}
        style={{ transformOrigin: '44px 68px' }}
      >
        <rect x="36" y="64" width="8" height="28" rx="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="40" cy="94" r="4" fill="#FBCFA0" stroke="#E8B884" strokeWidth="0.8" />
      </motion.g>
      <motion.g
        initial={{ rotate: 0 }}
        animate={{ rotate: reduceMotion ? 0 : [0, 8, 0] }}
        transition={armTransition}
        style={{ transformOrigin: '76px 68px' }}
      >
        <rect x="76" y="64" width="8" height="28" rx="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="80" cy="94" r="4" fill="#FBCFA0" stroke="#E8B884" strokeWidth="0.8" />
      </motion.g>

      <motion.g
        initial={{ y: 0 }}
        animate={{ y: reduceMotion ? 0 : [0, -2, 0] }}
        transition={swayTransition}
      >
        <rect x="74" y="88" width="14" height="18" rx="1" fill="#FFFFFF" stroke="#6B7280" strokeWidth="1.2" />
        <rect x="78" y="85" width="6" height="4" rx="1" fill="#6B7280" />
        <line x1="77" y1="93" x2="85" y2="93" stroke="#9CA3AF" strokeWidth="0.8" />
        <line x1="77" y1="96" x2="85" y2="96" stroke="#9CA3AF" strokeWidth="0.8" />
        <line x1="77" y1="99" x2="82" y2="99" stroke="#9CA3AF" strokeWidth="0.8" />
      </motion.g>

      <rect x="50" y="106" width="8" height="12" rx="2" fill="#1F2937" />
      <rect x="62" y="106" width="8" height="12" rx="2" fill="#1F2937" />
      <ellipse cx="54" cy="118" rx="6" ry="3" fill="#374151" />
      <ellipse cx="66" cy="118" rx="6" ry="3" fill="#374151" />
    </svg>
  );
}

export function DelayAlertOverlay() {
  const [alert, setAlert] = useAtom(delayAlertAtom);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  const alertData: DelayAlertData | null = useMemo(
    () => (alert as DelayAlertData | null),
    [alert],
  );

  useEffect(() => {
    if (alertData) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setAlert(null), reduceMotion ? 0 : EXIT_MS);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [alertData, setAlert, reduceMotion]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setAlert(null), reduceMotion ? 0 : EXIT_MS);
  };

  if (!alertData || !visible) return null;

  if (reduceMotion) {
    return (
      <div
        className="fixed flex items-end"
        style={{ bottom: 24, right: 24, zIndex: zIndex.panel, gap: 12 }}
      >
        <div className="relative">
          <LogisticsWorker size={120} reduceMotion />
        </div>
        <AlertCard alertData={alertData} dismiss={dismiss} reduceMotion />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {alertData && visible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed flex items-end"
          style={{ bottom: 24, right: 24, zIndex: zIndex.panel, gap: 12 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="relative"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute"
              style={{ bottom: 4, left: '50%', transform: 'translateX(-50%)', height: 8, width: 80, backgroundColor: 'rgba(0,0,0,0.20)', filter: 'blur(4px)', borderRadius: 4 }}
            />
            <LogisticsWorker size={120} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.15 }}
          >
            <AlertCard alertData={alertData} dismiss={dismiss} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AlertCard({
  alertData,
  dismiss,
  reduceMotion = false,
}: {
  alertData: DelayAlertData;
  dismiss: () => void;
  reduceMotion?: boolean;
}) {
  const [closeHover, setCloseHover] = useState(false);

  return (
    <div
      className="relative"
      style={{
        width: 288,
        marginBottom: 8,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid rgba(220,2,2,0.2)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
      }}
    >
      <button
        onClick={dismiss}
        onMouseEnter={() => setCloseHover(true)}
        onMouseLeave={() => setCloseHover(false)}
        className="absolute"
        style={{
          top: 8,
          right: 8,
          padding: 4,
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          color: closeHover ? '#000000' : '#808285',
          backgroundColor: closeHover ? '#F5F5F5' : 'transparent',
          transition: 'background-color 120ms ease-out, color 120ms ease-out',
        }}
      >
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
      </button>

      <div className="flex items-center" style={{ gap: 8 }}>
        <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(220,2,2,0.08)' }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16, color: '#DC0202' }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>Cita en espera prolongada</span>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#000000' }}>
          <span style={{ fontWeight: 600 }}>PO:</span> {alertData.poNumber}
        </p>
        {alertData.dockName && (
          <p style={{ margin: 0, fontSize: 14, color: '#808285' }}>
            <span style={{ fontWeight: 600 }}>Dock:</span> {alertData.dockName}
          </p>
        )}
        <div className="flex items-center" style={{ gap: 6, color: '#DC0202' }}>
          <FontAwesomeIcon icon={faClock} style={{ fontSize: 14 }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{alertData.minutes} min en Esp. Autorización</span>
        </div>
      </div>

      {reduceMotion ? (
        <div
          className="absolute"
          style={{ bottom: 0, left: 0, right: 0, height: 4, borderRadius: '0 0 12px 12px', backgroundColor: '#DC0202' }}
        />
      ) : (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 8, ease: 'linear' }}
          className="absolute"
          style={{ bottom: 0, left: 0, height: 4, borderRadius: '0 0 12px 12px', backgroundColor: '#DC0202' }}
        />
      )}

      <p style={{ margin: '8px 0 0', fontSize: 12, color: '#808285' }}>
        Revisa y autoriza esta cita para evitar demoras
      </p>
    </div>
  );
}
