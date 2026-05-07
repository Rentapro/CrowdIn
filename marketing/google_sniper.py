import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Sniper v4: Estrategia Bing (Mucho mas permisivo)
KEYWORDS = [
    'site:linkedin.com/in/ "Gerente General" Chile',
    'site:linkedin.com/in/ "CEO" Chile',
    'site:linkedin.com/in/ "Owner" Chile'
]

async def sniper_v4():
    async with async_playwright() as p:
        print("[*] Iniciando Sniper v4 (Motor: Bing)...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            print(f"[*] Buscando en Bing: {query}")
            try:
                await page.goto(f"https://www.bing.com/search?q={query.replace(' ', '+')}")
                await asyncio.sleep(5)
                
                # Bing usa li.b_algo para los resultados
                results = await page.query_selector_all("li.b_algo")
                
                for res in results:
                    try:
                        title_el = await res.query_selector("h2 a")
                        title = await title_el.inner_text() if title_el else ""
                        
                        snippet_el = await res.query_selector(".b_caption p, .b_lineclamp2")
                        snippet = await snippet_el.inner_text() if snippet_el else ""
                        
                        if title and "LinkedIn" in title:
                            name = title.split(" - ")[0].replace(" | LinkedIn", "").strip()
                            leads.append({
                                "name": name,
                                "position": "Target: " + query.split('"')[1],
                                "source": "Bing Sniper",
                                "notes": snippet[:200].strip()
                            })
                            print(f"    [+] Encontrado: {name}")
                    except:
                        continue
            except Exception as e:
                print(f"[!] Error: {e}")
            
            await asyncio.sleep(2)

        os.makedirs('marketing', exist_ok=True)
        with open('marketing/leads_sniper.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "position", "source", "notes"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"[*] Sniper v4 finalizado. {len(leads)} leads capturados.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(sniper_v4())
