import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Sniper FAST: Sin esperas de red, solo HTML puro
KEYWORDS = [
    'site:linkedin.com/in/ "Gerente General" Chile',
    'site:linkedin.com/in/ "CEO" Chile',
    'site:linkedin.com/in/ "Gerente" Chile'
]

async def sniper_fast():
    async with async_playwright() as p:
        print("[*] Iniciando Sniper MODO RELAMPAGO (Sin bloqueos de red)...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            print(f"[*] Escaneando Bing: {query}")
            try:
                # Usamos wait_until="commit" para no esperar a que carguen trackers/ads que dan timeout
                url = f"https://www.bing.com/search?q={query.replace(' ', '+')}"
                await page.goto(url, wait_until="commit", timeout=15000)
                await asyncio.sleep(2) # Solo un respiro
                
                # Busqueda agresiva de links de LinkedIn
                all_links = await page.query_selector_all("a")
                for link in all_links:
                    try:
                        href = await link.get_attribute("href")
                        title = await link.inner_text()
                        
                        if href and "linkedin.com/in/" in href and len(title) > 5:
                            name = title.split(" - ")[0].split(" | ")[0].strip()
                            if not any(l['name'] == name for l in leads):
                                leads.append({
                                    "name": name,
                                    "position": "Inversor Potencial",
                                    "source": "Sniper Fast",
                                    "notes": f"Perfil: {href}"
                                })
                                print(f"    [+] Encontrado: {name}")
                    except:
                        continue
            except Exception as e:
                print(f"[!] Aviso: Query finalizada por tiempo (procesando lo capturado).")
            
        os.makedirs('marketing', exist_ok=True)
        with open('marketing/leads_sniper.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "position", "source", "notes"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"[*] Proceso finalizado. {len(leads)} leads capturados.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(sniper_fast())
