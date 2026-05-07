import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Estrategia Sniper v3: DDG HTML (Bypass Anti-Bot)
KEYWORDS = [
    'site:linkedin.com/in/ "Gerente General" Chile',
    'site:linkedin.com/in/ "Gerente de Finanzas" Chile',
    'site:linkedin.com/in/ "Socio Fundador" Chile',
    'site:linkedin.com/in/ "Inversiones" Chile'
]

async def sniper_v3():
    async with async_playwright() as p:
        print("[*] Iniciando Google Sniper v3 (Estrategia DDG-HTML)...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            print(f"[*] Buscando: {query}")
            try:
                # Usamos la version HTML de DDG que no tiene bloqueos de JS/Bot agresivos
                url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
                await page.goto(url)
                await asyncio.sleep(3)
                
                # En DDG HTML los resultados estan en .result__body
                results = await page.query_selector_all(".result__body")
                
                for res in results:
                    try:
                        title_el = await res.query_selector(".result__title a")
                        title = await title_el.inner_text() if title_el else ""
                        
                        snippet_el = await res.query_selector(".result__snippet")
                        snippet = await snippet_el.inner_text() if snippet_el else ""
                        
                        if "LinkedIn" in title or "linkedin.com" in title:
                            # Limpieza rapida
                            name = title.split(" - ")[0].replace(" | LinkedIn", "").strip()
                            leads.append({
                                "name": name,
                                "position": query.replace('site:linkedin.com/in/ ', '').replace('"', ''),
                                "source": "Google Sniper",
                                "notes": snippet[:200].strip()
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
            
        print(f"[*] Sniper v3 finalizado. {len(leads)} leads capturados.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(sniper_v3())
