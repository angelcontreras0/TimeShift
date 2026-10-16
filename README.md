# TimeShift

Una pequeña web para convertir horarios de cualquier parte del mundo a tu hora local automáticamente.

## Qué hace

- Detecta tu zona horaria desde el navegador, sin GPS.
- Convierte entradas como `9:00 AM ET`, `7:30 PM PT`, `10:00 PM JST` o `18:00 España`.
- Respeta zonas IANA y cambios de horario de verano.
- Incluye reloj mundial.
- Guarda conversiones recientes en `localStorage`.
- Funciona como sitio estático, ideal para GitHub Pages.

## Tecnologías

- HTML
- CSS
- JavaScript
- Luxon

## Uso local

Abre `index.html` en tu navegador o sirve la carpeta con cualquier servidor estático.

Tambien puedes verla desde esta URL: https://angelcontreras0.github.io/timeshift/

## GitHub Pages

En el repositorio ve a **Settings → Pages → Build and deployment → Deploy from a branch** y elige:

- Branch: `main`
- Folder: `/ (root)`

Después GitHub mostrará la URL pública del sitio.
