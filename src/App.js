// App.js

import React, { useState } from 'react';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [operation, setOperation] = useState('BLUR');
  const [processedImageUrl, setProcessedImageUrl] = useState(null);

  const handleImageUpload = (event) => {
    const selectedImages = Array.from(event.target.files);
    setImages(selectedImages);
  };

  const handleOperationChange = (event) => {
    setOperation(event.target.value);
  };

  const processImages = () => {
    const formData = new FormData();
    formData.append('image', images[0]);
    formData.append('operation', operation);

    fetch('http://18.221.42.105/api/v1/image_processing', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (response.ok) {
        return response.blob(); // Convert response to Blob object
      } else {
        throw new Error('Error processing images');
      }
    })
    .then(blob => {
      const imageUrl = URL.createObjectURL(blob); // Create object URL for the Blob
      setProcessedImageUrl(imageUrl); // Set processed image URL
    })
    .catch(error => {
      console.error('Error processing images:', error);
    });
  };

  return (
    <div>
      <div className="container">
        <h1>Image Processing App</h1>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
        <label htmlFor="operation-select" className="select-label">Choose Operation:</label>
        <select id="operation-select" value={operation} onChange={handleOperationChange} className="select-operation">
          <option value="BLUR">BLUR</option>
          <option value="EMBOSS">EMBOSS</option>
          <option value="SHARPEN">SHARPEN</option>
        </select>
        <button onClick={processImages} className="button">Process Images</button>
      </div>
      {processedImageUrl && (
        <div className="processed-image-container">
          <h2 style={{
            textAlign: 'center'
          }}>Processed Image</h2>
          <img src={processedImageUrl} alt="Processed" className="processed-image" />
        </div>
      )}
    </div>
  );
}

export default App;
