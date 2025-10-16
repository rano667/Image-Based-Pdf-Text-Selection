import React, { useState } from "react";
import Tesseract from "tesseract.js";

const OCRDemo = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const downloadResult = (data, filename = "ocr_result.json") => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleExtractText = async () => {
    if (!image) return alert("Please upload an image first!");
    setLoading(true);
    setResult(null);

    try {
      const res = await Tesseract.recognize(image, "eng");
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error extracting text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🧠 OCR Text Extractor (Tesseract.js)</h2>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && (
        <div style={{ marginTop: 20 }}>
          <img
            src={image}
            alt="preview"
            style={{
              maxWidth: "300px",
              borderRadius: "8px",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}

      <button
        onClick={handleExtractText}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading ? "Extracting..." : "Extract Text"}
      </button>

      {result && (
        <button
          onClick={() => downloadResult(result.words[0])}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          💾 Download OCR Result
        </button>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            whiteSpace: "pre-wrap",
            background: "#f8f9fa",
            padding: 15,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        >
          <h3>📄 Extracted Text:</h3>
          <p>{result.text}</p>
        </div>
      )}
    </div>
  );
};

export default OCRDemo;
