import React, { useEffect, useRef, useState } from 'react';

function CameraTool({ groupId, plantId }) {
  const [imageUrls, setImageUrls] = useState([]); // Store multiple images
  const videoRef = useRef(null); // Ref to access the video element
  const canvasRef = useRef(null); // Ref to access the canvas element

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' } },  // Force rear camera
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing the camera: ', err);
      }
    }

    startCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('plantImage', blob, `${Date.now()}.jpg`);
        formData.append('groupId', groupId);
        formData.append('plantId', plantId);

        // Use environment variable for backend URL
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://enea-nursery-ad2458bf1633.herokuapp.com';

        // Upload the captured image
        fetch(`${backendUrl}/upload`, {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            setImageUrls((prevUrls) => [...prevUrls, `${backendUrl}${data.imageUrl}`]);
          })
          .catch((error) => console.error('Error uploading image:', error));
      });
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '400px' }} />
      <button onClick={handleCapture} style={{ display: 'block', marginTop: '10px', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
        Capture Image
      </button>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div>
        <h3>Captured Images:</h3>
        {imageUrls.length > 0 ? (
          imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`Captured ${index}`} width="200" style={{ marginRight: '10px' }} />
          ))
        ) : (
          <p>No images captured yet</p>
        )}
      </div>
    </div>
  );
}

export default CameraTool;
