import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Configuracion de busqueda
KEYWORDS = ["Gerente General Chile", "Socio Fundador Chile", "CEO Chile Inversion"]

async def google_sniper():
    async with async_playwright() as p:
        print("[*] Iniciando Google Sniper (Modo Resiliente)...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            # Usaremos DuckDuckGo como fuente mas permisiva que Google
            search_query = f'site:linkedin.com/in/ "{query}"'
            print(f"[*] Escaneando para: {search_query}")
            
            try:
                await page.goto(f"https://duckduckgo.com/?q={search_query.replace(' ', '+')}")
                await asyncio.sleep(4)
                
                # Selector de DuckDuckGo para resultados
                results = await page.query_selector_all("article")
                
                if not results:
                    # Intento con Google si DDG falla
                    await page.goto(f"https://www.google.com/search?q={search_query.replace(' ', '+')}")
                    await asyncio.sleep(5)
                    results = await page.query_selector_all("div.g")

                for res in results:
                    try:
                        title_el = await res.query_selector("h2, h3")
                        title_text = await title_el.inner_text() if title_el else "N/A"
                        
                        if "N/A" in title_text or "LinkedIn" not in title_text:
                            continue

                        snippet_el = await res.query_selector("div")
                        snippet_text = await snippet_el.inner_text() if snippet_el else "N/A"
                        
                        parts = title_text.split(" - ")
                        name = parts[0].replace(" | LinkedIn", "").replace(" - LinkedIn", "")
                        position = parts[1] if len(parts) > 1 else query
                        
                        leads.append({
                            "name": name.strip(),
                            "position": position.strip(),
                            "source": "Google Sniper",
                            "notes": snippet_text[:200].strip()
                        })
                        print(f"    [+] Encontrado: {name} ({position})")
                    except:
                        continue
            except Exception as e:
                print(f"[!] Error en query '{query}': {e}")
            
            await asyncio.sleep(2)

        # Guardar en CSV
        os.makedirs('marketing', exist_ok=True)
        with open('marketing/leads_sniper.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "position", "source", "notes"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"[*] Sniper finalizado. {len(leads)} leads guardados en marketing/leads_sniper.csv")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(google_sniper())
