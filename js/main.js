console.log("main.js loaded");

// Tracking user info via IP API and sending to Cloudflare Worker
console.log("Running visitor logger…");

//Tracking user info via IP API and sending to Cloudflare Worker
fetch("https://ipapi.co/json/")
  .then(r => r.json())
  .then(info => {
    fetch("https://ip-logging-surenz.surenxss.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info)
    });
  })
  .catch(err => console.error("Logging error:", err));

// Handles all recipe page interactions
document.addEventListener("DOMContentLoaded", () => {
  const recipeTitle = document.getElementById("recipe-title");
  const textContent = document.getElementById("text-content");
  const alertContainer = document.getElementById("alert-border-3");
  const printButton = document.querySelector(".print-recipe");
  const cookModeCheckbox = document.querySelector(".cook-mode");
  const copyButton = document.querySelector(".copy-recipe");
  const instagramLink = document.getElementById("instagramLink");

  initInstagramLink(instagramLink);
  initCopyButton(copyButton, recipeTitle, textContent, alertContainer);
  initPrintButton(printButton, recipeTitle, textContent);
  initCookMode(cookModeCheckbox);
  initViewImageToggle();
  initModalLinkGuards();
  initAlertDismiss();
});

function initInstagramLink(link) {
  if (!link) return;
  if (!isMobileDevice()) {
    link.setAttribute("href", "https://www.instagram.com/surenz2/");
  }
  console.log("Link changed to desktop version.");
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent);
}

function initCopyButton(copyButton, recipeTitle, textContent, alertContainer) {
  if (!copyButton || !recipeTitle || !textContent) return;
  copyButton.addEventListener("click", () => {
    const textToCopy = `${recipeTitle.innerText}\n\n${textContent.innerText}`;
    copyToClipboard(textToCopy);
    showSuccessAlert(alertContainer, "Recipe copied to clipboard! Paste in your notes app for easy use!");
  });
}

function copyToClipboard(text) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

function initPrintButton(printButton, recipeTitle, textContent) {
  if (!printButton || !recipeTitle || !textContent) return;
  printButton.addEventListener("click", () => {
    const printableContent = getPrintableContent(textContent);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(buildPrintHtml(recipeTitle.innerText, printableContent));
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  });
}

function getPrintableContent(contentNode) {
  const cleanContent = contentNode.cloneNode(true);
  const elementsToRemove = cleanContent.querySelectorAll(".view-image-controls, .view-image-wrap, .view-image-details, img, video");
  elementsToRemove.forEach((el) => el.remove());
  return cleanContent.innerHTML;
}

function buildPrintHtml(title, contentHtml) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Print Recipe</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { text-align: center; }
        .equipment-list, .ingredients-list { list-style: none; padding-left: 0; margin-left: 0; }
        .equipment-list li, .ingredients-list li { margin-left: 0; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div>${contentHtml}</div>
    </body>
    </html>
  `;
}

function initCookMode(cookModeCheckbox) {
  if (!cookModeCheckbox) return;
  let wakeLock = null;
  cookModeCheckbox.addEventListener("change", async () => {
    if (!("wakeLock" in navigator)) {
      alert("Cook Mode (Wake Lock) not supported on this browser.");
      cookModeCheckbox.checked = false;
      return;
    }

    if (cookModeCheckbox.checked) {
      wakeLock = await requestWakeLock();
      return;
    }

    if (wakeLock) {
      await wakeLock.release();
      wakeLock = null;
      console.log("Cook Mode OFF");
    }
  });
}

async function requestWakeLock() {
  try {
    const wakeLock = await navigator.wakeLock.request("screen");
    console.log("Cook Mode ON (Screen will stay awake)");
    wakeLock.addEventListener("release", () => console.log("Cook Mode OFF"));
    return wakeLock;
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
    return null;
  }
}

function initViewImageToggle() {
  const viewImageDetails = Array.from(document.querySelectorAll(".view-image-details"));
  const toggleAllImagesBtn = document.querySelector(".view-image-toggle-all");
  const toggleAllImagesLabel = document.querySelector(".view-image-toggle-all-label");
  const toggleAllShowIcon = document.querySelector(".view-image-icon-show");
  const toggleAllHideIcon = document.querySelector(".view-image-icon-hide");
  if (!toggleAllImagesBtn || !viewImageDetails.length) return;

  const viewImageSummaryLabel = (detailEl) => {
    const summary = detailEl.querySelector("summary");
    if (!summary) return null;
    const spans = summary.querySelectorAll("span");
    return spans.length > 1 ? spans[1] : null;
  };

  const updateDetailLabel = (detailEl) => {
    const labelSpan = viewImageSummaryLabel(detailEl);
    if (labelSpan) {
      labelSpan.textContent = detailEl.hasAttribute("open") ? "Hide" : "Show";
    }
  };

  const updateToggleAllLabel = (openState) => {
    if (toggleAllImagesLabel) {
      toggleAllImagesLabel.textContent = openState ? "Hide images" : "View images";
    }
    if (toggleAllShowIcon && toggleAllHideIcon) {
      toggleAllShowIcon.style.display = openState ? "none" : "inline-flex";
      toggleAllHideIcon.style.display = openState ? "inline-flex" : "none";
    }
  };

  const anyOpen = viewImageDetails.some((detail) => detail.hasAttribute("open"));
  viewImageDetails.forEach((detail) => {
    updateDetailLabel(detail);
    detail.addEventListener("toggle", () => updateDetailLabel(detail));
  });
  updateToggleAllLabel(anyOpen);

  toggleAllImagesBtn.addEventListener("click", () => {
    const shouldOpen = !viewImageDetails.every((detail) => detail.hasAttribute("open"));
    viewImageDetails.forEach((detail) => {
      if (shouldOpen) {
        detail.setAttribute("open", "");
      } else {
        detail.removeAttribute("open");
      }
      updateDetailLabel(detail);
    });
    updateToggleAllLabel(shouldOpen);
  });
}

function initModalLinkGuards() {
  const modalLinks = document.querySelectorAll(".modal-link");
  if (!modalLinks.length) return;
  const events = ["click", "mousedown", "pointerdown", "mouseup"];
  modalLinks.forEach((link) => {
    events.forEach((evt) => {
      link.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  });
}

function initAlertDismiss() {
  const dismissButton = document.querySelector("#alert-border-3 button");
  if (!dismissButton) return;
  const alertContainer = document.getElementById("alert-border-3");
  dismissButton.addEventListener("click", () => {
    if (alertContainer) {
      alertContainer.classList.add("fade-out");
      setTimeout(() => {
        alertContainer.classList.add("hidden");
      }, 500);
    }
  });
}

function showSuccessAlert(alertContainer, message, isError = false) {
  if (alertContainer) {
    const alertMessage = alertContainer.querySelector('.font-medium');
    if (alertMessage) {
      alertMessage.textContent = message;
    }

    if (isError) {
      alertContainer.classList.remove('text-green-800', 'border-green-300', 'bg-green-50');
      alertContainer.classList.add('text-red-800', 'border-red-300', 'bg-red-50');
    } else {
      alertContainer.classList.remove('text-red-800', 'border-red-300', 'bg-red-50');
      alertContainer.classList.add('text-green-800', 'border-green-300', 'bg-green-50');
    }

    alertContainer.classList.remove('hidden', 'fade-out');
    setTimeout(() => {
      alertContainer.classList.add('fade-out');
      setTimeout(() => {
        alertContainer.classList.add('hidden');
      }, 300);
    }, 3000);
  }
}
