const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURACIÓN DEL BOT LOCAL DE LINKEDIN
// ============================================================================
// Puerto de depuración al que conectaremos (debes iniciar Chrome con este puerto)
const PORT = 9222; 
const SEARCH_URL = "https://www.linkedin.com/search/results/people/?keywords=gerente%20inversiones&origin=GLOBAL_SEARCH_HEADER";

// Función de pausa aleatoria para simular comportamiento humano
const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

async function runSniper() {
    console.log("Iniciando conexión con Chrome local (Anti-Bloqueo)...");
    
    try {
        // Obtenemos la URL del WebSocket del Chrome abierto localmente
        const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        const data = await response.json();
        const webSocketDebuggerUrl = data.webSocketDebuggerUrl;

        console.log("Conexión establecida. Abriendo pestaña...");
        const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });
        const page = await browser.newPage();
        
        // Evitamos que carguen imágenes pesadas para ir más rápido
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if(req.resourceType() === 'image'){
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Navegando a la búsqueda: ${SEARCH_URL}`);
        await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded' });
        
        // Pausa simulando que el usuario está leyendo
        await delay(3000, 5000);

        console.log("Extrayendo perfiles de la página actual...");
        
        // Scrolleo hacia abajo para cargar resultados
        await page.evaluate(() => {
            window.scrollBy(0, document.body.scrollHeight);
        });
        await delay(2000, 4000);

        // Extraer datos (Nombres y Títulos)
        const profiles = await page.evaluate(() => {
            const results = [];
            // Selectores actualizados frecuentemente, esta es una aproximación estándar
            const items = document.querySelectorAll('li.reusable-search__result-container');
            
            items.forEach(item => {
                const nameEl = item.querySelector('span[dir="ltr"] > span[aria-hidden="true"]');
                const titleEl = item.querySelector('div.entity-result__primary-subtitle');
                const linkEl = item.querySelector('a.app-aware-link');

                if (nameEl && titleEl) {
                    results.push({
                        name: nameEl.innerText.trim(),
                        title: titleEl.innerText.trim(),
                        url: linkEl ? linkEl.href : ''
                    });
                }
            });
            return results;
        });

        console.log(`\n¡Se extrajeron ${profiles.length} prospectos en esta página!`);
        
        if(profiles.length > 0) {
            const csvContent = profiles.map(p => `"${p.name}","${p.title}","${p.url}"`).join("\n");
            const filePath = path.join(__dirname, 'prospectos_linkedin.csv');
            fs.appendFileSync(filePath, csvContent + "\n");
            console.log(`Guardados exitosamente en: ${filePath}`);
        } else {
            console.log("No se encontraron perfiles. Verifica que estés logueado y en la página correcta de resultados de LinkedIn.");
        }

        console.log("Desconectando...");
        await browser.disconnect();

    } catch (error) {
        console.error("Error al ejecutar el bot:", error.message);
        console.error("Asegúrate de haber cerrado todos los Chrome y luego abrirlo con el puerto habilitado:");
        console.error(`chrome.exe --remote-debugging-port=${PORT} --user-data-dir="C:\\chrome-bot"`);
    }
}

runSniper();
