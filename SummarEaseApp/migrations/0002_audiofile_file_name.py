# Generated by Django 5.0.8 on 2024-09-18 14:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("SummarEaseApp", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="audiofile",
            name="file_name",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]