/* Bharat Infotechs — Google Analytics 4
 *
 * Set your GA4 measurement ID below, e.g. G-XXXXXXXXXX.
 * Leave blank during development.
 */
(function () {
  "use strict";

  const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true
  });
})();
