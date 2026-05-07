import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Sniper LITE: DuckDuckGo Lite (Inmune a bloqueos de JS y Captchas)
KEYWORDS = [
    'site:linkedin.com/in/ "Gerente General" Chile',
    'site:linkedin.com/in/ "CEO" Chile',
    'site:linkedin.com/in/ "Gerente de Finanzas" Chile',
    'site:linkedin.com/in/ "Owner" Chile'
]

async def sniper_lite():
    async with async_playwright() as p:
        print("[*] Iniciando Sniper ESTRATEGIA LITE (DuckDuckGo)...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            print(f"[*] Escaneando DDG para: {query}")
            try:
                # DuckDuckGo es mucho mas permisivo con scrapers
                url = f"https://duckduckgo.com/html/?q={query.replace(' ', '+')}"
                await page.goto(url, timeout=20000)
                await asyncio.sleep(3)
                
                # Buscamos enlaces de LinkedIn en los resultados
                results = await page.query_selector_all("a")
                
                for res in results:
                    try:
                        href = await res.get_attribute("href")
                        title = await res.inner_text()
                        
                        if href and "linkedin.com/in/" in href and len(title) > 5:
                            name = title.split(" - ")[0].split(" | ")[0].replace(" - LinkedIn", "").strip()
                            
                            if not any(l['name'] == name for l in leads):
                                leads.append({
                                    "name": name,
                                    "position": "Inversor Potencial",
                                    "source": "Sniper Lite",
                                    "notes": f"Perfil: {href}"
                                })
                                print(f"    [+] Encontrado: {name}")
                    except:
                        continue
            except Exception as e:
                print(f"[!] Error en query: {e}")
            
            await asyncio.sleep(2)

        # Guardar resultados
        os.makedirs('marketing', exist_ok=True)
        with open('marketing/leads_sniper.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "position", "source", "notes"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"\n[*] Sniper Lite finalizado. {len(leads)} prospectos capturados.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(sniper_lite())
