import asyncio
import random
from playwright.async_api import async_playwright

# Configuración de búsqueda
KEYWORDS = ["Gerente General", "Socio Fundador", "Médico especialista", "Inversionista", "Empresario"]
REGIONS = ["Chile"] # Expandido a todo Chile

async def linkedin_sniper():
    async with async_playwright() as p:
        # Usamos un navegador persistente para evitar logins repetitivos
        browser = await p.chromium.launch_persistent_context(
            user_data_dir="./linkedin_session",
            headless=False # Lo ponemos visible para que puedas loguearte la primera vez
        )
        page = await browser.new_page()
        
        print("[*] Iniciando LinkedIn Sniper...")
        
        for kw in KEYWORDS:
            for region in REGIONS:
                search_url = f"https://www.linkedin.com/search/results/people/?keywords={kw}&location={region}"
                print(f"[*] Buscando: {kw} en {region}")
                await page.goto(search_url)
                await asyncio.sleep(random.uniform(5, 10))
                
                # Lógica de extracción y envío de conexión
                profiles = await page.query_selector_all(".entity-result__item")
                
                for profile in profiles:
                    try:
                        # Intentar encontrar botón de conectar
                        connect_btn = await profile.query_selector("button:has-text('Conectar')")
                        if connect_btn:
                            name = await profile.query_selector(".entity-result__title-text")
                            name_text = await name.inner_text() if name else "Inversor"
                            
                            print(f"[+] Prospecto encontrado: {name_text.splitlines()[0]}")
                            
                            # Acción: Clic en conectar y enviar nota personalizada
                            await connect_btn.click()
                            await asyncio.sleep(2)
                            
                            # Si aparece el modal de nota
                            note_btn = await page.query_selector("button:has-text('Añadir una nota')")
                            if note_btn:
                                await note_btn.click()
                                msg = f"Hola {name_text.split(' ')[0]}, vi tu perfil y me gustaría conectar. Estamos gestionando un fondo de inversión inmobiliario (CrowdIn) con retornos de hasta un 2.5% mensual (ampliamente superior a la banca tradicional). Saludos!"
                                await page.fill("textarea", msg)
                                # await page.click("button:has-text('Enviar')") # Comentado para seguridad inicial
                                print(f"    [!] Invitación preparada para {name_text.splitlines()[0]}")
                            
                            await asyncio.sleep(random.uniform(30, 60)) # Delay humano
                    except Exception as e:
                        continue

        await browser.close()

if __name__ == "__main__":
    asyncio.run(linkedin_sniper())
