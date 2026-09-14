/* ═══════════════════════════════════════════════════════════════════
   LÓGICA DE LA INVITACIÓN
   Para cambiar textos, fecha, lugar o canción edita config.js,
   no este archivo.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var C = window.CONFIG;
  if (!C){ console.error("Falta config.js: la invitación no puede iniciar."); return; }

  var $ = function(id){ return document.getElementById(id); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var INICIO = new Date(C.evento.inicio);
  var FIN    = new Date(C.evento.fin);

  if (isNaN(INICIO)){
    console.error('config.js: "evento.inicio" no es una fecha válida:', C.evento.inicio);
  }

  /* ══════════════════════════════════════════════════════════
     0 · VOLCAR LA CONFIGURACIÓN EN LA PÁGINA
     El index.html ya trae los textos escritos, para que la
     invitación se vea bien aunque el JavaScript falle. Aquí
     simplemente se sobrescriben con lo que diga config.js.
     ══════════════════════════════════════════════════════════ */
  function texto(id, valor){
    var el = $(id);
    if (el && valor != null) el.textContent = valor;
  }

  function aplicarConfig(){
    var t = C.textos, p = C.persona, e = C.evento, l = C.lugar, m = C.musica;

    // sobre
    texto("txtSobreEncabezado", t.sobreEncabezado);
    texto("txtSobreTitulo",     t.sobreTitulo);
    texto("txtSobrePista",      t.sobrePista);
    texto("txtIniciales",       p.iniciales);

    // fotografía
    var img = $("heroImg");
    if (img){
      img.src = p.foto;
      img.alt = p.fotoAlt;
      img.width  = p.fotoAncho;
      img.height = p.fotoAlto;
      img.style.objectPosition = p.fotoEncuadre;
    }
    texto("txtHeroEncabezado", t.heroEncabezado);
    texto("txtHeroTitulo",     t.heroTitulo);
    texto("txtHeroSubtitulo",  t.heroSubtitulo);

    // dedicatoria
    texto("txtNombre",      p.nombre);
    texto("txtApellido",    p.apellido);
    texto("txtDedicatoria", t.dedicatoria);

    // datos del evento
    texto("txtFecha",     e.fechaTexto);
    texto("txtAnio",      e.anioTexto);
    texto("txtHora",      e.horaTexto);
    texto("txtHoraNota",  e.horaNota);
    texto("txtLugar",     l.nombre);
    texto("txtDireccion", l.direccion);
    texto("txtCiudad",    l.ciudad);

    // enlaces de mapas
    var q = encodeURIComponent(l.busqueda);
    var maps = $("mapsLink"), waze = $("wazeLink");
    if (maps) maps.href = "https://www.google.com/maps/search/?api=1&query=" + q;
    if (waze) waze.href = "https://waze.com/ul?q=" + q + "&navigate=yes";

    // bloque intermedio y cierre
    texto("txtPistaTitulo",     t.pistaTitulo);
    texto("txtPistaTexto",      t.pistaTexto);
    texto("txtCierreFrase",     t.cierreFrase);
    texto("txtCierreTexto",     t.cierreTexto);
    texto("txtFirmaEncabezado", t.firmaEncabezado);
    texto("txtFirma",           t.firma);

    // canción
    texto("txtCancionTitulo",  m.titulo);
    texto("txtCancionArtista", m.artista);

    // título de la pestaña
    document.title = "Una sorpresa para " + p.nombre;

    // colores personalizados (opcionales)
    if (C.colores){
      for (var k in C.colores){
        if (Object.prototype.hasOwnProperty.call(C.colores, k)){
          document.documentElement.style.setProperty(k, C.colores[k]);
        }
      }
    }

    if (C.efectos.cuentaRegresiva === false){
      var cd = $("countdown");
      if (cd) cd.hidden = true;
    }
  }

  aplicarConfig();

  /* ══════════════════════════════════════════════════════════
     1 · MÚSICA
     Se reproduce el archivo de audio local indicado en config.js.
     El navegador exige un gesto del usuario para dejar sonar
     audio: ese gesto es el toque sobre el sello del sobre.
     ══════════════════════════════════════════════════════════ */
  var audio    = $("audio");
  var fab      = $("fab");
  var playBtn  = $("playBtn");
  var seek     = $("seek");
  var elapsed  = $("elapsed");
  var total    = $("total");
  var musicSec = $("musicSec");
  var sonando  = false;
  var buscando = false;   // el usuario está arrastrando la barra

  audio.src    = C.musica.archivo;
  audio.loop   = C.musica.repetir !== false;
  audio.volume = C.musica.volumen != null ? C.musica.volumen : 0.85;
  audio.preload = "auto";   // empieza a descargar mientras se ve el sobre

  function mmss(seg){
    if (!isFinite(seg) || seg < 0) return "0:00";
    var m = Math.floor(seg / 60), s = Math.floor(seg % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function pintarProgreso(){
    if (!isFinite(audio.duration) || buscando) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    seek.style.setProperty("--pct", pct + "%");
    elapsed.textContent = mmss(audio.currentTime);
    seek.setAttribute("aria-valuetext", mmss(audio.currentTime) + " de " + mmss(audio.duration));
  }

  function marcarEstado(v){
    sonando = v;
    fab.dataset.playing = playBtn.dataset.playing = v ? "1" : "0";
    var etiqueta = v ? "Pausar la música" : "Reproducir la música";
    fab.setAttribute("aria-label", etiqueta);
    playBtn.setAttribute("aria-label", etiqueta);
    musicSec.classList.toggle("playing", v);
  }

  /* sube el volumen poco a poco: entrar de golpe resulta agresivo */
  function reproducir(conFundido){
    var objetivo = C.musica.volumen != null ? C.musica.volumen : 0.85;
    var dur = C.musica.fundidoEntradaSegundos;

    if (conFundido && dur > 0 && !reduced){
      audio.volume = 0;
      var t0 = performance.now();
      var subir = function(now){
        var k = Math.min((now - t0) / (dur * 1000), 1);
        audio.volume = objetivo * k;
        if (k < 1) requestAnimationFrame(subir);
      };
      requestAnimationFrame(subir);
    } else {
      audio.volume = objetivo;
    }

    var intento = audio.play();
    if (intento && intento.catch){
      intento.catch(function(err){
        // si el navegador igual lo bloquea, el botón queda listo
        console.warn("El navegador no permitió iniciar el audio:", err && err.name);
        marcarEstado(false);
      });
    }
  }

  function alternar(){
    if (audio.paused) reproducir(false);
    else audio.pause();
  }

  audio.addEventListener("play",  function(){ marcarEstado(true);  });
  audio.addEventListener("pause", function(){ marcarEstado(false); });
  audio.addEventListener("timeupdate", pintarProgreso);
  audio.addEventListener("loadedmetadata", function(){
    total.textContent = mmss(audio.duration);
    seek.max = 100;
    pintarProgreso();
  });
  audio.addEventListener("ended", function(){ if (!audio.loop) marcarEstado(false); });
  audio.addEventListener("error", function(){
    musicSec.classList.add("failed");
    console.error("No se pudo cargar el audio:", C.musica.archivo);
  });

  fab.addEventListener("click", alternar);
  playBtn.addEventListener("click", alternar);

  // barra de progreso
  seek.addEventListener("input", function(){
    buscando = true;
    seek.style.setProperty("--pct", seek.value + "%");
    if (isFinite(audio.duration)) elapsed.textContent = mmss(audio.duration * seek.value / 100);
  });
  seek.addEventListener("change", function(){
    if (isFinite(audio.duration)) audio.currentTime = audio.duration * seek.value / 100;
    buscando = false;
  });

  /* ══════════════════════════════════════════════════════════
     2 · APERTURA DEL SOBRE
     ══════════════════════════════════════════════════════════ */
  var veil = $("veil"), openBtn = $("openBtn"), page = $("page");
  var abierto = false;

  // mientras el sobre esté cerrado, la página de atrás no debe recibir foco
  // (se aplica desde JS: si el script falla, la invitación sigue siendo usable)
  page.inert = true;

  // si la canción tarda en descargar, se avisa en lugar de dejar el sobre mudo
  var avisoCarga = setTimeout(function(){
    if (audio.readyState < 3) $("envLoading").classList.add("on");
  }, 2500);
  audio.addEventListener("canplay", function(){
    clearTimeout(avisoCarga);
    $("envLoading").classList.remove("on");
  });

  function abrir(){
    if (abierto) return;
    abierto = true;
    clearTimeout(avisoCarga);

    veil.classList.add("opening");
    reproducir(true);                       // dentro del gesto de usuario
    if (C.efectos.confeti && !reduced) confeti();

    setTimeout(function(){
      veil.classList.add("gone");
      page.inert = false;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = "";
      revelar();
      setTimeout(function(){ fab.classList.add("on"); }, 700);
    }, reduced ? 60 : 1150);
  }

  openBtn.addEventListener("click", abrir);
  veil.addEventListener("click", function(e){ if (e.target === veil) abrir(); });

  /* ══════════════════════════════════════════════════════════
     3 · CUENTA REGRESIVA
     ══════════════════════════════════════════════════════════ */
  var cd = { d:$("cd-d"), h:$("cd-h"), m:$("cd-m"), s:$("cd-s") };
  var previo = {}, srTick = 0;

  function pad(n){ return n < 10 ? "0" + n : "" + n; }

  function poner(el, val, clave){
    var txt = pad(val);
    if (previo[clave] === txt) return;
    previo[clave] = txt;
    el.textContent = txt;
    if (!reduced){
      el.classList.remove("tick");
      void el.offsetWidth;            // fuerza reinicio de la animación
      el.classList.add("tick");
    }
  }

  function cuentaRegresiva(){
    var falta = INICIO - Date.now();

    if (falta <= 0){
      $("cdGrid").hidden = true;
      $("cdDone").hidden = false;
      var enCurso = Date.now() < FIN;
      $("cdLabel").textContent = enCurso ? "Ahora mismo" : "Y así fue";
      $("cdDone").textContent  = enCurso
        ? "¡La celebración es ahora!"
        : "Gracias por celebrar con nosotros";
      $("cdSr").textContent = $("cdDone").textContent;
      return true;                    // detiene el intervalo
    }

    var s = Math.floor(falta / 1000);
    var d = Math.floor(s / 86400),
        h = Math.floor(s % 86400 / 3600),
        m = Math.floor(s % 3600 / 60),
        x = s % 60;

    poner(cd.d, d, "d"); poner(cd.h, h, "h"); poner(cd.m, m, "m"); poner(cd.s, x, "s");

    // el lector de pantalla se actualiza cada minuto, no cada segundo
    if (srTick++ % 60 === 0){
      $("cdSr").textContent = "Faltan " + d + " días, " + h + " horas y " + m + " minutos.";
    }
    return false;
  }

  if (C.efectos.cuentaRegresiva !== false && !isNaN(INICIO)){
    cuentaRegresiva();
    var reloj = setInterval(function(){ if (cuentaRegresiva()) clearInterval(reloj); }, 1000);
  }

  /* ══════════════════════════════════════════════════════════
     4 · AGENDAR (.ics) — se genera en el navegador, sin servidor
     ══════════════════════════════════════════════════════════ */
  function fechaICS(dt){ return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; }
  function escapar(s){ return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); }

  $("icsBtn").addEventListener("click", function(){
    var titulo = "Cumpleaños de " + C.persona.nombre + " " + C.persona.apellido;
    var sitio  = C.lugar.nombre + ", " + C.lugar.direccion + ", " + C.lugar.ciudad;
    var horas  = C.evento.recordatorioHorasAntes || 2;

    var cuerpo = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Portal Cumpleanos//ES","CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@invitacion",
      "DTSTAMP:" + fechaICS(new Date()),
      "DTSTART:" + fechaICS(INICIO),
      "DTEND:"   + fechaICS(FIN),
      "SUMMARY:"     + escapar(titulo),
      "LOCATION:"    + escapar(sitio),
      "DESCRIPTION:" + escapar(C.textos.pistaTexto),
      "BEGIN:VALARM","TRIGGER:-PT" + horas + "H","ACTION:DISPLAY",
      "DESCRIPTION:" + escapar(titulo),
      "END:VALARM","END:VEVENT","END:VCALENDAR"
    ].join("\r\n");

    var url = URL.createObjectURL(new Blob([cuerpo], { type:"text/calendar;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "cumpleanos-" + C.persona.nombre.toLowerCase().replace(/\s+/g, "-") + ".ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    aviso("Evento descargado · ábrelo para agendarlo");
  });

  /* ══════════════════════════════════════════════════════════
     5 · COMPARTIR
     ══════════════════════════════════════════════════════════ */
  $("shareBtn").addEventListener("click", async function(){
    var datos = {
      title: C.textos.compartirTitulo,
      text : C.textos.compartirTexto,
      url  : location.href
    };
    if (navigator.share){
      try { await navigator.share(datos); return; }
      catch(e){ if (e && e.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(location.href);
      aviso("Enlace copiado");
    } catch(e){
      aviso("Copia el enlace desde la barra del navegador");
    }
  });

  var temporizadorAviso;
  function aviso(msg){
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function(){ t.classList.remove("show"); }, 3200);
  }

  /* ══════════════════════════════════════════════════════════
     6 · REVELADO AL HACER SCROLL
     ══════════════════════════════════════════════════════════ */
  function revelar(){
    var items = document.querySelectorAll(".rv");
    if (reduced || !("IntersectionObserver" in window)){
      items.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en, i){
        if (!en.isIntersecting) return;
        setTimeout(function(){ en.target.classList.add("in"); }, i * 110);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    items.forEach(function(el){ io.observe(el); });
  }

  /* ══════════════════════════════════════════════════════════
     7 · CONFETI
     ══════════════════════════════════════════════════════════ */
  function confeti(){
    var host = $("confetti");
    var paleta = ["#D9B86A","#B8862F","#B0173F","#F4E9D7","#8C0F31"];
    var trozo = document.createDocumentFragment();
    var n = C.efectos.confetiPiezas || 46;

    for (var i = 0; i < n; i++){
      var p = document.createElement("i");
      p.className = "conf";
      p.style.left = (Math.random() * 100) + "vw";
      p.style.background = paleta[i % paleta.length];
      p.style.animationDuration = (2.6 + Math.random() * 2.4) + "s";
      p.style.animationDelay = (Math.random() * 1.1) + "s";
      if (i % 3 === 0){ p.style.borderRadius = "50%"; p.style.height = "8px"; }
      trozo.appendChild(p);
    }
    host.appendChild(trozo);
    setTimeout(function(){ host.innerHTML = ""; }, 7200);
  }
})();
