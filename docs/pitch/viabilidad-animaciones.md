# Viabilidad: usar elementos del juego en el pitch web (3 min)

Proyecto: `/Users/raulcano/Desktop/vestigia/vestigia/game/Vestigia` (Unity 6.5 `6000.5.9f1`, URP 17.5, Timeline 1.8.12 ya instalado). Análisis de solo lectura; no se modificó nada del juego.

## Resumen ejecutivo

1. **Sí es viable**, pero la vía recomendada es **renders/capturas desde Unity → video (mp4/webm) + imágenes por capas**, no glTF ni WebGL build.
2. **Hallazgo importante: el pueblo NO es una maqueta de cartón en el proyecto.** `Escena2_Pueblo.unity` usa modelos low-poly estilizados (casas, faro, muelle, barcos, vallas) sobre terreno con texturas de hierba/arena. La estética "maqueta/papel" del documento (`docs/BRUJULA_PROYECTO.md` L83-84, L190-194) hoy solo vive en los **personajes 2D recortados** y la **libreta**. Para lograr el look de diorama de cartón habría que añadir un tratamiento en render (ver §4, escena B).
3. **Licencias:** casi todo el 3D de entorno es de terceros (README lista dos packs de Asset Store, y hay muchos más sin documentar). Lo seguro: **libreta, UI, scripts, luces/composición propia y, con reservas, los sprites de personajes**.
4. El video `Art/Cinemáticas/vestigia_intro_alpha.mp4` es un **puntero Git LFS (134 bytes, 112 MB reales)**: hay que `git lfs pull` para usarlo. Podría ser la mejor fuente de "maqueta" ya hecha (nombre sugiere canal alfa).

## 1. Inventario de assets (con rutas)

Base: `game/Vestigia/Assets/` (Art = 4.8 GB, el grueso en `Art/Environments` 4.7 GB).

| Tipo | Contenido | Ruta |
|---|---|---|
| Escenas | Intro, **Pueblo**, Faro (+3 pisos), Observatorio (+interior), Menú, Salas | `Scenes/Escena1_Intro`, `Escena2_Pueblo` (2.5 MB, la más cargada), `Escena3_Faro`, `Escena3.1/3.2/3.3_*Piso`, `Escenario4_Observatorio`, `Escena4.1_InteriorObservatorio`, `Menu_Inicio`, `Salas` |
| Modelos (fbx/obj) | Casas (Iglesia, Cabaña2, Casa3, CasaGuardia, DogHouse, SandHouse), Faro encendido/apagado, Observatorio (geodésico), Pescador (cabaña, bote, muelle, caña, botella, banco), Barco, Puesto (carro, cajas), Fuente, Molino de viento, Antena, Radio, Telescopio, Triciclo, Tiburón, Señales, Vallas, Barriles, Sillas, Lata, Linterna, Panel, SimpleNaturePack (24 prefabs) | `Art/Environments/*` |
| Interiores | Faro interior (~40 subcarpetas: motor, palancas, gabinete, fusibles, engranajes, mapa, radio2, resonador…) y Observatorio interior | `Art/Environments/FARO INTERIOR/`, `Art/Environments/OBSERVATORIO INTERIOR/` |
| Sprites personajes (PNG con alfa) | Velador idle/hablando (600×1576), Pescador idle/hablando (579×1337), Científica (2040×1536) | `Art/Character/{Velador,Fisherman,Scient}/` |
| Criatura | `YARO.png` 8101×8101 (foto de alebrije, fondo transparente) | `Art/Yaro/YARO.png` |
| UI libreta | `LibretaFotoVelador.png` 7363×5555 (libreta abierta con fotos y texto manuscrito), fotos del faro pt1-3 + FotoReparada, menú de pausa (RadioMenu, botones), Spacebar | `Art/UI/` |
| Materiales/shaders | 13 materiales propios (MAT_Water, MAT_LightOn/WindowOn…), `CameraBlur.shader`, Water Toon (Asset Store, no incluido), RT_PuzzleBlur | `Art/Materials/`, `Art/Shaders/`, `Visual/RenderTextures/` |
| Terreno | `TerrainPueblo.asset` + capas (arena, hierba, camino, tierra) | `Assets/TerrainPueblo.asset`, `Textures/Ground/` |
| Animaciones | Pescador_Talking, Velador_Talking, RadioStatic.anim, StaticImage.controller, Spacebar_press | `Art/Character/*`, `Audio/SFX/` |
| Efectos | Niebla (Whitish/Bluish/Redish Fog), prefab Rain, PauseEffects, 3D Games Effects Pack | `Fog Particles/`, `PrefabsVestigia/Rain.prefab`, `_Creepy_Cat/` |
| Audio | **Lluvia** `SFX/Rain.wav`; **estática** `SFX/Static.wav`, `Radio Tuning.wav`, `Environment/gritoEstatica.wav`, `Textures/Estatica/02.jpg,03.jpg`; olas `Environment/Nature_Beach_Night…wav`; papel `SFX/Paper_Pull.wav`; música `Music/{Ambient Track: Homecoming.wav, Tears.mp3; Soundtrack Intro: alexunderthesky_cosmic-ambient…, cosmic_main.wav; End Track: Luke PN – Cosmic Universe…}`; voz `Voice/Voice.wav`; sonidos de Yaro | `Audio/` (156 MB) |
| Cinemática | `vestigia_intro_alpha.mp4` (LFS, 112 MB) | `Art/Cinemáticas/` |

