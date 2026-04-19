#!/bin/bash
echo "Iniciando deploy..."

cd ~/ElaDisseSim
git pull

echo "Rebuilding backend..."
cd ~/ElaDisseSim/Backend
sudo docker stop backend && sudo docker rm backend
sudo docker build -t wedding-backend .
sudo docker run -d --name backend -p 8080:8080 -e PORT=8080 -e DB_PATH=/data/eladissesim.db -v /home/ubuntu/data:/data wedding-backend

echo "Rebuilding frontend..."
cd ~/ElaDisseSim/frontend
sudo docker stop frontend && sudo docker rm frontend
sudo docker build -t wedding-frontend .
sudo docker run -d --name frontend -p 80:80 wedding-frontend

echo "Deploy concluído!"