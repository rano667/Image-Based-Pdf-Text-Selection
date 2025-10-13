import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Tesseract from "tesseract.js";

// ✅ Tell react-pdf where to find the worker (for pdfjs 5+)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

function App() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const pageCanvasRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setText("");
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleRunOCR = async () => {
    const canvas = pageCanvasRef.current?.querySelector("canvas");
    if (!canvas) return alert("Please wait until the PDF page is visible.");

    setLoading(true);
    try {
      const result = await Tesseract.recognize(canvas, "eng", {
        logger: (m) => console.log(m),
      });
      setText(result.data.text);
    } catch (err) {
      console.error(err);
      setText("Error during OCR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h2>📄 React-PDF + Tesseract.js OCR</h2>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <br />

      {file && (
        <div
          ref={pageCanvasRef}
          style={{ margin: "20px auto", width: "fit-content" }}
        >
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={1} scale={1.5} />
          </Document>
        </div>
      )}

      {file && (
        <button
          onClick={handleRunOCR}
          disabled={loading}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {loading ? "Extracting..." : "Run OCR on Visible Page"}
        </button>
      )}

      {text && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            border: "1px solid #ddd",
            background: "#fafafa",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "20px",
            textAlign: "left",
            maxWidth: "700px",
            margin: "20px auto",
          }}
        >
          <strong>Extracted Text:</strong>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}

export default App;
