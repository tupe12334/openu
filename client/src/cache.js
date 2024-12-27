const repoOwner = "tupe12334";
const repoName = "openu";

// Load the knowledge level database and file structure cache from localStorage
const db = JSON.parse(localStorage.getItem("knowledgeLevels")) || {};
let fileStructureCache =
  JSON.parse(localStorage.getItem("fileStructureCache")) || {};

// Load the expanded state from localStorage
const expandedState = JSON.parse(localStorage.getItem("expandedState")) || {};

// Check if the cache is expired (24 hours)
const cacheTimestamp = localStorage.getItem("fileStructureCacheTimestamp");
const now = Date.now();
if (!cacheTimestamp || now - cacheTimestamp > 24 * 60 * 60 * 1000) {
  console.log("Cache expired. Clearing file structure cache.");
  fileStructureCache = {};
  localStorage.removeItem("fileStructureCache");
  localStorage.removeItem("fileStructureCacheTimestamp");
}

function clearCacheForPath(path) {
  delete fileStructureCache[path];
  localStorage.setItem(
    "fileStructureCache",
    JSON.stringify(fileStructureCache)
  );
  console.log(`Cache cleared for path: ${path}`);
}
