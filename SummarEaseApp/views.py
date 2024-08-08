import os
import time
import gc
import torch
import whisperx
from django.http import HttpResponse
from django.conf import settings
from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth.decorators import login_required
from .forms import AudioFileForm
from .models import Transcript, SpeakerDiarization,AudioFile
from dotenv import load_dotenv
from SummarEaseFyp.settings import BASE_DIR
from ParticipantEngagement_SentimentAnalysis.views import calculate_engagement_metrics, calculate_speech_rate, calculate_interruption_frequency, calculate_sentiment
from ParticipantEngagement_SentimentAnalysis.models  import ParticipantEngagement
from collections import defaultdict
from Todo_list.views import bert_summarize,extract_advanced_todos
from Todo_list.models import ToDoItem,Summary

#Note: Move the ultity function to a seperate utilty file
def transcribe(device: str, model, audio_file: str, batch_size=16, compute_type="int8") -> dict:
    model = whisperx.load_model(model, device, compute_type=compute_type)
    audio = whisperx.load_audio(audio_file)
    result = model.transcribe(audio, batch_size=batch_size)
    return result

def diarize(auth_key: str, device: str, audio, transcription_result) -> str:
    result = transcription_result
    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
    result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
    diarize_model = whisperx.DiarizationPipeline(use_auth_token=auth_key, device=device)
    diarize_segments = diarize_model(audio)
    result = whisperx.assign_word_speakers(diarize_segments, result)
    return result

def main(device: str, model: str, audio_file, transcription_file: bool = False, diarization_file: bool = False) -> dict:
    load_dotenv(f"{BASE_DIR}\\.env")
    auth_key = os.getenv("AUTH")
    transcribe_ = transcribe(device, model, audio_file)
    output = {"transcription": transcribe_}
    if diarization_file:
        output["diarization"] = diarize(auth_key, device, audio_file, transcribe_)
    return output

def convert_defaultdict_to_dict(d):
    if isinstance(d, defaultdict):
        d = {k: convert_defaultdict_to_dict(v) for k, v in d.items()}
    return d

# @login_required
def upload_audio(request):
    if request.method == 'POST':
        form = AudioFileForm(request.POST, request.FILES)
        if form.is_valid():
            audio_file = form.save(commit=False)
            audio_file.user = request.user
            audio_file.save()
            file_path = os.path.join(settings.MEDIA_ROOT, audio_file.file.name)
            try:
                output = main(device="cuda", model="base", audio_file=file_path, transcription_file=True, diarization_file=request.POST.get('diarizationCheckbox'))
                
                transcript_content = output["transcription"]
                Transcript.objects.create(audio_file=audio_file, content=transcript_content)

                diarization_content = None
                metrics = None
                speech_rate = None
                interruptions = None
                sentiment = None
                todos=[]
                summary=''
                
                if request.POST.get('Todo_ListCheckbox'):
                     transcript_text = ''.join([segment.get('text', '') for segment in transcript_content.get("segments", [])])
                     todos = extract_advanced_todos(transcript_text)

                if request.POST.get('SummarizeCheckbox'):
                    transcript_text = ''.join([segment.get('text', '') for segment in transcript_content.get("segments", [])])
                    summary = bert_summarize(transcript_text)

                if "diarization" in output:
                    SpeakerDiarization.objects.create(audio_file=audio_file, content=output["diarization"])
                    diarization_content = output["diarization"]

                if request.POST.get('engagementCheckbox') and diarization_content:
                    metrics = calculate_engagement_metrics(diarization_content)
                    speech_rate = calculate_speech_rate(diarization_content)
                    interruptions = calculate_interruption_frequency(diarization_content)
                    sentiment = calculate_sentiment(diarization_content)

                    interruptions = convert_defaultdict_to_dict(interruptions)

                    ParticipantEngagement.objects.update_or_create(
                        audio_file=audio_file,
                        defaults={
                            'metrics': metrics,
                            'speech_rate': speech_rate,
                            'interruptions': interruptions,
                            'sentiment': sentiment
                        }
                    )
                
                for todo_content in todos:
                    ToDoItem.objects.create(audio_file=audio_file, content=todo_content)

                Summary.objects.update_or_create(
                audio_file=audio_file,
                defaults={'content': summary}
            )

                diarization_results = process_diarization_result(diarization_content)

                return render(request, 'SummarEaseApp/results.html', {
                    'diarization_results': diarization_results,
                    'transcript_result': ''.join([f"{segment.get('text').lstrip()}" for segment in transcript_content.get("segments", [])]),
                    'metrics': metrics if request.POST.get('engagementCheckbox') else None,
                    'speech_rate': speech_rate if request.POST.get('engagementCheckbox') else None,
                    'interruptions': interruptions if request.POST.get('engagementCheckbox') else None,
                    'sentiment': sentiment if request.POST.get('engagementCheckbox') else None,
                    'audio_file': audio_file,
                    'todos': todos if request.POST.get('Todo_ListCheckbox') else None,
                    'summary': summary if request.POST.get('SummarizeCheckbox') else None
                })
                
            except RuntimeError:
                return render(request, 'SummarEaseApp/error.html', {'error': "Ran out of Memory (try switching device to cpu or change the model)"})
            except FileNotFoundError:
                return render(request, 'SummarEaseApp/error.html', {'error': "File not found (If the file path is correct, make sure you have ffmpeg installed)"})
            finally:
                gc.collect()
                torch.cuda.empty_cache()
    else:
        form = AudioFileForm()
   
    return render(request, 'SummarEaseApp/upload.html', {'form': form})



