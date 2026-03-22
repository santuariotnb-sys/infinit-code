'use client';

import { useState } from 'react';
import { useIDEStore } from '@/lib/ide/store';
import type { FileNode } from '@/lib/ide/types';

function TreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const { openFile, deleteNode, renameNode, createFile, createFolder } = useIDEStore();
  const [expanded, setExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [createName, setCreateName] = useState('');

  const handleClick = () => {
    if (node.type === 'folder') setExpanded(!expanded);
    else openFile(node);
  };

  const handleRename = () => {
    if (newName.trim() && newName !== node.name) {
      renameNode(node.id, newName.trim());
    }
    setRenaming(false);
  };

  const handleCreate = () => {
    if (!createName.trim() || !creating) return;
    if (creating === 'file') createFile(node.type === 'folder' ? node.id : null, createName.trim());
    else createFolder(node.type === 'folder' ? node.id : null, createName.trim());
    setCreating(null);
    setCreateName('');
  };

  const icon = node.type === 'folder' ? (expanded ? '▾' : '▸') : '·';

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          paddingLeft: 8 + depth * 14,
          fontSize: 12,
          fontFamily: 'monospace',
          color: '#AEB6D8',
          cursor: 'pointer',
          background: showMenu ? '#1c2340' : 'transparent',
        }}
        onMouseEnter={e => { if (!showMenu) e.currentTarget.style.background = '#131829'; }}
        onMouseLeave={e => { if (!showMenu) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ color: '#5A6080', fontSize: 10, width: 10, textAlign: 'center' }}>{icon}</span>
        {renaming ? (
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
            autoFocus
            style={{
              background: '#0a0a0a',
              border: '1px solid #00ff88',
              color: '#e8e8e8',
              fontFamily: 'monospace',
              fontSize: 12,
              padding: '1px 4px',
              borderRadius: 2,
              outline: 'none',
              width: '100%',
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span style={{ color: node.type === 'folder' ? '#5B6CF9' : '#AEB6D8' }}>{node.name}</span>
        )}
      </div>

      {showMenu && (
        <div style={{
          marginLeft: 8 + depth * 14 + 16,
          background: '#131829',
          border: '1px solid #1c2340',
          borderRadius: 4,
          padding: 4,
          fontSize: 11,
          fontFamily: 'monospace',
        }}>
          {node.type === 'folder' && (
            <>
              <div onClick={(e) => { e.stopPropagation(); setCreating('file'); setShowMenu(false); }}
                style={{ padding: '4px 8px', cursor: 'pointer', color: '#AEB6D8' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1c2340'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >+ Novo arquivo</div>
              <div onClick={(e) => { e.stopPropagation(); setCreating('folder'); setShowMenu(false); }}
                style={{ padding: '4px 8px', cursor: 'pointer', color: '#AEB6D8' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1c2340'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >+ Nova pasta</div>
            </>
          )}
          <div onClick={(e) => { e.stopPropagation(); setRenaming(true); setShowMenu(false); }}
            style={{ padding: '4px 8px', cursor: 'pointer', color: '#AEB6D8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1c2340'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Renomear</div>
          <div onClick={(e) => { e.stopPropagation(); deleteNode(node.id); setShowMenu(false); }}
            style={{ padding: '4px 8px', cursor: 'pointer', color: '#e74c3c' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1c2340'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Excluir</div>
        </div>
      )}

      {creating && (
        <div style={{ paddingLeft: 8 + (depth + 1) * 14, padding: '4px 8px' }}>
          <input
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(null); }}
            autoFocus
            placeholder={creating === 'file' ? 'nome.ext' : 'pasta'}
            style={{
              background: '#0a0a0a',
              border: '1px solid #00ff88',
              color: '#e8e8e8',
              fontFamily: 'monospace',
              fontSize: 12,
              padding: '2px 6px',
              borderRadius: 2,
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      )}

      {node.type === 'folder' && expanded && node.children?.map(child => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function FileExplorer() {
  const { files, createFile, createFolder } = useIDEStore();
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [createName, setCreateName] = useState('');

  const handleCreate = () => {
    if (!createName.trim() || !creating) return;
    if (creating === 'file') createFile(null, createName.trim());
    else createFolder(null, createName.trim());
    setCreating(null);
    setCreateName('');
  };

  return (
    <div style={{
      height: '100%',
      background: '#0b0f1e',
      borderRight: '1px solid #1c2340',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 12px',
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#5A6080',
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottom: '1px solid #1c2340',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>Arquivos</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <span
            onClick={() => setCreating('file')}
            style={{ cursor: 'pointer', fontSize: 14 }}
            title="Novo arquivo"
          >+</span>
          <span
            onClick={() => setCreating('folder')}
            style={{ cursor: 'pointer', fontSize: 14 }}
            title="Nova pasta"
          >◫</span>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingTop: 4 }}>
        {creating && (
          <div style={{ padding: '4px 8px' }}>
            <input
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              onBlur={handleCreate}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(null); }}
              autoFocus
              placeholder={creating === 'file' ? 'nome.ext' : 'pasta'}
              style={{
                background: '#0a0a0a',
                border: '1px solid #00ff88',
                color: '#e8e8e8',
                fontFamily: 'monospace',
                fontSize: 12,
                padding: '2px 6px',
                borderRadius: 2,
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        )}
        {files.map(node => (
          <TreeNode key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}