Composición del Pueblo (conteo de referencias en la escena): SimpleNaturePack (árboles/rocas, ~6.8k refs), Low Poly Environment Starter Kit, Vallas, Whitish Fog, Casas, Pescador, Barril, Sillas, Barco, Puesto, Fuente.

## 2. Vías técnicas

| Vía | Esfuerzo | Calidad | Riesgo rendimiento (pantalla grande de paneles) | Qué hace falta en Unity |
|---|---|---|---|---|
| **(a) Renders/capturas HD** | Bajo | Alta (4K/8K, URP + post) | Ninguno (imágenes estáticas) | Cámara + Game View a 3840×2160; `ScreenCapture.CaptureScreenshot(path, superSize)` o Recorder (paquete `com.unity.recorder`, no instalado) |
| **(b) Video/loops** | Bajo-medio | Alta; reproduce lluvia, niebla, luces reales | Medio: 4K H.264/VP9 pesa en CPU/GPU; **usar 1080p–1440p, loops cortos (4–8 s), ≤10 Mbps** | Timeline (ya instalado) con cámara dolly/zoom; Recorder → mp4 (H.264) o webm VP9. **Alfa real:** Recorder → *Image sequence PNG* con alfa → convertir con ffmpeg a webm VP9 `yuva420p`. Safari no soporta bien webm con alfa; en Chrome/kiosco sí |
| **(c) glTF + three.js** | Alto | Media: se pierden shaders URP, Water Toon, niebla, post | **Alto**: escena completa (SimpleNaturePack ~miles de objetos) es pesada; solo viable con 1–3 modelos | Exportar FBX → glTF (Blender o paquete UnityGLTF); re-asignar materiales/texturas (texturas 4K comprimir a ≤1K). Además arrastra el problema de licencias del modelo |
| **(d) Capas parallax desde renders** | Medio | Muy alta y muy barata de animar en HTML/CSS/GSAP | Muy bajo (PNG/WebP en transform GPU) | Renders con **cámara ortográfica/fija**, fondo transparente por capas (primer plano/casas/faro/cielo/niebla) activando/desactivando grupos; o render con Z-depth para separar. Complemento ideal de (a) |
| **(e) WebGL build de Unity** | Alto | Fiel al juego pero sin control cinematográfico | **Muy alto** (build 100+ MB, GPU/RAM, sin garantías en kiosco); 4.8 GB de Art | Cambiar plataforma, revisar shaders/URP para WebGL, Addressables. **Descartada** para pitch de 3 min |

