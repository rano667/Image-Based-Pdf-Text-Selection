import React, { useState } from "react";
import Tesseract from "tesseract.js";

const imageUrl = "https://tesseract.projectnaptha.com/img/eng_bw.png";

function App() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRunOCR = async () => {
    setLoading(true);
    setText("");
    setProgress(0);

    try {
      const result = await Tesseract.recognize(imageUrl, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setText(result.data.text);
    } catch (error) {
      console.error("OCR error:", error);
      setText("Error while extracting text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h2>🧠 OCR Demo — Tesseract.js</h2>
      <img
        src={imageUrl}
        alt="OCR Source"
        style={{
          width: 300,
          margin: "20px auto",
          display: "block",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={handleRunOCR}
        disabled={loading}
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {loading ? "Extracting..." : "Run OCR"}
      </button>

      {loading && (
        <div style={{ marginBottom: "10px" }}>
          <p>Progress: {progress}%</p>
        </div>
      )}

      {text && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            background: "#fafafa",
            maxWidth: "600px",
            margin: "0 auto",
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
