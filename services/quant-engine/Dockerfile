FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

COPY services/quant-engine/pyproject.toml ./
RUN pip install --no-cache-dir \
    "fastapi>=0.115" "uvicorn[standard]>=0.30" \
    "pandas>=2.2" "numpy>=1.26" "scipy>=1.13" "scikit-learn>=1.5" \
    "statsmodels>=0.14" "redis>=5.0" "pydantic>=2.7" "python-dotenv>=1.0"

COPY services/quant-engine/app ./app

EXPOSE 5000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