Conclusión: **(a)+(b)+(d)** combinados; (c) solo para un objeto aislado (libreta ya es 2D, no necesita 3D); (e) no.

## 3. Licencias: propio vs. terceros

Nota: no encontré en el repo un documento de licencias; el README del juego solo lista 2 packs y avisa de "respetar licencias". Clasificación por indicios (carpetas, nombres, packs). **Verificar con el equipo antes de publicar.**

### Aparentemente PROPIO / seguro (confirmar autoría)
- `Art/UI/LibretaFotoVelador.png` y `Art/UI/Fotos Faro/*` (libreta, fotos, texto manuscrito; estilo coherente con el juego).
- `Art/UI/Menu Pausa/*`, `Art/UI/Spacebar/*`, logo/menú.
- `Art/Materials/MAT_*`, `Art/Shaders/CameraBlur.shader`, `Visual/RenderTextures`, `Core/`, `Gameplay/`, `PrefabsVestigia/` (scripts, materiales y prefabs propios).
- Composición de escena, iluminación, terreno (`TerrainPueblo.asset`) y cualquier render/captura que hagan ustedes **solo en la parte de composición** (la geometría base sigue siendo ajena).
- `Art/Cinemáticas/vestigia_intro_alpha.mp4` (nombre propio; confirmar con quien lo hizo y qué contiene).

### DUDOSO (origen no documentado; aclarar antes de usar)
- **Sprites de personajes** (`Art/Character/*`, `Art/Yaro/YARO.png`): parecen ilustraciones generadas/retocadas o fotografía (YARO es una foto de alebrije artesanal). Confirmar quién los creó, si hay IA de por medio y derechos de la fotografía/artesanía.
- **Audio**: pistas con nombres de librería/artista (`Luke PN – Cosmic Universe Piano`, `alexunderthesky_cosmic-ambient`, `Homecoming`, `Tears`, `…SDHOLLW_55842` y `…SDCLBRY_00581` = bancos de sonido tipo Sound Ideas/BOOM, `AnimalTiger`, `Atmospheric Alien Beast`). **No usar la música ni esos SFX** en el pitch sin licencia; si se necesita audio, usar `Rain.wav`/`Static.wav` solo si se confirma autoría, o grabar/componer propio.

### TERCEROS (no usar sin licencia confirmada)
- Packs de Asset Store identificables: `Low Poly Environment Starter Kit/`, `Space Skybox/` (Space Skyboxes 4K Free), `Fog Particles/`, `_Creepy_Cat/3D Games Effects Pack Free`, `CaptainCatSparrow/PBR_Materials`, `Blue Olive Studio/Magic Spellbook & Book Stand`, `TextMesh Pro` (Unity, uso libre dentro de Unity), AQUIS Water Toon (README).
- Modelos 3D sueltos en `Art/Environments/` con nombres típicos de repositorios (Sketchfab/CGTrader/TurboSquid): `Stylized_House_v1/v4`, `cabin_v1`, `dog_house_v1`, `Lighthouse_v1_Lit/Unlit`, `Old_Bottle_of_Alcohol_v5`, `wood_bridge_max_mental_ray_2015`, `wooden_log_bench`, `Small Wooden Boat`, `Coin_Operated_Telescope_v2`, `Geodesic_Dome_House`, `purple_pickerel_rush_flowers`, `SimpleNaturePack` (pack gratuito de Asset Store), `CasaGuardia/house.blend`. **Incluye faro, casas y observatorio**: sus renders pueden ser derivados de modelos con licencias distintas (algunas CC-BY exigen atribución, otras prohíben uso comercial).

**Regla práctica:** un render del pueblo completo contiene muchos modelos de terceros → riesgo. Para el pitch, priorizar elementos propios (libreta, fotos, UI, siluetas) y tratar el 3D como **silueta/fondo difuminado y estilizado** o sustituirlo por maqueta física fotografiada/ilustración propia.

