# AJUSTE AL ROL - IA Factory Marco Logacho

Plataforma inteligente para la evaluación de ajuste al rol y diagnóstico de carrera profesional. Diseñado bajo la identidad visual de **Formadores Auténticos**.

## 🚀 Requisitos de Instalación

- **Node.js**: v18 o superior.
- **npm**: v9 o superior.

## 🛠️ Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir en el navegador: `http://localhost:5173`

## 🏗️ Construcción para Producción

Para generar los archivos estáticos optimizados:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

## 📦 Despliegue Rápido (Disaster Recovery)

En caso de fallo del servidor, sigue estos pasos para restaurar el servicio en una nueva instancia de AWS (Amazon Linux/Ubuntu):

### 1. Preparar el Servidor Destino
Asegúrate de tener instalado un servidor web (Apache o Nginx):

```bash
# Ejemplo para Amazon Linux (Apache)
sudo yum update -y
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd
sudo chown -R $USER:$USER /var/www/html/
```

### 2. Ejecutar Script de Despliegue
He incluido un script automatizado `deploy.sh` en este repositorio. Para usarlo:

```bash
chmod +x deploy.sh
./deploy.sh [IP_DEL_SERVIDOR] [CAMINO_A_LA_LLAVE_PEM]
```

Ejemplo:
```bash
./deploy.sh 3.135.214.120 ../bot.pem
```

## 🛠️ Tecnologías Utilizadas

- **Vite**: Build tool ultrarrápido.
- **TypeScript**: Programación robusta y tipada.
- **Chart.js**: Visualización de datos y gráficos dinámicos.
- **jsPDF & html2canvas**: Generación de reportes profesionales en PDF.
- **CSS3 Vanilla**: Estética premium con CSS moderno.

## 📄 Créditos
© 2026 IA Factory Marco Logacho - Inspirar · Conectar · Transformar
