
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from SummarEaseApp.models import AudioFile, Transcript, SpeakerDiarization
from .models import ParticipantEngagement
from collections import defaultdict
from textblob import TextBlob

def categorize_polarity(polarity):
    if polarity > 0.1:
        return "Positive"
    elif polarity < -0.1:
        return "Negative"
    else:
        return "Neutral"

def categorize_subjectivity(subjectivity):
    if subjectivity > 0.5:
        return "Subjective"
    else:
        return "Objective"

def calculate_engagement_metrics(diarization_content):
    speaker_times = defaultdict(float)
    speaker_turns = defaultdict(int)
    current_speaker = None
    current_start = None

    for segment in diarization_content["segments"]:
        speaker = segment.get("speaker", "Unknown")
        start = segment["start"]
        end = segment["end"]

        if current_speaker:
            speaker_times[current_speaker] += start - current_start
            speaker_turns[current_speaker] += 1

        current_speaker = speaker
        current_start = start

    metrics = {}
    for speaker, total_time in speaker_times.items():
        turns = speaker_turns[speaker]
        metrics[speaker] = {
            "total_time": total_time,
            "turns": turns,
            "average_time_per_turn": total_time / turns if turns > 0 else 0
        }
    return metrics

def calculate_speech_rate(diarization_content):
    word_counts = defaultdict(int)
    speaker_times = defaultdict(float)

    # Ensure 'segments' exists and is iterable
    if "segments" not in diarization_content:
        raise ValueError("Transcript content does not contain 'segments' key")

    for segment in diarization_content["segments"]:
        # Ensure 'speaker' key exists and handle missing key scenarios
        speaker = segment.get("speaker", "Unknown")
        text = segment.get("text", "")
        start = segment.get("start", 0)
        end = segment.get("end", 0)

        # Log information for debugging
        # print(f"Processing segment - Speaker: {speaker}, Text: '{text}', Start: {start}, End: {end}")

        if speaker:
            word_counts[speaker] += len(text.split())
            speaker_times[speaker] += end - start

    # Log the counts and times for debugging
    # print("Word Counts:", dict(word_counts))
    # print("Speaker Times:", dict(speaker_times))

    speech_rate = {}
    for speaker, word_count in word_counts.items():
        total_time = speaker_times[speaker]
        # Handle division by zero and log results
        speech_rate[speaker] = {
            "speech_rate": word_count / total_time * 60 if total_time > 0 else 0
        }
        print(f"Speaker: {speaker}, Word Count: {word_count}, Total Time: {total_time}, Speech Rate: {speech_rate[speaker]['speech_rate']}")

    return speech_rate

from collections import defaultdict

def calculate_interruption_frequency(diarization_content):
    interruptions = defaultdict(lambda: defaultdict(int))
    previous_speaker = None

    for segment in diarization_content["segments"]:
        speaker = segment.get("speaker", "Unknown")

        # Skip "Unknown" speakers if you want to ignore them in interruption calculation
        if speaker == "Unknown":
            continue

        if previous_speaker and previous_speaker != speaker:
            interruptions[previous_speaker][speaker] += 1

        previous_speaker = speaker

    # Optionally handle interruptions involving "Unknown" speakers
    if "Unknown" in interruptions:
        unknown_interruptions = interruptions["Unknown"]
        interruptions["Unknown"] = dict(unknown_interruptions)

    return {speaker: dict(interrupted_speakers) for speaker, interrupted_speakers in interruptions.items()}


# def calculate_sentiment(diarization_content):
#     sentiments = defaultdict(lambda: {"polarity": 0, "subjectivity": 0, "count": 0})

#     for segment in diarization_content["segments"]:
#         speaker = segment.get("speaker", "Unknown")
#         text = segment["text"]
#         blob = TextBlob(text)
#         sentiments[speaker]["polarity"] += blob.sentiment.polarity
#         sentiments[speaker]["subjectivity"] += blob.sentiment.subjectivity
#         sentiments[speaker]["count"] += 1

#     sentiment_data = {}
#     for speaker, data in sentiments.items():
#         count = data["count"]
#         average_polarity = data["polarity"] / count if count > 0 else 0
#         average_subjectivity = data["subjectivity"] / count if count > 0 else 0
        
#         sentiment_data[speaker] = {
#             "average_polarity": average_polarity,
#             "average_subjectivity": average_subjectivity,
#             "polarity_label": categorize_polarity(average_polarity),
#             "subjectivity_label": categorize_subjectivity(average_subjectivity)
#         }

#     return sentiment_data

def calculate_sentiment(diarization_content):
    total_sentiments = {"positive": 0, "negative": 0, "neutral": 0}
    total_count = 0

    for segment in diarization_content["segments"]:
        text = segment["text"]
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        total_count += 1
        
        if polarity > 0:
            total_sentiments["positive"] += 1
        elif polarity < 0:
            total_sentiments["negative"] += 1
        else:
            total_sentiments["neutral"] += 1

    average_positive = (total_sentiments["positive"] / total_count) * 100 if total_count > 0 else 0
    average_negative = (total_sentiments["negative"] / total_count) * 100 if total_count > 0 else 0
    average_neutral = (total_sentiments["neutral"] / total_count) * 100 if total_count > 0 else 0

    return {
        "average_positive": round(average_positive, 2),
        "average_negative": round(average_negative, 2),
        "average_neutral": round(average_neutral, 2),
    }



