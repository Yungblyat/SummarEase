import { useState } from "react";
import { Upload, FileUp, CheckSquare, BarChart2, ListTodo } from "lucide-react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { FILE_ID } from "../constants";
import "../styles/upload.css";

export default function UploadSection({ isLoggedIn, onLoginRequired }) {
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    summary: true,
    diarization: false,
    engagement: false,
    todo: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    if (file) {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("options", JSON.stringify(options));

      try {
        const response = await api.post("/summarease/upload/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 3000000,
        });
        console.log(JSON.stringify(response.data));
        localStorage.removeItem(FILE_ID);
        localStorage.setItem(FILE_ID, response.data.audio_file);
        // Navigate to results page with the response data
        navigate("/results", { state: { result: response.data } });
      } catch (err) {
        console.error("Error uploading file:", err);
        setError("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleOptionChange = (key) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: !prev[key] };

      // If diarization is unchecked, also uncheck engagement
      if (key === "diarization" && !newOptions.diarization) {
        newOptions.engagement = false;
      }

      return newOptions;
    });
  };

  return (
    <div className="upload" id="upload">
      <div className="main-section">
        <div className="left-section">
          <h2>Upload your file</h2>
          <p>File should be an audio or video</p>
          <div
            className="file-upload"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p>Drop files here</p>
            <span>or</span>
            <label className="block mt-2">
              <span>Choose file</span>
              <input
                type="file"
                className="block w-full text-sm text-purple-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-700 file:text-purple-200
                  hover:file:bg-purple-800"
                onChange={handleFileChange}
                accept="audio/*,video/*"
              />
            </label>
          </div>
          <div className="space-y-2 mb-4">
            {Object.entries(options).map(([key, value]) => (
              <label
                key={key}
                className={`flex items-center space-x-2 text-purple-200 ${
                  key === "engagement" && !options.diarization
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleOptionChange(key)}
                  className="form-checkbox h-5 w-5 text-purple-500"
                  disabled={key === "engagement" && !options.diarization}
                />
                <span className="capitalize">{key}</span>
                {key === "summary" && <FileUp className="h-4 w-4" />}
                {key === "diarization" && <CheckSquare className="h-4 w-4" />}
                {key === "engagement" && <BarChart2 className="h-4 w-4" />}
                {key === "todo" && <ListTodo className="h-4 w-4" />}
              </label>
            ))}
          </div>
          <button
            onClick={handleUpload}
            className={`w-full bg-purple-800 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center ${
              isUploading || !file ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Upload className="mr-2 h-5 w-5" />
            )}
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          {error && <p className="mt-2 text-red-300 text-sm">{error}</p>}
        </div>
        <div className="right-section">
          <h2>Revolutionize your Meetings</h2>
          <p>
            Upload your meeting, and watch as we transform it into clear
            summaries and deep insights— understanding made effortless.
          </p>
        </div>
      </div>
    </div>
  );
}
