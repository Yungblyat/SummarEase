import React from 'react';
import { ArrowDown } from 'lucide-react';
import { FILE_ID } from '../constants';
import api from "../api";

const DownloadPDF = () => {
  // Function to handle the PDF download
  const downloadPdf = async () => {
    let file_id = localStorage.getItem(FILE_ID);
    console.log(`Download fileID:${file_id}`);

    try {
      const response = await api.post('/email/generate_pdf/', { file_id: file_id }, { responseType: 'blob' });
      console.log(response.data);
      // Create a temporary link to trigger the download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file_id}_results.pdf`; // Set the default download name
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={downloadPdf} 
        className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center hover:bg-purple-100 transition-colors duration-200"
      >
        <ArrowDown className="mr-2 h-4 w-4" />
        DownloadPDF
      </button>
    </div>
  );
};

export default DownloadPDF;