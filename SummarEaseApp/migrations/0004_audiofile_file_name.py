# Generated by Django 5.0.8 on 2024-09-18 15:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("SummarEaseApp", "0003_remove_audiofile_file_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="audiofile",
            name="file_name",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]