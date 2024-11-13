from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.http import JsonResponse, HttpResponse
from SummarEaseApp.models import AudioFile,Transcript,SpeakerDiarization
from ParticipantEngagement_SentimentAnalysis.models import ParticipantEngagement
from Todo_list.models import Summary,ToDoItem
from io import BytesIO
from xhtml2pdf import pisa
from django.core.mail import send_mail
from django.shortcuts import render, redirect,get_object_or_404
import dotenv,os,re
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from Todo_list.models import Summary, ToDoItem
import re, os
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from SummarEaseFyp.settings import BASE_DIR
from dotenv import load_dotenv

load_dotenv(f"{BASE_DIR}\\.env")

def validate_email(email):
    email_regex = re.compile(
        r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    )
    return re.match(email_regex, email) is not None

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_email(request):
    audio_file_id = request.data.get('file_id')
    email_addresses_str = ",".join(request.data.get('emails'))
    selected_audio_file = get_object_or_404(AudioFile, id=audio_file_id, user=request.user)
    transcript = getattr(selected_audio_file, 'transcript', None)
    diarization = getattr(selected_audio_file, 'speaker_diarization', None)
    engagement = ParticipantEngagement.objects.filter(audio_file=selected_audio_file).first()

    transcript_result = ''.join([f"{segment.get('text').lstrip()}" for segment in transcript.content["segments"]]) if transcript else None
    diarization_results = [f"{segment.get('speaker')}: {segment.get('text').lstrip()}" for segment in diarization.content["segments"]] if diarization else None

    todos_queryset = ToDoItem.objects.filter(audio_file=selected_audio_file)
    todos = [todo.content for todo in todos_queryset] if todos_queryset else []
    Summarize = Summary.objects.filter(audio_file=selected_audio_file).first()
    Summarize = Summarize.content if Summarize else None

    metrics = engagement.metrics if engagement else None
    speech_rate = engagement.speech_rate if engagement else None
    interruptions = engagement.interruptions if engagement else None
    sentiment = engagement.sentiment if engagement else None

    # Retrieve and process email addresses from the form
    email_addresses = [email.strip() for email in email_addresses_str.split(',') if email.strip()]

    # Filter out invalid email addresses
    valid_email_addresses = [email for email in email_addresses]

    email_subject = f"Meeting Results for {selected_audio_file.file.name}"
    email_body = render_to_string('email.html', {
        'audio_file': selected_audio_file,
        'sentiment': sentiment,
        'todos': todos,
        'summary': Summarize
    })

    # Debugging output
    print(f"Sending email to: {valid_email_addresses}")
    try:
        send_mail(
            email_subject,
            '',  # Body is handled in the HTML email
            os.getenv("EMAIL_HOST_USER"),  # Sender email
            valid_email_addresses,  # List of recipient emails
            html_message=email_body,  # HTML body
            fail_silently=False,
        )
        return Response({'status': 'Email sent successfully'})
    except Exception as e:
        print(f"Error sending email: {e}")
        return Response({'status': 'Error sending email', 'error': str(e)}, status=500)

@api_view(["POST"])
def generate_pdf(request):
    # Get audio_file_id from the request
    audio_file_id = request.data.get('file_id')
    if not audio_file_id:
        return JsonResponse({'error': 'Audio file ID not provided'}, status=400)

    try:
        # Retrieve associated data based on the audio_file_id
        audio_file = AudioFile.objects.get(id=audio_file_id)
        transcript = Transcript.objects.filter(audio_file=audio_file).first()
        diarization = SpeakerDiarization.objects.filter(audio_file=audio_file).first()
        engagement = ParticipantEngagement.objects.filter(audio_file=audio_file).first()
        todos_queryset = ToDoItem.objects.filter(audio_file=audio_file)
        summarize = Summary.objects.filter(audio_file=audio_file).first()

        # Process content for the PDF
        transcript_text = ''.join([f"{segment.get('text').lstrip()}" for segment in transcript.content["segments"]]) if transcript else None
        diarization_text = [f"{segment.get('speaker')}: {segment.get('text').lstrip()}" for segment in diarization.content["segments"]] if diarization else None
        todos = [todo.content for todo in todos_queryset] if todos_queryset else []
        metrics = engagement.metrics if engagement else None
        speech_rate = engagement.speech_rate if engagement else None
        interruptions = engagement.interruptions if engagement else None
        sentiment = engagement.sentiment if engagement else None
        summary = summarize.content if summarize else None

        # Render the HTML template with context data
        html = render_to_string('pdf_template.html', {
            'audio_file': audio_file,
            'transcript_result': transcript_text,
            'diarization_results': diarization_text,
            'metrics': metrics,
            'speech_rate': speech_rate,
            'interruptions': interruptions,
            'sentiment': sentiment,
            'todos': todos,
            'summary': summary
        })

        # Convert the rendered HTML to PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{audio_file.file.name}_results.pdf"'

        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode('UTF-8')), result)

        # Check for PDF generation errors
        if pdf.err:
            return JsonResponse({'error': 'Error generating PDF'}, status=500)

        # Write PDF content to the response
        response.write(result.getvalue())
        return response

    except AudioFile.DoesNotExist:
        return JsonResponse({'error': 'Audio file not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


