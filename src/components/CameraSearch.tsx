import React, { useState } from 'react';
import {
  IonSearchbar,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { Camera } from '../types/Camera';
import './CameraSearch.css';

interface CameraSearchProps {
  cameras: Camera[];
  searchText: string;
  onSearchChange: (text: string, results: Camera[]) => void;
}

const CameraSearch: React.FC<CameraSearchProps> = ({ cameras, searchText, onSearchChange }) => {
  const [searchField, setSearchField] = useState<'id' | 'nombre' | 'direccion'>('nombre');

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD") // Separa (ej: "á" -> "a" + "´")
      .replace(/[\u0300-\u036f]/g, ""); // Elimina los diacríticos
  };

  const handleSearch = (text: string) => {
    if (!text.trim()) {
      onSearchChange(text, []); // Devuelve el texto y un array vacío
      return;
    }

    const searchValue = normalizeText(text);
    const filteredCameras = cameras.filter((camera) => {
      switch (searchField) {
        case 'id':
          return camera.id.toString().includes(searchValue);
        case 'nombre':
          return normalizeText(camera.nombre).includes(searchValue);
        case 'direccion':
          return normalizeText(camera.direccion).includes(searchValue);
        default:
          return false;
      }
    });

    onSearchChange(text, filteredCameras);
  };

  return (
    <div className="camera-search-container">
      <IonSearchbar
        value={searchText}
        onIonInput={(e) => handleSearch(e.detail.value || '')}
        placeholder={`Buscar cámara...`}
        animated={true}
        showClearButton="always"
        className="camera-searchbar"
      />
      <IonSelect
        value={searchField}
        onIonChange={(e) => setSearchField(e.detail.value)}
        interface="popover"
        className="search-type-select"
      >
        <IonSelectOption value="id">ID</IonSelectOption>
        <IonSelectOption value="nombre">Nombre</IonSelectOption>
        <IonSelectOption value="direccion">Dirección</IonSelectOption>
      </IonSelect>
    </div>
  );
};

export default CameraSearch;
