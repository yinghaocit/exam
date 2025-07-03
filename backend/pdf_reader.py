import fitz
import re
import json

def extract_questions(pdf_path):
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text() for page in doc])

    # Step 1: 粗分每题
    raw_blocks = re.split(r"\bQUESTION\s+(\d+)\b", text)
    pairs = list(zip(raw_blocks[1::2], raw_blocks[2::2]))

    questions = []
    for number, block in pairs:
        number = int(number)

        # Step 2: 动态提取选项（支持 A-Z 多个）
        # 正则格式：匹配 "\nA. xxx\nB. xxx\n...Correct Answer"
        option_pattern = re.compile(r"\n([A-Z])\.\s+(.*?)(?=\n[A-Z]\.|\nCorrect Answer:)", re.DOTALL)
        option_matches = option_pattern.findall(block)

        if not option_matches:
            print(f"[跳过] 第 {number} 题无选项")
            continue

        options = {key: val.strip() for key, val in option_matches}

        # 提取题干（位于 A. 前）
        first_option_pos = block.find(f"{option_matches[0][0]}.")
        question_text = block[:first_option_pos].strip()

        # 提取正确答案（支持多选）
        correct_match = re.search(r"Correct Answer:\s+([A-Z]+)", block)
        if not correct_match:
            print(f"[跳过] 第 {number} 题无正确答案")
            continue
        correct_answer = correct_match.group(1)

        # 提取解析
        explanation_match = re.search(r"Explanation:\s*(.+)", block, re.DOTALL)
        explanation = explanation_match.group(1).strip() if explanation_match else ""

        questions.append({
            "number": number,
            "question": question_text,
            "options": options,
            "correct_answer": list(correct_answer),
            "explanation": explanation
        })

    print(f"✅ 共提取 {len(questions)} 道题")
    return questions


if __name__ == "__main__":
    questions = extract_questions("../develop/AIF-C01.pdf")

    with open("questions01.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("✅ 已保存为 questions.json")
