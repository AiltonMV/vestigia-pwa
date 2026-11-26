# VESTIGIA · Pitch de 3 min · Guion v2 y storyboard

Estado: borrador para revisión del equipo. El tráiler va antes y aparte de los 3 minutos. Después del pitch hay un stand con la demo.

## Decisiones tomadas

- HTML animado en navegador, 16:9 (resolución final por confirmar tras la prueba en la pantalla de paneles).
- Avance con flechas del teclado (← →). Cada flecha → dispara el siguiente paso, para que quienes presentan controlen el ritmo.
- Colores oficiales: azul marino `#000F20`, amarillo `#FFCC00` (única luz), Papel `#F6F1E7`, Marfil `#FFFCF4`, Piedra `#D7D1C6`, Niebla `#9EABB6`, Pizarra `#263A49`, Carbón `#17212B`.
- Tipografía: Literata (títulos y narrativa), Mona Sans (etiquetas y UI), Playball solo para el logotipo "Vestigia" con "armando maqueta" debajo, como en la pantalla de carga de la PWA.
- Audio opcional (tecla M): lluvia, estática, papel. Sin sustos sonoros. La presentación funciona en silencio.
- La ilustradora solo se menciona en voz, sin pantalla de créditos.
- Sin spoiler del giro (Janeth es la madre). Sin rostro de Janeth. Sin terror.

## Guion v2 (≈290 palabras, ≈2:30 hablado + pausas de animación)

Voces provisionales: A y B. Se ajustan cuando el equipo confirme el reparto.

| # | Tiempo | Punto de la profesora | Voz | Texto |
|---|---|---|---|---|
| 1 | 0:00–0:10 | Hook | A | ¿Qué ocurre cuando aquello que nos amenaza no podemos verlo, tocarlo ni detenerlo? Algo indiferente, que tal vez ni siquiera sabe que existimos. |
| 2 | 0:10–0:30 | Contexto del hook | A | Un pueblo costero [¿1940?]. Las luces comenzaron a seguir patrones extraños. Las radios reproducían voces familiares… voces que ya no deberían existir. Entonces llega Janeth, una científica que intenta entender lo que ocurre. |
| 3 | 0:30–0:45 | Concepto, género y plataforma | A | Esto es Vestigia: una aventura de misterio y suspenso cósmico para PC, que se juega con tu teléfono en la mano. |
| 4 | 0:45–1:15 | Core gameplay loop | B | Exploras el pueblo, el faro y el observatorio. Giras la cámara y aparecen caminos y pistas que antes estaban ocultos. Cada pista abre un acertijo: sintonizas una radio entre la estática, armas una fotografía rota, limpias el lente de un mirador, apuntas al cielo. A veces, para descubrir algo, no necesitas buscar más… necesitas aprender a mirar de otra manera. |
| 5 | 1:15–1:45 | Diferenciador (USP) | B | Y la investigación no se limita al monitor. Tu teléfono es la libreta de Janeth: sus notas, sus pistas, todo en tu mano. Lo que resuelvas aquí abre el camino allá. Dos pantallas, una historia de unos quince minutos, sin combate. |
| 6 | 1:45–2:15 | Diferenciador (arte) | A | Los escenarios, los puzles y su continuidad los diseñamos nosotros, con una estética de maqueta de cartón y papel. Para los personajes y otros elementos visuales contamos con la colaboración de una ilustradora. |
| 7 | 2:15–2:40 | Estado actual y equipo | A | Hoy tenemos un prototipo jugable de principio a fin, que se recorre en unos quince minutos. Somos Quetzal Bytes. Un equipo que cree que algunas personas no se van. Se quedan en lo que dejaron… esperando a que alguien aprenda a mirar. |
| 8 | 2:40–3:00 | Llamada a la acción | B | Lo que Janeth vio esa noche lo dejó escrito. Su libreta está en nuestro stand. Abrirla… es decisión de ustedes. |

Cambios respecto al borrador:
- "horror cósmico" pasa a "misterio y suspenso cósmico" (el proyecto dice sin terror). Decisión del equipo.
- Se agrega una frase de qué hace el jugador (los 4 acertijos) y la duración del prototipo.
- Se quita "3 de 3 completaron el prototipo": los presentadores no lo sostienen.
- El CTA ahora es concreto: ir al stand.
- "1940": pendiente de confirmar, el documento final no lo menciona.

## Storyboard (pasos con flecha →)

Cada escena entra lenta (400-700 ms), sin rebotes, con una sola animación protagonista. Fondo: azul marino con lluvia diagonal muy tenue.

| # | Escena | Qué se ve | Animación protagonista | Pasos → |
|---|---|---|---|---|
| 0 | Reposo | Fondo oscuro liso, sin logo ni texto, como un cristal con lluvia | Gotas que se detienen, se juntan y escurren dejando su rastro | 1 |
| 1 | Hook | La maqueta oscura, una sola luz amarilla | La pregunta aparece línea por línea como papel que se asienta | 2 |
| 2 | El pueblo | Maqueta del pueblo costero con lluvia | Estática que se estabiliza en una voz. Entra Janeth de espaldas | 2 |
| 3 | Concepto | Logo "Vestigia" en Playball y "armando maqueta" abajo. Chips: PC + celular, Misterio | Logo que se arma como pieza de cartón | 1 |
| 4 | Core loop | Maqueta que gira 90° y revela una pista | Giro de cámara. Después 4 iconos de línea (radio, foto, lente, cielo) en amarillo | 3 |
| 5 | Libreta | PC a un lado y celular con la libreta al otro | Tarjeta de papel Papel/Marfil que se desliza; una pista viaja de pantalla a pantalla | 2 |
| 6 | Arte y mundo | Recortes de papel y personajes ilustrados | Piezas que se ensamblan | 1 |
| 7 | Estado y equipo | Cifra grande en serif amarillo: "~15 min por partida" | Cifra que se estabiliza como estática | 1 |
| 8 | Cierre / CTA | Libreta cerrada sobre una mesa, el stand | La libreta se abre lentamente. Todo se aleja y vuelve a ser maqueta | 1 |

## Material de animación propia

Se decide cuando termine el análisis del hilo "Viabilidad animaciones del juego para pitch" (informe en `docs/pitch/viabilidad-animaciones.md`). Mientras tanto, la presentación usa maquetas y recortes dibujados en SVG/CSS como respaldo, así que no depende de ese resultado.

## Pendientes

- Reparto de voces entre los dos presentadores.
- Confirmar año "1940" y si "horror cósmico" se queda.
- Resolución real de la pantalla (prueba de la tarde).
- Logo en archivo (SVG/PNG) o reconstruirlo con Playball.
- Capturas o clips del juego y cómo aparecen en la presentación.
