import json
import httpx
import asyncio
import traceback

API_URL = "http://localhost:8000/questions/"
INPUT_FILE = "questions.json"
MAX_CONCURRENT_REQUESTS = 5  # 并发数量上限

def convert_to_api_format(question):
    q_type = 2 if len(question["correct_answer"]) > 1 else 1
    answers = [
        {"content": val, "is_correct": key in question["correct_answer"]}
        for key, val in question["options"].items()
    ]
    return {
        "type": q_type,
        "question": question["question"],
        "explanation": question["explanation"],
        "answers": answers
    }

async def upload_question(client, semaphore, question):
    async with semaphore:
        payload = convert_to_api_format(question)
        try:
            response = await client.post(API_URL, json=payload)
            if response.status_code == 200:
                print(f"[✓] 第 {question['number']} 题上传成功")
                return True
            else:
                print(f"[×] 第 {question['number']} 题上传失败: {response.status_code} {response.text}")
                return False
        except Exception as e:
            print(f"[×] 第 {question['number']} 题请求异常: {type(e).__name__}: {str(e)}")
            traceback.print_exc()
            return False

async def upload_all():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        questions = json.load(f)

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    async with httpx.AsyncClient(timeout=60.0) as client:
        tasks = [upload_question(client, semaphore, q) for q in questions]
        results = await asyncio.gather(*tasks)

    success_count = sum(results)
    print(f"\n✅ 上传完成：成功 {success_count} / 共 {len(questions)} 道题")

if __name__ == "__main__":
    asyncio.run(upload_all())