def process_diarization_result(diarization_result):
    if not diarization_result:
        return []

    results = []
    for segment in diarization_result["segments"]:
        speaker = segment.get("speaker", "Unknown")
        text = segment.get("text", "Unknown").lstrip()
        results.append(f"{speaker}: {text}")
    return results

@login_required
def transcript_list(request):
    audio_files = AudioFile.objects.filter(user=request.user)
    return render(request, 'SummarEaseApp/transcript_list.html', {'audio_files': audio_files})

@login_required
def transcript_list_and_view(request, audio_file_id=None):
    audio_files = AudioFile.objects.filter(user=request.user)
    
    transcript_result = None
    diarization_results = None
    metrics =None
    speech_rate=None
    interruptions=None
    sentiment= None
    selected_audio_file = None

    if audio_file_id:
        selected_audio_file = get_object_or_404(AudioFile, id=audio_file_id, user=request.user)
        transcript = getattr(selected_audio_file, 'transcript', None)
        diarization = getattr(selected_audio_file, 'speaker_diarization', None)  # Use getattr to handle absence

        transcript_result = ''.join([f"{segment.get('text').lstrip()}" for segment in transcript.content["segments"]]) if transcript else None
        diarization_results = [f"{segment.get('speaker')}: {segment.get('text').lstrip()}" for segment in diarization.content["segments"]] if diarization else None
        
        # Fetch engagement metrics
        Summarize=Summary.objects.filter(audio_file=selected_audio_file).first()
        if Summarize:
            Summarize=Summarize.content

        engagement = ParticipantEngagement.objects.filter(audio_file=selected_audio_file).first()
        if engagement:
                metrics =engagement.metrics
                speech_rate= engagement.speech_rate
                interruptions= engagement.interruptions
                sentiment= engagement.sentiment
    
        todos_queryset = ToDoItem.objects.filter(audio_file=selected_audio_file)
        if todos_queryset:
            todos = [todo.content for todo in todos_queryset]
    context = {
        'audio_files': audio_files,
        'audio_file': selected_audio_file,
        'transcript_result': transcript_result,
        'diarization_results': diarization_results,
        'interruptions': interruptions,
        'sentiment': sentiment,
        'speech_rate': speech_rate,
        'metrics':metrics,
        'summary':Summarize,
        'todos':todos
        
    }

    return render(request, 'SummarEaseApp/results.html', context)

