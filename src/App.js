import React, { useState } from 'react';
import QRCodeScanner from './QRCodeScanner';

function App() {
  const [plantData, setPlantData] = useState(null);

  // Handle QR code scan success
  const handleScanSuccess = (data) => {
    setPlantData(data);
  };

  // Reset function
  const handleReset = () => {
    setPlantData(null);
  };

  return (
    <div style={{ padding: '10px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Plant Nursery</h1>

      {!plantData ? (
        <div>
          <h2>Step 1: Scan QR Code</h2>
          <QRCodeScanner onScanSuccess={handleScanSuccess} />
        </div>
      ) : (
        <div>
          <h2>Step 2: Plant Details</h2>
          <p><strong>Group ID:</strong> {plantData.GroupID}</p>
          <p><strong>Plant:</strong> {plantData.Plant}</p>
          <p><strong>Name:</strong> {plantData.Name}</p>
          <p><strong>Storage:</strong> {plantData.Storage}</p>
          <p><strong>Pad:</strong> {plantData.Pad}</p>
          
          <button onClick={handleReset} style={{ marginTop: '20px' }}>
            Reset and Scan Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
