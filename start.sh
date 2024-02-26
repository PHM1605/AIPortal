#!/bin/bash
ls -la /app
ls -la /app/server
ls -la /app/client
ls -la /client/dist
python apiServer/main.py &
cd server && node index.js 