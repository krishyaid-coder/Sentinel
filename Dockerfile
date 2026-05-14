# Build from monorepo root (GitHub default). Backend lives under sentinel/backend/.
FROM python:3.11-slim

WORKDIR /app

COPY sentinel/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sentinel/backend/ .

EXPOSE 8000

# Railway sets PORT; local default 8000
CMD ["/bin/sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
