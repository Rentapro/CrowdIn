/**
 * CrowdIn WhatsApp Bulk Outreach
 * Sistema para envío de mensajes personalizados "vecino a vecino"
 * Requiere: @whiskeysockets/baileys
 */

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require('fs');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('marketing/auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if(connection === 'close') {
            console.log("[!] Conexión cerrada. Reintentando...");
            connectToWhatsApp();
        } else if(connection === 'open') {
            console.log("[+] WhatsApp Conectado exitosamente.");
            // Una vez conectado, podemos ejecutar la función de envío masivo
            // runOutreach(sock);
        }
    });
}

async function runOutreach(sock) {
    // Ejemplo de lista de leads (esto debería venir del CSV del scraper)
    const leads = [
        { name: "Juan", phone: "56912345678" }
    ];

    for (const lead of leads) {
        const id = `${lead.phone}@s.whatsapp.net`;
        const msg = `Hola ${lead.name}, soy Diego de Constructora Capi. Te escribo porque estamos lanzando un fondo privado (CrowdIn) para proyectos en la V Región con retornos del 2.5% mensual. Si te interesa diversificar el capital de tu empresa, avísame y te mando la tabla de retornos.`;
        
        console.log(`[*] Enviando a ${lead.name}...`);
        await sock.sendMessage(id, { text: msg });
        
        // Delay aleatorio para evitar baneo (30-90 segundos)
        const delay = Math.floor(Math.random() * (90000 - 30000 + 1) + 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

console.log("[*] Iniciando Sistema de Salida WhatsApp...");
connectToWhatsApp();
