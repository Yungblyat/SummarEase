# Generated by Django 5.0.8 on 2024-09-18 15:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("SummarEaseApp", "0004_audiofile_file_name"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="audiofile",
            name="file_name",
        ),
    ]