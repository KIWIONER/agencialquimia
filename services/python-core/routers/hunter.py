from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
from selectolax.parser import HTMLParser
from dependencies.auth import verify_internal_signature
import httpx
import re
import urllib.parse

router = APIRouter(prefix="/hunter", tags=["Hunter"])

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
TEL_REGEX = re.compile(r'(?:\+34|34)?[6789]\d{8}')

# Configuración de límites geográficos
ES_BBOX = {"minLat": 27.0, "maxLat": 44.0, "minLon": -18.5, "maxLon": 5.0}
GALICIA_BBOX = "bbox=-9.4,41.7,-6.7,43.9"

PORTUGAL_STATES = [
    'viseu', 'lisboa', 'lisbon', 'porto', 'porto district', 'braga', 'coimbra',
    'aveiro', 'setúbal', 'setubal', 'faro', 'guarda', 'vila real', 'bragança',
    'braganca', 'viana do castelo', 'santarém', 'santarem', 'leiria', 'castelo branco',
    'beja', 'évora', 'evora', 'portalegre', 'madeira', 'açores', 'azores',
    'região norte', 'regiao norte', 'região centro', 'regiao centro', 'alentejo', 'algarve'
]

FUERA_PAISES = [
    'casablanca', 'rabat', 'tánger', 'tanger', 'marrakech', 'fès', 'fes',
    'meknès', 'meknes', 'agadir', 'marruecos', 'morocco', 'alger', 'algiers',
    'argelia', 'túnez', 'tunis', 'france', 'francia'
]

CIUDADES_GALLEGAS = [
    'santiago de compostela', 'a coruña', 'la coruña', 'vigo', 'ourense',
    'orense', 'lugo', 'pontevedra', 'ferrol', 'santiago'
]

KNOWN_COMUNIDADES = [
    'galicia', 'país vasco', 'cataluña', 'comunidad de madrid', 'andalucía',
    'comunidad valenciana', 'aragón', 'castilla y león', 'castilla-la mancha',
    'extremadura', 'asturias', 'cantabria', 'la rioja', 'navarra', 'región de murcia',
    'islas baleares', 'canarias'
]

class ScrapeRequest(BaseModel):
    url: HttpUrl

class ScrapeResult(BaseModel):
    emails: list[str]
    phones: list[str]
    tech_stack: list[str]

class GeocodeRequest(BaseModel):
    queries: list[str]
    city_detectada: str | None = None

class GeocodeResult(BaseModel):
    lat: float
    lon: float
    match: str
    comunidad: str | None
    ciudad: str | None

def in_spain(lat: float, lon: float) -> bool:
    return ES_BBOX["minLat"] <= lat <= ES_BBOX["maxLat"] and ES_BBOX["minLon"] <= lon <= ES_BBOX["maxLon"]

def es_fuera_de_espana(state: str | None) -> bool:
    if not state:
        return False
    s = state.lower()
    return any(p in s for p in PORTUGAL_STATES) or any(p in s for p in FUERA_PAISES)

def es_ciudad_gallega(ciudad: str | None) -> bool:
    if not ciudad:
        return False
    c = ciudad.lower()
    return any(g in c for g in CIUDADES_GALLEGAS)

def clean_name(s: str) -> str:
    return re.sub(r'[^a-záéíóúñü\s]', '', s.lower()).strip()

