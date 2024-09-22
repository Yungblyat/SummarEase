from nltk.corpus import stopwords
from rake_nltk import Rake

def extract_advanced_todos(transcript_text):
    # Initialize RAKE with NLTK stopwords
    rake = Rake()
    # Extract keywords/phrases
    rake.extract_keywords_from_text(transcript_text)
    # Get ranked phrases with scores
    ranked_phrases = rake.get_ranked_phrases_with_scores()

    # Define a threshold score for selecting keywords
    threshold = 4.0
    todos = [phrase for score, phrase in ranked_phrases if score > threshold]
    return todos

sample_text = """
Meeting Notes:
1. Review the latest project milestones and deadlines.
2. Task: Complete the documentation by end of the week.
3. Follow up with the client regarding the feedback on the new feature.
4. Action item: Set up a meeting with the marketing team next Tuesday.
5. Discuss the budget allocation for the upcoming quarter.
6. Todo: Prepare a presentation for the board meeting.
7. Review the performance metrics for the last quarter.
8. Plan the product launch event.
9. Deadline: Submit the financial report by the 15th of this month.
10. Action: Update the project management tool with the latest changes.
"""

if __name__ == "__main__":
    todos = extract_advanced_todos(sample_text)
    print("Extracted TODOs:")
    for todo in todos:
        print(todo)
