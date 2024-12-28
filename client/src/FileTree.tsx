import { minimatch } from "minimatch";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import FileItem from "./components/FileItem"; // Import FileItem
import { setExpandedState as setExpandedStateService } from "./services/cacheService";
import { fetchFileTreeData } from "./services/fileTreeService";

interface FileTreeProps {
  expandedState: { [key: string]: boolean };
  setExpandedState: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  openHtmlFileInIframe: (filePath: string) => Promise<void>;
  ignorePatterns?: string[]; // Add ignorePatterns prop
}

interface File {
  path: string;
  name: string;
  type: "file" | "dir";
}

const FileTree: React.FC<FileTreeProps> = ({
  expandedState,
  setExpandedState,
  openHtmlFileInIframe,
  ignorePatterns = [],
}) => {
  const [fileTree, setFileTree] = useState<File[]>([]);

  useEffect(() => {
    const loadTree = async () => {
      const files = await fetchFileTreeData("");
      setFileTree(files);
    };
    loadTree();
  }, []);

  const renderTree = async (container: HTMLElement, path: string) => {
    const files = await fetchFileTreeData(path);
    const ul = document.createElement("ul");

    for (const file of files) {
      if (ignorePatterns.some((pattern) => minimatch(file.path, pattern))) {
        continue;
      }

      const li = document.createElement("li");
      ul.appendChild(li);
      const root = createRoot(li);
      root.render(
        <FileItem
          file={file}
          openHtmlFileInIframe={openHtmlFileInIframe}
          renderTree={renderTree}
          saveExpandedState={saveExpandedState}
        />
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