@router.post("/extract", response_model=ScrapeResult, dependencies=[Depends(verify_internal_signature)])
async def extract_lead_contacts(payload: ScrapeRequest):
    """
    Extracción asíncrona optimizada de contactos y tecnologías desde una URL externa.
    """
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            resp = await client.get(str(payload.url), headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
            tree = HTMLParser(resp.text)
            text = tree.body.text() if tree.body else ""
            
            emails = list(set(EMAIL_REGEX.findall(text)))
            # Limpiar escapes comunes de emails obtenidos del HTML
            emails = [re.sub(r'^u00a0', '', e) for e in emails]
            
            phones = list(set(TEL_REGEX.findall(text)))
            
            tech = []
            html_lower = resp.text.lower()
            if "wp-content" in html_lower or "wordpress" in html_lower:
                tech.append("WordPress")
            if "shopify" in html_lower:
                tech.append("Shopify")
            if "wix.com" in html_lower or "wixpress" in html_lower:
                tech.append("Wix")
            
            return ScrapeResult(emails=emails[:5], phones=phones[:5], tech_stack=tech)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error scraping web: {str(e)}")

@router.post("/geocode", response_model=GeocodeResult, dependencies=[Depends(verify_internal_signature)])
async def geocode_queries(payload: GeocodeRequest):
    """
    Geocodificación con prioridad geográfica gallega. Replicación exacta del motor de Next.js.
    """
    async with httpx.AsyncClient(timeout=6.0) as client:
        for query in payload.queries:
            # Detectar si priorizar Galicia
            anclaje_galicia = (
                any(x in query.lower() for x in ['santiago', 'compostela', 'galicia', 'coruña', 'vigo', 'ourense', 'lugo', 'pontevedra', 'ferrol']) or
                (payload.city_detectada is not None and es_ciudad_gallega(payload.city_detectada))
            )
            otra_ciudad = payload.city_detectada is not None and not es_ciudad_gallega(payload.city_detectada)
            
            bbox_options = [f"&{GALICIA_BBOX}"] if anclaje_galicia or not otra_ciudad else [f"&{GALICIA_BBOX}", ""]
            
            for bbox_suffix in bbox_options:
                photon_ok = False
                try:
                    # 1. Intentar con Photon
                    p_url = f"https://photon.komoot.io/api/?limit=5&q={urllib.parse.quote(query)}{bbox_suffix}"
                    p_res = await client.get(p_url, headers={"User-Agent": "AgenciAlquimiaPanel/1.0"})
                    
                    if p_res.status_code == 200:
                        photon_ok = True
                        p_data = p_res.json()
                        for feat in p_data.get("features", []):
                            coords = feat.get("geometry", {}).get("coordinates", [0.0, 0.0])
                            lon, lat = coords[0], coords[1]
                            props = feat.get("properties", {})
                            feat_state = props.get("state")
                            
                            if in_spain(lat, lon) and not es_fuera_de_espana(feat_state):
                                comunidad_raw = feat_state
                                ciudad = props.get("city")
                                comunidad = None
                                
                                if comunidad_raw:
                                    c_clean = clean_name(comunidad_raw)
                                    known = next((k for k in KNOWN_COMUNIDADES if c_clean in k or k in c_clean), None)
                                    comunidad = known.capitalize() if known else comunidad_raw
                                
                                return GeocodeResult(lat=lat, lon=lon, match=query, comunidad=comunidad, ciudad=ciudad)
                except Exception:
                    pass
                
                if photon_ok:
                    continue
                
                # 2. Respaldo en Nominatim
                try:
                    n_url = f"https://nominatim.openstreetmap.org/search?format=json&limit=3&q={urllib.parse.quote(query)}"
                    n_res = await client.get(n_url, headers={"User-Agent": "AgenciAlquimiaPanel/1.0"})
                    if n_res.status_code == 200:
                        n_data = n_res.json()
                        for item in n_data:
                            lat = float(item.get("lat", 0))
                            lon = float(item.get("lon", 0))
                            dn = item.get("display_name", "")
                            
                            if in_spain(lat, lon) and not es_fuera_de_espana(dn):
                                parts = [p.strip() for p in dn.split(",")]
                                ciudad = next(
                                    (p for p in parts[:4] if not any(x in p.lower() for x in ['españa', 'spain'])),
                                    None
                                )
                                return GeocodeResult(lat=lat, lon=lon, match=query, comunidad=None, ciudad=ciudad)
                except Exception:
                    pass
                
                if bbox_suffix == "":
                    break
                    
        raise HTTPException(status_code=404, detail="No se pudo geocodificar la query dentro de los límites válidos")
