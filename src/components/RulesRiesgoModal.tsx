import { 
    IonButton, IonIcon, IonItem, 
    IonLabel, IonModal, IonHeader, 
    IonToolbar, IonTitle, IonContent, 
    IonFooter, IonSelect, IonSelectOption, 
    IonRange, IonInput } from '@ionic/react';
import { useState } from 'react';
import {settingsOutline } from 'ionicons/icons';
import './RulesRiesgoModal.css'

export type RulesType = {
  riesgo: string;
  tipoAlerta: string[];
  horaInicio: string;
  horaFin: string;
  score: number;
  sector: string;
};

type Props = {
  reglas: RulesType[];
  setReglas: React.Dispatch<React.SetStateAction<RulesType[]>>;
};


export function EditRules({ reglas, setReglas }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  
  if (!reglas || reglas.length === 0) {
    return null;
  }

  const updateRegla = (field: keyof RulesType, value: any) => {
    setReglas(prev =>
      prev.map((regla, index) =>
        index === activeIndex ? { ...regla, [field]: value } : regla
      )
    );
  };

  const guardarReglas = () => {
    console.log(reglas);
    localStorage.setItem("reglas", JSON.stringify(reglas));
  };
  
  const guardarcerrarReglas = () => {
    console.log(reglas);
    localStorage.setItem("reglas", JSON.stringify(reglas));
    setModalOpen(false);
  };

  return (
    <>
      <IonButton slot="end" fill="clear" color="dark" onClick={() => setModalOpen(true)}>
          <IonIcon icon={settingsOutline} />
      </IonButton>
      <IonModal isOpen={modalOpen} onDidPresent={() => { const firstInput = document.querySelector('.small-modal input, .small-modal select, .small-modal button') as HTMLElement; 
      firstInput?.focus();}} onDidDismiss={() => setModalOpen(false)} className="small-modal">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Configurar reglas de riesgo</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem lines="none">
            <IonLabel>Selecciona regla</IonLabel>
            <IonSelect value={activeIndex} interface="popover" interfaceOptions={{cssClass: 'custom-popover-rul'}} onIonChange={e => setActiveIndex(e.detail.value)}>
            {reglas.map((r, i) => ( 
              <IonSelectOption className="rul-opt" key={i} value={i}>{r.riesgo?.toUpperCase()}</IonSelectOption>
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
            <IonInput value={reglas[activeIndex].sector} placeholder={"Ingrese Sector"} onIonChange={e => updateRegla("sector", e.detail.value!)} />
          </IonItem>
        </IonContent>
        <IonFooter>
          <IonToolbar>
            <IonButton expand="full" className="buton-rul-green" onClick={guardarReglas}>Guardar</IonButton>
            <IonButton expand="full" className="buton-rul-blue" onClick={guardarcerrarReglas}>Cerrar y Guardar</IonButton>
            <IonButton expand="full" className="buton-rul-red" onClick={() => setModalOpen(false)}>Cerrar</IonButton>
          </IonToolbar>
        </IonFooter>
      </IonModal>

    </>
  );
}

