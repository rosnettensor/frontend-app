import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function QRCodeScanner({ onScanSuccess }) {
  const html5QrCodeRef = useRef(null);
  const [message, setMessage] = useState('Initializing scanner...');

  // Function to parse the QR code and extract GroupID and PlantID
  const parseQRCode = (qrCodeData) => {
    const qrArray = qrCodeData.split('*');
    // Find and clean the GroupID and PlantID
    const groupID = qrArray.find(code => code.startsWith('A')).replace(/[A-Z]/g, ''); // Extract GroupID, remove letter prefix
    const plantID = qrArray.find(code => code.startsWith('V')).replace(/[A-Z]/g, ''); // Extract PlantID, remove letter prefix
    return { groupID, plantID };
  };

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    const handleScanSuccess = (decodedText) => {
      console.log('QR code detected:', decodedText);

      const { groupID, plantID } = parseQRCode(decodedText); // Parse QR code data
      console.log('Parsed Group ID:', groupID, 'Parsed Plant ID:', plantID);

      // Make a request to the backend only if both GroupID and PlantID are parsed
      if (groupID && plantID) {
        fetch('https://enea-nursery.herokuapp.com/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupID, plantID }) // Send parsed GroupID and PlantID
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch plant data');
          }
          return response.json();
        })
        .then(data => {
          onScanSuccess(data); // Pass the plant data to the parent component
          setMessage('Plant data found and fetched!');
        })
        .catch(error => {
          console.error('Error fetching plant data:', error);
          setMessage('Error fetching plant data');
        });
      } else {
        setMessage('Invalid QR code format.');
        console.error('QR code parsing failed.');
      }
    };

    const handleScanError = (errorMessage) => {
      console.error('QR Code scan error:', errorMessage);
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      { fps: 20, qrbox: 300 }, // Increased fps and qrbox size for better detection
      handleScanSuccess, 
      handleScanError
    ).then(() => {
      setMessage('QR Code scanner initialized.');
    }).catch(err => {
      setMessage('Failed to start QR code scanning.');
      console.error('Failed to start QR code scanning:', err);
    });

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current.clear();
        }).catch(err => {
          console.error('Failed to stop QR code scanning:', err);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div>
      <div id="reader" style={{ width: '300px', marginBottom: '10px' }}></div>
      <p>{message}</p>
    </div>
  );
}

export default QRCodeScanner;
