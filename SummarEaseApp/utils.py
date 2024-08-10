from .models import Transcript, AudioFile,SpeakerDiarization

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