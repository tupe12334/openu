import React, { useRef } from "react";
import { clearHtmlCacheForPath } from "../services/cacheService";
import { repoOwner, repoName } from "../consts";
import ReloadButton from "./ReloadButton";
import { File } from "../types";

interface FileItemProps {
  file: File;
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

  const handleDirectoryClick = () => {
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
  };

  const handleFileClick = () => {
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
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (file.type === "dir") {
      handleDirectoryClick();
    } else {
      handleFileClick();
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

export default FileItem;
