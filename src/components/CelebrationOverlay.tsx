import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAtom } from 'jotai';
import { celebrationAtom } from '@/lib/store';
import { zIndex } from '@/kit/tokens/layout';

interface StarParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const MESSAGES = [
  '¡Excelente trabajo, equipo!',
  '¡Cita completada en tiempo récord!',
  '¡Eficiencia de almacén!',
  '¡Bien hecho!',
];

export function CelebrationOverlay() {
  const [celebration, setCelebration] = useAtom(celebrationAtom);
  const [stars, setStars] = useState<StarParticle[]>([]);
  const reduceMotion = useReducedMotion();

  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    [celebration],
  );

  useEffect(() => {
    if (celebration) {
      setStars(
        Array.from({ length: 24 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 1.5 + Math.random() * 1.5,
          size: 16 + Math.random() * 24,
        })),
      );
    }
  }, [celebration]);

  const dismiss = () => setCelebration(null);

  if (!celebration) return null;

  if (reduceMotion) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: zIndex.modal, backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={dismiss}
      >
        <CelebrationCard
          message={message}
          celebration={celebration}
          dismiss={dismiss}
          reduceMotion
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: zIndex.modal, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={dismiss}
        >
          <div className="pointer-events-none absolute inset-0" style={{ overflow: 'hidden' }}>
            {stars.map((s) => (
              <motion.div
                key={s.id}
                initial={{ y: -60, opacity: 0, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 60,
                  opacity: [0, 1, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: s.duration,
                  delay: s.delay,
                  ease: 'easeIn',
                }}
                className="absolute"
                style={{ top: 0, left: `${s.x}%` }}
              >
                <FontAwesomeIcon
                  icon={faStar}
                  style={{ width: s.size, height: s.size, fontSize: s.size, color: '#D4A017' }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <CelebrationCard
              message={message}
              celebration={celebration}
              dismiss={dismiss}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CelebrationCard({
  message,
  celebration,
  dismiss,
  reduceMotion = false,
}: {
  message: string;
  celebration: { poNumber?: string; minutes?: number } | null;
  dismiss: () => void;
  reduceMotion?: boolean;
}) {
  const [closeHover, setCloseHover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const starRing = [0, 60, 120, 180, 240, 300].map((angle, i) => (
    <div
      key={i}
      className="absolute"
      style={{ transform: `rotate(${angle}deg) translateY(-36px)` }}
    >
      {reduceMotion ? (
        <FontAwesomeIcon icon={faStar} style={{ fontSize: 20, color: '#D4A017' }} />
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + i * 0.05, type: 'spring' }}
        >
          <FontAwesomeIcon icon={faStar} style={{ fontSize: 20, color: '#D4A017' }} />
        </motion.div>
      )}
    </div>
  ));

  const centralIcon = reduceMotion ? (
    <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 8, background: 'linear-gradient(to bottom right, #D4A017, #E3650B)', boxShadow: '0 4px 12px rgba(0,0,0,0.13)' }}>
      <FontAwesomeIcon icon={faStar} style={{ fontSize: 28, color: '#FFFFFF' }} />
    </div>
  ) : (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      transition={{ delay: 0.1, type: 'spring' }}
      className="flex items-center justify-center"
      style={{ width: 56, height: 56, borderRadius: 8, background: 'linear-gradient(to bottom right, #D4A017, #E3650B)', boxShadow: '0 4px 12px rgba(0,0,0,0.13)' }}
    >
      <FontAwesomeIcon icon={faStar} style={{ fontSize: 28, color: '#FFFFFF' }} />
    </motion.div>
  );

  const Wrap = reduceMotion ? 'div' : motion.div;
  const titleProps = reduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 } };
  const poProps = reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.4 } };
  const msgProps = reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 } };
  const btnAnimProps = reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.6 } };

  return (
    <div
      className="relative"
      style={{
        maxWidth: 448,
        margin: '0 16px',
        padding: 32,
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={dismiss}
        onMouseEnter={() => setCloseHover(true)}
        onMouseLeave={() => setCloseHover(false)}
        className="absolute"
        style={{
          top: 12,
          right: 12,
          padding: 6,
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          color: closeHover ? '#000000' : '#808285',
          backgroundColor: closeHover ? '#F5F5F5' : 'transparent',
          transition: 'background-color 120ms ease-out, color 120ms ease-out',
        }}
      >
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
      </button>

      <div className="relative flex items-center justify-center" style={{ margin: '0 auto 16px', width: 80, height: 80 }}>
        {starRing}
        {centralIcon}
      </div>

      <Wrap {...titleProps}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#000000', margin: 0 }}>
          {message}
        </h2>
      </Wrap>

      {celebration?.poNumber && (
        <Wrap {...poProps}>
          <p style={{ fontSize: 14, color: '#808285', margin: '8px 0 0' }}>
            PO: {celebration.poNumber} · {celebration.minutes} min en almacén
          </p>
        </Wrap>
      )}

      <Wrap {...msgProps}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#6ABF4B', margin: '12px 0 0' }}>
          Tiempo total dentro del límite de 2 horas
        </p>
      </Wrap>

      <Wrap {...btnAnimProps}>
        <button
          onClick={dismiss}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{
            marginTop: 20,
            padding: '8px 24px',
            fontSize: 14,
            fontWeight: 600,
            color: '#FFFFFF',
            backgroundColor: btnHover ? '#B80000' : '#DC0202',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background-color 120ms ease-out',
          }}
        >
          Continuar
        </button>
      </Wrap>
    </div>
  );
}
