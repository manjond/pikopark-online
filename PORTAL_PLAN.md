# Plan de portal de juegos — Documento maestro

> Documento de trabajo. Vivimos aquí mientras decidimos arquitectura, dominio, y empezamos a construir. Cuando creemos el repositorio del portal lo movemos allí.

**Última revisión:** 2026-04-29

---

## 1. Decisión estratégica

- **Producto:** portal de juegos casuales/multijugador en navegador, posicionamiento de **nicho multiplayer/co-op hispanohablante**.
- **PikoPark:** se queda como juego destacado del catálogo. NO es la base técnica del portal — son productos distintos.
- **Modelo de catálogo:** 90% agregado vía proveedores gratuitos (GameDistribution, GamePix) + 10% propio (PikoPark + originales que vayamos haciendo).
- **Coste primer mes:** ~12€/año (sólo dominio). El resto en planes gratuitos.

---

## 2. Investigación de palabras clave (research realizado 2026-04-29)

### 2.1 Términos de mayor volumen en español
Los buscan masivamente, pero tienen muchísima competencia (Minijuegos, Poki, CrazyGames):

| Keyword | Intención | Competencia |
|---|---|---|
| `juegos navegador` | Genérica | Altísima |
| `juegos multijugador` / `juegos multijugador online` | Multiplayer | Muy alta |
| `juegos para 2 jugadores` | Player count | Muy alta |
| `juegos online sin descargar` | Comercial | Muy alta |
| `juegos para jugar con amigos` | Social | Alta |

### 2.2 Términos nicho (volumen medio, competencia más débil)
**Aquí está nuestra oportunidad.**

| Keyword | Intención | Competencia | Por qué nos sirve |
|---|---|---|---|
| `juegos cooperativos online` | Co-op | Media | Nadie domina esta keyword en castellano |
| `juegos coop navegador` | Co-op + tech | Baja | Hueco evidente |
| `juegos web con amigos` | Social | Media | Tono moderno, menos saturado |
| `juegos para 4 jugadores online` | Player count | Media | Squad-pack focus |
| `juegos .io multijugador` | Subcultura .io | Media | Audiencia joven |
| `juegos para 3 jugadores` | Player count nicho | Baja | Casi nadie cubre 3p específico |

### 2.3 Patrón de URL del competidor principal (Minijuegos.com)

Lo copiamos como base SEO porque rankea bien:

```
/multijugador
/juegos-de-2-jugadores
/juegos-io
/juegos-de-accion
/juegos-clasicos
/juegos-de-mesa
/juegos-de-cartas
/juegos-trending
/juegos-nuevos
```

### 2.4 Top competidores del nicho

- **Minijuegos.com** — dominante en español, web vieja, reemplazable.
- **Poki.com** — multilingüe, líder global. Cerrado (no podemos embeber sus juegos).
- **CrazyGames.com** — inglés first, fuerte en España. Cerrado.
- **Juegos.com** — legacy, sigue rankeando.
- **Juegos.games / Misjuegos.com / IsladeJuegos.com** — long-tail, débiles.
- **Coolmath Games** — fortísimo en niño/educativo.

### 2.5 Hueco competitivo identificado

> **"Portal de juegos cooperativos y multijugador en español, moderno, con juegos exclusivos."**

Razones:
1. Minijuegos no se identifica con "cooperativo".
2. Poki/Crazy son ingleses primero.
3. Tenemos un AAA (PikoPark) que NADIE más tiene.

---

## 3. Candidatos de dominio (basados en research)

### Tier A — Brand + keyword (recomendados)

| Dominio | Pros | Contras |
|---|---|---|
| `coopjuegos.com` | Match exacto keyword nicho. Claro. | Genérico-ish |
| `coopjuegos.gg` | Match keyword + extensión gaming | Menos confianza que `.com` |
| `multijuega.com` | Verbo en imperativo, dinámico | Menos directo |
| `juegoscoop.com` | Match keyword | Suena más "técnico" |
| `arcademos.com` | "Arcade" + "amos" (jugamos en grupo) | Inventado, requiere branding |

