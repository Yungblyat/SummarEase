from django import forms

class EmailForm(forms.Form):
    emails = forms.CharField(widget=forms.Textarea, help_text="Enter emails separated by commas.")
