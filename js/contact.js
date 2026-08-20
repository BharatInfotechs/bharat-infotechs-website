/* Bharat Infotechs — Contact integrations
 *
 * BEFORE DEPLOYMENT:
 * 1) Set WHATSAPP_NUMBER to your business number, international format, no + or spaces.
 * 2) Replace YOUR_WEB3FORMS_ACCESS_KEY in index.html with your Web3Forms access key.
 * 3) Email fallback is hello@bharatinfotechs.com.
 */
(function () {
  "use strict";

  const CONFIG = {
    whatsappNumber: "YOUR_WHATSAPP_NUMBER",
    email: "hello@bharatinfotechs.com",
    formEndpoint: "https://api.web3forms.com/submit"
  };

  function buildWhatsAppUrl(message) {
    const number = CONFIG.whatsappNumber.replace(/\D/g, "");
    if (!number || number === "YOUR_WHATSAPP_NUMBER") return null;
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
  }

  function openWhatsApp(message) {
    const url = buildWhatsAppUrl(message);
    if (!url) {
      alert("WhatsApp is not configured yet. Add your number in js/contact.js.");
      return false;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  }

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  // WhatsApp buttons
  document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      const message = el.getAttribute("data-whatsapp-message") ||
        "Hello Bharat Infotechs, I would like to discuss a project.";
      if (openWhatsApp(message)) track("whatsapp_click", { location: "floating_button" });
    });
  });

  // Enquiry form -> WhatsApp
  const whatsappEnquiry = document.querySelector("[data-whatsapp-enquiry]");
  if (whatsappEnquiry) {
    whatsappEnquiry.addEventListener("click", function () {
      const form = document.getElementById("enquiryForm");
      const data = new FormData(form);
      const message =
        "Hello Bharat Infotechs,\n\n" +
        "Project enquiry\n" +
        "Name: " + (data.get("name") || "") + "\n" +
        "Company: " + (data.get("company") || "") + "\n" +
        "Email: " + (data.get("email") || "") + "\n" +
        "Phone: " + (data.get("phone") || "") + "\n" +
        "Service: " + (data.get("service") || "") + "\n" +
        "Budget: " + (data.get("budget") || "") + "\n\n" +
        "Details:\n" + (data.get("message") || "");

      if (openWhatsApp(message)) track("whatsapp_enquiry", { service: data.get("service") || "unknown" });
    });
  }

  // Email click tracking
  document.querySelectorAll("[data-email-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      track("email_click", { email: CONFIG.email });
    });
  });

  // Project enquiry form
  const form = document.getElementById("enquiryForm");
  const status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const accessKey = form.querySelector('[name="access_key"]').value;
      if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
        status.textContent = "Form is not configured yet. Use WhatsApp or email for now.";
        track("form_not_configured");
        return;
      }

      status.textContent = "Sending enquiry…";

      try {
        const response = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });

        const result = await response.json();

        if (result.success) {
          form.reset();
          status.textContent = "Thanks — your enquiry has been sent.";
          track("enquiry_submitted", { service: "website" });
        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch (error) {
        console.error(error);
        status.textContent = "Could not send right now. Please use WhatsApp or email.";
        track("enquiry_failed");
      }
    });
  }
})();
