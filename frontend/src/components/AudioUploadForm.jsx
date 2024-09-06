import React, { useState } from 'react';
import axios from 'axios';
import {ACCESS_TOKEN, REFRESH_TOKEN} from "../constants"

const AudioUploadForm = () => {
    const [file, setFile] = useState(null);
    const [diarization, setDiarization] = useState(false);
    const [engagement, setEngagement] = useState(false);
    const [summarize, setSummarize] = useState(false);
    const [todoList, setTodoList] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('diarizationCheckbox', diarization);
        formData.append('engagementCheckbox', engagement);
        formData.append('SummarizeCheckbox', summarize);
        formData.append('Todo_ListCheckbox', todoList);

        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            const response = await axios.post('http://127.0.0.1:8000/summarease/api/upload/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponseData(response.data);
        } catch (error) {
            console.error('There was an error uploading the file!', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} required />
                <label>
                    <input
                        type="checkbox"
                        checked={diarization}
                        onChange={() => setDiarization(!diarization)}
                    />
                    Diarization
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={engagement}
                        onChange={() => setEngagement(!engagement)}
                    />
                    Engagement Metrics
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={summarize}
                        onChange={() => setSummarize(!summarize)}
                    />
                    Summarize
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={todoList}
                        onChange={() => setTodoList(!todoList)}
                    />
                    Extract To-Do List
                </label>
                <button type="submit">Upload</button>
            </form>

            {responseData && (
                <div>
                    <h2>Processing Results</h2>
                    <pre>{JSON.stringify(responseData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default AudioUploadForm;
