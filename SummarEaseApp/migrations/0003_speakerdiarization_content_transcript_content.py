# Generated by Django 5.0.6 on 2024-05-26 07:57

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("SummarEaseApp", "0002_audiofile_user_speakerdiarization_transcript"),
    ]

    operations = [
        migrations.AddField(
            model_name="speakerdiarization",
            name="content",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="transcript",
            name="content",
            field=models.TextField(blank=True, null=True),
        ),
    ]