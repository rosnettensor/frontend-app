import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

function QRCodeScanner({ onScanSuccess }) {
  const html5QrCodeRef = useRef(null);
  const [message, setMessage] = useState('Initializing scanner...');

  // Function to parse the QR code and extract GroupID and Plant
  const parseQRCode = (qrCodeData) => {
    console.log('Raw QR Data:', qrCodeData);
    const qrArray = qrCodeData.split('*');
    const groupID = qrArray.find(code => code.startsWith('A'))?.replace(/[A-Z]/g, '');
    const plant = qrArray.find(code => code.startsWith('V'))?.replace(/[A-Z]/g, '');
    
    if (!groupID || !plant) {
      console.error('Parsing failed:', groupID, plant);
      setMessage('Error parsing QR code');
      return { error: 'Parsing error' };
    }

    return { groupID, plant };
  };

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    const handleScanSuccess = (decodedText) => {
      console.log('QR code detected:', decodedText);

      // Parse the scanned QR code
      const { groupID, plant } = parseQRCode(decodedText);

      if (groupID && plant) {
        console.log('Parsed Group ID:', groupID, 'Parsed Plant:', plant);

        // Send the raw QR code data to the backend for validation and processing
        fetch('https://enea-nursery.herokuapp.com/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCodeData: decodedText })  // Send the full QR code data
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch plant data');
          }
          return response.json();
        })
        .then(data => {
          onScanSuccess(data);  // Pass the plant data back to the parent component
          setMessage('Plant data found and fetched!');
        })
        .catch(error => {
          console.error('Error fetching plant data:', error);
          setMessage('Error fetching plant data');
        });
      }
    };

    const handleScanError = (errorMessage) => {
      console.error('QR Code scan error:', errorMessage);
      setMessage('QR code could not be detected. Please try again.');
    };

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]  // Ensure correct QR code format
      },
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
