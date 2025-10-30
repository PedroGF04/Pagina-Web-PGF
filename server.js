// CÓDIGO DEL SERVIDOR NODE.JS CON EXPRESS

const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Necesitas instalar 'node-fetch' (npm install node-fetch)

const app = express();
// Configura el puerto para usar la variable de entorno del host o el 3000 por defecto
const port = process.env.PORT || 3000; 

// ====================================================================
// CONFIGURACIÓN DE LAST.FM (PROXY PARA SPOTIFY)
// --- DEBES REEMPLAZAR ESTOS VALORES ---
const LASTFM_API_KEY = 'TU_API_KEY_DE_LASTFM'; 
const LASTFM_USERNAME = 'TU_USUARIO_DE_LASTFM'; 
// ====================================================================


// 1. SERVIR ARCHIVOS ESTÁTICOS
// Esto permite que el navegador acceda a archivos en la carpeta 'public' (index.html, styles.css, images, videos, etc.)
app.use(express.static(path.join(__dirname, 'public')));


// 2. RUTA PRINCIPAL (SIRVE EL INDEX.HTML)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// 3. RUTA API PARA OBTENER LA ÚLTIMA CANCIÓN ESCUCHADA
app.get('/api/spotify-last-song', async (req, res) => {
    // URL de la API de Last.fm para obtener la última pista del usuario
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Manejo de errores de la API de Last.fm
        if (data.error) {
            console.error('Error de Last.fm:', data.message);
            return res.status(500).json({ error: 'Fallo al obtener datos de Last.fm. Revisa tu API Key o usuario.' });
        }
        
        // Extrae la información de la primera pista
        const track = data.recenttracks.track[0];

        if (!track) {
             // Si el usuario no tiene reproducciones recientes
             return res.json({ title: 'Ninguna canción reciente', artist: 'N/A', url: '#' });
        }

        // Estructura de la respuesta para el frontend
        const result = {
            title: track.name,
            artist: track.artist['#text'],
            url: track.url // URL que enlaza a la pista en Last.fm (y a menudo a Spotify/Apple Music)
        };

        // Envía la información al cliente (script.js)
        res.json(result);

    } catch (e) {
        console.error("Error al contactar Last.fm:", e);
        res.status(500).json({ error: "Fallo en el servidor al obtener datos de música." });
    }
});


// 4. INICIAR EL SERVIDOR
app.listen(port, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);
    console.log(`[CTRL + C] para detener.`);
});