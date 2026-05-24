#!/usr/bin/env bash
set -e

echo "Bringing up docker-compose stack..."
docker-compose up --build
