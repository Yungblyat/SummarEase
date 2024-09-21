import os
import gc
import torch
from django.conf import settings
from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth.decorators import login_required
from .forms import AudioFileForm
from .models import Transcript, SpeakerDiarization,AudioFile
from dotenv import load_dotenv
from SummarEaseFyp.settings import BASE_DIR
from ParticipantEngagement_SentimentAnalysis.views import calculate_sentiment, calculate_speech_rate, calculate_engagement_metrics, calculate_interruption_frequency
from ParticipantEngagement_SentimentAnalysis.models  import ParticipantEngagement
from collections import defaultdict
from Todo_list.views import bert_summarize,extract_advanced_todos
from Todo_list.models import ToDoItem,Summary
from .utils import transcribe, diarize
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
import json
from .serializers import AudioFileSerializer

#Note: Move the ultity function to a seperate utilty file

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def upload_audio(request):
    options = json.loads(request.POST.get("options"))
    if request.method == 'POST':
        form = AudioFileForm(request.POST, request.FILES)
        if form.is_valid():
            audio_file = form.save(commit=False)
            audio_file.user = request.user
            audio_file.save()
            file_path = os.path.join(settings.MEDIA_ROOT, audio_file.file.name)
            try:
                output = main(
                    device="cuda",
                    model="base",
                    audio_file=file_path,
                    transcription_file=True,
                    diarization_file=True
                )
                
                transcript_content = output.get("transcription")
                Transcript.objects.create(audio_file=audio_file, content=transcript_content)

                diarization_content = None
                metrics = None
                speech_rate = None
                interruptions = None
                sentiment = None
                todos = []
                summary = ''
                
                if options["todo"]:
                    transcript_text = ''.join([segment.get('text', '') for segment in transcript_content.get("segments", [])])
                    todos = extract_advanced_todos(transcript_text)

                if options["summary"]:
                    transcript_text = ''.join([segment.get('text', '') for segment in transcript_content.get("segments", [])])
                    summary = bert_summarize(transcript_text)

                if "diarization" in output:
                    SpeakerDiarization.objects.create(audio_file=audio_file, content=output.get("diarization"))
                    diarization_content = output.get("diarization")
                # if options["engagement"] and diarization_content:
                if options["engagement"]:
                    interruptions = calculate_interruption_frequency(diarization_content)
                    metrics = calculate_engagement_metrics(diarization_content)
                    speech_rate = calculate_speech_rate(diarization_content)
                    sentiment = calculate_sentiment(diarization_content)
                    interruptions = convert_defaultdict_to_dict(interruptions)
                    ParticipantEngagement.objects.update_or_create(
                        audio_file=audio_file,
                        defaults={
                            'sentiment': sentiment,
                            'metrics': metrics,
                            'speech_rate': speech_rate,
                            'interruptions': interruptions,
                        }
                    )
                for todo_content in todos:
                    ToDoItem.objects.create(audio_file=audio_file, content=todo_content)

                Summary.objects.update_or_create(
                    audio_file=audio_file,
                    defaults={'content': summary}
                )

                diarization_results = process_diarization_result(diarization_content)

                return JsonResponse({
                    'diarization_results': diarization_results,
                    'transcript_result': ''.join([f"{segment.get('text').lstrip()}" for segment in transcript_content.get("segments", [])]),
                    'sentiment': sentiment if options["engagement"] else None,
                    'audio_file': audio_file.id,
                    'todos': todos if options["todo"] else None,
                    'summary': summary if options["summary"] else None,
                    'interruptions': interruptions if options["engagement"] else None,
                    'speech_rate': speech_rate if options["engagement"] else None,
                    'metrics':metrics if options["engagement"] else None,
                }, status=200)
                
            except RuntimeError:
                return JsonResponse({'error': "Ran out of Memory (try switching device to CPU or change the model)"}, status=500)
            except FileNotFoundError:
                return JsonResponse({'error': "File not found (If the file path is correct, make sure you have ffmpeg installed)"}, status=404)
            finally:
                gc.collect()
                torch.cuda.empty_cache()
        else:
            return JsonResponse({'error': "Invalid form submission"}, status=400)
   
    return JsonResponse({'error': "Invalid request method"}, status=405)



def process_diarization_result(diarization_result):
    if not diarization_result:
        return []

    results = []
    for segment in diarization_result["segments"]:
        speaker = segment.get("speaker", "Unknown")
        text = segment.get("text", "Unknown").lstrip()
        results.append(f"{speaker}: {text}")
    return results

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def history(request):
    # Filter audio files by the authenticated user
    audio_files = AudioFile.objects.filter(user=request.user)
    
    # Serialize the audio files
    serializer = AudioFileSerializer(audio_files, many=True)
    
    # Return the serialized data
    return Response({'audio_files': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def show_result_for_file(request):
    file_id = request.data.get('audio_file_id')
    audio_file = get_object_or_404(AudioFile, id=file_id, user=request.user)
    transcription = getattr(audio_file, 'transcript', None)
    diarization = getattr(audio_file, 'speaker_diarization', None)
    if transcription:
        transcript_result = ''.join([f"{segment.get('text').lstrip()}" for segment in transcription.content["segments"]])

    if diarization:
        diarization_results = [f"{segment.get('speaker')}: {segment.get('text').lstrip()}" for segment in diarization.content["segments"]]

        # Fetch summary if available
        summary_instance = Summary.objects.filter(audio_file=audio_file).first()
    if summary_instance:
        summary = summary_instance.content

        # Fetch engagement metrics if available
        engagement = ParticipantEngagement.objects.filter(audio_file=audio_file).first()
    if engagement:
        # metrics = engagement.metrics
        speech_rate = engagement.speech_rate
        interruptions = engagement.interruptions
        sentiment = engagement.sentiment

        # Fetch to-do items if available
    todos_queryset = ToDoItem.objects.filter(audio_file=audio_file)
    todos = [todo.content for todo in todos_queryset if todos_queryset is not None]

    # Prepare data for the response
    response_data = {
        'transcript_result': transcript_result if transcription else None,
        'diarization_results': diarization_results if diarization else None,
        # 'metrics': metrics,
        'speech_rate': speech_rate if engagement else None,
        'interruptions': interruptions if engagement else None,
        'sentiment': sentiment if engagement else None,
        'summary': summary if summary else None,
        'todos': todos if todos else None,
    }
    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def delete_audio_file(request):
    audio_file_id = request.data.get('audio_file_id')
    print(audio_file_id)
    if audio_file_id:
        audio_file = get_object_or_404(AudioFile, id=audio_file_id, user=request.user)
        if audio_file:
            audio_file.delete()
    return Response("File and related data has been terminated.", status=status.HTTP_200_OK)


