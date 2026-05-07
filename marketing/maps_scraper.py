import asyncio
from playwright.async_api import async_playwright
import csv

LOCATIONS = ["Puchuncaví", "Quintero", "Quillota", "Concón"]
BUSINESS_TYPES = ["Ferretería", "Automotora", "Constructora"]

async def maps_scraper():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        leads = []
        
        for loc in LOCATIONS:
            for btype in BUSINESS_TYPES:
                query = f"{btype} en {loc}"
                print(f"[*] Buscando {query} en Google Maps...")
                await page.goto(f"https://www.google.com/maps/search/{query.replace(' ', '+')}")
                await asyncio.sleep(5)
                
                # Scroll para cargar resultados
                for _ in range(3):
                    await page.mouse.wheel(0, 5000)
                    await asyncio.sleep(2)
                
                # Extraer info básica (Simulado, requiere selectores específicos de Maps)
                # Google Maps usa selectores dinámicos, esto es una base conceptual
                cards = await page.query_selector_all("a.hfpxzc") # Selector común de Maps
                
                for card in cards:
                    try:
                        name = await card.get_attribute("aria-label")
                        await card.click()
                        await asyncio.sleep(3)
                        
                        phone_el = await page.query_selector("button[data-tooltip='Copiar el número de teléfono']")
                        phone = await phone_el.inner_text() if phone_el else "N/A"
                        
                        if phone != "N/A":
                            leads.append({"name": name, "phone": phone, "location": loc, "type": btype})
                            print(f"    [+] Encontrado: {name} - {phone}")
                    except:
                        continue

        # Guardar en CSV
        with open('marketing/leads_maps.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["name", "phone", "location", "type"])
            writer.writeheader()
            writer.writerows(leads)
            
        print(f"[*] Scraping finalizado. {len(leads)} leads guardados en marketing/leads_maps.csv")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(maps_scraper())
