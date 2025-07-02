# 前端构建阶段
FROM node:18 AS frontend-build
WORKDIR /app/react-app
COPY react-app/package.json react-app/package-lock.json ./
RUN npm install
COPY react-app ./
RUN npm run build

# 后端构建阶段
FROM python:3.10-slim AS backend
WORKDIR /app

# 安装编译依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ make libffi-dev libssl-dev python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend ./backend
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -i https://mirrors.aliyun.com/pypi/simple/ -r ./backend/requirements.txt

# 拷贝前端构建产物到后端
COPY --from=frontend-build /app/react-app/build ./backend/static

# 启动服务
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
