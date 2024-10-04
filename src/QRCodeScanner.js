import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';  // Ensure this is installed in your project

function QRCodeScanner({ onScanSuccess }) {
  const html5QrCodeRef = useRef(null);
  const [message, setMessage] = useState('Initializing scanner...');

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    const handleScanSuccess = (decodedText) => {
      console.log('QR code detected:', decodedText);

      fetch('https://enea-nursery.herokuapp.com/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeData: decodedText }) // Send the full QR code data
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch plant data');
        }
        return response.json();
      })
      .then(data => {
        onScanSuccess(data);
        setMessage('Plant data found and fetched!');
      })
      .catch(error => {
        console.error('Error fetching plant data:', error);
        setMessage('Error fetching plant data');
      });
    };

    const handleScanError = (errorMessage) => {
      console.error('QR Code scan error:', errorMessage);
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      { fps: 10, qrbox: 250 }, 
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
