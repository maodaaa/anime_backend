#!/bin/bash

# Docker Test Script for Bun/Hono Migration
# This script tests the containerized application startup and functionality

set -e

echo "🐳 Starting Docker tests for Bun/Hono application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Clean up function
cleanup() {
    print_info "Cleaning up containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    docker rmi wajik-anime-api-test 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Test 1: Build the Docker image
print_info "Building Docker image..."
if docker build -t wajik-anime-api-test .; then
    print_status "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Test 2: Start the container using docker-compose
print_info "Starting container with docker-compose..."
if docker-compose up -d; then
    print_status "Container started successfully"
else
    print_error "Failed to start container"
    exit 1
fi

# Test 3: Wait for application to be ready
print_info "Waiting for application to be ready..."
sleep 10

# Test 4: Check if container is running
if docker-compose ps | grep -q "Up"; then
    print_status "Container is running"
else
    print_error "Container is not running"
    docker-compose logs
    exit 1
fi

# Test 5: Test application endpoints
print_info "Testing application endpoints..."

# Test main endpoint
if curl -f -s http://localhost:3001/ > /dev/null; then
    print_status "Main endpoint is responding"
else
    print_error "Main endpoint is not responding"
    docker-compose logs
    exit 1
fi

# Test API endpoint
if curl -f -s http://localhost:3001/otakudesu/anime > /dev/null; then
    print_status "API endpoint is responding"
else
    print_error "API endpoint is not responding"
    docker-compose logs
    exit 1
fi

# Test 6: Check application logs for errors
print_info "Checking application logs..."
if docker-compose logs | grep -i error; then
    print_error "Found errors in application logs"
    docker-compose logs
    exit 1
else
    print_status "No errors found in application logs"
fi

# Test 7: Performance test - check startup time
print_info "Testing container restart performance..."
start_time=$(date +%s)
docker-compose restart
sleep 5
end_time=$(date +%s)
restart_time=$((end_time - start_time))

if [ $restart_time -lt 15 ]; then
    print_status "Container restart completed in ${restart_time}s (good performance)"
else
    print_error "Container restart took ${restart_time}s (may be slow)"
fi

print_status "All Docker tests passed! 🎉"
print_info "The Bun/Hono application is working correctly in Docker."