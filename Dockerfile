# ========================
# 基础镜像：Node + Python 共存
# ========================
FROM node:20

# 安装 Python + supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.10 python3-pip python3-dev \
    build-essential gcc g++ libffi-dev libssl-dev \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# ========================
# 安装前端依赖
# ========================
COPY react-app/package.json react-app/package-lock.json ./react-app/
WORKDIR /app/react-app
RUN npm install
COPY react-app ./

# ========================
# 安装后端依赖
# ========================
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip3 install --break-system-packages -i https://mirrors.aliyun.com/pypi/simple/ -r requirements.txt
COPY backend ./

# ========================
# 添加 supervisor 配置
# ========================
WORKDIR /app
COPY supervisord-dev.conf /etc/supervisord.conf

# 启动 3000 + 8000
EXPOSE 3000 8000
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
