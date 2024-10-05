from .models import Transcript, AudioFile,SpeakerDiarization
import whisperx

def get_transcript(audio_file_id):
    try:
        audio_file = AudioFile.objects.get(id=audio_file_id)
        transcript = Transcript.objects.get(audio_file=audio_file)
        return transcript.content  # This is a dictionary containing the transcript data
    except AudioFile.DoesNotExist:
        return None
    except Transcript.DoesNotExist:
        return None

def get_diarization(audio_file_id):
    try:
        audio_file = AudioFile.objects.get(id=audio_file_id)
        diarization = SpeakerDiarization.objects.get(audio_file=audio_file)
        return diarization.content  # This is a dictionary containing the diarization data
    except AudioFile.DoesNotExist:
        return None
    except SpeakerDiarization.DoesNotExist:
        return None
    
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