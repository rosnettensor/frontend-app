import React, { useState } from 'react';
import QRCodeScanner from './QRCodeScanner';
import CameraTool from './CameraTool';

function App() {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [plantData, setPlantData] = useState(null);
  const [storedImages, setStoredImages] = useState([]);
  const [isImageCaptureActive, setIsImageCaptureActive] = useState(false);

  // Use environment variable for backend URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://enea-nursery-ad2458bf1633.herokuapp.com';

  const handleScanSuccess = (data) => {
    console.log('Data received:', data);
    if (!data || !data.GroupID || !data.Plant) {
      console.error('No data received or invalid structure');
      return;
    }

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

  // Handle reset to initial state
  const handleConfirmAndReset = () => {
    setQrCodeData(null);
    setPlantData(null);
    setStoredImages([]);
    setIsImageCaptureActive(false);
  };

  // Delete image function
  const handleDeleteImage = (imageUrl) => {
    fetch(`${backendUrl}/delete-image`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: qrCodeData.groupId,
        plantId: qrCodeData.plant,
        imageUrl: imageUrl,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete image');
        }
        return response.json();
      })
      .then((result) => {
        if (result.success) {
          setStoredImages((prevImages) => prevImages.filter((url) => url !== imageUrl));
        }
      })
      .catch((error) => console.error('Error deleting image:', error));
  };

  return (
    <div style={{ padding: '10px', maxWidth: '400px', margin: 'auto' }}>
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

          <h3>Stored Images:</h3>
          {storedImages.length > 0 ? (
            storedImages.map((url, index) => (
              <div key={index} style={{ display: 'inline-block', margin: '10px', textAlign: 'center' }}>
                <img src={`${backendUrl}${url}`} alt={`Stored ${index}`} width="100" />
                <button
                  onClick={() => handleDeleteImage(url)}
                  style={{
                    display: 'block',
                    marginTop: '5px',
                    color: 'white',
                    backgroundColor: 'red',
                    border: 'none',
                    padding: '5px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No stored images</p>
          )}

          <CameraTool groupId={qrCodeData.groupId} plantId={qrCodeData.plant} />

          <button
            onClick={handleConfirmAndReset}
            style={{
              display: 'block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Confirm and Scan Next Plant
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
