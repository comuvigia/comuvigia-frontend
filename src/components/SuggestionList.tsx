// src/components/SuggestionList.tsx

import React from 'react';
import { IonList, IonItem, IonLabel, IonNote } from '@ionic/react';
import { Camera } from '../types/Camera';
import './SuggestionList.css';

interface SuggestionListProps {
  suggestions: Camera[];
  onSelect: (camera: Camera) => void;
  style?: React.CSSProperties;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onSelect, style }) => {
    console.log('6. LIST: Renderizando con', suggestions.length, 'sugerencias');
  // No mostrar nada si no hay texto de búsqueda
  if (suggestions.length === 0) {
    return null; 
  }

  return (
    <IonList className="suggestion-list-container" style={style}>
      {suggestions.map((camera) => (
        <IonItem 
          key={camera.id} 
          button 
          onClick={() => onSelect(camera)}
        >
          <IonLabel>
            <h2>{camera.nombre}</h2>
            <IonNote>{camera.direccion}</IonNote>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};

export default SuggestionList;