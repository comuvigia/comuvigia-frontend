import { 
    IonButton, IonIcon, IonItem, 
    IonLabel, IonModal, IonHeader, 
    IonToolbar, IonTitle, IonContent, 
    IonFooter, IonSelect, IonSelectOption, 
    IonRange, IonInput } from '@ionic/react';
import { useState, useEffect } from 'react';
import {settingsOutline } from 'ionicons/icons';
import './RulesRiesgoModal.css'
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export type RulesType = {
  id: number; 
  riesgo: string;
  tipoAlerta: string[];
  horaInicio: string;
  horaFin: string;
  score: number;
  sector: number;
};

type Props = {
  reglas: RulesType[];
  setReglas: React.Dispatch<React.SetStateAction<RulesType[]>>;
};


export function EditRules({ reglas, setReglas }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalaux, setModalaux] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [nuevaRegla, setNuevaRegla] = useState<RulesType>({
    id: 0,
    riesgo: '',
    tipoAlerta: [],
    horaInicio: '00:00',
    horaFin: '23:59',
    score: 0,
    sector: -1,
  });

  //CARGAR SECTORES DESDE LA BASE DE DATOS
  const [sectores, setSectores] = useState<{ id: number, nombre_sector: string, descripcion: string }[]>([]);
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
  
  //CARGAR REGLAS DESDE LA BASE DE DATOS
  const cargarReglas = async () => {
    try {
      
      const response = await axios.get<RulesType[]>(`${BACKEND_URL}/api/reglas/obtener`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReglas(response.data);
      
    } catch (err) {
      console.error('Error al cargar reglas:', err);
    }
  };

  useEffect(() => {
    if (reglas.length === 0) {
      cargarReglas();
    }
  }, []);

  if (!reglas || reglas.length === 0) {
    return;
  }


  const guardarReglaBackend = async (regla: RulesType) => {
    try {
      // Actualizar regla existente
      await axios.post(`${BACKEND_URL}/api/reglas/actualizar`, regla, {withCredentials: true});
    } catch (err) {
      console.error('Error guardando regla:', err);
    }
  };

  const guardarnuevaReglaBackend = async (regla: RulesType) => {
    try {
        // Insertar nueva regla
        const response = await axios.post(`${BACKEND_URL}/api/reglas/insertar`, regla, {withCredentials: true});
        // Actualizar id de la regla recién creada
        regla.id = response.data.id;
    } catch (err) {
      console.error('Error guardando regla:', err);
    }
  };

  const eliminarRegla = async () => {
    try {
      const reglaAux = reglas[activeIndex]

      if (!reglaAux?.id) {
        console.error('No hay una regla seleccionada para eliminar.');
        return;
      }

      const response = await axios.delete(`${BACKEND_URL}/api/reglas/eliminar`, {
        data: { id: reglaAux.id }, withCredentials: true});

      console.log('Regla eliminada:', response.data.mensaje);

      setReglas((prev) => prev.filter((r) => r.id !== reglaAux.id));

    } catch (err) {
      console.error('Error eliminando regla:', err);
    }
  };


  const guardarNuevaRegla = () => {
    try {
      guardarnuevaReglaBackend(nuevaRegla); // guarda y asigna ID
      setReglas(prev => [...prev, nuevaRegla]); // agrega al array de reglas
      setModalaux(false); // cierra modal
      setNuevaRegla({
        id: 0,
        riesgo: '',
        tipoAlerta: [],
        horaInicio: '00:00',
        horaFin: '23:59',
        score: 0,
        sector: -1,
      });
      console.log('Nueva regla creada');
    } catch (err) {
      console.error('Error al crear regla:', err);
    }
  };

  const updateRegla = (field: keyof RulesType, value: any) => {
    setReglas(prev =>
      prev.map((regla, index) =>
        index === activeIndex ? { ...regla, [field]: value } : regla
      )
    );
  };

  const guardarReglas = async () => {
    for (const regla of reglas) {
      await guardarReglaBackend(regla);
    }
    console.log('Reglas sincronizadas con backend');
    setModalaux(false)
  };

  const guardarcerrarReglas = async () => {
    await guardarReglas();
    setModalOpen(false);
    console.log('Reglas sincronizadas con backend cerrando modal');
    setModalaux(false)
  };


  return (
    <>
      <IonButton className='icon-small' slot="end" fill="clear" color="dark" onClick={() => setModalOpen(true)}>
          <IonIcon icon={settingsOutline} />
      </IonButton>
      <IonModal isOpen={modalOpen} onDidPresent={() => { const firstInput = document.querySelector('.small-modal input, .small-modal select, .small-modal button') as HTMLElement; 
        firstInput?.focus();}} onDidDismiss={() => setModalOpen(false)} className="small-modal">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Configurar reglas de riesgo</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem>
          <IonButton slot="end" fill="clear" color={modalaux ? 'medium' : 'primary'} onClick={() => setModalaux(prev => !prev)}>
            {modalaux ? "Cancelar" : "Crear Regla"}
          </IonButton>
        </IonItem>
        {!modalaux && (
          <>
            <IonContent className="ion-padding">
              <IonItem lines="none">
                <IonLabel>Selecciona regla</IonLabel>
                <IonSelect value={activeIndex} interface="popover" interfaceOptions={{cssClass: 'custom-popover-rul'}} onIonChange={e => setActiveIndex(e.detail.value)}>
                {reglas.map((r, i) => ( 
                  <IonSelectOption className="rul-opt" key={i} value={i}> {`${r.id} - ${r.riesgo?.toUpperCase()}`}</IonSelectOption>
                ))}
                </IonSelect>
              </IonItem>
              <IonItem lines="none">
                  <IonLabel>Tipo de alerta</IonLabel>
                  <IonSelect value={reglas[activeIndex].tipoAlerta} interface="popover" interfaceOptions={{cssClass: 'custom-popover-rul'}} multiple={true} 
                  placeholder={String(reglas[activeIndex].tipoAlerta)} onIonChange={e => updateRegla("tipoAlerta", e.detail.value)}>
                    <IonSelectOption className="rul-opt" value="3">Asalto Hogar</IonSelectOption>
                    <IonSelectOption className="rul-opt" value="1">Merodeo</IonSelectOption>
                    <IonSelectOption className="rul-opt" value="2">Portonazo</IonSelectOption>
                  </IonSelect>
              </IonItem >
              <IonItem lines="none">
                  <IonLabel>Hora Inicio</IonLabel>
                    <IonInput type="time" value={reglas[activeIndex].horaInicio} placeholder={String(reglas[activeIndex].horaInicio)} onIonChange={e => updateRegla("horaInicio", e.detail.value!)}/>
              </IonItem>
              <IonItem lines="none">
                  <IonLabel>Hora Final</IonLabel>
                  <IonInput type="time" value={reglas[activeIndex].horaFin} placeholder={String(reglas[activeIndex].horaInicio)}  onIonChange={e => updateRegla("horaFin", e.detail.value!)}/>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>Score mínimo</IonLabel>
                <IonInput type="number" value={reglas[activeIndex].score} placeholder={String(reglas[activeIndex].score)} onIonChange={e => updateRegla("score",e.detail.value!)} min={0} max={100}/>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>Sector</IonLabel>
                <IonSelect value={reglas[activeIndex].sector} placeholder="Seleccione un sector" 
                onIonChange={e => updateRegla("sector", e.detail.value)}>
                  {sectores.map((s) => (
                    <IonSelectOption key={s.id} value={s.id}>{s.nombre_sector}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonContent>
            <IonFooter>
              <IonToolbar>
                  <IonButton size="small" className="buton-rul-green" onClick={guardarReglas}>Guardar</IonButton>
                  <IonButton size="small" className="buton-rul-blue" onClick={guardarcerrarReglas}>Cerrar y Guardar</IonButton>
                  <IonButton size="small" className="buton-rul-red" onClick={eliminarRegla}>Eliminar</IonButton>
                  <IonButton size="small" className="buton-rul-gray" onClick={() => setModalOpen(false)}>Cerrar</IonButton>
              </IonToolbar>
            </IonFooter>

          </>
        )}

        {modalaux && (
          <>
            <IonContent className="ion-padding">
              <IonItem lines="none">
                <IonLabel>Riesgo</IonLabel>
                <IonSelect value={nuevaRegla.riesgo} interface="popover" onIonChange={e => setNuevaRegla({ ...nuevaRegla, riesgo: e.detail.value! })}>
                  <IonSelectOption value="bajo">Bajo</IonSelectOption>
                  <IonSelectOption value="medio">Medio</IonSelectOption>
                  <IonSelectOption value="alto">Alto</IonSelectOption>
                  <IonSelectOption value="critico">Crítico</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="none">
                <IonLabel>Tipo de alerta</IonLabel>
                <IonSelect value={nuevaRegla.tipoAlerta} interface="popover" multiple={true} onIonChange={e => setNuevaRegla({ ...nuevaRegla, tipoAlerta: e.detail.value })}>
                  <IonSelectOption value="3">Asalto Hogar</IonSelectOption>
                  <IonSelectOption value="1">Merodeo</IonSelectOption>
                  <IonSelectOption value="2">Portonazo</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="none">
                <IonLabel>Hora Inicio</IonLabel>
                <IonInput type="time" value={nuevaRegla.horaInicio} onIonChange={e => setNuevaRegla({ ...nuevaRegla, horaInicio: e.detail.value! })}/>
              </IonItem>

              <IonItem lines="none">
                <IonLabel>Hora Final</IonLabel>
                <IonInput type="time" value={nuevaRegla.horaFin} onIonChange={e => setNuevaRegla({ ...nuevaRegla, horaFin: e.detail.value! })}/>
              </IonItem>

              <IonItem lines="none">
                <IonLabel>Score mínimo</IonLabel>
                <IonInput type="number" value={nuevaRegla.score} onIonChange={e => setNuevaRegla({ ...nuevaRegla, score: Number(e.detail.value!) })} min={0} max={100}/>
              </IonItem>

              <IonItem lines="none">
                <IonLabel>Sector</IonLabel>
                <IonSelect value={reglas[activeIndex].sector} placeholder="Seleccione un sector" 
                onIonChange={e => updateRegla("sector", e.detail.value)}>
                  {sectores.map((s) => (
                    <IonSelectOption key={s.id} value={s.id}>{s.nombre_sector}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

            </IonContent>

            <IonFooter>
              <IonToolbar>
                <IonButton expand="full" className="buton-rul-green" onClick={guardarNuevaRegla}>Guardar Nueva Regla</IonButton>
              </IonToolbar>
            </IonFooter>
          </>
        )}
      </IonModal>
    </>
  );
}

