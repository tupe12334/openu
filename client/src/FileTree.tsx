import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { minimatch } from "minimatch";
import {
  setExpandedState as setExpandedStateService,
  clearHtmlCacheForPath,
} from "./services/cacheService";
import { fetchFileTreeData } from "./services/fileTreeService";
import { repoOwner, repoName } from "./consts";

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

const ReloadButton: React.FC<{
  onClick: (event: React.MouseEvent) => void;
}> = ({ onClick }) => {
  return (
    <span className="reload-icon" onClick={onClick}>
      🔄
    </span>
  );
};

const FileItem: React.FC<FileItemProps> = ({
  file,
  openHtmlFileInIframe,
  renderTree,
  saveExpandedState,
}) => {
  const liRef = useRef<HTMLLIElement>(null);

  const handleReloadClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const li = liRef.current;
    if (li) {
      const ul = li.querySelector("ul");
      if (ul) {
        ul.remove();
      }
      clearHtmlCacheForPath(file.path);
      renderTree(li, file.path, true);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (file.type === "dir") {
      const isExpanded = liRef.current?.classList.toggle("expanded");
      saveExpandedState(file.path, !!isExpanded);
      if (isExpanded) {
        renderTree(liRef.current!, file.path, true);
      } else {
        const ul = liRef.current?.querySelector("ul");
        if (ul) {
          ul.remove();
        }
      }
    } else {
      if (
        file.name.endsWith(".pdf") ||
        file.name.match(/\.(jpg|jpeg|png|gif)$/)
      ) {
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
      <ReloadButton onClick={handleReloadClick} />
    </li>
  );
};

const FileTree: React.FC<FileTreeProps> = ({
  expandedState,
  setExpandedState,
  openHtmlFileInIframe,
  ignorePatterns = [],
}) => {
  const [fileTree, setFileTree] = useState<any[]>([]);

  useEffect(() => {
    const loadTree = async () => {
      const files = await fetchFileTreeData("");
      setFileTree(files);
    };
    loadTree();
  }, []);

  const renderTree = async (
    container: HTMLElement,
    path: string,
    isExpanded: boolean
  ) => {
    const files = await fetchFileTreeData(path);
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

  return (
    <div>
      <ul>
        {fileTree.map((file) => (
          <FileItem
            key={file.path}
            file={file}
            openHtmlFileInIframe={openHtmlFileInIframe}
            renderTree={renderTree}
            saveExpandedState={saveExpandedState}
          />
        ))}
      </ul>
    </div>
  );
};

export default FileTree;
