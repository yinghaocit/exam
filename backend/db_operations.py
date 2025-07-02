from backend.models import Question, Option
from tortoise.transactions import atomic

@atomic()
async def insert_question(question_data):
    question = await Question.create(
        type=question_data["type"],
        question=question_data["question"],
        explanation=question_data.get("explanation"),
        difficulty=question_data.get("difficulty")
    )
    for option_data in question_data["options"]:
        await Option.create(
            question=question,
            text=option_data["text"],
            is_correct=option_data["is_correct"]
        )
    return {"message": "题目已成功添加"}

async def fetch_all_questions():
    questions = await Question.all().prefetch_related("options")
    result = []
    for question in questions:
        result.append({
            "id": question.id,
            "type": question.type,
            "question": question.question,
            "explanation": question.explanation,
            "difficulty": question.difficulty,
            "options": [{"text": option.text, "is_correct": option.is_correct} for option in question.options]
        })
