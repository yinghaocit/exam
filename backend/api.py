from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models import Question, Answer
from translator import translate_question_dict
import random
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ExamRequest(BaseModel):
    types: List[int]
    count_per_type: List[int]


@app.post("/questions")
async def create_question(question: dict):
    """
    接收仅包含 type、question、explanation、answers 的 dict，自动补全中英文结构并入库。
    """
    original_number = question.get("original_number")
    if original_number is not None:
        existing_question = await Question.filter(original_number=original_number).first()
        if existing_question:
            return {"id": existing_question.id}

    full_question = await translate_question_dict(question)

    question_obj = await Question.create(
        original_number=original_number,
        type=full_question["type"],
        question_en=full_question["question_en"],
        question_cn=full_question["question_cn"],
        explanation_en=full_question["explanation_en"],
        explanation_cn=full_question["explanation_cn"]
    )
    for answer in full_question["answers"]:
        await Answer.create(
            question=question_obj,
            content_en=answer["content_en"],
            content_cn=answer["content_cn"],
            is_correct=answer["is_correct"]
        )
    return {"id": question_obj.id}

@app.get("/questions/{question_id}")
async def get_question(question_id: int):
    question = await Question.filter(id=question_id).prefetch_related("answers").first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    answers = await Answer.filter(question=question)
    return {
        "id": question.id,
        "type": question.type,
        "question_en": question.question_en,
        "question_cn": question.question_cn,
        "explanation_en": question.explanation_en,
        "explanation_cn": question.explanation_cn,
        "answers": [
            {
                "content_en": answer.content_en,
                "content_cn": answer.content_cn,
                "is_correct": answer.is_correct
            } for answer in answers
        ]
    }

@app.post("/generate_exam")
async def generate_exam(req: ExamRequest):
    if len(req.types) != len(req.count_per_type):
        raise HTTPException(status_code=400, detail="types 和 count_per_type 长度不一致")

    result = []
    """
    根据题型和数量获取随机题目，并打乱答案选项顺序。

    参数：
    - type: 题型（例如单选、多选）
    - count: 获取题目的数量

    返回：
    - 包含题目和答案选项的列表
    """
    try:
        # 查询指定题型的题目
        for qtype, count in zip(req.types, req.count_per_type):
            #  如果count为0，则跳过该题型
            if count <= 0:
                continue
            questions = await Question.filter(type=qtype).prefetch_related("answers")
            random.shuffle(questions)
            questions = questions[:count]
            if not questions:
                raise HTTPException(status_code=404, detail="未找到符合条件的题目")

            for question in questions:
                # 获取答案并打乱顺序
                answers = await Answer.filter(question_id=question.id).all()
                random.shuffle(answers)
                # 构造题目和答案的返回结构
                result.append({
                    "id": question.id,
                    "type": question.type,
                    "question_cn": question.question_cn,
                    "question_en": question.question_en,
                    "explanation_cn": question.explanation_cn,
                    "explanation_en": question.explanation_en,
                    "answers": [
                        {
                            "id": answer.id,
                            "content_cn": answer.content_cn,
                            "content_en": answer.content_en,
                            "is_correct": answer.is_correct
                        } for answer in answers
                    ]
                })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")
