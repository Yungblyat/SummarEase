import re
import nltk
from transformers import pipeline

nltk.download('punkt')

#remove all the extra white spaces
def preprocess_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    return text

#look for words that help identify action words
def contains_imperative_verb(sentence):
    words = nltk.word_tokenize(sentence)
    tagged_words = nltk.pos_tag(words)
    for word, tag in tagged_words:
        if tag in ["VB", "VBP"]:
            return True
    return False

def extract_action_items(transcript):
    sentences = nltk.sent_tokenize(transcript)

    high_priority_keywords = ["urgent", "ASAP", "immediately", "important"]
    medium_priority_keywords = ["soon", "priority", "quickly"]
    low_priority_keywords = ["next week", "later", "eventually"]

    to_do_list = []

    for sent in sentences:
        priority = 1
        sentence_text = sent.lower()

        if any(keyword in sentence_text for keyword in high_priority_keywords):
            priority = 3
        elif any(keyword in sentence_text for keyword in medium_priority_keywords):
            priority = 2
        elif any(keyword in sentence_text for keyword in low_priority_keywords):
            priority = 1

        if contains_imperative_verb(sent):
            to_do_list.append((sent.strip(), priority))

    return to_do_list
