import os
import time
import redis
from datetime import datetime

REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

def main():
    print("Worker starting...")

    # Connect to Redis
    r = redis.from_url(REDIS_URL, decode_responses=True)

    try:
        r.ping()
        print("Connected to Redis")
    except redis.ConnectionError:
        print("Failed to connect to Redis")
        return

    # Simple worker that updates a timestamp every 10 seconds
    while True:
        try:
            timestamp = datetime.now().isoformat()
            r.set('worker_last_run', timestamp)
            print(f"Worker updated timestamp: {timestamp}")
            time.sleep(10)
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == '__main__':
    main()
