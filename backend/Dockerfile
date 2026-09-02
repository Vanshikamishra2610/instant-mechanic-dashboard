FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Local default; hosts like Render inject their own PORT at runtime.
ENV PORT=8000
EXPOSE 8000

# Shell form on purpose: the exec form would pass "$PORT" through literally.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
