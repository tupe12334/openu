const HTML_CACHE_PREFIX = "htmlCache_";
const FILE_STRUCTURE_CACHE_KEY = "fileStructureCache";
const FILE_STRUCTURE_CACHE_TIMESTAMP_KEY = "fileStructureCacheTimestamp";
const KNOWLEDGE_LEVELS_KEY = "knowledgeLevels";
const EXPANDED_STATE_KEY = "expandedState";

export const getCachedHtmlContent = (filePath: string): string | null => {
  return localStorage.getItem(`${HTML_CACHE_PREFIX}${filePath}`);
};

export const setCachedHtmlContent = (
  filePath: string,
  content: string
): void => {
  localStorage.setItem(`${HTML_CACHE_PREFIX}${filePath}`, content);
};

export const getFileStructureCache = (): any => {
  return JSON.parse(localStorage.getItem(FILE_STRUCTURE_CACHE_KEY) || "{}");
};

export const setFileStructureCache = (cache: any): void => {
  localStorage.setItem(FILE_STRUCTURE_CACHE_KEY, JSON.stringify(cache));
};

export const getFileStructureCacheTimestamp = (): number | null => {
  const timestamp = localStorage.getItem(FILE_STRUCTURE_CACHE_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : null;
};

export const setFileStructureCacheTimestamp = (timestamp: number): void => {
  localStorage.setItem(
    FILE_STRUCTURE_CACHE_TIMESTAMP_KEY,
    timestamp.toString()
  );
};

export const getKnowledgeLevels = (): any => {
  return JSON.parse(localStorage.getItem(KNOWLEDGE_LEVELS_KEY) || "{}");
};

export const setKnowledgeLevels = (levels: any): void => {
  localStorage.setItem(KNOWLEDGE_LEVELS_KEY, JSON.stringify(levels));
};

export const getExpandedState = (): any => {
  return JSON.parse(localStorage.getItem(EXPANDED_STATE_KEY) || "{}");
};

export const setExpandedState = (state: any): void => {
  localStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(state));
};

export const clearCacheForPath = (path: string): void => {
  const fileStructureCache = getFileStructureCache();
  delete fileStructureCache[path];
  setFileStructureCache(fileStructureCache);
  console.log(`Cache cleared for path: ${path}`);
};