## 4. Recomendación: 5 escenas de alto impacto

### A. La libreta que se abre (100% propio, bajo riesgo) — *prioridad 1*
- Fuente: `Art/UI/LibretaFotoVelador.png` (+ `Fotos Faro/pt1-3.png`, `FotoReparada.png`).
- Pasos: exportar WebP ~3000 px; en HTML recortar en capas (hoja izquierda, hoja derecha, 3 fotos, texto) con CSS 3D `rotateY` para abrir/pasar página; las fotos "se pegan" con GSAP; sombra y vignette en CSS. Añadir polvo/grano con canvas. Sin Unity.
- Mensaje: el misterio se descubre en el cuaderno.

### B. El pueblo como diorama de cartón en la noche (más iconográfico; requiere trabajo)
- Aprovecha el texto del documento ("pequeñas maquetas conectadas").
- Pasos: 1) en Unity, escena `Escena2_Pueblo`, cámara ortográfica/3-4 con Timeline (dolly lento + rack focus); 2) aplicar look papel: post-proceso (Volume URP) con grano, viñeta, bordes recortados, o shader tipo "toon/paper" y **sustituir texturas por cartulina**; 3) renderizar por capas (primer plano, casas, faro, niebla, cielo) con alfa → PNG; 4) en HTML parallax con GSAP/mousemove-like automático, luz del faro como `radial-gradient` rotando, lluvia en canvas.
- Riesgo licencias: usar siluetas/oscuras y con desenfoque para no mostrar modelos reconocibles, o sustituir por ilustración propia recortada sobre cartón.

### C. Faro encendiéndose / haz de luz (3D tercero → tratar como silueta)
- Fuente: `Art/Environments/Faro/Apagado|Encendido` (modelo de tercero) y `MAT_LightOn/WindowOn`.
- Pasos: render de 6–8 s en Unity (cámara fija, apagado→encendido con Timeline), exportar mp4 1080p; en web superponer haz de luz con CSS (`conic-gradient` rotando + blend `screen`) en vez de depender del render. Mantener el faro como silueta negra contra cielo.

### D. Estática / radio y señal (propio, efectos)
- Fuente: `Textures/Estatica/02.jpg,03.jpg`, `Art/UI/Menu Pausa/RadioMenu.png`, idea de coordenadas del puzzle de la radio.
- Pasos: capa de ruido en `<canvas>` (o las texturas con jitter), glitch del título, aguja de la radio animada con CSS sobre `RadioMenu.png`. Audio: `Static.wav`/`Radio Tuning.wav` solo si se confirma autoría; si no, generar ruido con WebAudio.

### E. Yaro / aparición del fenómeno + reveal (con reservas)
- Fuente: `Art/Yaro/YARO.png` (alfa, 8101 px) y sprites del Velador/Científica.
- Pasos: recortes a WebP, entran por la niebla (capas de `Fog Particles/Texture` solo si se confirma licencia, o niebla propia en canvas), parpadeo de silueta sincronizado con estática. **Confirmar derechos de YARO y de los personajes antes** (§3 dudosos).

### Orden sugerido en los 3 minutos
Libreta (apertura/gancho) → pueblo-diorama (mundo) → faro (misterio) → estática/radio (tensión) → Yaro/personajes (cierre).

## 5. Pendientes antes de producir
1. `git lfs pull` para obtener `vestigia_intro_alpha.mp4` y los PNG en LFS (p. ej. `FARO INTERIOR/Gabinete/**/*.png`); inspeccionar su contenido.
2. Confirmar con el equipo autoría de libreta, personajes, Yaro, y audio de Intro/Ambient/End.
3. Decidir si el look "cartón" se logra en Unity (post-proceso/capas) o en la web (filtros CSS/WebGL shader) sobre renders oscuros/desenfocados.
4. Si se quiere Recorder/Alembic: instalar `com.unity.recorder` solo en una **copia** del proyecto, para no modificar el original.
