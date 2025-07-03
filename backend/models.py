from tortoise.models import Model
from tortoise import fields

class Question(Model):
    id = fields.IntField(pk=True)
    original_number = fields.IntField(description="原题号")
    type = fields.IntField(description="题型（单选、多选）")
    question_en = fields.TextField(description="英文问题")
    question_cn = fields.TextField(description="中文问题")
    explanation_en = fields.TextField(description="英文解析")
    explanation_cn = fields.TextField(description="中文解析")

class Answer(Model):
    id = fields.IntField(pk=True)
    question = fields.ForeignKeyField("models.Question", related_name="answers")
    content_en = fields.TextField(description="英文选项内容")
    content_cn = fields.TextField(description="中文选项内容")
    is_correct = fields.BooleanField(description="是否为正确答案")
