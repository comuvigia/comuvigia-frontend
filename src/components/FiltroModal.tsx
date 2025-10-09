import { 
  IonButton, IonIcon, IonItem, IonLabel, IonModal, 
  IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, 
  IonSelect, IonSelectOption, IonInput 
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { filterOutline } from 'ionicons/icons';
import './RulesRiesgoModal.css';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export type FiltroType = {
    isUsed: Boolean;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    tipo: number[] | null;
    scoreMin: number | null;
    scoreMax: number | null;
    sector: number | null;
};

type Props = {
  filtro: FiltroType;
  setFiltro: React.Dispatch<React.SetStateAction<FiltroType>>;
};

export function EditFiltros({ filtro, setFiltro }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [sectores, setSectores] = useState<{ id: number; nombre_sector: string; descripcion: string }[]>([]);

    const updateFiltro = (field: keyof FiltroType, value: any) => {
        setFiltro(prev => ({ ...prev, [field]: value }));
    };

  //Valores por defecto del filtro (para resetear)
    const filtroInicial: FiltroType = {
        isUsed: false,
        fechaInicio: null,
        fechaFin: null,
        tipo: null,
        scoreMin: null,
        scoreMax: null,
        sector: null
    };

  //Cargar sectores desde la BD
    useEffect(() => {
        const fetchSectores = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/reglas/sectores`, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
            });
            setSectores(response.data);
            console.log('Sectores cargados:', response.data);
        } catch (err) {
            console.error('Error cargando sectores:', err);
        }
        };

        fetchSectores();
    }, []);

    const guardar = () => {
        updateFiltro('isUsed', true)
        console.log('Filtros aplicados:', filtro);
        setModalOpen(false);
    };

    const limpiarFiltros = () => {
        updateFiltro('isUsed', false)
        setFiltro(filtroInicial);
        console.log('Filtros limpiados');
        setModalOpen(false);
    };

    return (
        <>
            <IonButton className='icon-small' slot="end" fill="clear" color="dark" onClick={() => setModalOpen(true)}>
                <IonIcon icon={filterOutline} />
            </IonButton>

            <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)} className="small-modal">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Filtrar Notificaciones</IonTitle>
                    </IonToolbar>
                </IonHeader>
                
                <IonContent className="ion-padding">
                    <IonItem lines="none">
                        <IonLabel>Tipo de alerta</IonLabel>
                        <IonSelect className="input-borde" value={filtro.tipo} multiple={true} interface="popover" interfaceOptions={{ cssClass: 'custom-popover-rul' }} 
                            onIonChange={e => updateFiltro('tipo', e.detail.value)}>
                            <IonSelectOption value={3}>Asalto Hogar</IonSelectOption>
                            <IonSelectOption value={1}>Merodeo</IonSelectOption>
                            <IonSelectOption value={2}>Portonazo</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    <IonItem lines="none">
                        <IonLabel>Desde</IonLabel>
                        <IonInput  className="input-borde" type="date" value={filtro.fechaInicio ? filtro.fechaInicio.toISOString().split('T')[0] : ''}
                            onIonChange={e => { const value = e.detail.value; updateFiltro('fechaInicio', value ? new Date(value) : null);}}/>
                    </IonItem>

                    <IonItem lines="none">
                        <IonLabel>Hasta</IonLabel>
                        <IonInput className="input-borde" type="date" value={filtro.fechaFin ? filtro.fechaFin.toISOString().split('T')[0] : ''}
                            onIonChange={e => {const value = e.detail.value; updateFiltro('fechaFin', value ? new Date(value) : null);}}/>
                    </IonItem>

                    <IonItem lines="none">
                        <IonLabel>Score mínimo</IonLabel>
                        <IonInput className="input-borde" placeholder="Score mínimo" type="number" value={filtro.scoreMin} min={0} max={100} onIonChange={e => updateFiltro('scoreMin', Number(e.detail.value))}/>
                    </IonItem>

                    <IonItem lines="none">
                        <IonLabel>Score máximo</IonLabel>
                        <IonInput className="input-borde" placeholder="Score maximo" type="number" value={filtro.scoreMax} min={0} max={100} onIonChange={e => updateFiltro('scoreMax', Number(e.detail.value))}/>
                    </IonItem>

                    <IonItem lines="none">
                        <IonLabel>Sector</IonLabel>
                        <IonSelect className="input-borde" value={filtro.sector} placeholder="Seleccione un sector" onIonChange={e => updateFiltro('sector', e.detail.value)}>
                            {sectores.map(s => (<IonSelectOption key={s.id} value={s.id}> {s.nombre_sector}</IonSelectOption>))}
                        </IonSelect>
                    </IonItem>
                </IonContent>

                <IonFooter>
                    <IonToolbar>
                        <IonButton size="small" className="buton-rul-green" onClick={guardar}>Filtrar</IonButton>
                        <IonButton size="small" className="buton-rul-blue" onClick={limpiarFiltros}>Limpiar filtros</IonButton>
                    </IonToolbar>
                </IonFooter>
            </IonModal>
        </>
    );
}
