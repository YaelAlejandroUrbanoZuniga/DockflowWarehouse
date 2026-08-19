import { useState, type FormEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { Boton } from '@/kit/componentes/Boton/Boton';

interface Props {
  categoria: string;
  tituloSistema: string;
  descripcion: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  children?: ReactNode;
}

export function Login({ categoria, tituloSistema, descripcion, onSubmit, children }: Props) {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Left panel — 45% */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: '45%',
          flexShrink: 0,
          background: 'linear-gradient(160deg, #AA0202 0%, #DC0202 100%)',
          padding: 48,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -60,
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.03)',
          }}
        />

        {/* Top — category */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {categoria}
          </span>
        </div>

        {/* Center — title + description */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 55,
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {tituloSistema}
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.25 }}
            style={{
              marginTop: 20,
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.80)',
              maxWidth: 420,
            }}
          >
            {descripcion}
          </motion.p>
        </div>

        {/* Bottom — security note */}
        <div className="flex items-center" style={{ gap: 8, position: 'relative', zIndex: 1 }}>
          <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>
            Acceso restringido a personal autorizado
          </span>
        </div>
      </div>

      {/* Right panel — 55% */}
      <div
        className="flex flex-1 items-center justify-center"
        style={{ backgroundColor: '#EEEEEE', padding: 32 }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.4 }}
          style={{
            width: 550,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
            padding: '48px 40px',
            boxSizing: 'border-box',
          }}
        >
          {/* Welcome heading */}
          <div style={{ textAlign: 'center' }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: '#DC0202',
                margin: '0 auto 16px',
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>DF</span>
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: '#000000', margin: '0 0 4px' }}>
              Iniciar Sesión
            </h2>
            <p style={{ fontSize: 15, fontWeight: 400, color: '#484848', margin: '0 0 36px' }}>
              {tituloSistema} — {categoria}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 16, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>
                Correo electrónico
              </label>
              <CampoTexto
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@nexteer.com"
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 16, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>
                Contraseña
              </label>
              <CampoTexto
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Boton
              type="submit"
              cargando={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Boton>
          </form>

          {/* Extra content (quick-access buttons) */}
          {children && <div style={{ marginTop: 28 }}>{children}</div>}
        </motion.div>
      </div>
    </div>
  );
}
