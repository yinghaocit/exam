import openai
import json

openai.api_key = "hk-05t5d51000055906b2c55b197c599386635d008bb58eac13"
openai.api_base = "https://api.openai-hk.com/v1"

# 独立函数：输入只包含中或英文的题目数据，自动补全另一种语言，返回完整结构
def translate_question_dict(question):

    prompt = (
        "你是一个中英互译助手。用户会提供一份只包含中文或英文的题目数据（question dict），请自动判断语种，并补全另一种语言，返回如下格式：\\n"
        "{\\n  'type': ...,\\n  'question_en': ...,\\n  'question_cn': ...,\\n  'explanation_en': ...,\\n  'explanation_cn': ...,\\n  'answers': [\\n    {'content_en': ..., 'content_cn': ..., 'is_correct': ...}, ...\\n  ]\\n}\\n"
        "只返回JSON，不要多余解释。以下是用户数据：\\n"
        f"{json.dumps(question, ensure_ascii=False)}"
    )
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=[
            {"role": "system", "content": "你是一个专业的中英互译助手。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=2048
    )
    content = response["choices"][0]["message"]["content"].strip()
    try:
        return json.loads(content)
    except Exception as e:
        print("⚠️ 翻译返回不是合法 JSON")
        print("返回内容：", content)
        raise e

