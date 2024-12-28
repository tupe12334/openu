import { FILE_STRUCTURE_CACHE_KEY, repoOwner, repoName } from "../consts";

export const fetchFileTreeData = async (
  path: string,
  bypassCache = false
): Promise<any> => {
  const cachedFileStructure = JSON.parse(
    localStorage.getItem(FILE_STRUCTURE_CACHE_KEY) || "{}"
  );
  if (!bypassCache && cachedFileStructure[path]) {
    return cachedFileStructure[path];
  }

  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`
  );
  const files = await response.json();
  cachedFileStructure[path] = files;
  localStorage.setItem(
    FILE_STRUCTURE_CACHE_KEY,
    JSON.stringify(cachedFileStructure)
  );
  return files;
};
