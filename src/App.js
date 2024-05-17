// App.js

import React, { useState } from "react";
import "./App.css";
import spinner from "./spinner.gif";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const processImages = async () => {
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }
    formData.append("operation", operation);

    setLoading(true);
    // Create a toast and update it with the event message
    const toastId = toast.loading("Processing Image...", {
      type: "",
      autoClose: false,
      progress: 0,
    });
    axios({
      url: `${BASE_URL}/api/v1/image_processing`,
      data: formData,
      method: "POST",
      onDownloadProgress: (progressEvent) => {
        console.log(progressEvent.loaded);
        const xhr = progressEvent.event.target;
        const { responseText } = xhr;
        console.log(responseText);
        const messages = responseText.split("\n");
        const newMessage =
          messages[messages.length - 2] ||
          messages[messages.length - 1] ||
          "{}";
        const response = JSON.parse(newMessage);
        if (response.event)
          toast.update(toastId, {
            render: response.event,
            type: "info",
            autoClose: false,
            progress: parseInt(response.progress) / 100,
          });
        else if (response.url) {
          setProcessedImageUrl(response.url);
          toast.update(toastId, {
            render: "Image Processed",
            type: "success",
            autoClose: 3000,
            progress: parseInt(response.progress) / 100,
            closeOnClick: true,
          });
          setLoading(false);
        }
      },
    }).finally(() => {
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
          multiple
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
      <ToastContainer />
    </>
  );
}

export default App;
