document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("file-browser");
  renderTree(container, "", false).then(() => {
    // Restore expanded state after initial render
    for (const path in expandedState) {
      if (expandedState[path]) {
        const folderElement = document.querySelector(
          `.folder:contains(${path.split("/").pop()})`
        );
        if (folderElement) {
          folderElement.click();
        }
      }
    }
  });
});

async function openHtmlFileInIframe(filePath) {
  let iframeContainer = document.getElementById("iframe-container");
  if (!iframeContainer) {
    iframeContainer = document.createElement("div");
    iframeContainer.id = "iframe-container";
    iframeContainer.classList.add("iframe-container");
    document.body.appendChild(iframeContainer);
  }

  // Check if the file content is already cached
  const cachedContent = localStorage.getItem(`htmlCache_${filePath}`);
  if (
    cachedContent &&
    cachedContent !== "undefined" &&
    cachedContent !== "null" &&
    cachedContent.trim() !== ""
  ) {
    const blob = new Blob([cachedContent], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    iframeContainer.innerHTML = `<iframe src="${blobUrl}" frameborder="0" width="100%" height="100%"></iframe>`;
    return;
  }

  const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filePath}`;
  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${filePath}`);
    }
    const fileContent = await response.text();
    // Cache the file content
    localStorage.setItem(`htmlCache_${filePath}`, fileContent);
    const blob = new Blob([fileContent], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    iframeContainer.innerHTML = `<iframe src="${blobUrl}" frameborder="0" width="100%" height="100%"></iframe>`;
  } catch (error) {
    console.error(`Error loading HTML file ${filePath}:`, error);
    iframeContainer.innerHTML = `<div class="error-message">Error loading file content. Please try again.</div>`;
  }
}
