#!/bin/bash

echo "Starting Academa Development Environment..."

echo ""
echo "Setting up environment variables..."
export PORT=5000

echo ""
echo "Starting backend server on port 5000..."
cd server && export PORT=5000 && npm run dev &
BACKEND_PID=$!

echo ""
echo "Waiting 5 seconds for backend to start..."
sleep 5

echo ""
echo "Starting frontend on port 3000..."
cd ../client && npm start &
FRONTEND_PID=$!

echo ""
echo "Development environment started!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
