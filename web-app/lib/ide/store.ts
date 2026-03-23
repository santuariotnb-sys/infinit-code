import { create } from 'zustand';
import type { IDEState, FileNode, OpenFile } from './types';
import { loadFileSystem, saveFileSystem } from './file-system';
import {
  writeContainerFile,
  deleteContainerPath,
  renameContainerPath,
  mkdirContainer,
} from './file-client';

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

// Debounce para sync com container
const syncTimers = new Map<string, ReturnType<typeof setTimeout>>();
function debouncedContainerWrite(filePath: string, content: string) {
  const existing = syncTimers.get(filePath);
  if (existing) clearTimeout(existing);
  syncTimers.set(filePath, setTimeout(() => {
    writeContainerFile(filePath, content).catch(err =>
      console.warn('[sync] Failed to write to container:', err.message)
    );
    syncTimers.delete(filePath);
  }, 1000));
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
  /** Indica se há um container conectado (habilita sync) */
  machineConnected: boolean;
  setMachineConnected: (connected: boolean) => void;
  /** Substitui file tree com dados do container */
  syncFromContainer: (files: FileNode[]) => void;
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

// Helper: resolve o path de um node na árvore
function getNodePath(nodes: FileNode[], id: string, parentPath: string = ''): string | null {
  for (const n of nodes) {
    const currentPath = parentPath ? `${parentPath}/${n.name}` : n.name;
    if (n.id === id) return n.path || currentPath;
    if (n.children) {
      const found = getNodePath(n.children, id, currentPath);
      if (found) return found;
    }
  }
  return null;
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
  machineConnected: false,

  setCursorInsertCallback: (cb) => set({ _cursorInsertCallback: cb }),
  setMachineConnected: (connected) => set({ machineConnected: connected }),

  syncFromContainer: (files: FileNode[]) => {
    set({ files, openFiles: [], activeFileId: null });
    saveFileSystem(files);
  },

  insertAtCursor: (text: string) => {
    const cb = get()._cursorInsertCallback;
    if (cb) cb(text);
  },

  openFile: (node: FileNode) => {
    if (node.type !== 'file') return;
    const { openFiles, machineConnected } = get();
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

    // Se conectado ao container e arquivo sem conteúdo, carrega sob demanda
    if (machineConnected && !node.content && node.path) {
      import('./file-client').then(({ loadFileContent }) => {
        loadFileContent(node.path!).then(content => {
          const { openFiles: currentOpen, files } = get();
          const updatedOpen = currentOpen.map(f =>
            f.id === node.id ? { ...f, content } : f
          );
          const updatedFiles = updateNode(files, node.id, { content });
          set({ openFiles: updatedOpen, files: updatedFiles });
        }).catch(err => console.warn('[sync] Failed to load file content:', err.message));
      });
    }
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
    const { openFiles, files, machineConnected } = get();
    const updatedOpen = openFiles.map(f =>
      f.id === id ? { ...f, content, unsaved: true } : f
    );
    const updatedFiles = updateNode(files, id, { content });
    set({ openFiles: updatedOpen, files: updatedFiles });
    saveFileSystem(updatedFiles);

    // Sync com container (debounced)
    if (machineConnected) {
      const filePath = getNodePath(files, id);
      if (filePath) {
        debouncedContainerWrite(filePath, content);
      }
    }
  },

  createFile: (parentId: string | null, name: string) => {
    const { machineConnected, files: currentFiles } = get();
    const parentPath = parentId ? getNodePath(currentFiles, parentId) : null;
    const filePath = parentPath ? `${parentPath}/${name}` : name;

    const child: FileNode = { id: uid(), name, type: 'file', content: '', path: filePath };
    const files = addChild(currentFiles, parentId, child);
    set({ files });
    saveFileSystem(files);

    if (machineConnected) {
      writeContainerFile(filePath, '').catch(err =>
        console.warn('[sync] Failed to create file in container:', err.message)
      );
    }
  },

  createFolder: (parentId: string | null, name: string) => {
    const { machineConnected, files: currentFiles } = get();
    const parentPath = parentId ? getNodePath(currentFiles, parentId) : null;
    const dirPath = parentPath ? `${parentPath}/${name}` : name;

    const child: FileNode = { id: uid(), name, type: 'folder', children: [], path: dirPath };
    const files = addChild(currentFiles, parentId, child);
    set({ files });
    saveFileSystem(files);

    if (machineConnected) {
      mkdirContainer(dirPath).catch(err =>
        console.warn('[sync] Failed to create folder in container:', err.message)
      );
    }
  },

  deleteNode: (id: string) => {
    const { files, openFiles, activeFileId, machineConnected } = get();
    const filePath = getNodePath(files, id);
    const updated = removeNode(files, id);
    const filteredOpen = openFiles.filter(f => f.id !== id);
    const newActive = activeFileId === id
      ? (filteredOpen.length > 0 ? filteredOpen[filteredOpen.length - 1].id : null)
      : activeFileId;
    set({ files: updated, openFiles: filteredOpen, activeFileId: newActive });
    saveFileSystem(updated);

    if (machineConnected && filePath) {
      deleteContainerPath(filePath).catch(err =>
        console.warn('[sync] Failed to delete in container:', err.message)
      );
    }
  },

  renameNode: (id: string, newName: string) => {
    const { files, openFiles, machineConnected } = get();
    const oldPath = getNodePath(files, id);
    const updated = updateNode(files, id, { name: newName });
    const updatedOpen = openFiles.map(f => f.id === id ? { ...f, name: newName, language: getLanguage(newName) } : f);
    set({ files: updated, openFiles: updatedOpen });
    saveFileSystem(updated);

    if (machineConnected && oldPath) {
      const parts = oldPath.split('/');
      parts[parts.length - 1] = newName;
      const newPath = parts.join('/');
      renameContainerPath(oldPath, newPath).catch(err =>
        console.warn('[sync] Failed to rename in container:', err.message)
      );
    }
  },

  togglePreview: () => set(s => ({ showPreview: !s.showPreview })),
  toggleSnippets: () => set(s => ({ showSnippets: !s.showSnippets })),
  toggleExplorer: () => set(s => ({ showExplorer: !s.showExplorer })),
  setProjectName: (name: string) => set({ projectName: name }),
}));
