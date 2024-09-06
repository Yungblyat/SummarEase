import React, { useState } from 'react';
import axios from 'axios';
import { ACCESS_TOKEN } from '../constants';



const AudioUpload = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [responseData, setResponseData] = useState(null);

  const handleFileChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

//   const handleFileUpload = async (file) => {
//     const formData = new FormData();
//     formData.append('audio', file);
  
//     const token = localStorage.getItem('accessToken'); // Or wherever you store your JWT
  
//     try {
//       const response = await axios.post('http://localhost:8000/api/upload-audio/', formData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });
  
//       console.log('Upload successful:', response.data);
//     } catch (error) {
//       console.error('Error uploading file:', error.response?.data || error.message);
//     }
//   };

  const handleFileUpload = async () => {
    if (!audioFile) return;

    const formData = new FormData();
    formData.append('audio', audioFile); 
    const token = localStorage.getItem(ACCESS_TOKEN)
    try {
      const response = await axios.post('http://127.0.0.1:8000/SummarEaseApp/api/upload/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      setResponseData(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>

      {responseData && (
        <div>
          <h3>Response from Server:</h3>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;