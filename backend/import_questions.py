import os
from dotenv import load_dotenv

load_dotenv()

import json
import httpx
import asyncio
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from more_itertools import chunked
from tqdm.asyncio import tqdm_asyncio
from tqdm import tqdm  # 用于 tqdm.write()

API_URL = os.getenv("BASE_URL", "http://localhost:8000") + "/questions"
INPUT_FILE = "questions.json"
FAILED_FILE = "failed.json"
MAX_CONCURRENT_REQUESTS = 10
BATCH_SLEEP_INTERVAL = 0.5


def convert_to_api_format(question):
    q_type = 2 if len(question["correct_answer"]) > 1 else 1
    answers = [
        {"content": val, "is_correct": key in question["correct_answer"]}
        for key, val in question["options"].items()
    ]
    return {
        "original_number": question['number'],
        "type": q_type,
        "question": question["question"],
        "explanation": question["explanation"],
        "answers": answers
    }


@retry(stop=stop_after_attempt(3), wait=wait_fixed(2), retry=retry_if_exception_type(httpx.RequestError))
async def upload_question(client, semaphore, question):
    async with semaphore:
        payload = convert_to_api_format(question)
        try:
            response = await client.post(API_URL, json=payload)
            if response.status_code == 200:
                tqdm.write(f"[✓] 第 {question['number']} 题上传成功")
                return True
            else:
                tqdm.write(f"[×] 第 {question['number']} 题上传失败: {response.status_code} {response.text}")
                return False
        except Exception as e:
            tqdm.write(f"[×] 第 {question['number']} 题请求异常: {type(e).__name__}: {str(e)}")
            raise  # 触发重试


async def upload_all():
    tqdm.write("开始上传所有题目...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        questions = json.load(f)

    failed_questions = []
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    limits = httpx.Limits(
        max_connections=MAX_CONCURRENT_REQUESTS * 2,
        max_keepalive_connections=MAX_CONCURRENT_REQUESTS
    )

    async with httpx.AsyncClient(timeout=60.0, limits=limits) as client:
        success_count = 0
        for batch_index, batch in enumerate(chunked(questions, MAX_CONCURRENT_REQUESTS), start=1):
            tqdm.write(f"\n🚀 正在上传第 {batch_index} 批题目，共 {len(batch)} 道题")
            tasks = [upload_question(client, semaphore, q) for q in batch]
            results = await tqdm_asyncio.gather(*tasks, desc="上传中", ncols=80)
            for q, result in zip(batch, results):
                if not result:
                    failed_questions.append(q)
            success_count += sum(results)
            await asyncio.sleep(BATCH_SLEEP_INTERVAL)

    tqdm.write(f"\n✅ 上传完成：成功 {success_count} / 共 {len(questions)} 道题")
    if failed_questions:
        with open(FAILED_FILE, "w", encoding="utf-8") as f:
            json.dump(failed_questions, f, ensure_ascii=False, indent=2)
        tqdm.write(f"⚠️ 失败的题目已保存到 {FAILED_FILE}，可以稍后重试。")


if __name__ == "__main__":
    asyncio.run(upload_all())
