// App.js

import React, { useState } from "react";
// import "./App.css";
import spinner from "./spinner.gif";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
} from "react-bootstrap";

const BASE_URL =
  process.env.REACT_APP_BACKEND_BASE_URL || "http://dist-proj-api.mu-stafa.com";

function App() {
  const [images, setImages] = useState([]);
  const [operation, setOperation] = useState("BLUR");
  const [processedImages, setProcessedImages] = useState([]);
  const [loading, setLoading] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [imagesProgress, setImagesProgress] = useState([]);

  const handleImageUpload = (event) => {
    if (event.target.files) {
      const newImagesPreview = Array.from(event.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagesPreview(newImagesPreview);
      const selectedImages = Array.from(event.target.files);
      setImages(selectedImages);
      setProcessedImages(
        Array.from({ length: selectedImages.length, fill: "" })
      );
      setLoading(Array.from({ length: selectedImages.length, fill: false }));
      setImagesProgress(Array.from({ length: selectedImages.length, fill: 0 }));
    }
  };

  const handleOperationChange = (event) => {
    setOperation(event.target.value);
  };

  const updateProcessedImages = (eventMessagesString) => {
    // Search for any json line containing the url and update the corresponding image
    const newProcessedImages = [...processedImages];
    const eventMessages = eventMessagesString.split("\n");
    for (let i = 0; i < eventMessages.length; i++) {
      try {
        const message = JSON.parse(eventMessages[i]);
        if (message.url) {
          const id = parseInt(message.id);
          newProcessedImages[id] = message.url;
        }
      } catch (error) {
        console.error(error);
      }
    }
    setProcessedImages(newProcessedImages);
  };

  const updateLoading = (id, value) => {
    const loadingCopy = [...loading];
    loadingCopy[id] = value;
    setLoading(loadingCopy);
  };

  const updateImagesProgress = (id, value) => {
    const imagesProgressCopy = [...imagesProgress];
    imagesProgressCopy[id] = value;
    setImagesProgress(imagesProgressCopy);
  };

  const processImages = async () => {
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }
    formData.append("operation", operation);

    setLoading(Array.from({ length: images.length, fill: true }));
    // Create a toast and update it with the event message
    const toastId = toast.loading("Processing Image...", {
      type: "",
      autoClose: false,
      progress: 0,
      closeOnClick: false,
    });
    axios({
      url: `${BASE_URL}/api/v1/image_processing`,
      data: formData,
      method: "POST",
      onDownloadProgress: (progressEvent) => {
        const xhr = progressEvent.event.target;
        const { responseText } = xhr;
        // console.log(responseText);
        const messages = responseText.split("\n");
        const newMessage =
          messages[messages.length - 2] ||
          messages[messages.length - 1] ||
          "{}";
        const response = JSON.parse(newMessage);
        const id = parseInt(response.id);
        const progress = parseInt(response.progress);
        updateImagesProgress(id, progress);
        if (response.event)
          toast.update(toastId, {
            render: `${id + 1}: ${response.event}`,
            type: "info",
            autoClose: false,
            progress: progress / 100,
          });
        else if (response.url) {
          toast.update(toastId, {
            render: `${id + 1} Image Processed`,
            type: "success",
            autoClose: 3000,
            progress: progress / 100,
            closeOnClick: true,
          });
          updateLoading(id, false);
          updateImagesProgress(id, 100);
          updateProcessedImages(responseText);
        }
      },
    }).finally(() => {
      setLoading(Array.from({ length: images.length, fill: false }));
    });
  };

  return (
    <>
      <Container>
        <h1 className="text-center">Distributed Image Processing App</h1>
        {/* Create a pretty design header having a form with the file and operration inputs using react-bootstrap */}
        <>
          <Form.Group controlId="formFileMultiple" className="mb-3">
            <Form.Label>Choose Images:</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              multiple
              placeholder="Choose Images"
            />
          </Form.Group>
          <Form.Group controlId="operation-select" className="mb-3">
            <Form.Label>Choose Operation:</Form.Label>
            <Form.Control
              as="select"
              value={operation}
              onChange={handleOperationChange}
            >
              <option value="BLUR">BLUR</option>
              <option value="EMBOSS">EMBOSS</option>
              <option value="SHARPEN">SHARPEN</option>
              <option value="EDGE_DETECTION">EDGE DETECTION</option>
              <option value="MEDIAN">Median Filter</option>
            </Form.Control>
          </Form.Group>
          <Button onClick={processImages} className="button">
            Process Images
          </Button>
        </>
        {/* Create a grid of n rows and 2 columns where n is the number of selected images. The first column has the selected image and the second column has, at first a placeholder spinner and then the processed image */}
        {imagesPreview.map((selectedImage, index) => (
          <Row key={index} className="mb-4">
            <Col xs={"12"} md={"6"}>
              <img
                src={selectedImage}
                alt="Selected"
                className="selected-image"
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={"12"} md={"6"}>
              {loading && index < loading.length && loading[index] ? (
                <img
                  src={spinner}
                  alt="Loading..."
                  style={{
                    width: "100%",
                  }}
                />
              ) : null}
              {(!loading || index >= loading.length || !loading[index]) &&
              index < processedImages.length &&
              processedImages[index] ? (
                <img
                  src={processedImages[index]}
                  alt="Processed"
                  className="processed-image"
                  style={{ width: "100%" }}
                />
              ) : null}
            </Col>
            <Col xs={"12"} className="mb-4 mt-4">
              <ProgressBar
                animated
                now={imagesProgress[index]}
                variant={imagesProgress[index] >= 90 ? "success" : "primary"}
              />
            </Col>
            {processedImages[index] ? (
              // Align the button to the right
              <Col className="d-flex justify-content-end">
                <Button variant="success" href={processedImages[index]}>
                  Download Processed Image
                </Button>
              </Col>
            ) : null}
          </Row>
        ))}
      </Container>
      <ToastContainer />
    </>
  );
}

export default App;
