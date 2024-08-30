
content_loaded = false;

/* populate the menu */
function populateMenu() {
  const menu = document.getElementById('menu');
  const content = document.getElementById('content');
  const headings = content.querySelectorAll('h1, h2');

  // Clear existing menu items
  menu.innerHTML = '';

  // Add menu items based on headings
  headings.forEach(heading => {                 
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    // Add prefix based on heading level
    textContent = heading.textContent
    if (heading.tagName === 'H1') {
      textContent = "| " + textContent
    }
    else if (heading.tagName === 'H2') {
      textContent = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + textContent
    }
    link.innerHTML = textContent;
    menu.appendChild(link);
  });
}

/* Function to fetch and render the Markdown file */
function loadMarkdown(file) {
  return new Promise((resolve, reject) => {
    fetch(file)
      .then(response => response.text())
      .then(text => {
        const converter = new showdown.Converter({
          simpleLineBreaks: true,                     // Treat single line breaks as <br>
          ghCompatibleHeaderId: true,                 // GitHub-compatible IDs
          noHeaderId: false,                          // Ensure headers get IDs
          strikethrough: true,                        // Enable strikethrough syntax
          tables: true,                               // Enable table syntax
          smoothLivePreview: true,                    // Enable smooth live preview
          openLinksInNewWindow: true,                 // Open links in new window
          disableForced4SpacesIndentedSublists: true,
        });

        const htmlContent = converter.makeHtml(text);
        document.getElementById('content').innerHTML = htmlContent;
        // Apply syntax highlighting to any code blocks
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
        resolve();                                    // Resolve the promise once everything is done
      })
      .catch(error => {
        console.error('Error loading file:', error);
        document.getElementById('content').innerHTML = '<p>Error loading content. Please try again.</p>';
        reject(error);                                // Reject the promise if there's an error
      });
  });
}

// Toggle menu visibility
document.getElementById('menuToggle').addEventListener('click', () => {

  const menu = document.getElementById('menu');
  if (content_loaded==false) {
    return;
  }
  if (menu.classList.contains('open') ) {
    menu.classList.remove('open');
    // menuToggle.textContent = '☰'; // Change back to hamburger icon
    // menuToggle.style.left = '0'; // Move to the original position
  } else {
    menu.classList.add('open');
    // menuToggle.textContent = '✖'; // Change to cross icon
    // menuToggle.style.left = '210px'; // Move to the right edge of the expanded menu
  }
});

function loadContent(file_path) {
// document.addEventListener('DOMContentLoaded', () => {
  // file_path = 'System Design/solid_principles.md'
  // file_path = 'System Design/scalability.md'
  // file_path = 'Python/Python in depth.md'
  loadMarkdown(file_path).then(() => {
    populateMenu(); // Populate menu after loading content
    content_loaded = true;
  });
};

// Show or hide the Back to Top button based on scroll position
window.onscroll = function () {
  const backToTopBtn = document.getElementById("backToTop");
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
};

// Smooth scroll to top when the Back to Top button is clicked
document.getElementById("backToTop").addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});