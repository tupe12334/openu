import React, { useEffect, useState } from "react";
import FileTree from "./FileTree";
import {
  getCachedHtmlContent,
  getExpandedState,
  getFileStructureCache,
  getFileStructureCacheTimestamp,
  getKnowledgeLevels,
  setCachedHtmlContent,
  setFileStructureCache,
} from "./services/cacheService";

const IFRAME_CONTAINER_ID = "iframe-container";
const IFRAME_CONTAINER_CLASS = "iframe-container";
const ERROR_MESSAGE = "Error loading file content. Please try again.";
const FRAME_BORDER = "0";
const FRAME_WIDTH = "100%";
const FRAME_HEIGHT = "50%";
const INSTRUCTION_FILE_NAME = "instruction.html";
const repoOwner = "tupe12334";
const repoName = "openu";

interface KnowledgeLevels {
  [filePath: string]: {
    segments: { questions: (number | null)[] }[];
  };
}

interface FileStructureCache {
  [path: string]: any;
}

interface ExpandedState {
  [path: string]: boolean;
}

const App: React.FC = () => {
  const [db, setDb] = useState<KnowledgeLevels>(getKnowledgeLevels());
  const [fileStructureCache, setFileStructureCacheState] =
    useState<FileStructureCache>(getFileStructureCache());
  const [expandedState, setExpandedStateState] = useState<ExpandedState>(
    getExpandedState()
  );

  useEffect(() => {
    const cacheTimestamp = getFileStructureCacheTimestamp();
    const now = Date.now();
    if (!cacheTimestamp || now - cacheTimestamp > 24 * 60 * 60 * 1000) {
      console.log("Cache expired. Clearing file structure cache.");
      setFileStructureCacheState({});
      setFileStructureCache({});
      localStorage.removeItem("fileStructureCacheTimestamp");
    }
  }, []);

  const openHtmlFileInIframe = async (filePath: string) => {
    let iframeContainer = document.getElementById(IFRAME_CONTAINER_ID);
    if (!iframeContainer) {
      iframeContainer = document.createElement("div");
      iframeContainer.id = IFRAME_CONTAINER_ID;
      iframeContainer.classList.add(IFRAME_CONTAINER_CLASS);
      document.body.appendChild(iframeContainer);
    }

    await fetchAndDisplayInstructionFile(filePath, iframeContainer);

    const cachedContent = getCachedHtmlContent(filePath);
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
      setCachedHtmlContent(filePath, fileContent);
      const blob = new Blob([fileContent], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      iframeContainer.innerHTML += `<iframe src="${blobUrl}" frameborder="${FRAME_BORDER}" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}"></iframe>`;
    } else {
      iframeContainer.innerHTML = `<div class="error-message">${ERROR_MESSAGE}</div>`;
    }
  };

  const fetchAndDisplayInstructionFile = async (
    filePath: string,
    iframeContainer: HTMLElement
  ) => {
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
  };

  const fetchHtmlFileContent = async (
    filePath: string
  ): Promise<string | null> => {
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
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <div
        id="file-browser"
        style={{
          width: "30%",
          overflowY: "auto",
          borderRight: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <FileTree
          expandedState={expandedState}
          setExpandedState={setExpandedStateState}
          openHtmlFileInIframe={openHtmlFileInIframe}
        />
      </div>
      <div
        id={IFRAME_CONTAINER_ID}
        className={IFRAME_CONTAINER_CLASS}
        style={{
          width: "70%",
          height: "100%",
          overflowY: "auto",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      ></div>
    </div>
  );
};

export default App;
