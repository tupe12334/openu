import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { minimatch } from "minimatch";
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

interface FileItemProps {
  file: any;
  openHtmlFileInIframe: (filePath: string) => Promise<void>;
  renderTree: (
    container: HTMLElement,
    path: string,
    isExpanded: boolean
  ) => Promise<void>;
  saveExpandedState: (path: string, isExpanded: boolean) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  openHtmlFileInIframe,
  renderTree,
  saveExpandedState,
}) => {
  const liRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const li = liRef.current;
    if (li) {
      const reloadIcon = document.createElement("span");
      reloadIcon.textContent = "🔄";
      reloadIcon.classList.add("reload-icon");
      reloadIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        while (li.lastChild && li.lastChild !== li.firstChild) {
          li.removeChild(li.lastChild);
        }
        renderTree(li, file.path, true);
      });
      li.appendChild(reloadIcon);
    }
  }, [file, renderTree]);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (file.type === "dir") {
      const isExpanded = liRef.current?.classList.toggle("expanded");
      saveExpandedState(file.path, !!isExpanded);
      if (isExpanded) {
        renderTree(liRef.current!, file.path, true);
      } else {
        while (
          liRef.current?.lastChild &&
          liRef.current?.lastChild !== liRef.current?.firstChild
        ) {
          liRef.current?.removeChild(liRef.current?.lastChild);
        }
      }
    } else {
      if (file.name.endsWith(".pdf")) {
        window.open(
          `https://github.com/${repoOwner}/${repoName}/blob/main/${file.path}`,
          "_blank"
        );
      } else {
        openHtmlFileInIframe(file.path);
      }
    }
  };

  return (
    <li
      ref={liRef}
      className={file.type === "dir" ? "folder" : "file"}
      onClick={handleClick}
    >
      {file.name}
    </li>
  );
};

const FileTree: React.FC<FileTreeProps> = ({
  expandedState,
  setExpandedState,
  openHtmlFileInIframe,
  ignorePatterns = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      renderTree(container, "", false).then(() => {
        for (const path in expandedState) {
          if (expandedState[path]) {
            const folderElements = container.querySelectorAll(".folder");
            folderElements.forEach((folderElement) => {
              if (folderElement.textContent === path.split("/").pop()) {
                (folderElement as HTMLElement).click();
              }
            });
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
    const ul = document.createElement("ul");

    for (const file of files) {
      if (ignorePatterns.some((pattern) => minimatch(file.path, pattern))) {
        continue;
      }

      const li = document.createElement("li");
      ul.appendChild(li);
      ReactDOM.render(
        <FileItem
          file={file}
          openHtmlFileInIframe={openHtmlFileInIframe}
          renderTree={renderTree}
          saveExpandedState={saveExpandedState}
        />,
        li
      );
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
