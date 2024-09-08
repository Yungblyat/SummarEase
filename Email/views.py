from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.http import JsonResponse, HttpResponse
from SummarEaseApp.models import AudioFile,Transcript,SpeakerDiarization
from ParticipantEngagement_SentimentAnalysis.models import ParticipantEngagement
from Todo_list.models import Summary,ToDoItem
from django.template.loader import render_to_string
from io import BytesIO
from xhtml2pdf import pisa
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.shortcuts import render, redirect,get_object_or_404
import dotenv,os,re

def validate_email(email):
    email_regex = re.compile(
        r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    )
    return re.match(email_regex, email) is not None

def send_email(request):
    audio_file_id = request.POST.get('audio_file_id')
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
    email_addresses_str = request.POST.get('email', '')
    email_addresses = [email.strip() for email in email_addresses_str.split(',') if email.strip()]

    # Filter out invalid email addresses
    valid_email_addresses = [email for email in email_addresses if validate_email(email)]

    email_subject = f"Meeting Results for {selected_audio_file.file.name}"
    email_body = render_to_string('email.html', {
        'audio_file': selected_audio_file,
        'transcript_result': transcript_result,
        'diarization_results': diarization_results,
        'metrics': metrics,
        'speech_rate': speech_rate,
        'interruptions': interruptions,
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
        return JsonResponse({'status': 'Email sent successfully'})
    except Exception as e:
        print(f"Error sending email: {e}")
        return JsonResponse({'status': 'Error sending email', 'error': str(e)}, status=500)



def generate_pdf(request):
    if request.method == 'POST':
        audio_file_id = request.POST.get('audio_file_id')
        audio_file = AudioFile.objects.get(id=audio_file_id)

        transcript = Transcript.objects.filter(audio_file=audio_file).first()
        diarization = SpeakerDiarization.objects.filter(audio_file=audio_file).first()
        engagement = ParticipantEngagement.objects.filter(audio_file=audio_file).first()
        transcript_text = ''.join([f"{segment.get('text').lstrip()}" for segment in transcript.content["segments"]]) if transcript else None
        diarization_text = [f"{segment.get('speaker')}: {segment.get('text').lstrip()}" for segment in diarization.content["segments"]] if diarization else None
        todos_queryset = ToDoItem.objects.filter(audio_file=audio_file)
        if todos_queryset:
            todos = [todo.content for todo in todos_queryset]
        metrics = engagement.metrics if engagement else None
        Summarize=Summary.objects.filter(audio_file=audio_file).first()
        if Summarize:
            Summarize=Summarize.content
        
        metrics = engagement.metrics if engagement else None
        speech_rate = engagement.speech_rate if engagement else None
        interruptions = engagement.interruptions if engagement else None
        sentiment = engagement.sentiment if engagement else None

        # Render the template to HTML
        html = render_to_string('pdf_template.html', {
            'audio_file': audio_file,
        'transcript_result': transcript_text,
        'diarization_results': diarization_text,
        'metrics': metrics,
        'speech_rate': speech_rate,
        'interruptions': interruptions,
        'sentiment': sentiment,
        'todos':todos,
        'summary':Summarize
        })

        # Convert the HTML to PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{audio_file.file.name}_results.pdf"'

        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode('UTF-8')), result)
        
        if not pdf.err:
            response.write(result.getvalue())
            return response
        else:
            return HttpResponse('Error generating PDF', status=500)
    
    return HttpResponse('Invalid request', status=400)

