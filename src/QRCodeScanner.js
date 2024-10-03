import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRCodeScanner({ onScanSuccess, onScanError }) {
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-code-scanner",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText, decodedResult) => {
        console.log("QR Code decoded:", decodedText);

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://enea-nursery-ad2458bf1633.herokuapp.com';

        fetch(`${backendUrl}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCodeData: decodedText }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch plant data');
            }
            return response.json();
          })
          .then(data => {
            if (onScanSuccess) {
              onScanSuccess(data); // Pass the plant data to the parent component
            }
          })
          .catch(error => {
            console.error('Error fetching plant data:', error);
            if (onScanError) onScanError(error);
          });
      },
      (error) => {
        console.log("QR Code scan error:", error);
        if (onScanError) onScanError(error);
      }
    );

    setScanner(scanner);

    return () => {
      scanner.clear().catch((error) => console.error("Failed to clear QRCodeScanner", error));
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-code-scanner" style={{ width: '300px' }} />;
}

export default QRCodeScanner;
