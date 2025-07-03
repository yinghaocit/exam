import json
import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

load_dotenv()

# 初始化异步 OpenAI 客户端
client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    timeout=60.0
)

# 加入重试机制
@retry(stop=stop_after_attempt(3), wait=wait_fixed(2), retry=retry_if_exception_type(Exception))
async def translate_question_dict(question):
    print("开始翻译题目数据...")
    prompt = (
        "你是一个中英互译助手。用户会提供一份只包含中文或英文的题目数据（question dict），请自动判断语种，并补全另一种语言，返回如下格式：\n"
        "{\n  'type': ..., \n  'question_en': ..., \n  'question_cn': ..., \n  'explanation_en': ..., \n  'explanation_cn': ..., \n  'answers': [\n    {'content_en': ..., 'content_cn': ..., 'is_correct': ...}, ...\n  ]\n}\n"
        "只返回 JSON，禁止输出说明或注释。以下是用户数据：\n"
        f"{json.dumps(question, ensure_ascii=False)}"
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo-0613",
            messages=[
                {"role": "system", "content": "你是一个专业的中英互译助手。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2048
        )
        content = response.choices[0].message.content.strip()

        print("翻译完成，开始解析 JSON...")
        # 尝试修复非法 JSON（替换单引号）
        try:
            return json.loads(content)
        except:
            fixed = content.replace("'", '"')
            return json.loads(fixed)
    except Exception as e:
        print("⚠️ 翻译请求失败：", type(e).__name__, str(e))
        raise e
