import transcript_icon from "../assets/transcription.png";
import summary_icon from "../assets/summary.png";
import sentimnet_icon from "../assets/sentiment-analysis.png";
import participants_icon from "../assets/participation.png";
import diarization_icon from "../assets/diarization.png";
import ToDo_icon from "../assets/to-do.png";
import bot_icon from "../assets/bot.png";
import "../styles/Features.css";
const Features = () => {
  return (
    <div>
      <div className="features" id="features">
        <div className="features-head">
          <h2>Why Choose Our Meeting Summarizer?</h2>
          <p>
            Our meeting summarizer is designed to turn complex discussions into
            clear, actionable insights. By transcribing, summarizing, and
            analyzing every aspect of your meetings, we make it easy for you to
            focus on decisions that matter. Say goodbye to missed details and
            hello to smarter, more efficient meetings.
          </p>
        </div>
        <div className="features-tiles">
          <div className="card">
            <img src={diarization_icon} alt="" />
            <h3>Speech Diarization</h3>
            <p>
              Identify and separate speakers in your meetings with speech
              diarization. This feature distinguishes between different voices,
              making it easy to follow who said what
            </p>
          </div>
          <div className="card">
            <img src={transcript_icon} alt="" />
            <h3>Transcription</h3>
            <p>
              Effortlessly convert your meeting discussions into accurate,
              searchable text. Our transcription feature ensures that every word
              is captured, making it easy to revisit and reference important
              points
            </p>
          </div>
          <div className="card">
            <img src={summary_icon} alt="" />
            <h3>Summarization</h3>
            <p>
              Quickly distill your meetings into concise summaries. Our
              summarization feature captures key insights, allowing you to
              review essential information at a glance
            </p>
          </div>
          <div className="card">
            <img src={sentimnet_icon} alt="" />
            <h3>Sentiment Analysis</h3>
            <p>
              Analyze the tone of your meetings with our sentiment analysis
              feature. It detects positive, negative, and neutral sentiments,
              giving you insights into the overall mood and dynamics of the
              discussion
            </p>
          </div>
          <div className="card">
            <img src={participants_icon} alt="" />
            <h3>Engagement Metrics</h3>
            <p>
              Track participant engagement with detailed metrics. Our feature
              analyzes interaction levels, providing insights into who’s most
              involved and the overall engagement of your meetings
            </p>
          </div>
          <div className="card">
            <img src={ToDo_icon} alt="" />
            <h3>To-Do List</h3>
            <p>
              Generate actionable to-do lists from meeting discussions. Our
              feature extracts tasks and assignments, helping you stay organized
              and ensure follow-ups are clear and manageable
            </p>
          </div>
          <div className="card">
            <img src={bot_icon} alt="" />
            <h3>Document Bot</h3>
            <p>
              A document understanding bot uses NLP and ML to analyze and
              comprehend text documents, extract relevant information, answer
              queries, and assist users in understanding complex documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
