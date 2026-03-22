import type { FileNode } from './types';

const STORAGE_KEY = 'infinit-ide-files';

export function saveFileSystem(files: FileNode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {}
}

export function loadFileSystem(): FileNode[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FileNode[];
  } catch {
    return null;
  }
}
