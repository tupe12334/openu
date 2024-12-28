import React, { useEffect, useRef } from "react";
import { minimatch } from "minimatch"; // Correct the import
import { setExpandedState as setExpandedStateService } from "./services/cacheService";
import { fetchFileTreeData } from "./services/fileTreeService";

const repoOwner = "tupe12334";
const repoName = "openu";

interface FileTreeProps {
  expandedState: { [key: string]: boolean };
  setExpandedState: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  openHtmlFileInIframe: (filePath: string) => Promise<void>;
  ignorePatterns?: string[]; // Add ignorePatterns prop
}

const FileTree: React.FC<FileTreeProps> = ({
  expandedState,
  setExpandedState,
  openHtmlFileInIframe,
  ignorePatterns = [], // Default to an empty array
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
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
    }
  }, [expandedState]);

  const renderTree = async (
    container: HTMLElement,
    path: string,
    isExpanded: boolean
  ) => {
    const files = await fetchFileTreeData(path, repoOwner, repoName);

    // Create a list element to hold the file/folder items
    const ul = document.createElement("ul");

    // Iterate over the files and folders
    for (const file of files) {
      // Check if the file or folder matches any of the ignore patterns
      if (ignorePatterns.some((pattern) => minimatch(file.path, pattern))) {
        continue;
      }

      const li = document.createElement("li");
      li.textContent = file.name;

      // Create a reload icon
      const reloadIcon = document.createElement("span");
      reloadIcon.textContent = "🔄";
      reloadIcon.classList.add("reload-icon");
      reloadIcon.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent parent nodes from being toggled
        while (li.lastChild && li.lastChild !== li.firstChild) {
          li.removeChild(li.lastChild);
        }
        renderTree(li, file.path, true);
      });

      if (file.type === "dir") {
        li.classList.add("folder");
        li.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent parent nodes from being toggled
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
        li.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent parent nodes from being toggled
          if (file.name.endsWith(".pdf")) {
            window.open(
              `https://github.com/${repoOwner}/${repoName}/blob/main/${file.path}`,
              "_blank"
            );
          } else {
            openHtmlFileInIframe(file.path);
          }
        });
      }

      li.appendChild(reloadIcon); // Append the reload icon to the list item
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

  return <div ref={containerRef}></div>;
};

export default FileTree;
