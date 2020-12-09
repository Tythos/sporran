FROM python:3.7
LABEL maintainer="code@tythos.net"
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8421
ENTRYPOINT ["python", "serve.py"]
