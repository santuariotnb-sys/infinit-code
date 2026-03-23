export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  /** Caminho relativo ao workspace do container (ex: "src/App.tsx") */
  path?: string;
}

export type PreviewMode = 'html' | 'react' | 'none';

export interface OpenFile {
  id: string;
  name: string;
  content: string;
  language: string;
  unsaved: boolean;
}

export interface IDEState {
  files: FileNode[];
  openFiles: OpenFile[];
  activeFileId: string | null;
  showPreview: boolean;
  showSnippets: boolean;
  showExplorer: boolean;
  projectName: string;
}
