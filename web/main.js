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

  // Fetch and display instruction.html
  await fetchAndDisplayInstructionFile(filePath, iframeContainer);

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
    iframeContainer.innerHTML += `<iframe src="${blobUrl}" frameborder="0" width="100%" height="50%"></iframe>`;
    return;
  }

  const fileContent = await fetchHtmlFileContent(filePath);
  if (fileContent) {
    // Cache the file content
    localStorage.setItem(`htmlCache_${filePath}`, fileContent);
    const blob = new Blob([fileContent], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    iframeContainer.innerHTML += `<iframe src="${blobUrl}" frameborder="0" width="100%" height="50%"></iframe>`;
  } else {
    iframeContainer.innerHTML = `<div class="error-message">Error loading file content. Please try again.</div>`;
  }
}

async function fetchAndDisplayInstructionFile(filePath, iframeContainer) {
  const instructionFilePath = filePath.replace(/\/[^/]+$/, "/instruction.html");
  const instructionContent = await fetchHtmlFileContent(instructionFilePath);
  if (instructionContent) {
    const instructionBlob = new Blob([instructionContent], {
      type: "text/html",
    });
    const instructionBlobUrl = URL.createObjectURL(instructionBlob);
    iframeContainer.innerHTML = `<iframe src="${instructionBlobUrl}" frameborder="0" width="100%" height="50%"></iframe>`;
  }
}

async function fetchHtmlFileContent(filePath) {
  const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filePath}`;
  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching HTML file ${filePath}:`, error);
    return null;
  }
}
