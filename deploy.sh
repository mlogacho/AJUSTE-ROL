#!/bin/bash

# Script de Despliegue Rápido - IA Factory Marco Logacho
# Uso: ./deploy.sh [IP_SERVER] [PEM_FILE]

SERVER_IP=$1
PEM_FILE=$2
USER="admin" # Usuario por defecto detectado previamente

if [ -z "$SERVER_IP" ] || [ -z "$PEM_FILE" ]; then
    echo "Uso: ./deploy.sh [IP_DEL_SERVIDOR] [CAMINO_A_LA_LLAVE_PEM]"
    exit 1
fi

echo "🚀 Iniciando despliegue en $SERVER_IP..."

# 1. Compilación
echo "🏗️  Compilando proyecto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación. Despliegue abortado."
    exit 1
fi

# 2. Preparar permisos remotos (opcional pero recomendado)
echo "🔑 Asegurando permisos en el servidor..."
ssh -i "$PEM_FILE" "$USER@$SERVER_IP" "sudo chown -R $USER:$USER /var/www/html/"

# 3. Transferencia de archivos
echo "📦 Transfiriendo archivos a /var/www/html/..."
scp -i "$PEM_FILE" -r dist/* "$USER@$SERVER_IP:/var/www/html/"
scp -i "$PEM_FILE" public/logo.jpg "$USER@$SERVER_IP:/var/www/html/logo.jpg"

if [ $? -eq 0 ]; then
    echo "✅ Despliegue completado con éxito."
    echo "🌐 Visita: http://$SERVER_IP"
else
    echo "❌ Error en la transferencia de archivos."
    exit 1
fi
