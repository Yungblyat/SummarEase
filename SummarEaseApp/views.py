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
    load_dotenv(".env")
    auth_key = os.getenv("AUTH")
    transcribe_ = transcribe(device, model, audio_file)
    output = {"transcription": transcribe_}
    if diarization_file:
        output["diarization"] = diarize(auth_key, device, audio_file, transcribe_)
    return output

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
                start_time = time.time()
                diarization_selected = request.POST.get('diarizationCheckbox')
                output = main(device="cuda", model="base", audio_file=file_path, transcription_file=True, diarization_file=diarization_selected)
                print("Processing took: {} seconds".format(time.time() - start_time))

                # Save transcription result
                transcript_result = ''.join([f"{segment.get('text').lstrip()}" for segment in output["transcription"]["segments"]])
                Transcript.objects.create(audio_file=audio_file, content=output["transcription"])

                # Save diarization result if selected
                if "diarization" in output:
                    SpeakerDiarization.objects.create(audio_file=audio_file, content=output["diarization"])

                diarization_results = process_diarization_result(output.get("diarization", None))
    
                return render(request, 'SummarEaseApp/results.html', {
                    'audio_file': audio_file,
                    'diarization_results': diarization_results,
                    'transcript_result': transcript_result
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
        return 

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
    selected_audio_file = None

    if audio_file_id:
        selected_audio_file = get_object_or_404(AudioFile, id=audio_file_id, user=request.user)
        transcript = selected_audio_file.transcript
        diarization = getattr(selected_audio_file, 'speaker_diarization', None)  # Use getattr to handle absence

        transcript_result = ''.join([f"{segment.get('text').lstrip()}" for segment in transcript.content["segments"]]) if transcript else None
        diarization_results = [f"{segment.get('speaker')}: {segment.get('text').lstrip()}" for segment in diarization.content["segments"]] if diarization else None

    context = {
        'audio_files': audio_files,
        'audio_file': selected_audio_file,
        'transcript_result': transcript_result,
        'diarization_results': diarization_results,
    }

    return render(request, 'SummarEaseApp/results.html', context)

