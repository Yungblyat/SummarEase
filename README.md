
# SummarEase

SummarEase is a web application that allows users to upload audio files for advanced post-processing, including transcription, diarization, summarization, engagement metric extraction, and more. It uses Django Rest Framework (DRF) with a React frontend, offering token-based authentication via Django SimpleJWT. 

## Features

- **Audio Upload:** Upload MP3 files for processing.
- **Transcription:** Converts speech in audio to text.
- **Diarization:** Identifies different speakers in the audio.
- **Summarization:** Automatically generates summaries from transcribed audio.
- **Engagement Metrics:** Calculates engagement statistics like speech rate and sentiment analysis.
- **User Authentication:** Token-based authentication using Django SimpleJWT.
- **Email Reports:** Sends results via email after processing.

## Tech Stack

- **Backend:** Django Rest Framework (DRF), Django SimpleJWT for authentication
- **Frontend:** React with Vite
- **Processing:** Various Python libraries for audio processing and natural language processing

## Installation

### Backend (Django)

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/Yungblyat/SummarEase.git
   cd SummarEase
   \`\`\`

2. Create a virtual environment and install the dependencies:

   \`\`\`bash
   python3 -m venv env
   source env/bin/activate
   pip install -r requirements.txt
   \`\`\`

3. Set up the database:

   \``` bash
   python manage.py migrate
   ```

4. Create a superuser:

   \`\`\`bash
   python manage.py createsuperuser
   \`\`\`

5. Start the Django development server:

   \`\`\`bash
   python manage.py runserver
   \`\`\`

### Frontend (React)

1. Navigate to the frontend directory:

   \`\`\`bash
   cd frontend
   \`\`\`

2. Install the frontend dependencies:

   \`\`\`bash
   npm install
   \`\`\`

3. Start the frontend development server:

   \`\`\`bash
   npm run dev
   \`\`\`

## Usage

1. Navigate to \`http://localhost:3000\` to access the frontend.
2. Register or login using the authentication system.
3. Upload an MP3 file and select the processing options (diarization, summarization, etc.).
4. After processing, you will receive an email with the results or view the results on the history page.

## Project Structure

\`\`\`
SummarEase/
│
├── backend/
│   ├── authentication/   # User authentication with Django SimpleJWT
│   ├── audio/            # Audio processing logic
│   └── templates/        # Email templates
│
├── frontend/             # React frontend code
│   ├── components/       # React components (forms, chat, etc.)
│   ├── pages/            # Pages like history, dashboard, etc.
│   └── styles/           # Tailwind CSS styles
│
└── README.md             # Project documentation
\`\`\`

## API Endpoints

- **POST /api/register:** Register a new user
- **POST /api/login:** Login and get an access token
- **POST /api/upload:** Upload an audio file for processing
- **GET /summarease/history:** View previously uploaded files

## Future Features

- AI Chatbot

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
