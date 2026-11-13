import { Navigate } from 'react-router-dom';
import { useLoginController } from '@/controllers/useLoginController';
import { LabLayout } from '@/views/components/LabLayout';
import { LoginForm } from '@/views/components/LoginForm';
import { Notice } from '@/views/components/Notice';
import styles from './LoginPage.module.css';

/** Inicio de sesión de las pantallas de administración; al entrar regresa a la que lo pidió. */
export function LoginPage() {
  const { yaIniciada, desde, entrando, aviso, cerrarAviso, iniciarSesion } = useLoginController();

  if (yaIniciada) return <Navigate to={desde} replace />;

  return (
    <LabLayout
      title="Acceso"
      eyebrow="Vestigia · Administración"
      notice={aviso && <Notice tone={aviso.tono} text={aviso.texto} onClose={cerrarAviso} />}
    >
      <div className={styles.panel}>
        <LoginForm onSubmit={iniciarSesion} entrando={entrando} />
      </div>
    </LabLayout>
  );
}
