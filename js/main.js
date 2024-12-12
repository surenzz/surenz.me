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
            //DM https://www.instagram.com/direct/t/115592643163322
            //IG Page: https://www.instagram.com/surenz2/
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
            </style>
          </head>
          <body>
            <h1>${recipeTitle.innerText}</h1>
            <div>${textContent.innerHTML}</div>
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
    alertContainer.classList.remove('hidden');

    // Auto-dismiss the alert after 5 seconds
    setTimeout(() => {
      alertContainer.classList.add('hidden');
    }, 2000);
  }
}

// Add dismiss button functionality
const dismissButton = document.querySelector('#alert-border-3 button');
if (dismissButton) {
  dismissButton.addEventListener('click', () => {
    const alertContainer = document.getElementById('alert-border-3');
    if (alertContainer) {
      alertContainer.classList.add('hidden');
    }
  });
}