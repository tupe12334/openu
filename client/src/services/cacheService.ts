import {
  HTML_CACHE_PREFIX,
  FILE_STRUCTURE_CACHE_KEY,
  FILE_STRUCTURE_CACHE_TIMESTAMP_KEY,
  KNOWLEDGE_LEVELS_KEY,
  EXPANDED_STATE_KEY,
} from "../consts";

class CacheService {
  private static instance: CacheService;

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public getCachedHtmlContent(filePath: string): string | null {
    return localStorage.getItem(`${HTML_CACHE_PREFIX}${filePath}`);
  }

  public setCachedHtmlContent(filePath: string, content: string): void {
    localStorage.setItem(`${HTML_CACHE_PREFIX}${filePath}`, content);
  }

  public getFileStructureCache(): any {
    return JSON.parse(localStorage.getItem(FILE_STRUCTURE_CACHE_KEY) || "{}");
  }

  public setFileStructureCache(cache: any): void {
    localStorage.setItem(FILE_STRUCTURE_CACHE_KEY, JSON.stringify(cache));
  }

  public getFileStructureCacheTimestamp(): number | null {
    const timestamp = localStorage.getItem(FILE_STRUCTURE_CACHE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  public setFileStructureCacheTimestamp(timestamp: number): void {
    localStorage.setItem(
      FILE_STRUCTURE_CACHE_TIMESTAMP_KEY,
      timestamp.toString()
    );
  }

  public getKnowledgeLevels(): any {
    return JSON.parse(localStorage.getItem(KNOWLEDGE_LEVELS_KEY) || "{}");
  }

  public setKnowledgeLevels(levels: any): void {
    localStorage.setItem(KNOWLEDGE_LEVELS_KEY, JSON.stringify(levels));
  }

  public getExpandedState(): any {
    return JSON.parse(localStorage.getItem(EXPANDED_STATE_KEY) || "{}");
  }

  public setExpandedState(state: any): void {
    localStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(state));
  }

  public clearCacheForPath(path: string): void {
    const fileStructureCache = this.getFileStructureCache();
    delete fileStructureCache[path];
    this.setFileStructureCache(fileStructureCache);
    console.log(`Cache cleared for path: ${path}`);
  }

  public clearHtmlCacheForPath(filePath: string): void {
    localStorage.removeItem(`${HTML_CACHE_PREFIX}${filePath}`);
    console.log(`HTML cache cleared for path: ${filePath}`);
  }
}

const cacheServiceInstance = CacheService.getInstance();

export default cacheServiceInstance;

export const {
  getCachedHtmlContent,
  setCachedHtmlContent,
  getFileStructureCache,
  setFileStructureCache,
  getFileStructureCacheTimestamp,
  setFileStructureCacheTimestamp,
  getKnowledgeLevels,
  setKnowledgeLevels,
  getExpandedState,
  setExpandedState,
  clearCacheForPath,
  clearHtmlCacheForPath,
} = cacheServiceInstance;
