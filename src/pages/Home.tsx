import React, { useState } from 'react';
import MapView from '../components/MapView';
import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';

function Home() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unseenAlerts, setUnseenAlerts] = useState(2); // Demo

  // Camaras iniciales de ejemplo
  const cameras = [
    { id: 1, posicion: [-33.52, -70.603], estadoCamara: true, nombre: 'Cámara Plaza', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
    { id: 2, posicion: [-33.525, -70.6], estadoCamara: false, nombre: 'Cámara Sur', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
    { id: 3, posicion: [-33.511, -70.59], estadoCamara: true, nombre: 'Cámara Centro', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
  ];

  const handleShowModal = (camera: any) => {
    setSelectedCamera(camera);
    setModalOpen(true);
  };

  return (
    <div>
      <Navbar unseenCount={unseenAlerts} onShowNotifications={() => alert('Aquí abriría el panel de notificaciones')} />
      <MapView cameras={ cameras } onShowModal={handleShowModal}/>
      <CameraModal open={modalOpen} onClose={() => setModalOpen(false)} camera={selectedCamera} />
    </div>
  );
}
export default Home;
