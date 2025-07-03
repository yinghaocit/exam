from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `question` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `type` INT NOT NULL COMMENT '题型（单选、多选）',
    `question_en` LONGTEXT NOT NULL COMMENT '英文问题',
    `question_cn` LONGTEXT NOT NULL COMMENT '中文问题',
    `explanation_en` LONGTEXT NOT NULL COMMENT '英文解析',
    `explanation_cn` LONGTEXT NOT NULL COMMENT '中文解析',
    `original_number` INT(100) COMMENT '原题号'
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `answer` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `content_en` LONGTEXT NOT NULL COMMENT '英文选项内容',
    `content_cn` LONGTEXT NOT NULL COMMENT '中文选项内容',
    `is_correct` BOOL NOT NULL COMMENT '是否为正确答案',
    `question_id` INT NOT NULL,
    CONSTRAINT `fk_answer_question_9199b639` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `aerich` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `version` VARCHAR(255) NOT NULL,
    `app` VARCHAR(100) NOT NULL,
    `content` JSON NOT NULL
) CHARACTER SET utf8mb4;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
