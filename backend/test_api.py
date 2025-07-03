import requests
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

def test_insert_question(question_data):
    response = requests.post(f"{BASE_URL}/questions/", json=question_data)
    print("插入问题状态码:", response.status_code)
    print("插入问题原始响应:", response.text)
    try:
        result = response.json()
        print("插入问题响应 JSON:", result)
        return result.get("id")
    except Exception as e:
        print("解析 JSON 出错:", e)
        return None

def test_get_question(question_id):
    response = requests.get(f"{BASE_URL}/questions/{question_id}")
    print("获取问题状态码:", response.status_code)
    try:
        print("获取问题响应 JSON:", response.json())
    except Exception as e:
        print("获取问题解析 JSON 出错:", e)

def run_demo():
    # 新版接口 demo 测试数据
    new_demo_data = {
        "type": 1,
        "question": (
            "A company makes forecasts each quarter to decide how to optimize operations to meet expected demand.\n"
            "The company uses ML models to make these forecasts.\n"
            "An AI practitioner is writing a report about the trained ML models to provide transparency and explainability to company stakeholders.\n"
            "What should the AI practitioner include in the report to meet the transparency and explainability requirements?"
        ),
        "explanation": (
            "Partial Dependence Plots (PDPs) are a powerful tool for understanding and explaining how the features in a machine learning model impact predictions. "
            "They are often used to meet transparency and explainability requirements for stakeholders."
        ),
        "answers": [
            {"content": "Code for model training", "is_correct": False},
            {"content": "Partial dependence plots (PDPs)", "is_correct": True},
            {"content": "Sample data for training", "is_correct": False},
            {"content": "Model convergence tables", "is_correct": False}
        ]
    }
    question_id = test_insert_question(new_demo_data)
    if question_id:
        test_get_question(question_id)
    else:
        print("插入问题失败，无法测试获取问题接口。")

if __name__ == "__main__":
    run_demo()
