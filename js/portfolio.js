/* Bharat Infotechs — Portfolio integrations */
(function () {
  "use strict";

  const PROJECTS = {
    sellergrid: { live: "https://leoswing1.github.io/sellergrid-ai-dashboard/" },
    atglance: { live: "https://bharatinfotechs.github.io/AtGlance-Mannequins/" },
    taskplanet: { live: "https://social-app-beta-three.vercel.app/" },
    quickrecharge: { github: "https://github.com/LeoSwing1/QuickRecharge" }
  };

  document.querySelectorAll("[data-project][data-link-type]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      const project = PROJECTS[el.dataset.project];
      const url = project && project[el.dataset.linkType];
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  });
})();
