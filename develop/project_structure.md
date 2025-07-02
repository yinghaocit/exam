# 项目目录结构

## 根目录
- `requirements.md`: 需求文档
- `backend/`: 后端代码目录
  - `main.py`: FastAPI 应用入口
  - `models.py`: 数据库模型定义
  - `schemas.py`: 数据验证和序列化
  - `crud.py`: 数据库操作逻辑
  - `services/`: 服务目录
    - `translation.py`: MCP 翻译工具集成
    - `question_generation.py`: 出题逻辑
  - `tests/`: 测试目录
    - `test_api.py`: API 测试
- `frontend/`: 前端代码目录
  - `src/`: React 源代码
    - `components/`: React 组件
    - `pages/`: 页面组件
    - `services/`: 前端 API 调用逻辑
  - `public/`: 静态资源
- `database/`: 数据库目录
  - `init.sql`: 数据库初始化脚本
- `deploy/`: 部署相关目录
  - `Dockerfile`: Docker 配置文件
  - `docker-compose.yml`: Docker Compose 配置文件

## 说明
- 后端使用 FastAPI 构建，前端使用 React。
- 数据库使用 MySQL，初始化脚本存储在 `database/init.sql`。
- MCP 翻译工具集成在 `backend/services/translation.py`。
- 出题逻辑实现于 `backend/services/question_generation.py`。
