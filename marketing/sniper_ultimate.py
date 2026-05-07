import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Sniper ULTIMATE: Motor Bing + Screenshot Debug + Selectores Dinamicos
KEYWORDS = [
    'site:linkedin.com/in/ "Gerente General" Chile',
    'site:linkedin.com/in/ "CEO" Chile',
    'site:linkedin.com/in/ "Owner" Chile'
]

async def sniper_ultimate():
    async with async_playwright() as p:
        print("[*] Iniciando Sniper ULTIMATE (Bypass de Cache y Bloqueos)...")
        # Forzamos un perfil limpio
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 720}
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            print(f"[*] Escaneando Bing para: {query}")
            try:
                # Usamos una URL de Bing mas "limpia"
                url = f"https://www.bing.com/search?q={query.replace(' ', '+')}&qs=n&form=QBRE&sp=-1"
                await page.goto(url, wait_until="networkidle")
                await asyncio.sleep(4)
                
                # Debug: Tomar captura para ver que ve el Sniper
                os.makedirs('marketing/debug', exist_ok=True)
                await page.screenshot(path=f"marketing/debug/bing_{query[:10]}.png")
                
                # Intentar capturar todos los links que parezcan de LinkedIn
                all_links = await page.query_selector_all("a")
                print(f"    [-] Analizando {len(all_links)} enlaces en la pagina...")
                
                for link in all_links:
                    try:
                        href = await link.get_attribute("href")
                        title = await link.inner_text()
                        
                        if href and "linkedin.com/in/" in href and len(title) > 5:
                            # Limpieza del nombre
                            name = title.split(" - ")[0].split(" | ")[0].split(" – ")[0].strip()
                            
                            if any(l['name'] == name for l in leads): continue
                            
                            leads.append({
                                "name": name,
                                "position": query.split('"')[1],
                                "source": "Bing Sniper Ultimate",
                                "notes": f"Perfil: {href}"
                            })
                            print(f"    [+] EXITO: Encontrado {name}")
                    except:
                        continue
            except Exception as e:
                print(f"[!] Error: {e}")
            
            await asyncio.sleep(2)

        # Guardar en CSV
        os.makedirs('marketing', exist_ok=True)
        with open('marketing/leads_sniper.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "position", "source", "notes"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"\n[*] Sniper ULTIMATE finalizado. {len(leads)} personas listas para el CRM.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(sniper_ultimate())
