FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" httpx python-dotenv pydantic
COPY services/notification-service/app ./app
EXPOSE 5100
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5100"]
