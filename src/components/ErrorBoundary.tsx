import { Component, type ReactNode } from 'react';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@/kit/componentes/EmptyState/EmptyState';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#EEEEEE', padding: 24 }}>
          <div style={{ maxWidth: 400, width: '100%' }}>
            <EmptyState
              icon={faTriangleExclamation}
              title="Algo salio mal"
              description="La interfaz encontro un error inesperado. Puede recargar la pagina o intentar de nuevo."
              action={{ label: 'Recargar', onClick: () => window.location.reload() }}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
