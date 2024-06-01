from django.shortcuts import render
from utlis import *

# Create your views here.

def todo(request):
    if request.method == 'POST':
        transcript = request.POST.get("""
    We need to finalize the project report by Friday. John, please follow up with the client regarding the feedback.
    Sarah, can you prepare the presentation slides for Monday's meeting? Also, we should arrange a team meeting
    to discuss the new strategy for Q3. Someone needs to organize the team building event next month. This is urgent.
""", '')  # Assuming 'transcript' is the name of the textarea where the user inputs the transcript
        if transcript:
            to_do_list = extract_action_items(transcript)
            return render(request, 'result.html', {'to_do_list': to_do_list})
    return render(request, 'your_template.html')