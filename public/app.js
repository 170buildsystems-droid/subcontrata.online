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
      error.hidden = true;

      var p = new URLSearchParams();
      p.set("tipo", tipoInput.value);
      p.set("ciudad", ciudad.value.trim());
      p.set("cp", cp.value.trim());
      var urg = form.querySelector('select[name="urgencia"]'); if (urg && urg.value) p.set("urgencia", urg.value);
      var m2 = form.querySelector('input[name="superficie"]'); if (m2 && m2.value) p.set("superficie", m2.value);
      var cal = form.querySelector('select[name="calidad"]'); if (cal && cal.value) p.set("calidad", cal.value);
      if (empresa && empresa.checked) p.set("perfil", "empresa");
      p.set("utm_source", SC.dominio || location.hostname);
      p.set("utm_medium", "landing");
      p.set("utm_campaign", campaign);
      p.set("utm_content", content + (empresa && empresa.checked ? "-empresa" : ""));
      var ref = new URLSearchParams(location.search).get("utm_term") || new URLSearchParams(location.search).get("q");
      if (ref) p.set("utm_term", ref);
      var url = (SC.destino || "https://reformapresupuesto.com/solicitar") + "?" + p.toString();

      var datos = { tipo: tipoInput.value, ciudad: ciudad.value.trim(), utm_campaign: campaign, utm_content: content, empresa: !!(empresa && empresa.checked) };
      if (SC.ads) datos.send_to = SC.ads;
      evento("form_submit", datos);
      enviar.disabled = true; enviar.textContent = "Un momento…";
      // Da 300 ms a GTM para disparar la conversión; después redirige pase lo que pase.
      setTimeout(function () { location.href = url; }, 300);
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
