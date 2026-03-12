# =========================================
# 🧩 STEP 1: Build app (dành cho NestJS)
# =========================================
FROM node:18-alpine AS builder

# Tạo thư mục làm việc
WORKDIR /app

# Copy file khai báo dependencies
COPY package*.json ./

# Cài dependencies (npm ci nhanh và sạch hơn)
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build NestJS sang JS (dist/)
RUN npm run build

# =========================================
# 🚀 STEP 2: Run app
# =========================================
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.env ./
COPY --from=builder /app/proto ./proto

RUN npm ci --omit=dev

EXPOSE 3005
# gRPC port
EXPOSE 50055

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
