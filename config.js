/* ═══════════════════════════════════════════════════════════════════
   CONFIGURACIÓN — el único archivo que necesitas tocar.
   Todo lo editable de la invitación vive aquí: nombres, fecha, lugar,
   textos y canción. No hace falta abrir ningún otro archivo.
   ═══════════════════════════════════════════════════════════════════ */

window.CONFIG = {

  /* ─── A QUIÉN SE CELEBRA ─────────────────────────────────────── */
  persona: {
    nombre   : "María Mercedes",       // se muestra grande, en rosa
    apellido : "Tulcán Cabrera",       // debajo, en mayúsculas espaciadas
    iniciales: "MM",                   // van en el sello del sobre
    foto     : "assets/maria_mercedes.jpg",
    fotoAlt  : "María Mercedes Tulcán Cabrera sonriendo en su oficina",
    // tamaño real de la foto: evita que la página “salte” al cargarla
    fotoAncho: 1284,
    fotoAlto : 1496,
    // qué parte de la foto se ve. 50% = centrada horizontal.
    // El segundo valor sube o baja el encuadre: menor = se ve más arriba.
    fotoEncuadre: "50% 36%"
  },

  /* ─── CUÁNDO ──────────────────────────────────────────────────────
     Estas dos fechas son las que se guardan en el calendario cuando
     alguien pulsa "Agendar". Lo que se lee en pantalla son los textos
     de más abajo.

     Formato: "AAAA-MM-DDTHH:MM:SS-05:00"
     El -05:00 final es la hora de Colombia. No lo quites: sin él, a
     quien esté en otro país se le guardaría a una hora distinta.
     Usa formato de 24 horas (las 12 del mediodía son las 12:00,
     las 8 de la noche son las 20:00).                               */
  evento: {
    inicio : "2026-09-18T12:00:00-05:00",
    fin    : "2026-09-18T16:00:00-05:00",   // para el archivo de calendario
    // cómo se lee la fecha en pantalla
    fechaTexto : "Viernes 18 de septiembre",
    anioTexto  : "2026",
    horaTexto  : "12:00 p. m.",
    horaNota   : "Te esperamos puntual",
    // cuántas horas antes debe avisar el recordatorio del calendario
    recordatorioHorasAntes: 2
  },

  /* ─── DÓNDE ──────────────────────────────────────────────────── */
  lugar: {
    nombre    : "Restaurante San Julian’s",
    direccion : "Calle 19A #42-18, Pandiaco",
    ciudad    : "Pasto, Nariño",
    // lo que se busca en Google Maps y Waze al pulsar los botones
    busqueda  : "Restaurante San Julian's, Cl. 19A #42-18, Pandiaco, Pasto, Nariño"
  },

  /* ─── LA CANCIÓN ──────────────────────────────────────────────────
     Pon tu archivo en la carpeta assets/ y escribe aquí su nombre.
     Evita espacios y tildes en el nombre del archivo: algunos
     servidores no los sirven bien.                                  */
  musica: {
    archivo : "assets/tu-cumpleanos.mp3",
    titulo  : "Tu Cumpleaños",
    artista : "Diomedes Díaz",
    repetir : true,      // true = vuelve a empezar al terminar
    volumen : 0.85,      // de 0 a 1
    // sube el volumen poco a poco al abrir el sobre, en vez de golpe seco
    fundidoEntradaSegundos: 2.5
  },

  /* ─── TEXTOS ──────────────────────────────────────────────────── */
  textos: {
    // el sobre, antes de abrir
    sobreEncabezado : "Una sorpresa muy especial",
    sobreTitulo     : "Ahora sí puedes descubrirlo",
    sobrePista      : "Toca el sello para abrir",

    // sobre la fotografía
    heroEncabezado  : "Esta vez la sorpresa es para ti",
    heroTitulo      : "Feliz cumpleaños",
    heroSubtitulo   : "Hoy celebramos tu vida. 🤎",

    // la dedicatoria
    dedicatoria     : "Queremos celebrar la vida de una mujer que, con su liderazgo, compromiso y calidez, hace la diferencia.",

    // el bloque intermedio
    pistaTitulo     : "¿Y qué te espera?",
    pistaTexto      : "Una celebración preparada especialmente para ti… con música, alegría y buena compañía.",

    // el cierre
    cierreFrase     : "La vida se celebra mejor con música, alegría y buena compañía.",
    cierreTexto     : "Gracias por todo lo que haces. Hoy la celebración es tuya.",
    firmaEncabezado : "Con cariño",
    firma           : "Tus funcionarios",

    // mensaje al compartir por WhatsApp
    compartirTitulo : "Esta vez, la sorpresa es para ti",
    compartirTexto  : "María Mercedes: te esperamos el viernes 18 de septiembre, 12:00 p. m., en San Julian's."
  },

  /* ─── EFECTOS ─────────────────────────────────────────────────────
     Quien tenga activado “reducir movimiento” en su teléfono no verá
     animaciones aunque aquí estén encendidas. Es intencional.       */
  efectos: {
    confeti       : true,
    confetiPiezas : 46
  },

  /* ─── COLORES ─────────────────────────────────────────────────────
     Opcional. Descomenta y cambia para repintar toda la invitación.
     Si lo dejas comentado, se usan los colores de styles.css.       */
  // colores: {
  //   "--rose"     : "#B0173F",   // acento principal
  //   "--gold"     : "#B8862F",   // filetes y detalles
  //   "--cream"    : "#FBF5EA",   // el papel
  //   "--espresso" : "#241509"    // los bloques oscuros
  // }
};
