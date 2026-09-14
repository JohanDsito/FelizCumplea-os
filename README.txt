PORTAL DE CUMPLEAÑOS — MARÍA MERCEDES TULCÁN CABRERA
════════════════════════════════════════════════════════════════

Invitación de una sola página. Sin dependencias ni compilación:
se sube la carpeta completa a cualquier hosting estático.


ESTRUCTURA
────────────────────────────────────────────────────────────────

  config.js     ← LO ÚNICO QUE NECESITAS EDITAR
                  Nombres, fecha, lugar, textos, canción, colores.

  index.html      El contenido de la página.
  styles.css      Los estilos.
  app.js          La lógica (cuenta regresiva, música, calendario).
  assets/
    maria_mercedes.jpg
    tu-cumpleanos.mp3

Para cambiar la fecha, el lugar o cualquier texto NO hace falta
abrir el HTML: todo está en config.js, comentado línea por línea.
El index.html trae los mismos textos ya escritos para que la página
se vea bien aunque el JavaScript falle; config.js los sobrescribe al
cargar. Si cambias un texto en config.js, se aplica solo.


⚠️  ANTES DE PUBLICAR — UN SOLO PASO MANUAL
────────────────────────────────────────────────────────────────
En index.html, dentro del bloque OPEN GRAPH del <head>, reemplaza:

    <meta property="og:image" content="assets/maria_mercedes.jpg">

por la URL ABSOLUTA real del sitio, por ejemplo:

    <meta property="og:image" content="https://tudominio.com/assets/maria_mercedes.jpg">

WhatsApp y Facebook exigen URL absoluta. Sin esto, el enlace se
comparte sin foto de vista previa.

Estas etiquetas son las únicas que no están en config.js, porque
WhatsApp las lee antes de ejecutar cualquier JavaScript.


LA MÚSICA Y EL SOBRE
────────────────────────────────────────────────────────────────
La canción es ahora un archivo MP3 propio, en assets/, reproducido
con un reproductor hecho a medida: disco girando, barra de progreso
que se puede arrastrar y tiempos. Ya no se usa el reproductor
incrustado de YouTube, así que la página no hace ninguna petición a
servidores de terceros para el audio.

La versión original pedía autoplay con sonido al cargar. Eso NUNCA
funcionó: todos los navegadores bloquean el audio automático si no
hubo antes un gesto del usuario.

Ahora la página abre con un sobre lacrado. El toque sobre el sello
sí es un gesto válido, así que la música arranca en ese momento con
sonido, de forma confiable y en todos los navegadores. Entra con un
fundido de volumen para que no sea un golpe seco.

El archivo empieza a descargarse mientras se ve el sobre, así que
para cuando se toca el sello ya suele estar listo. Si aún va a medias,
aparece el aviso "Cargando la canción…" bajo el sobre.

Un botón flotante permite pausar y reanudar en cualquier momento.

Cambiar de canción: pon el archivo en assets/ y escribe su nombre en
config.js → musica.archivo. Evita espacios y tildes en el nombre del
archivo; algunos servidores no los sirven bien.

Nota sobre el peso: el MP3 actual pesa 5,3 MB (192 kbps, 3:54). Si
quieres que cargue más rápido en datos móviles, se puede recomprimir
a 128 kbps, que baja a unos 3,5 MB sin diferencia audible en el
parlante de un teléfono.

Nota sobre el alojamiento: a diferencia de la versión anterior, que
sólo incrustaba el video oficial, ahora el archivo de audio se aloja
en el sitio. Para una invitación privada compartida por WhatsApp no
suele ser un tema; tenlo en cuenta si la página se hiciera pública.


SI LA MÚSICA NO SUENA EN EL CELULAR
────────────────────────────────────────────────────────────────
Los teléfonos son mucho más estrictos que un computador. Las causas
habituales, en orden:

1. iPhone con el interruptor lateral en silencio.
   Es la causa número uno. Ese interruptor calla la música de las
   páginas web. La página intenta sortearlo enrutando el sonido por
   la Web Audio API, que suele sonar igual, pero no siempre.

2. El volumen multimedia del teléfono está bajo.
   Es un volumen distinto al del timbre. Súbelo mientras suena.

3. La canción todavía se está descargando.
   Con datos móviles lentos, los 5,3 MB tardan. Aparece el aviso
   "Cargando la canción…" bajo el sobre.

4. Modo de ahorro de datos activado.

Si el sonido no arranca, la página no se queda callada sin más:
muestra arriba un botón rojo "Toca aquí para escuchar la música".
Tocarlo lo intenta de nuevo, y casi siempre funciona.

PARA AVERIGUAR QUÉ PASA EN UN TELÉFONO CONCRETO:
añade  ?debug  al final del enlace. Por ejemplo:

    https://tusitio.com/?debug

Aparece abajo un recuadro verde con el estado real del audio. Las
líneas que importan:

    carga     : debe llegar a "4 completo"
    error     : debe decir "ninguno"
    web audio : debe decir "running"
    segundo   : debe ir subiendo

Si "segundo" sube pero no se oye nada, el archivo está sonando y el
problema es el silencio o el volumen del teléfono, no la página.


QUÉ INCLUYE
────────────────────────────────────────────────────────────────
· Sobre lacrado de apertura, con confeti
· Reproductor de música propio, con control flotante
· Aviso de respaldo si el teléfono bloquea el sonido
· Diagnóstico de audio con ?debug
· Datos del evento, con botones a Google Maps y a Waze
· "Agendar": genera un archivo .ics en el navegador, con recordatorio
  configurable. No requiere servidor
· Compartir mediante el menú nativo del teléfono, con copia del
  enlace como respaldo
· Vista propia para escritorio
· Vista previa al compartir por WhatsApp (Open Graph)


ACCESIBILIDAD
────────────────────────────────────────────────────────────────
· Todos los textos cumplen contraste WCAG AA sobre su fondo
· Los iconos son SVG decorativos, ocultos al lector de pantalla
· La cuenta regresiva se anuncia cada minuto, no cada segundo
· Respeta "reducir movimiento" del sistema: sin confeti, sin
  animaciones y sin fundido de volumen
· La cuenta regresiva se retiró a petición; las fechas de config.js
  se siguen usando para el archivo de calendario
· Navegable por teclado, con foco visible
· Si el navegador no ejecuta JavaScript, se muestra la invitación
  completa sin el sobre


SI ALGO NO FUNCIONA
────────────────────────────────────────────────────────────────
· "No se pudo cargar la canción": revisa que el nombre en
  config.js → musica.archivo coincida exactamente con el archivo
  que está en assets/, incluidas mayúsculas.

· La barra de progreso no deja adelantar la canción: el servidor
  donde publicaste no admite peticiones de rango. Los hostings
  habituales (Netlify, Vercel, GitHub Pages, cPanel) sí las admiten.

· Al abrir index.html con doble clic desde el escritorio algunas
  cosas fallan por seguridad del navegador. Pruébalo siempre
  publicado, o con un servidor local.
