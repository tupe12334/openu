import React, { useEffect } from "react";
import {
  setExpandedState as setExpandedStateService,
  getFileStructureCache,
  setFileStructureCache,
} from "./services/cacheService";

const repoOwner = "tupe12334";
const repoName = "openu";

interface FileTreeProps {
  expandedState: { [key: string]: boolean };
  setExpandedState: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  openHtmlFileInIframe: (filePath: string) => Promise<void>;
}

const FileTree: React.FC<FileTreeProps> = ({
  expandedState,
  setExpandedState,
  openHtmlFileInIframe,
}) => {
  useEffect(() => {
    const container = document.getElementById("file-browser");
    renderTree(container, "", false).then(() => {
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
  }, [expandedState]);

  const renderTree = async (
    container: HTMLElement,
    path: string,
    isExpanded: boolean
  ) => {
    let files;
    const cachedFileStructure = JSON.parse(localStorage.getItem("fileStructureCache") || "{}");
    if (cachedFileStructure[path]) {
      files = cachedFileStructure[path];
    } else {
      const response = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`
      );
      files = await response.json();
      cachedFileStructure[path] = files;
      localStorage.setItem("fileStructureCache", JSON.stringify(cachedFileStructure));
    }

    // Create a list element to hold the file/folder items
    const ul = document.createElement("ul");

    // Iterate over the files and folders
    for (const file of files) {
      const li = document.createElement("li");
      li.textContent = file.name;

      if (file.type === "dir") {
        li.classList.add("folder");
        li.addEventListener("click", () => {
          const isExpanded = li.classList.toggle("expanded");
          saveExpandedState(file.path, isExpanded);
          if (isExpanded) {
            renderTree(li, file.path, true);
          } else {
            while (li.lastChild && li.lastChild !== li.firstChild) {
              li.removeChild(li.lastChild);
            }
          }
        });
      } else {
        li.classList.add("file");
        li.addEventListener("click", () => openHtmlFileInIframe(file.path));
      }

      ul.appendChild(li);
    }

    container.appendChild(ul);
  };

  const saveExpandedState = (path: string, isExpanded: boolean) => {
    const newExpandedState = { ...expandedState };
    if (isExpanded) {
      newExpandedState[path] = true;
    } else {
      delete newExpandedState[path];
    }
    setExpandedState(newExpandedState);
    setExpandedStateService(newExpandedState);
  };

  return <div id="file-browser"></div>;
};

export default FileTree;
