/* Bharat Infotechs — Portfolio integrations
 * Replace empty URLs with your actual live demos / public GitHub repositories.
 */
(function () {
  "use strict";

  const PROJECTS = {
    sellergrid: {
      live: "https://leoswing1.github.io/sellergrid-ai-dashboard/",
      github: ""
    },
    crm: {
      live: "",
      github: ""
    },
    immersiveCommerce: {
      live: "",
      github: ""
    }
  };

  function open(url) {
    if (!url) {
      alert("This project link has not been configured yet.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Optional: add data-project="sellergrid" data-link-type="live|github"
  document.querySelectorAll("[data-project][data-link-type]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      const project = PROJECTS[el.dataset.project];
      if (!project) return;
      open(project[el.dataset.linkType]);
    });
  });
})();
