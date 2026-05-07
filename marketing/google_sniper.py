import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Configuracion de busqueda
KEYWORDS = ["Gerente General Chile", "Socio Fundador Chile", "CEO Chile Inversion"]
PAGES_TO_SCAN = 3

async def google_sniper():
    async with async_playwright() as p:
        print("[*] Iniciando Google Sniper (Modo Dorking)...")
        browser = await p.chromium.launch(headless=True) # Headless para velocidad
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            search_query = f'site:linkedin.com/in/ "{query}"'
            print(f"[*] Escaneando Google para: {search_query}")
            
            await page.goto(f"https://www.google.com/search?q={search_query.replace(' ', '+')}")
            await asyncio.sleep(3)
            
            # Extraer resultados
            results = await page.query_selector_all("div.g")
            
            for res in results:
                try:
                    title_el = await res.query_selector("h3")
                    title_text = await title_el.inner_text() if title_el else "N/A"
                    
                    snippet_el = await res.query_selector("div.VwiC3b")
                    snippet_text = await snippet_el.inner_text() if snippet_el else "N/A"
                    
                    # Limpiar Nombre y Cargo
                    # El titulo suele ser: "Nombre Apellido - Cargo - Empresa | LinkedIn"
                    parts = title_text.split(" - ")
                    name = parts[0] if len(parts) > 0 else "N/A"
                    position = parts[1] if len(parts) > 1 else query
                    
                    leads.append({
                        "name": name.replace(" | LinkedIn", ""),
                        "position": position,
                        "source": "Google Sniper",
                        "notes": snippet_text[:200]
                    })
                    print(f"    [+] Encontrado: {name} ({position})")
                except Exception as e:
                    continue
            
            await asyncio.sleep(2) # Evitar captchas

        # Guardar en CSV para respaldo
        os.makedirs('marketing', exist_ok=True)
        with open('marketing/leads_sniper.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "position", "source", "notes"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"[*] Sniper finalizado. {len(leads)} leads guardados en marketing/leads_sniper.csv")
        print("[!] Siguiente paso: Importe estos prospectos al CRM usando 'node import_leads.js'")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(google_sniper())
