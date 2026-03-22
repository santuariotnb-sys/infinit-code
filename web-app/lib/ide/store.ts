import { create } from 'zustand';
import type { IDEState, FileNode, OpenFile } from './types';
import { loadFileSystem, saveFileSystem } from './file-system';

function getLanguage(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    html: 'html', css: 'css', json: 'json', md: 'markdown',
    py: 'python', sql: 'sql', sh: 'shell', yml: 'yaml', yaml: 'yaml',
  };
  return map[ext] || 'plaintext';
}

let counter = 0;
function uid(): string {
  return `f_${Date.now()}_${++counter}`;
}

interface IDEActions {
  openFile: (node: FileNode) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  createFile: (parentId: string | null, name: string) => void;
  createFolder: (parentId: string | null, name: string) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  togglePreview: () => void;
  toggleSnippets: () => void;
  toggleExplorer: () => void;
  setProjectName: (name: string) => void;
  insertAtCursor: (text: string) => void;
  _cursorInsertCallback: ((text: string) => void) | null;
  setCursorInsertCallback: (cb: ((text: string) => void) | null) => void;
}

const defaultFiles: FileNode[] = [
  {
    id: 'default_1',
    name: 'index.html',
    type: 'file',
    content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Meu Projeto</title>
  <style>
    body { font-family: system-ui; background: #0a0a0a; color: #e8e8e8; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    h1 { color: #00ff88; }
  </style>
</head>
<body>
  <div>
    <h1>∞ Infinit Code</h1>
    <p>Edite este arquivo e veja o preview ao vivo!</p>
  </div>
</body>
</html>`,
  },
  {
    id: 'default_2',
    name: 'App.tsx',
    type: 'file',
    content: `export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-400 mb-4">∞ Infinit Code</h1>
        <p className="text-gray-400">Preview React ao vivo!</p>
      </div>
    </div>
  );
}`,
  },
];

function findNode(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeNode(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter(n => n.id !== id)
    .map(n => n.children ? { ...n, children: removeNode(n.children, id) } : n);
}

function addChild(nodes: FileNode[], parentId: string | null, child: FileNode): FileNode[] {
  if (!parentId) return [...nodes, child];
  return nodes.map(n => {
    if (n.id === parentId && n.type === 'folder') {
      return { ...n, children: [...(n.children || []), child] };
    }
    if (n.children) return { ...n, children: addChild(n.children, parentId, child) };
    return n;
  });
}

function updateNode(nodes: FileNode[], id: string, update: Partial<FileNode>): FileNode[] {
  return nodes.map(n => {
    if (n.id === id) return { ...n, ...update };
    if (n.children) return { ...n, children: updateNode(n.children, id, update) };
    return n;
  });
}

export const useIDEStore = create<IDEState & IDEActions>((set, get) => ({
  files: loadFileSystem() || defaultFiles,
  openFiles: [],
  activeFileId: null,
  showPreview: true,
  showSnippets: false,
  showExplorer: true,
  projectName: 'Meu Projeto',
  _cursorInsertCallback: null,

  setCursorInsertCallback: (cb) => set({ _cursorInsertCallback: cb }),

  insertAtCursor: (text: string) => {
    const cb = get()._cursorInsertCallback;
    if (cb) cb(text);
  },

  openFile: (node: FileNode) => {
    if (node.type !== 'file') return;
    const { openFiles } = get();
    const existing = openFiles.find(f => f.id === node.id);
    if (existing) {
      set({ activeFileId: node.id });
      return;
    }
    const file: OpenFile = {
      id: node.id,
      name: node.name,
      content: node.content || '',
      language: getLanguage(node.name),
      unsaved: false,
    };
    set({ openFiles: [...openFiles, file], activeFileId: node.id });
  },

  closeFile: (id: string) => {
    const { openFiles, activeFileId } = get();
    const filtered = openFiles.filter(f => f.id !== id);
    const newActive = activeFileId === id
      ? (filtered.length > 0 ? filtered[filtered.length - 1].id : null)
      : activeFileId;
    set({ openFiles: filtered, activeFileId: newActive });
  },

  setActiveFile: (id: string) => set({ activeFileId: id }),

  updateFileContent: (id: string, content: string) => {
    const { openFiles, files } = get();
    const updatedOpen = openFiles.map(f =>
      f.id === id ? { ...f, content, unsaved: true } : f
    );
    const updatedFiles = updateNode(files, id, { content });
    set({ openFiles: updatedOpen, files: updatedFiles });
    saveFileSystem(updatedFiles);
  },

  createFile: (parentId: string | null, name: string) => {
    const child: FileNode = { id: uid(), name, type: 'file', content: '' };
    const files = addChild(get().files, parentId, child);
    set({ files });
    saveFileSystem(files);
  },

  createFolder: (parentId: string | null, name: string) => {
    const child: FileNode = { id: uid(), name, type: 'folder', children: [] };
    const files = addChild(get().files, parentId, child);
    set({ files });
    saveFileSystem(files);
  },

  deleteNode: (id: string) => {
    const { files, openFiles, activeFileId } = get();
    const updated = removeNode(files, id);
    const filteredOpen = openFiles.filter(f => f.id !== id);
    const newActive = activeFileId === id
      ? (filteredOpen.length > 0 ? filteredOpen[filteredOpen.length - 1].id : null)
      : activeFileId;
    set({ files: updated, openFiles: filteredOpen, activeFileId: newActive });
    saveFileSystem(updated);
  },

  renameNode: (id: string, newName: string) => {
    const { files, openFiles } = get();
    const updated = updateNode(files, id, { name: newName });
    const updatedOpen = openFiles.map(f => f.id === id ? { ...f, name: newName, language: getLanguage(newName) } : f);
    set({ files: updated, openFiles: updatedOpen });
    saveFileSystem(updated);
  },

  togglePreview: () => set(s => ({ showPreview: !s.showPreview })),
  toggleSnippets: () => set(s => ({ showSnippets: !s.showSnippets })),
  toggleExplorer: () => set(s => ({ showExplorer: !s.showExplorer })),
  setProjectName: (name: string) => set({ projectName: name }),
}));
