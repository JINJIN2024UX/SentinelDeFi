# 1. 使用轻量级的 Bun 镜像作为底座
FROM oven/bun:1.1 as base
WORKDIR /app

# 🚀 必须先安装基础工具，否则后面的 bun install 无法编译 native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 2. 复制依赖文件并安装 (利用缓存提高 Nosana 部署速度)
COPY package.json bun.lock ./
RUN bun install --jobs 2

# 3. 复制全部源代码
COPY . .

# 4. 暴露 ElizaOS 默认的 API 端口
EXPOSE 3000

# 5. 启动指令：直接运行你的入口文件
CMD ["bun", "run", "src/index.ts"]