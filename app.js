// subcontrata.online — formulario de dos pasos, eventos y consentimiento. Sin dependencias.
(function () {
  "use strict";
  var dl = (window.dataLayer = window.dataLayer || []);
  var SC = window.SC || {};
  var CLAVE_CK = "sc_consent";

  function evento(nombre, datos) {
    var o = { event: nombre };
    for (var k in datos) if (datos.hasOwnProperty(k)) o[k] = datos[k];
    dl.push(o);
  }
  function leerCk() { try { return localStorage.getItem(CLAVE_CK); } catch (e) { return null; } }
  function guardarCk(v) { try { localStorage.setItem(CLAVE_CK, v); } catch (e) {} }
  function aplicarConsentimiento(v) {
    var g = v === "granted" ? "granted" : "denied";
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { ad_storage: g, ad_user_data: g, ad_personalization: g, analytics_storage: g });
    }
    evento("consent_" + g, {});
  }

  // ---- cookies ----
  var banner = document.querySelector("[data-cookies]");
  function mostrarBanner() { if (banner) banner.hidden = false; }
  if (banner) {
    var previo = leerCk();
    if (previo === "granted" || previo === "denied") aplicarConsentimiento(previo); else mostrarBanner();
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ck]");
      if (!b) return;
      guardarCk(b.getAttribute("data-ck"));
      aplicarConsentimiento(b.getAttribute("data-ck"));
      banner.hidden = true;
    });
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-abrir-cookies]")) { e.preventDefault(); mostrarBanner(); }
  });

  // ---- CTA ----
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-cta]");
    if (!a) return;
    evento("cta_click", { utm_content: a.getAttribute("data-cta"), destino: a.getAttribute("href") });
  });

  // ---- formulario ----
  var formularios = document.querySelectorAll("form.solicitud");
  var yaEmpezado = false;
  Array.prototype.forEach.call(formularios, function (form) {
    var tipoInput = form.querySelector('input[name="tipo"]');
    var paso1 = form.querySelector('[data-paso="1"]');
    var paso2 = form.querySelector('[data-paso="2"]');
    var elegido = form.querySelector("[data-elegido]");
    var elegidoTxt = form.querySelector("[data-elegido-txt]");
    var error = form.querySelector("[data-error]");
    var enviar = form.querySelector('button[type="submit"]');
    var empresa = form.querySelector('input[name="empresa"]');
    var campaign = form.getAttribute("data-campaign") || "general";
    var content = form.getAttribute("data-content") || "formulario";

    function empezar() { if (!yaEmpezado) { yaEmpezado = true; evento("form_start", { utm_campaign: campaign, utm_content: content }); } }
    form.addEventListener("focusin", empezar, { once: true });

    form.addEventListener("click", function (e) {
      var b = e.target.closest("button.tipo");
      if (b) {
        empezar();
        tipoInput.value = b.getAttribute("data-tipo");
        Array.prototype.forEach.call(form.querySelectorAll("button.tipo"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        paso1.hidden = true; paso2.hidden = false;
        if (elegido) { elegido.hidden = false; elegidoTxt.textContent = tipoInput.value; }
        evento("form_step2", { tipo: tipoInput.value, utm_campaign: campaign, utm_content: content });
        var ciudad = form.querySelector('input[name="ciudad"]');
        if (ciudad && !ciudad.value) setTimeout(function () { ciudad.focus(); }, 50);
        return;
      }
      if (e.target.closest("[data-cambiar]")) {
        paso2.hidden = true; paso1.hidden = false;
      }
    });

    if (empresa && enviar) {
      empresa.addEventListener("change", function () {
        enviar.textContent = empresa.checked ? enviar.getAttribute("data-txt-empresa") : enviar.getAttribute("data-txt-particular");
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ciudad = form.querySelector('input[name="ciudad"]');
      var cp = form.querySelector('input[name="cp"]');
      var mensajes = [];
      ciudad.setAttribute("aria-invalid", "false"); cp.setAttribute("aria-invalid", "false");
      if (!tipoInput.value) { mensajes.push("Elige qué necesitas."); paso2.hidden = true; paso1.hidden = false; }
      if (!ciudad.value.trim()) { mensajes.push("Indica la ciudad."); ciudad.setAttribute("aria-invalid", "true"); }
      if (!/^\d{5}$/.test(cp.value.trim())) { mensajes.push("El código postal son 5 cifras."); cp.setAttribute("aria-invalid", "true"); }
      if (mensajes.length) { error.textContent = mensajes.join(" "); error.hidden = false; return; }
      var nombre = form.querySelector('input[name="nombre"]');
      var telefono = form.querySelector('input[name="telefono"]');
      var email = form.querySelector('input[name="email"]');
      var privacidad = form.querySelector('input[name="privacidad"]');
      nombre.setAttribute("aria-invalid", "false"); telefono.setAttribute("aria-invalid", "false"); email.setAttribute("aria-invalid", "false");
      if (nombre.value.trim().length < 2) { mensajes.push("Indica tu nombre."); nombre.setAttribute("aria-invalid", "true"); }
      if (!telefono.value.trim() && !email.value.trim()) { mensajes.push("Déjanos un teléfono o un email."); telefono.setAttribute("aria-invalid", "true"); email.setAttribute("aria-invalid", "true"); }
      if (telefono.value.trim() && !/^[+\d][\d\s.-]{6,19}$/.test(telefono.value.trim())) { mensajes.push("El teléfono no es válido."); telefono.setAttribute("aria-invalid", "true"); }
      if (email.value.trim() && !/^[^\s@]+@[^\s@.]+(\.[^\s@.]{2,})+$/.test(email.value.trim())) { mensajes.push("El email no es válido."); email.setAttribute("aria-invalid", "true"); }
      if (!privacidad.checked) mensajes.push("Marca la casilla de privacidad para continuar.");
      if (mensajes.length) { error.textContent = mensajes.join(" "); error.hidden = false; return; }
      error.hidden = true;

      var q = new URLSearchParams(location.search);
      var urg = form.querySelector('select[name="urgencia"]');
      var m2 = form.querySelector('input[name="superficie"]');
      var cal = form.querySelector('select[name="calidad"]');
      var desc = form.querySelector('textarea[name="descripcion"]');
      var mkt = form.querySelector('input[name="marketing"]');
      var trampa = form.querySelector('input[name="web"]');
      var esEmpresa = !!(empresa && empresa.checked);
      var carga = {
        tipo: tipoInput.value,
        ciudad: ciudad.value.trim(),
        cp: cp.value.trim(),
        urgencia: urg ? urg.value : "",
        superficie: m2 && m2.value ? Number(m2.value) : null,
        calidad: cal ? cal.value : "",
        empresa: esEmpresa,
        nombre: nombre.value.trim(),
        telefono: telefono.value.trim(),
        email: email.value.trim(),
        descripcion: desc ? desc.value.trim() : "",
        consentimiento_marketing: !!(mkt && mkt.checked),
        pagina: campaign,
        cta: content + (esEmpresa ? "-empresa" : ""),
        keyword: q.get("utm_term") || q.get("q") || "",
        web: trampa ? trampa.value : ""
      };

      enviar.disabled = true; var txtAntes = enviar.textContent; enviar.textContent = "Enviando…";
      fetch(SC.api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(carga) })
        .then(function (r) { return r.json().catch(function () { return { ok: false, error: "Respuesta no válida" }; }).then(function (j) { j.status = r.status; return j; }); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || "No se pudo enviar la solicitud.");
          var datos = { tipo: carga.tipo, ciudad: carga.ciudad, utm_campaign: campaign, utm_content: carga.cta, empresa: esEmpresa, solicitud_id: j.id || "" };
          if (SC.ads) datos.send_to = SC.ads;
          evento("form_submit", datos);
          var g = new URLSearchParams({ tipo: carga.tipo, ciudad: carga.ciudad });
          // Da 300 ms a GTM para disparar la conversión antes de cambiar de página.
          setTimeout(function () { location.href = "/gracias?" + g.toString(); }, 300);
        })
        .catch(function (e) {
          evento("form_error", { mensaje: String(e && e.message || e), utm_campaign: campaign });
          error.textContent = (e && e.message) || "No se pudo enviar. Inténtalo de nuevo o llama al " + "964 95 94 17" + ".";
          error.hidden = false;
          enviar.disabled = false; enviar.textContent = txtAntes;
        });
    });
  });

  // CTA fija móvil: ocultar cuando el formulario está a la vista
  var fija = document.querySelector(".cta-fija");
  var formCard = document.getElementById("solicitar");
  if (fija && formCard && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { fija.hidden = en[0].isIntersecting; }, { threshold: 0.15 }).observe(formCard);
  } else if (fija && !formCard) {
    fija.setAttribute("href", "/#solicitar");
  }
})();
