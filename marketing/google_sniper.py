import asyncio
from playwright.async_api import async_playwright
import csv
import os

# Sniper v5: Motor Bing + Selectores de Respaldo + Modo No-JS fallback
KEYWORDS = [
    'site:linkedin.com/in/ "Gerente General" Chile',
    'site:linkedin.com/in/ "Socio Fundador" Chile',
    'site:linkedin.com/in/ "CEO" Chile',
    'site:linkedin.com/in/ "Gerente de Finanzas" Chile'
]

async def sniper_v5():
    async with async_playwright() as p:
        print("[*] Iniciando Sniper v5 (Optimizado para Personas)...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        leads = []
        
        for query in KEYWORDS:
            print(f"[*] Buscando: {query}")
            try:
                # Bing es mas amigable con bots que Google
                await page.goto(f"https://www.bing.com/search?q={query.replace(' ', '+')}&count=50")
                await asyncio.sleep(5)
                
                # Intentar varios selectores conocidos de Bing
                results = await page.query_selector_all("li.b_algo, .b_algo, h2")
                
                for res in results:
                    try:
                        # Extraer link y titulo
                        link_el = await res.query_selector("a")
                        if not link_el: continue
                        
                        href = await link_el.get_attribute("href")
                        title = await link_el.inner_text()
                        
                        if href and "linkedin.com/in/" in href:
                            # Limpieza de Nombre: "Nombre Apellido - Cargo - Empresa"
                            clean_name = title.split(" - ")[0].replace(" | LinkedIn", "").replace(" - LinkedIn", "").strip()
                            
                            # Evitar duplicados en la misma sesion
                            if any(l['name'] == clean_name for l in leads): continue
                            
                            leads.append({
                                "name": clean_name,
                                "position": query.split('"')[1],
                                "source": "Bing Sniper",
                                "notes": f"Perfil: {href}"
                            })
                            print(f"    [+] Capturado: {clean_name}")
                    except:
                        continue
            except Exception as e:
                print(f"[!] Error en query: {e}")
            
            await asyncio.sleep(3)

        # Guardar en CSV
        os.makedirs('marketing', exist_ok=True)
        with open('marketing/leads_sniper.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "position", "source", "notes"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"[*] Sniper v5 finalizado. {len(leads)} personas capturadas.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(sniper_v5())
