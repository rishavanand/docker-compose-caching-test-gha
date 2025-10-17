# Docker Compose Caching Test with GitHub Actions

This repository demonstrates efficient Docker layer caching strategies for Docker Compose projects in GitHub Actions.

## Project Structure

```
.
├── docker-compose.yml          # Multi-service composition
├── web/                        # Node.js web service
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── worker/                     # Python worker service
│   ├── Dockerfile
│   ├── requirements.txt
│   └── worker.py
└── .github/
    └── workflows/
        └── docker-compose-caching.yml
```

## Services

### Web Service (Node.js + Express)
- HTTP server on port 3000
- Connects to Redis for state management
- Endpoints:
  - `GET /` - Hello world
  - `GET /health` - Health check with Redis status
  - `GET /counter` - Visit counter using Redis

### Worker Service (Python)
- Background worker that updates Redis timestamp every 10 seconds
- Demonstrates multi-service orchestration

### Redis
- In-memory data store
- Shared between web and worker services

## Running Locally

```bash
# Build and start all services
docker compose up --build

# Test the web service
curl http://localhost:3000/health
curl http://localhost:3000/counter

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Caching Strategies

The GitHub Actions workflow implements two different caching approaches:

### Job 1: Individual Service Caching
- Separate cache for each service (web and worker)
- Uses `docker/build-push-action` with local cache
- Cache keys based on Dockerfile and dependency files
- Better granularity and cache hit rates

### Job 2: Compose-Level Caching
- Unified cache for all services
- Uses `docker compose build` with BuildKit
- Simpler setup for smaller projects
- Cache key based on all relevant files

## Cache Benefits

With proper caching:
- **First run**: ~2-3 minutes (cold cache)
- **Subsequent runs**: ~30-60 seconds (warm cache)
- **No code changes**: ~10-20 seconds (full cache hit)

## Key Features

1. **Layer Caching**: Dependencies cached separately from application code
2. **BuildKit**: Modern Docker build engine with improved caching
3. **Cache Key Management**: Invalidates cache only when dependencies change
4. **Cache Rotation**: Prevents unbounded cache growth
5. **Multi-Stage Awareness**: Optimized Dockerfiles for maximum cache reuse

## GitHub Actions Workflow

The workflow runs on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual trigger via `workflow_dispatch`

Each run:
1. Builds services with layer caching
2. Starts the stack with Docker Compose
3. Runs integration tests
4. Reports cache statistics
5. Cleans up resources

## Best Practices Demonstrated

- Dependencies installed before copying application code
- `.dockerignore` to exclude unnecessary files (future enhancement)
- Separate caches per service for optimal cache hits
- Health checks to ensure services are ready
- Integration tests to validate the stack
- Proper cleanup to avoid resource leaks
