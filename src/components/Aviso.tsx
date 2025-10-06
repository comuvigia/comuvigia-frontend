import React from 'react';
import { 
  IonCard, 
  IonIcon, 
  IonButton, 
  IonText, 
  IonGrid, 
  IonRow, 
  IonCol 
} from '@ionic/react';
import { 
  close, 
  checkmarkCircle, 
  warning, 
  alertCircle, 
  informationCircle,
  videocam,
  eye,
  checkmark
} from 'ionicons/icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type AlertStyle = 'simple' | 'detailed' | 'actionable' | 'toast';

export interface AvisoProps {
  isOpen: boolean;
  type: AlertType;
  title?: string;
  message: string;
  style?: AlertStyle;
  duration?: number;
  onClose: () => void;
  actions?: {
    text: string;
    handler: () => void;
    icon?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  }[];
  showCloseButton?: boolean;
  autoClose?: boolean;
}

const Aviso: React.FC<AvisoProps> = ({
  isOpen,
  type,
  title,
  message,
  style = 'simple',
  duration = 5000,
  onClose,
  actions = [],
  showCloseButton = true,
  autoClose = true
}) => {
  if (!isOpen) return null;

  // Auto cerrar si está habilitado
  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  // Iconos por tipo
  const getIcon = () => {
    switch (type) {
      case 'success': return checkmarkCircle;
      case 'error': return alertCircle;
      case 'warning': return warning;
      case 'info': return informationCircle;
      default: return informationCircle;
    }
  };

  // Colores por tipo
  const getColor = () => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'primary';
      default: return 'medium';
    }
  };

  // Estilos base según el tipo de alerta
  const getBaseStyles = () => {
    const base = {
      margin: '10px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      borderLeft: `4px solid var(--ion-color-${getColor()})`
    };

    switch (style) {
      case 'toast':
        return {
          ...base,
          position: 'fixed' as const,
          top: '20px',
          right: '20px',
          zIndex: 10000,
          minWidth: '300px',
          maxWidth: '90vw'
        };
      case 'detailed':
        return {
          ...base,
          padding: '16px',
          background: `rgba(var(--ion-color-${getColor()}-rgb), 0.05)`
        };
      case 'actionable':
        return {
          ...base,
          padding: '16px',
          background: `rgba(var(--ion-color-${getColor()}-rgb), 0.08)`
        };
      default: // simple
        return {
          ...base,
          padding: '12px 16px'
        };
    }
  };

  // Renderizado según el estilo
  const renderSimple = () => (
    <IonCard style={getBaseStyles()}>
      <IonGrid>
        <IonRow className="ion-align-items-center">
          <IonCol size="auto">
            <IonIcon 
              icon={getIcon()} 
              color={getColor()}
              size="small"
            />
          </IonCol>
          <IonCol>
            <IonText color={getColor()}>
              <p style={{ margin: 0, fontWeight: '500' }}>{message}</p>
            </IonText>
          </IonCol>
          {showCloseButton && (
            <IonCol size="auto">
              <IonButton 
                fill="clear" 
                size="small" 
                onClick={onClose}
                style={{ '--padding-start': '0', '--padding-end': '0' }}
              >
                <IonIcon icon={close} />
              </IonButton>
            </IonCol>
          )}
        </IonRow>
      </IonGrid>
    </IonCard>
  );

  const renderDetailed = () => (
    <IonCard style={getBaseStyles()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <IonIcon 
          icon={getIcon()} 
          color={getColor()}
          size="large"
        />
        <div style={{ flex: 1 }}>
          {title && (
            <IonText color={getColor()}>
              <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{title}</h4>
            </IonText>
          )}
          <IonText>
            <p style={{ margin: 0, lineHeight: '1.4' }}>{message}</p>
          </IonText>
        </div>
        {showCloseButton && (
          <IonButton 
            fill="clear" 
            size="small" 
            onClick={onClose}
            style={{ marginTop: '-8px', marginRight: '-8px' }}
          >
            <IonIcon icon={close} />
          </IonButton>
        )}
      </div>
    </IonCard>
  );

  const renderActionable = () => (
    <IonCard style={getBaseStyles()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <IonIcon 
          icon={getIcon()} 
          color={getColor()}
          size="large"
        />
        <div style={{ flex: 1 }}>
          {title && (
            <IonText color={getColor()}>
              <h4 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{title}</h4>
            </IonText>
          )}
          <IonText>
            <p style={{ margin: 0, lineHeight: '1.4' }}>{message}</p>
          </IonText>
        </div>
        {showCloseButton && (
          <IonButton 
            fill="clear" 
            size="small" 
            onClick={onClose}
            style={{ marginTop: '-8px', marginRight: '-8px' }}
          >
            <IonIcon icon={close} />
          </IonButton>
        )}
      </div>
      
      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {actions.map((action, index) => (
            <IonButton
              key={index}
              size="small"
              color={action.color || 'primary'}
              fill={index === 0 ? 'solid' : 'outline'}
              onClick={() => {
                action.handler();
                if (index !== 0) onClose(); // Cerrar después de acciones secundarias
              }}
            >
              {action.icon && <IonIcon icon={action.icon} slot="start" />}
              {action.text}
            </IonButton>
          ))}
        </div>
      )}
    </IonCard>
  );

  const renderToast = () => (
    <div 
      style={getBaseStyles()}
      className="alert-toast"
    >
      <IonCard style={{ margin: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <IonGrid>
          <IonRow className="ion-align-items-center">
            <IonCol size="auto">
              <IonIcon 
                icon={getIcon()} 
                color={getColor()}
                size="small"
              />
            </IonCol>
            <IonCol>
              <IonText>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{message}</p>
              </IonText>
            </IonCol>
            {(showCloseButton || actions.length > 0) && (
              <IonCol size="auto">
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {actions.slice(0, 1).map((action, index) => (
                    <IonButton
                      key={index}
                      size="small"
                      color={action.color || 'primary'}
                      onClick={action.handler}
                    >
                      {action.icon && <IonIcon icon={action.icon} />}
                    </IonButton>
                  ))}
                  {showCloseButton && (
                    <IonButton 
                      fill="clear" 
                      size="small" 
                      onClick={onClose}
                    >
                      <IonIcon icon={close} />
                    </IonButton>
                  )}
                </div>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      </IonCard>
    </div>
  );

  // Seleccionar el renderizado basado en el estilo
  switch (style) {
    case 'detailed':
      return renderDetailed();
    case 'actionable':
      return renderActionable();
    case 'toast':
      return renderToast();
    default:
      return renderSimple();
  }
};

export default Aviso;