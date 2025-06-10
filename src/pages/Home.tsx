import React, { useState } from 'react';
import MapView from '../components/MapView';
import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';

function Home() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unseenAlerts, setUnseenAlerts] = useState(2); // Demo

  return (
    <div>
      <Navbar unseenCount={unseenAlerts} onShowNotifications={() => alert('Aquí abriría el panel de notificaciones')} />
      <MapView onCameraClick={cam => { setSelectedCamera(cam); setModalOpen(true); }} />
      <CameraModal open={modalOpen} onClose={() => setModalOpen(false)} camera={selectedCamera} />
    </div>
  );
}
export default Home;
