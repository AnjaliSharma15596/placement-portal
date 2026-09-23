# Start from an official lightweight Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Install system-level dependencies psycopg2 needs to compile/run
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first (before the rest of the code)
COPY requirements.txt .

# Install Python packages listed in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of your backend code into the container
COPY . .

# Tell Docker which port the app listens on
EXPOSE 10000

# Command to actually run the app when the container starts
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]