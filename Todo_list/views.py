import spacy
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.tokenize import sent_tokenize
import torch
from rake_nltk import Rake

nltk.download('punkt')

def bert_summarize(text, num_sentences=3):
    # Load pre-trained BERT model and tokenizer
    model_name = "bert-base-uncased"
    tokenizer = BertTokenizer.from_pretrained(model_name)
    model = BertModel.from_pretrained(model_name)

    # Split text into sentences
    sentences = sent_tokenize(text)

    # Tokenize and encode sentences
    inputs = tokenizer(sentences, return_tensors='pt', padding=True, truncation=True)

    # Generate sentence embeddings
    with torch.no_grad():
        outputs = model(**inputs)
        sentence_embeddings = outputs.last_hidden_state.mean(dim=1).numpy()

    # Calculate cosine similarity matrix
    similarity_matrix = cosine_similarity(sentence_embeddings, sentence_embeddings)

    # Rank sentences based on their similarity to others
    sentence_ranks = similarity_matrix.sum(axis=1)
    ranked_sentence_indices = np.argsort(-sentence_ranks)

    # Select top-ranked sentences for the summary
    summary_sentences = [sentences[i] for i in ranked_sentence_indices[:num_sentences]]
    summary = ' '.join(summary_sentences)
    return summary


#nlp = spacy.load("en_core_web_sm")

def extract_advanced_todos(transcript_text):
    # Initialize RAKE with NLTK stopwords
    rake = Rake()
    # Extract keywords/phrases
    rake.extract_keywords_from_text(transcript_text)
    # Get ranked phrases with scores
    ranked_phrases = rake.get_ranked_phrases_with_scores()

    # Define a threshold score for selecting keywords
    threshold = 4.0
    todos = [phrase for score, phrase in ranked_phrases if score > threshold]
    return todos