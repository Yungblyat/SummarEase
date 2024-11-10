# chatbot/views.py

import os
import pickle
import faiss
from django.shortcuts import render, get_object_or_404
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import warnings
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from SummarEaseFyp.settings import BASE_DIR
from SummarEaseApp.models import AudioFile, SpeakerDiarization

warnings.filterwarnings("ignore", category=FutureWarning, message="clean_up_tokenization_spaces was not set")

load_dotenv(f"{BASE_DIR}\.env")
groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(groq_api_key=groq_api_key, model_name="Llama3-8b-8192")

prompt = ChatPromptTemplate.from_template(
    """
    Answer the question based on the provided meeting document context.
    Context: {context}
    Diarization: {diarization_content}
    Question: {input}
    """
)

embedding_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-mpnet-base-v2')

def load_embeddings():
    if os.path.exists('embeddings.pkl') and os.path.exists('faiss_index.index'):
        with open('embeddings.pkl', 'rb') as f:
            embeddings_metadata = pickle.load(f)
        index = faiss.read_index('faiss_index.index')
        vectors = FAISS(
            embedding_function=embedding_model,
            index=index,
            docstore=InMemoryDocstore(),
            index_to_docstore_id={}
        )
    else:
        loader = PyPDFDirectoryLoader("./docs")
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_documents = text_splitter.split_documents(docs)
        
        embedding_dim = len(embedding_model.embed_documents(["sample"])[0])
        index = faiss.IndexFlatL2(embedding_dim)
        vectors = FAISS(
            embedding_function=embedding_model,
            index=index,
            docstore=InMemoryDocstore(),
            index_to_docstore_id={}
        )

        texts_to_add = {str(i): doc for i, doc in enumerate(final_documents)}
        vectors.docstore.add(texts_to_add)
        
        with open('embeddings.pkl', 'wb') as f:
            pickle.dump({'model_name': 'sentence-transformers/all-mpnet-base-v2'}, f)
        faiss.write_index(index, 'faiss_index.index')

    return vectors

vectors = load_embeddings()

def handle_user_query(user_query, diarization_content):
    # Modify document chain prompt with diarization context
    document_chain = create_stuff_documents_chain(llm, prompt)
    retriever = vectors.as_retriever()
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    
    # Include diarization content in the context for the question
    context = {'input': user_query, 'diarization_content': diarization_content}
    response = retrieval_chain.invoke(context)
    return response['answer']

# def chatbot_view(request):
#     response = ""
#     if request.method == "POST":
#         user_query = request.POST.get('user_query')
#         response = handle_user_query(user_query, "")
#     return render(request, 'chatbot/chatbot.html', {'response': response})

@api_view(["POST"])
def chatbot_endpoint(request):
    message = request.data.get("message", None)
    file_id = request.data.get("fileId", None)
    audio_file = get_object_or_404(AudioFile, id=file_id, user=request.user)

    # Get diarization content for context
    diarization = getattr(audio_file, 'speaker_diarization', None)

    transcription = getattr(audio_file, 'transcript', None)
    
    diarization_content = ""
    if diarization:
        Ai_context = "\n".join(
            f"{segment.get('speaker')}: {segment.get('text').lstrip()}"
            for segment in diarization.content["segments"]
        )
    else:
        Ai_context = ''.join([segment.get('text', '') for segment in transcription.get("segments", [])])

    # Pass the message and diarization content to the query handler
    response = handle_user_query(message, Ai_context)
    return Response(response)
