import type { FileNode } from './types';

// ── File operations via API proxy → container file server ──

interface FileTreeEntry {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileTreeEntry[];
}

async function fileApi(action: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`/api/ide/files?action=${action}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `File API error: ${res.status}`);
  }
  return res;
}

/** Busca árvore de arquivos do container */
export async function fetchFileTree(): Promise<FileTreeEntry[]> {
  const res = await fileApi('tree');
  const { tree } = await res.json();
  return tree;
}

/** Lê conteúdo de um arquivo do container */
export async function readContainerFile(filePath: string): Promise<string> {
  const res = await fileApi(`read&path=${encodeURIComponent(filePath)}`);
  const { content } = await res.json();
  return content;
}

/** Escreve arquivo no container */
export async function writeContainerFile(filePath: string, content: string): Promise<void> {
  await fileApi('write', {
    method: 'POST',
    body: JSON.stringify({ path: filePath, content }),
  });
}

/** Cria diretório no container */
export async function mkdirContainer(dirPath: string): Promise<void> {
  await fileApi('mkdir', {
    method: 'POST',
    body: JSON.stringify({ path: dirPath }),
  });
}

/** Deleta arquivo ou pasta no container */
export async function deleteContainerPath(filePath: string): Promise<void> {
  await fileApi(`delete&path=${encodeURIComponent(filePath)}`, {
    method: 'DELETE',
  });
}

/** Renomeia arquivo ou pasta no container */
export async function renameContainerPath(oldPath: string, newPath: string): Promise<void> {
  await fileApi('rename', {
    method: 'POST',
    body: JSON.stringify({ oldPath, newPath }),
  });
}

// ── Conversão: tree do container → FileNode[] do Zustand ────

let syncCounter = 0;

function treeToFileNodes(entries: FileTreeEntry[]): FileNode[] {
  return entries.map(entry => {
    const id = `sync_${++syncCounter}_${Date.now()}`;
    if (entry.type === 'folder') {
      return {
        id,
        name: entry.name,
        type: 'folder' as const,
        path: entry.path,
        children: entry.children ? treeToFileNodes(entry.children) : [],
      };
    }
    return {
      id,
      name: entry.name,
      type: 'file' as const,
      path: entry.path,
      content: '', // conteúdo carregado sob demanda ao abrir no editor
    };
  });
}

/** Sincroniza arquivos do container → Zustand store.
 *  Retorna FileNode[] pronto para substituir o state. */
export async function syncFromContainer(): Promise<FileNode[]> {
  syncCounter = 0;
  const tree = await fetchFileTree();
  return treeToFileNodes(tree);
}

/** Carrega conteúdo de um arquivo quando aberto no editor */
export async function loadFileContent(filePath: string): Promise<string> {
  return readContainerFile(filePath);
}
