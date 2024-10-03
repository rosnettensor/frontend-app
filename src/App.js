import React, { useState } from 'react';
import QRCodeScanner from './QRCodeScanner';
import CameraTool from './CameraTool';

function App() {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [plantData, setPlantData] = useState(null);
  const [isImageCaptureActive, setIsImageCaptureActive] = useState(false);
  const [storedImages, setStoredImages] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://enea-nursery-ad2458bf1633.herokuapp.com';

  const handleScanSuccess = (data) => {
    const qrData = {
      groupId: data.GroupID,
      plant: data.Plant,
      name: data.Name || 'No name',
      storage: data.Storage || 'No storage',
      pad: data.Pad || 'No pad',
    };

    setQrCodeData(qrData);
    setPlantData(data);
    setStoredImages(data.ImageLinks ? data.ImageLinks.split(',') : []);
    setIsImageCaptureActive(true);
  };

  const handleConfirmAndReset = () => {
    setQrCodeData(null);
    setPlantData(null);
    setStoredImages([]);
    setIsImageCaptureActive(false);
  };

  return (
    <div className="app-container" style={{ padding: '20px', border: '1px solid black', borderRadius: '10px', textAlign: 'center' }}>
      <h1>Plant Nursery</h1>
      {!isImageCaptureActive ? (
        <div>
          <h2>Scan QR Code</h2>
          <QRCodeScanner onScanSuccess={handleScanSuccess} />
        </div>
      ) : (
        <div>
          <h2>Manage Plant</h2>
          {qrCodeData && (
            <div>
              <p><strong>Group ID:</strong> {qrCodeData.groupId}</p>
              <p><strong>Plant:</strong> {qrCodeData.plant}</p>
              <p><strong>Name:</strong> {qrCodeData.name}</p>
              <p><strong>Storage:</strong> {qrCodeData.storage}</p>
              <p><strong>Pad:</strong> {qrCodeData.pad}</p>
            </div>
          )}
          <CameraTool groupId={qrCodeData.groupId} plantId={qrCodeData.plant} />
          <button onClick={handleConfirmAndReset} style={{ marginTop: '20px', padding: '10px', backgroundColor: 'black', color: 'white', borderRadius: '5px' }}>
            Confirm and Scan Next Plant
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