### Tier B — Brandables (aprovechan PikoPark IP)

| Dominio | Pros | Contras |
|---|---|---|
| `pikoplay.com` / `pikoplay.gg` | Conecta con PikoPark, corto, memorable | Limita expansión más allá del Piko-universe |
| `pikoarcade.com` | Define producto + brand | Mismo |
| `pikoverse.com` | Suena a metaverso de juegos | Suena pretencioso |

### Tier C — Cortos y punchy

| Dominio | Pros | Contras |
|---|---|---|
| `jugar.gg` | Corto, claro | Muy probablemente taken |
| `jugamos.gg` | Verbo plural, social | Verifica disponibilidad |
| `2to8.gg` | Player count nicho, geek | Críptico, poco SEO |
| `co.op` | Ultra-short, se lee "co-op" | Caro, casi seguro taken |

### Recomendación

**Top 3 candidatos a verificar primero**, en este orden:

1. **`coopjuegos.com`** — máximo SEO match. Si está libre, cómpralo sin pensar.
2. **`pikoplay.com`** — mejor para branding y reusar IP de PikoPark.
3. **`multijuega.com`** — buen balance, verbo de acción.

**Verificar en**: [Porkbun](https://porkbun.com), [Namecheap](https://namecheap.com) o [Cloudflare Registrar](https://domains.cloudflare.com).

> Si `coopjuegos.com` está libre, mi voto es ese. SEO directo gana al brand al inicio cuando no tienes audiencia.

---

## 4. Stack técnico final

| Capa | Tecnología | Coste |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui | 0€ |
| Hosting | Cloudflare Pages (frontend) | 0€ |
| Base de datos | Neon Postgres (free tier 3GB) | 0€ |
| Auth | Clerk (free hasta 10k MAU) | 0€ |
| Almacenamiento assets | Cloudflare R2 (gratis hasta 10GB, egreso siempre gratis) | 0€ |
| Búsqueda | Meilisearch self-hosted o Algolia free | 0€ |
| Email transaccional | Resend (free 3k/mes) | 0€ |
| Analytics | Cloudflare Web Analytics | 0€ |
| Catálogo agregado | GameDistribution.com (revshare) | 0€ |
| Monetización | Google AdSense + AdSense for Games | 0€ |
| Premium opcional | Stripe | 0€ + 1.4%+0.25€ por txn |

**Total fase MVP: ~12€/año (solo dominio).**

---

## 5. Pasos completos a ejecutar (en orden)

### Fase 0 — Setup (días 1-7)

1. **Keyword research** ✅ (hecho en este documento)
2. **Decidir nombre + verificar disponibilidad de dominio**
   - Verificar Tier A en Porkbun/Cloudflare
   - Decidir TLD (.com preferido, .gg como alternativa gaming)
3. **Comprar el dominio** (Porkbun o Cloudflare Registrar)
4. **Crear cuenta de Cloudflare**, añadir el dominio
   - Cambiar nameservers en el registrador
   - Esperar 1-2 horas a que propague
5. **Crear repositorio de GitHub** para el portal
6. **Inicializar proyecto Next.js**
   - `npx create-next-app@latest` con TypeScript, Tailwind, App Router
   - Estructura inicial de carpetas (`/app`, `/components`, `/lib`)

### Fase 1 — UI base (días 7-14)

7. **Decidir estilo visual**
   - 2-3 mockups de paleta + tipografía
   - Tono recomendado: oscuro arcade con acentos vivos (azul/magenta)
8. **Construir páginas críticas (sin login, sin DB todavía)**
   - `/` — Home con hero + secciones (destacados, categorías, populares)
   - `/c/[slug]` — Categoría
   - `/g/[slug]` — Detalle de juego (descripción + instrucciones + similares)
   - `/play/[slug]` — Pantalla de juego en iframe a pantalla completa
9. **Integrar PikoPark como primer juego destacado**
   - PikoPark sigue desplegado en Vercel/Render
   - El portal lo abre en iframe en `/play/pikopark`
   - Botón "Volver al portal" arriba

### Fase 2 — Backend mínimo (días 14-21)

10. **Crear cuenta de Neon** (Postgres serverless, free tier)
    - Crear proyecto, copiar connection string
    - Conectar Next.js (Drizzle ORM o Prisma)
11. **Esquema de base de datos**
    ```
    games:      id, slug, title, description, instructions, embed_url,
                thumb_url, category_id, source ('own'|'gd'|'manual'),
                license, plays_count, rating_avg, featured, created_at
    categories: id, slug, name, icon, sort
    tags / game_tags
    users:      id, email, name, avatar, created_at
    favorites:  user_id, game_id
    ratings:    user_id, game_id, stars
    play_logs:  game_id, ts (para popularity-sort)
    ```
12. **Panel admin mínimo**
    - `/admin` con contraseña simple por ahora (variable env)
    - Formulario para añadir juego: título, descripción, embed URL, thumb, categoría
    - Listado con editar/borrar

### Fase 3 — Lanzamiento (días 21-28)

13. **Despliegue a producción**
    - Conectar repo Git a Cloudflare Pages
    - Variables de entorno (Neon URL, Clerk keys cuando llegue, etc)
    - Apuntar dominio al deployment
14. **Registro en GameDistribution**
    - [gamedistribution.com](https://gamedistribution.com) → registrarse como publisher
    - Esperar 1-3 días aprobación
    - Obtener SDK + acceso al catálogo

### Fase 4 — Catálogo + SEO (mes 2)

15. **Subir 10 juegos curados de GameDistribution** vía panel admin
16. **SEO técnico**
    - Sitemap.xml dinámico
    - Robots.txt
    - Meta tags por página (Open Graph + Twitter Cards)
    - Schema.org markup `VideoGame` por cada `/g/[slug]`
    - Canonical URLs

### Fase 5 — Auth + engagement (mes 2-3)

17. **Login global con Clerk**
    - Crear cuenta Clerk, obtener API keys
    - Integración en Next.js middleware
    - Páginas /login, /signup
18. **Favoritos + perfil de usuario**
    - Tabla favoritos en Neon
    - Heart icon en game cards
    - Página `/u/[username]` con favoritos públicos
19. **Migrar auth de PikoPark a Clerk**
    - PikoPark server valida Clerk JWT en lugar de su AccountStore actual
    - Login unificado en todo el ecosistema

### Fase 6 — Monetización (mes 3-4)

20. **Verificar dominio en Google Search Console**
    - Subir verificación HTML
    - Submit sitemap
    - Empezar a ver impressions/clicks orgánicos
21. **Escribir 10 artículos SEO**
    - "Los 10 mejores juegos cooperativos de navegador 2026"
    - "Cómo jugar X con un amigo sin descargar nada"
    - Long-tail keywords objetivo
22. **Solicitar Google AdSense**
    - Requiere ~30+ páginas con contenido propio (ya las tendremos con catalog + blog)
    - Esperar 2-4 semanas aprobación
23. **Integrar anuncios**
    - Banner top en /g/[slug]
    - Banner sidebar en /play/[slug]
    - Pre-roll opcional antes de cargar el juego (rewarded video CPM alto)

### Fase 7 — Crecer o pivotar (mes 4-6)

24. **Subir catálogo a 50-100 juegos**
25. **Discord community** + RRSS (TikTok, Instagram, YouTube Shorts) clipeando momentos divertidos de PikoPark
26. **Métricas clave a vigilar (mensual)**:
    - Impressions en Search Console (creciendo MoM = SEO funciona)
    - MAU (engagement)
    - CPM efectivo en AdSense
    - Bounce rate < 60% en /g/[slug]
27. **Decisión 90 días post-launch**:
    - Tráfico SEO creciendo → invertir más (paid ads, más juegos propios)
    - Estancado → pivotar nicho o keywords

---

## 6. Análisis financiero

### Costes mensuales (sin IVA)

| Fase | MAU | Coste mensual |
|---|---|---|
| Fase MVP (mes 1-2) | < 1k | 1€ (dominio amortizado) |
| Crecimiento (mes 3-6) | 1k-10k | 1€ |
| Tracción (mes 6-12) | 10k-100k | 80-100€ |
| Escala (año 2) | 100k-500k | 250-350€ |
| Mass market (año 3+) | 1M+ | 500-1500€ |

### Ingresos esperados

CPMs realistas mercado España (gross, antes 32% AdSense):

- Display banner: 0,50-1,50€
- Pre-roll vídeo: 4-8€
- Rewarded vídeo: 6-12€
- Interstitial entre juegos: 2-5€

**Caso realista mes 6:** 5k DAU × 4 pv = 600k pv/mes × 1,20€ CPM mix = ~720€ brutos = ~420€ netos. Cubre infra + 340€ extra.

**Caso optimista mes 18:** 50k MAU + 10% tráfico EEUU = 4M pv × 1,80€ = 7200€ brutos = 4500€ netos. Cubre todo + 4300€ profit.

**Caso pesimista (sin SEO):** 100k pv/mes × 1€ = 65€ netos = pérdida de 15€/mes.

### Punto de break-even

Aproximadamente **3-4 meses post-launch** SI el SEO funciona. Si en mes 3 las impresiones de Google Search Console no crecen mes a mes, hay que pivotar el nicho.

---

## 7. Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| SEO no despega | Alta | Crítico | Nicho específico (cooperativo), contenido propio (PikoPark + blog) |
| AdSense rechaza el dominio | Media | Alto | Tener mucho contenido propio antes de pedir aprobación, no ser solo agregador |
| Demanda de juegos cooperativos baja | Media | Alto | Pivotar a otro nicho (kids, .io, multijugador genérico) |
| Burnout del fundador | Alta | Crítico | Ritmo sostenible, no quemar 100h/semana |
| Cambio algoritmo Google | Media | Alto | Diversificar tráfico (RRSS, Discord, marca directa) |

---

## 8. Lo que NO vamos a hacer (al menos al inicio)

- Apps móviles nativas (iOS/Android). Web first. Móvil web suficiente.
- Backend autoritativo para juegos third-party. Iframes y ya.
- Marketplace para devs externos. Demasiado complejo año 1.
- Crypto / Web3 / NFTs. Mercado tóxico, no aporta.
- Servidores de partidas matchmaking. Cada juego se monetiza solo.
- Foros internos / chat. Discord externo es suficiente.

---

## 9. Próxima sesión de trabajo: qué retomar

**Punto actual:** Step 1 completado (keyword research). Step 2 pendiente — decidir nombre + verificar disponibilidad de dominio.

**Tareas concretas para retomar:**
1. Usuario verifica disponibilidad de los 3 candidatos top:
   - `coopjuegos.com`
   - `pikoplay.com`
   - `multijuega.com`
2. Compra el dominio que esté libre y prefiera.
3. Volvemos al chat con el dominio comprado y arrancamos Step 4 (Cloudflare account).

---

## 10. Comandos útiles para retomar

```bash
# Cuando creemos el repo del portal:
mkdir portal-juegos && cd portal-juegos
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint
git init && git add -A && git commit -m "init"

# Conectar a GitHub remote (después de crear repo en github.com):
gh repo create portal-juegos --public --source=. --push

# Cuando llegue el momento de Cloudflare Pages:
# 1. cloudflare.com → Workers & Pages → Create → Connect Git → seleccionar repo
# 2. Build command: npm run build
# 3. Build output: .next
# 4. Variables de entorno: copiar de .env.local
```

---

## 11. Notas misceláneas

- El plan está diseñado para ser ejecutable por una sola persona (tú) + Claude en VSCode.
- Tiempo estimado al MVP en producción: **3-4 semanas a ritmo part-time** (10-15h/semana) o **1-2 semanas full-time**.
- Si en cualquier paso encuentras fricción, abre de nuevo este doc y revisamos.
