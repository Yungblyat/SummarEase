import re
import nltk
from transformers import pipeline

# Download necessary NLTK data
nltk.download('averaged_perceptron_tagger')
nltk.download('punkt')

# Load BERT model for text summarization
summarizer = pipeline("summarization")

# Sample transcript (replace this with your actual transcript)

transcript = """
    We need to finalize the project report by Friday. John, please follow up with the client regarding the feedback.
    Sarah, can you prepare the presentation slides for Monday's meeting? Also, we should arrange a team meeting
    to discuss the new strategy for Q3. Someone needs to organize the team building event next month. This is urgent.
"""

# transcript = "This is urgent"
c= summarizer(transcript)
print(c)
print(c[0]["summary_text"])
print(type(cock))


# Preprocessing function to clean up the transcript
def preprocess_text(text):
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


# Preprocess the transcript
cleaned_transcript = preprocess_text(cock[0].get("summary_text", "blyat no summary"))

# Summarize transcript (optional but useful for long transcripts)


# # Tokenize sentences using NLTK
sentences = nltk.sent_tokenize(cleaned_transcript)

# # Keywords to determine priority
high_priority_keywords = ["urgent", "ASAP", "immediately", "important","now"]
medium_priority_keywords = ["soon", "priority", "quickly"]
low_priority_keywords = ["next week", "later", "eventually"]

# Extract sentences containing action items and assign priorities
to_do_list = []

# # Define a simple heuristic to check for verbs in imperative mood using NLTK's pos_tag
def contains_imperative_verb(sentence):
    words = nltk.word_tokenize(sentence)
    tagged_words = nltk.pos_tag(words)
    for word, tag in tagged_words:
        if tag in ["VB", "VBP", "JJ"]:  # Checking for verbs in base form
            return True
    return False

for sent in sentences:
    priority = ""
    sentence_text = sent.lower()
    
#     # Check for priority keywords
    
    if any(keyword in sentence_text for keyword in high_priority_keywords):
        priority = "high"
    elif any(keyword in sentence_text for keyword in medium_priority_keywords):
        priority = "medium"
    elif any(keyword in sentence_text for keyword in low_priority_keywords):
        priority = "low"
    # Check for imperative verbs
    if contains_imperative_verb(sent):
        to_do_list.append((sent.strip(), priority))

# # Print extracted to-do items with priorities
print("To-Do List:")
for item, priority in to_do_list:
    print(f"- {item} (Priority: {priority})")
