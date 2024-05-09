// App.js

import React, { useState } from "react";
import "./App.css";
import spinner from "./spinner.gif";

const BASE_URL =
  process.env.REACT_APP_BACKEND_BASE_URL || "http://dist-proj-api.mu-stafa.com";

function App() {
  const [images, setImages] = useState([]);
  const [operation, setOperation] = useState("BLUR");
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
    const selectedImages = Array.from(event.target.files);
    setImages(selectedImages);
  };

  const handleOperationChange = (event) => {
    setOperation(event.target.value);
  };

  const processImages = () => {
    const formData = new FormData();
    formData.append("image", images[0]);
    formData.append("operation", operation);

    setLoading(true);
    fetch(`${BASE_URL}/api/v1/image_processing`, {
      method: "POST",
      body: formData,
      mode: "cors",
    })
      .then((response) => response.json())
      .then((data) => {
        const url = data.url;
        setProcessedImageUrl(url);
      })
      .catch((error) => {
        console.error("Error processing images:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="container">
        <h1>Image Processing App</h1>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
        />
        <label htmlFor="operation-select" className="select-label">
          Choose Operation:
        </label>
        <select
          id="operation-select"
          value={operation}
          onChange={handleOperationChange}
          className="select-operation"
        >
          <option value="BLUR">BLUR</option>
          <option value="EMBOSS">EMBOSS</option>
          <option value="SHARPEN">SHARPEN</option>
          <option value="EDGE_DETECTION">EDGE DETECTION</option>
          <option value="MEDIAN">Median Filter</option>
        </select>
        <button onClick={processImages} className="button">
          Process Images
        </button>
      </div>
      <div>
        {loading && (
          <div className="loading processed-image-container">
            <img
              src={spinner}
              alt="Loading..."
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            gap: "20px",
          }}
        >
          {image && (
            <div className="processed-image-container">
              <h2
                style={{
                  textAlign: "center",
                }}
              >
                Selected Image
              </h2>
              <img src={image} alt="Processed" className="processed-image" />
            </div>
          )}
          {!loading && processedImageUrl && (
            <div className="processed-image-container">
              <h2
                style={{
                  textAlign: "center",
                }}
              >
                Processed Image
              </h2>
              <img
                src={processedImageUrl}
                alt="Processed"
                className="processed-image"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
