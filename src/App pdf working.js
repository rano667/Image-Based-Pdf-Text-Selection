import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import Tesseract from "tesseract.js";

// ✅ Correct worker path setup for pdfjs-dist v5
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

function App() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setText("");
    setProgress(0);

    try {
      // Step 1: Load the PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let extractedText = "";

      // Step 2: Iterate over each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 }); // higher = better quality

        // Step 3: Render page to canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        // Step 4: OCR using Tesseract.js
        const result = await Tesseract.recognize(canvas, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });

        extractedText += `\n\n--- Page ${pageNum} ---\n${result.data.text}`;
      }

      setText(extractedText);
    } catch (error) {
      console.error("OCR PDF Error:", error);
      setText("Error while extracting text from PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h2>📄 OCR Demo — Scanned PDF + Tesseract.js</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        style={{ margin: "20px 0" }}
      />

      {loading && <p>Processing... {progress}%</p>}

      {text && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            background: "#fafafa",
            maxWidth: "700px",
            margin: "20px auto",
            textAlign: "left",
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
