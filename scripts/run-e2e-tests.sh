#!/bin/bash

# Start Docker container
docker-compose up -d e2e-mongo-db

# Run tests and capture exit code
NODE_ENV=test jest --config ./test/jest-e2e.json "$@"
EXIT_CODE=$?

# Stop and remove Docker container
docker-compose stop e2e-mongo-db
docker-compose rm -f e2e-mongo-db

# Exit with the original test exit code
exit $EXIT_CODE
