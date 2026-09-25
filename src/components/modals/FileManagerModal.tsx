import React, { useState } from 'react';
import { X, Folder, File, Plus, Search, Trash2, Edit3, HardDrive, RefreshCw, Sparkles, Download, Check } from 'lucide-react';
import { WorkspaceFile } from '../../types/denver';
import { playHudBeep } from '../../utils/speech';

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: WorkspaceFile[];
  onAddFile: (file: WorkspaceFile) => void;
  onDeleteFile: (id: string) => void;
  onUpdateFile: (file: WorkspaceFile) => void;
  onAskDenverAboutFile: (fileName: string, content: string) => void;
}

export const FileManagerModal: React.FC<FileManagerModalProps> = ({
  isOpen,
  onClose,
  files,
  onAddFile,
  onDeleteFile,
  onUpdateFile,
  onAskDenverAboutFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(files[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [localDirConnected, setLocalDirConnected] = useState(false);
  const [localDirName, setLocalDirName] = useState('');

  if (!isOpen) return null;

  // Handle native Web File System Access API
  const handleConnectLocalFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        setLocalDirName(dirHandle.name);
        setLocalDirConnected(true);
        playHudBeep('success');

        // Read files from chosen directory
        const loadedFiles: WorkspaceFile[] = [];
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const fileData = await entry.getFile();
            let text = '';
            try {
              text = await fileData.text();
            } catch {
              text = '[Binary or protected file content]';
            }
            loadedFiles.push({
              id: 'local_' + entry.name,
              name: entry.name,
              path: `C:\\Users\\Pritam\\${dirHandle.name}\\${entry.name}`,
              extension: entry.name.split('.').pop() || 'txt',
              size: `${(fileData.size / 1024).toFixed(1)} KB`,
              content: text.slice(0, 15000),
              updatedAt: new Date().toLocaleTimeString(),
              isRealLocal: true,
            });
          }
        }

        if (loadedFiles.length > 0) {
          loadedFiles.forEach(f => onAddFile(f));
          setSelectedFile(loadedFiles[0]);
        }
      } else {
        alert('File System Access API is supported in Chrome, Edge, and modern browsers.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Directory pick error:', err);
      }
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const ext = newFileName.includes('.') ? newFileName.split('.').pop()! : 'txt';
    const newFile: WorkspaceFile = {
      id: 'file_' + Date.now(),
      name: newFileName.trim(),
      path: `C:\\DenverAI\\Workspace\\${newFileName.trim()}`,
      extension: ext,
      size: '0.8 KB',
      content: `// Denver AI Workspace File: ${newFileName.trim()}\n// Created for Pritam\n// Timestamp: ${new Date().toISOString()}\n\n`,
      updatedAt: new Date().toLocaleTimeString(),
    };
    onAddFile(newFile);
    setSelectedFile(newFile);
    setNewFileName('');
    setIsCreating(false);
    playHudBeep('success');
  };

  const handleSaveEdit = () => {
    if (!selectedFile) return;
    const updated = {
      ...selectedFile,
      content: editContent,
      updatedAt: new Date().toLocaleTimeString(),
    };
    onUpdateFile(updated);
    setSelectedFile(updated);
    setIsEditing(false);
    playHudBeep('success');
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl h-[85vh] rounded-2xl bg-[#071318] border border-teal-500/30 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-teal-500/20 flex items-center justify-between bg-[#0a1820]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-teal-100 text-sm tracking-wide">LOCAL FILE SYSTEM WORKSPACE</span>
              <div className="text-[10px] font-mono text-teal-400/60">
                {localDirConnected ? `Connected folder: C:\\Users\\Pritam\\${localDirName}` : 'Virtual & Local Windows Files'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConnectLocalFolder}
              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{localDirConnected ? 'Folder Linked' : 'Connect PC Folder'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-teal-400/60 hover:text-teal-200 hover:bg-teal-500/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body 2-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* File list sidebar */}
          <div className="w-72 border-r border-teal-500/15 bg-[#061014] flex flex-col">
            <div className="p-3 border-b border-teal-500/10 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-teal-500/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0a171d] border border-teal-500/20 text-xs text-teal-100 placeholder-teal-500/40 outline-none"
                />
              </div>

              {isCreating ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. project_notes.py"
                    className="flex-1 px-2 py-1 bg-[#0d1e26] border border-teal-400/40 rounded text-xs text-teal-100 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFile}
                    className="p-1 rounded bg-teal-400 text-black text-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-1 rounded bg-teal-950 text-teal-300 text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#0b1f28] hover:bg-[#0e2733] border border-teal-500/25 text-teal-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New File</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => {
                    playHudBeep('click');
                    setSelectedFile(file);
                    setIsEditing(false);
                  }}
                  className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                    selectedFile?.id === file.id
                      ? 'bg-teal-500/20 border border-teal-400/40 text-teal-100 shadow-[0_0_10px_rgba(45,212,191,0.2)]'
                      : 'hover:bg-[#0a1b22] text-teal-300/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-4 h-4 text-teal-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{file.name}</div>
                      <div className="text-[10px] font-mono text-teal-500/50">{file.size} &bull; {file.updatedAt}</div>
                    </div>
                  </div>
                  {file.isRealLocal && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      PC
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* File Viewer / Editor */}
          <div className="flex-1 flex flex-col bg-[#071419] overflow-hidden">
            {selectedFile ? (
              <>
                <div className="h-12 px-5 border-b border-teal-500/15 flex items-center justify-between bg-[#081820]/70">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-teal-200 font-semibold">{selectedFile.name}</span>
                    <span className="font-mono text-[10px] text-teal-400/50">{selectedFile.path}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAskDenverAboutFile(selectedFile.name, selectedFile.content);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Denver Analyze</span>
                    </button>

                    {isEditing ? (
                      <button
                        onClick={handleSaveEdit}
                        className="px-2.5 py-1 rounded bg-emerald-500 text-black text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditContent(selectedFile.content);
                          setIsEditing(true);
                        }}
                        className="px-2.5 py-1 rounded bg-[#0e2733] hover:bg-[#123140] border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteFile(selectedFile.id)}
                      className="p-1.5 rounded hover:bg-rose-950/40 text-teal-400/50 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono-code text-xs">
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full bg-[#050e12] border border-teal-500/30 rounded-lg p-3 text-slate-200 outline-none resize-none font-mono-code text-xs leading-relaxed"
                    />
                  ) : (
                    <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                      {selectedFile.content || '// Empty file'}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-teal-500/40 text-xs">
                <File className="w-10 h-10 mb-2 opacity-50" />
                <span>Select a file to inspect</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
