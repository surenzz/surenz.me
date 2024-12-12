document.addEventListener('DOMContentLoaded', function() {
  const link = document.getElementById('instagramLink');
  if (link) {
    // Perform your checks and modifications here
    // For example:
    function isMobileDevice() {
      return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent);
    }

    if (!isMobileDevice()) {
      link.setAttribute('href', 'https://www.instagram.com/surenz2/');
        //DM https://www.instagram.com/direct/t/115592643163322
        //IG Page: https://www.instagram.com/surenz2/
    }
  console.log("Link changed to desktop version.");
  }
});
