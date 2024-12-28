export interface File {
  path: string;
  name: string;
  type: "file" | "dir";
}

export interface ExpandedState {
  [path: string]: boolean;
}
