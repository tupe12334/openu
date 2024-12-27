const IFRAME_CONTAINER_ID = "iframe-container";
const IFRAME_CONTAINER_CLASS = "iframe-container";
const HTML_CACHE_PREFIX = "htmlCache_";
const ERROR_MESSAGE = "Error loading file content. Please try again.";
const FRAME_BORDER = "0";
const FRAME_WIDTH = "100%";
const FRAME_HEIGHT = "50%";
const INSTRUCTION_FILE_NAME = "instruction.html";

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
  let iframeContainer = document.getElementById(IFRAME_CONTAINER_ID);
  if (!iframeContainer) {
    iframeContainer = document.createElement("div");
    iframeContainer.id = IFRAME_CONTAINER_ID;
    iframeContainer.classList.add(IFRAME_CONTAINER_CLASS);
    document.body.appendChild(iframeContainer);
  }

  // Fetch and display instruction.html
  await fetchAndDisplayInstructionFile(filePath, iframeContainer);

  // Check if the file content is already cached
  const cachedContent = localStorage.getItem(`${HTML_CACHE_PREFIX}${filePath}`);
  if (
    cachedContent &&
    cachedContent !== "undefined" &&
    cachedContent !== "null" &&
    cachedContent.trim() !== ""
  ) {
    const blob = new Blob([cachedContent], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    iframeContainer.innerHTML += `<iframe src="${blobUrl}" frameborder="${FRAME_BORDER}" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}"></iframe>`;
    return;
  }

  const fileContent = await fetchHtmlFileContent(filePath);
  if (fileContent) {
    // Cache the file content
    localStorage.setItem(`${HTML_CACHE_PREFIX}${filePath}`, fileContent);
    const blob = new Blob([fileContent], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    iframeContainer.innerHTML += `<iframe src="${blobUrl}" frameborder="${FRAME_BORDER}" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}"></iframe>`;
  } else {
    iframeContainer.innerHTML = `<div class="error-message">${ERROR_MESSAGE}</div>`;
  }
}

async function fetchAndDisplayInstructionFile(filePath, iframeContainer) {
  const instructionFilePath = filePath.replace(
    /\/[^/]+$/,
    `/${INSTRUCTION_FILE_NAME}`
  );
  const instructionContent = await fetchHtmlFileContent(instructionFilePath);
  if (instructionContent) {
    const instructionBlob = new Blob([instructionContent], {
      type: "text/html",
    });
    const instructionBlobUrl = URL.createObjectURL(instructionBlob);
    iframeContainer.innerHTML =
      `<iframe src="${instructionBlobUrl}" frameborder="${FRAME_BORDER}" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}"></iframe>` +
      iframeContainer.innerHTML;
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
