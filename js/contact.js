/* Bharat Infotechs — Contact integrations */
(function () {
  "use strict";

  const CONFIG = {
    whatsappNumber: "918840751012",
    email: "infotechsbharat@gmail.com",
    formEndpoint: "https://api.web3forms.com/submit"
  };

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  function buildWhatsAppUrl(message) {
    const number = CONFIG.whatsappNumber.replace(/\D/g, "");
    if (!number || number.length < 10) return null;
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
  }

  function openWhatsApp(message) {
    const url = buildWhatsAppUrl(message);
    if (!url) {
      alert("WhatsApp is not configured yet. Please contact us by email.");
      return false;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  }

  function enquiryMessage(form) {
    const data = new FormData(form);
    return [
      "Hello Bharat Infotechs,",
      "",
      "Project enquiry",
      "Name: " + (data.get("name") || ""),
      "Company: " + (data.get("company") || ""),
      "Email: " + (data.get("email") || ""),
      "Phone: " + (data.get("phone") || ""),
      "Service: " + (data.get("service") || ""),
      "Budget: " + (data.get("budget") || ""),
      "",
      "Details:",
      data.get("message") || ""
    ].join("\n");
  }

  // Generic WhatsApp CTAs.
  document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      const message = el.getAttribute("data-whatsapp-message") ||
        "Hello Bharat Infotechs, I would like to discuss a project.";
      if (openWhatsApp(message)) track("whatsapp_click", { location: el.className || "cta" });
    });
  });

  const form = document.getElementById("enquiryForm");
  const status = document.getElementById("formStatus");

  // Enquiry form -> WhatsApp. Validate the form first so the WhatsApp message is complete.
  const whatsappEnquiry = document.querySelector("[data-whatsapp-enquiry]");
  if (whatsappEnquiry && form) {
    whatsappEnquiry.addEventListener("click", function () {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (openWhatsApp(enquiryMessage(form))) {
        track("whatsapp_enquiry", { service: form.elements.service?.value || "unknown" });
      }
    });
  }

  // Project/service cards can open the enquiry form with the service preselected.
  document.querySelectorAll("[data-service]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (!form) return;
      const service = el.getAttribute("data-service");
      const select = form.elements.service;
      if (select && service) {
        const option = Array.from(select.options).find(function (opt) { return opt.text === service; });
        if (option) select.value = service;
      }
    });
  });

  // Email click tracking.
  document.querySelectorAll("[data-email-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      track("email_click", { email: CONFIG.email });
    });
  });

  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const accessKeyInput = form.querySelector('[name="access_key"]');
    const accessKey = accessKeyInput ? accessKeyInput.value.trim() : "";
    if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
      status.textContent = "Online form is not configured. Please use WhatsApp or email.";
      track("form_not_configured");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    status.textContent = "Sending enquiry…";

    try {
      const payload = Object.fromEntries(new FormData(form));
      payload.subject = "New Bharat Infotechs Project Enquiry — " + (payload.service || "General");
      payload.from_name = "Bharat Infotechs Website";
      payload.replyto = payload.email || CONFIG.email;

      const response = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Submission failed");
      }

      form.reset();
      status.textContent = "Thanks — your enquiry has been sent successfully.";
      track("enquiry_submitted", { service: payload.service || "unknown" });
    } catch (error) {
      console.error("Bharat Infotechs enquiry error:", error);
      status.textContent = "Could not send right now. Please use WhatsApp or email.";
      track("enquiry_failed", { message: error.message || "unknown" });
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
})();
