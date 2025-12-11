//Handles logic for swapping URL to link for desktop users
document.addEventListener("DOMContentLoaded", function () {
    const link = document.getElementById("instagramLink");
    if (link) {
        // Perform your checks and modifications here
        // For example:
        function isMobileDevice() {
            return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent);
        }

        if (!isMobileDevice()) {
            link.setAttribute("href", "https://www.instagram.com/surenz2/");
        }
        console.log("Link changed to desktop version.");
    }

    //Handles logic for cook mode button and print recipe button
    const printButton = document.querySelector(".print-recipe");
    const cookModeCheckbox = document.querySelector(".cook-mode");
    const copyButton = document.querySelector(".copy-recipe");

    let wakeLock = null;

    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            console.log("Cook Mode ON (Screen will stay awake)");
            wakeLock.addEventListener("release", () => {
                console.log("Cook Mode OFF");
            });
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }
    
     if (copyButton) {
        const recipeTitle = document.getElementById("recipe-title");
        const textContent = document.getElementById("text-content");
        const alertContainer = document.getElementById("alert-border-3");
        copyButton.addEventListener('click', () => {
          if (recipeTitle && textContent) {
            // Combine title and text content
            const textToCopy = `${recipeTitle.innerText}\n\n${textContent.innerText}`;

            // Use a temporary textarea to copy the content
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = textToCopy;

            // Append textarea to the body
            document.body.appendChild(tempTextArea);

            // Select and copy the text
            tempTextArea.select();
            document.execCommand('copy');

            // Remove the textarea
            document.body.removeChild(tempTextArea);

            // Provide feedback to the user
      showSuccessAlert(alertContainer, 'Recipe copied to clipboard! Paste in your notes app for easy use!');
          } else {
            showSuccessAlert(alertContainer, 'Recipe content not found!', true); // true for error
          }
        });
      }

    if (printButton) {
        const recipeTitle = document.getElementById("recipe-title");
        const textContent = document.getElementById("text-content");
        printButton.addEventListener("click", () => {
            if (recipeTitle && textContent) {
                // Clone the content and strip media/toggle controls so printing stays text-only
                const cleanContent = textContent.cloneNode(true);
                const elementsToRemove = cleanContent.querySelectorAll(".view-image-controls, .view-image-wrap, .view-image-details, img, video");
                elementsToRemove.forEach((el) => el.remove());

                // Create a new window for printing
                const printWindow = window.open("", "_blank");

                // Add title and content
                printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Print Recipe</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              h1, h2 {
                text-align: center;
              }
              .equipment-list,
              .ingredients-list {
                list-style: none;
                padding-left: 0;
                margin-left: 0;
              }
              .equipment-list li,
              .ingredients-list li {
                margin-left: 0;
              }
            </style>
          </head>
          <body>
            <h1>${recipeTitle.innerText}</h1>
            <div>${cleanContent.innerHTML}</div>
          </body>
          </html>
        `);

                // Trigger the print and close the print window afterward
                printWindow.document.close();
                printWindow.print();
                printWindow.close();
            } else {
                alert("Recipe content not found!");
            }
        });
    }

    // Handle Cook Mode (using the checkbox)
    if (cookModeCheckbox) {
        cookModeCheckbox.addEventListener("change", async () => {
            if ("wakeLock" in navigator) {
                if (cookModeCheckbox.checked) {
                    // If checkbox is checked, request the wake lock
                    await requestWakeLock();
                } else {
                    // If checkbox is unchecked, release the wake lock
                    if (wakeLock) {
                        await wakeLock.release();
                        wakeLock = null;
                        console.log("Cook Mode OFF");
                    }
                }
            } else {
                alert("Cook Mode (Wake Lock) not supported on this browser.");
                // Revert checkbox to unchecked if not supported
                cookModeCheckbox.checked = false;
            }
        });
    }

      // Handle "show all images" toggler for step images
      const viewImageDetails = Array.from(document.querySelectorAll('.view-image-details'));
      const toggleAllImagesBtn = document.querySelector('.view-image-toggle-all');
      const toggleAllImagesLabel = document.querySelector('.view-image-toggle-all-label');
      const toggleAllShowIcon = document.querySelector('.view-image-icon-show');
      const toggleAllHideIcon = document.querySelector('.view-image-icon-hide');
      const viewImageSummaryLabel = (detailEl) => {
        const summary = detailEl.querySelector('summary');
        if (!summary) return null;
        const spans = summary.querySelectorAll('span');
        return spans.length > 1 ? spans[1] : null;
      };

      function updateDetailLabel(detailEl) {
        const labelSpan = viewImageSummaryLabel(detailEl);
        if (labelSpan) {
          labelSpan.textContent = detailEl.hasAttribute('open') ? 'Hide' : 'Show';
        }
      }

      function updateToggleAllLabel(openState) {
        if (toggleAllImagesLabel) {
          toggleAllImagesLabel.textContent = openState ? 'Hide images' : 'View images';
        }
        if (toggleAllShowIcon && toggleAllHideIcon) {
          if (openState) {
            toggleAllShowIcon.style.display = 'none';
            toggleAllHideIcon.style.display = 'inline-flex';
          } else {
            toggleAllShowIcon.style.display = 'inline-flex';
            toggleAllHideIcon.style.display = 'none';
          }
        }
      }

      if (toggleAllImagesBtn && viewImageDetails.length) {
        // Set initial button label based on whether any details are open
        const anyOpen = viewImageDetails.some(detail => detail.hasAttribute('open'));
        viewImageDetails.forEach(detail => {
          updateDetailLabel(detail);
          detail.addEventListener('toggle', () => updateDetailLabel(detail));
        });
        updateToggleAllLabel(anyOpen);

        toggleAllImagesBtn.addEventListener('click', () => {
          const shouldOpen = !viewImageDetails.every(detail => detail.hasAttribute('open'));
          viewImageDetails.forEach(detail => {
            if (shouldOpen) {
              detail.setAttribute('open', '');
            } else {
              detail.removeAttribute('open');
            }
            updateDetailLabel(detail);
          });
          updateToggleAllLabel(shouldOpen);
        });
      }

      // Prevent modal trigger links inside labels from toggling their checkboxes
      const modalLinks = document.querySelectorAll('.modal-link');
      modalLinks.forEach(link => {
        ['click', 'mousedown', 'pointerdown', 'mouseup'].forEach(evt => {
          link.addEventListener(evt, e => {
            e.preventDefault();
            e.stopPropagation();
          });
        });
      });
});

function showSuccessAlert(alertContainer, message, isError = false) {
  if (alertContainer) {
    // Update the alert content
    const alertMessage = alertContainer.querySelector('.font-medium');
    if (alertMessage) {
      alertMessage.textContent = message;
    }

    // Apply styles based on success or error
    if (isError) {
      alertContainer.classList.remove('text-green-800', 'border-green-300', 'bg-green-50');
      alertContainer.classList.add('text-red-800', 'border-red-300', 'bg-red-50');
    } else {
      alertContainer.classList.remove('text-red-800', 'border-red-300', 'bg-red-50');
      alertContainer.classList.add('text-green-800', 'border-green-300', 'bg-green-50');
    }

    // Make the alert visible
    alertContainer.classList.remove('hidden', 'fade-out');
    // Auto-dismiss the alert after 5 seconds
    setTimeout(() => {
      alertContainer.classList.add('fade-out'); // Add fade-out class
      setTimeout(() => {
        alertContainer.classList.add('hidden'); // Fully hide after animation
      }, 300); // Match the duration in the CSS
    }, 3000); // Dismiss after 5 seconds
  }
}

// Add dismiss button functionality
const dismissButton = document.querySelector('#alert-border-3 button');
if (dismissButton) {
  dismissButton.addEventListener('click', () => {
    const alertContainer = document.getElementById('alert-border-3');
    if (alertContainer) {
      alertContainer.classList.add('fade-out'); // Add fade-out class
      setTimeout(() => {
        alertContainer.classList.add('hidden'); // Fully hide after animation
      }, 500); // Match the duration in the CSS
    }
  });
}
