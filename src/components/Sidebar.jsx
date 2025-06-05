// File: src/components/Sidebar.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FiFile, 
  FiFolder, 
  FiFolderPlus, 
  FiFilePlus, 
  FiTrash2, 
  FiEdit2, 
  FiChevronRight, 
  FiChevronDown,
  FiRefreshCw,
  FiX
} from 'react-icons/fi';
import { MdFolderOpen } from 'react-icons/md';

// Separate component for local folder to avoid hooks in render functions
const LocalFolder = ({ folderHandle, theme, currentFilePath, onOpenFile, index }) => {
  const [folderChildren, setFolderChildren] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to read directory structure
  const readDirectoryStructure = async (dirHandle, maxDepth = 3, currentDepth = 0) => {
    if (currentDepth >= maxDepth) return null;
    
    const children = [];
    try {
      for await (const [name, handle] of dirHandle.entries()) {
        if (name.startsWith('.')) continue; // Skip hidden files/folders
        
        if (handle.kind === 'directory') {
          const subChildren = await readDirectoryStructure(handle, maxDepth, currentDepth + 1);
          children.push({
            type: 'folder',
            name,
            handle,
            children: subChildren || []
          });
        } else if (handle.kind === 'file') {
          // Check if it's a code file
          const extension = name.split('.').pop()?.toLowerCase();
          const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'md', 'txt'];
          
          if (codeExtensions.includes(extension)) {
            children.push({
              type: 'file',
              name,
              handle,
              extension
            });
          }
        }
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }
    
    return children;
  };

  // Function to read file content
  const readFileContent = async (fileHandle) => {
    try {
      const file = await fileHandle.getFile();
      const content = await file.text();
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      return '';
    }
  };

  // Function to get language from file extension
  const getLanguageFromExtension = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const extensionMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'javascript',
      'tsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'cpp',
      'html': 'html',
      'css': 'css',
      'json': 'javascript'
    };
    return extensionMap[extension] || 'javascript';
  };

  // Function to handle file opening from local system
  const handleOpenLocalFile = async (node, path) => {
    if (node.type === 'file' && node.handle) {
      const content = await readFileContent(node.handle);
      const language = getLanguageFromExtension(node.name);
      
      // Create a temporary file object for the editor
      const fileData = {
        name: node.name,
        content,
        language,
        path,
        isLocal: true,
        handle: node.handle
      };
      
      onOpenFile(path, fileData);
    }
  };

  const loadChildren = async () => {
    if (!isLoaded) {
      const structure = await readDirectoryStructure(folderHandle, 2, 0);
      setFolderChildren(structure || []);
      setIsLoaded(true);
    }
    setIsExpanded(!isExpanded);
  };

  const folderPath = [folderHandle.name];
  const pathKey = folderPath.join('/');

  // Function to check if folder is expanded
  const isFolderExpanded = (path) => {
    // For local folders, we manage expansion state internally
    return isExpanded;
  };

  // Render local file/folder nodes
  const renderLocalNode = (node, path = []) => {
    const nodePath = [...path, node.name];
    const pathKey = nodePath.join('/');
    const isSelected = currentFilePath.join('/') === pathKey;

    if (node.type === 'folder') {
      const expanded = isFolderExpanded(nodePath);
      
      return (
        <div key={pathKey} className="pl-2">
          <div
            className={`flex items-center cursor-pointer select-none p-1 rounded ${
              theme === 'dark' 
                ? 'text-white hover:bg-gray-700' 
                : 'text-gray-900 hover:bg-gray-200'
            }`}
            onClick={() => {
              // Toggle folder expansion (simplified for local folders)
            }}
          >
            <span className="mr-1">
              {expanded ? <FiChevronDown /> : <FiChevronRight />}
            </span>
            <span className="mr-2">
              <FiFolder className="text-blue-400" />
            </span>
            <span className="truncate">{node.name}</span>
          </div>
          
          {expanded && node.children && (
            <div className="pl-4">
              {node.children.map((child) => renderLocalNode(child, nodePath))}
            </div>
          )}
        </div>
      );
    } else if (node.type === 'file') {
      const getFileIcon = (filename) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        const iconMap = {
          'js': '🟨',
          'jsx': '⚛️',
          'ts': '🔷',
          'tsx': '⚛️',
          'py': '🐍',
          'java': '☕',
          'cpp': '⚙️',
          'c': '⚙️',
          'html': '🌍',
          'css': '🎨',
          'json': '📋',
          'md': '📝'
        };
        return iconMap[ext] || '📄';
      };

      return (
        <div
          key={pathKey}
          className={`cursor-pointer select-none p-1 pl-6 rounded flex items-center ${
            isSelected
              ? theme === 'dark'
                ? 'bg-blue-800 text-white'
                : 'bg-blue-200 text-blue-900'
              : theme === 'dark'
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-900 hover:bg-gray-200'
          }`}
          onClick={() => handleOpenLocalFile(node, nodePath)}
        >
          <span className="mr-2 text-sm">
            {getFileIcon(node.name)}
          </span>
          <span className="truncate">{node.name}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div key={pathKey} className="mb-2">
      {/* Folder header with controls */}
      <div className="flex items-center justify-between group">
        <div
          className={`flex items-center cursor-pointer select-none p-2 rounded flex-1 ${
            theme === 'dark' 
              ? 'text-white hover:bg-gray-700' 
              : 'text-gray-900 hover:bg-gray-200'
          }`}
          onClick={loadChildren}
        >
          <span className="mr-2">
            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </span>
          <span className="mr-2">
            <MdFolderOpen className="text-blue-500" />
          </span>
          <span className="truncate font-medium">{folderHandle.name}</span>
        </div>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Refresh functionality can be added here
            }}
            className={`p-1 rounded hover:bg-gray-600 ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Refresh"
          >
            <FiRefreshCw size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Close folder functionality can be added here
            }}
            className={`p-1 rounded hover:bg-gray-600 ml-1 ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Close Folder"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Folder contents */}
      {isExpanded && (
        <div className="pl-6 mt-1">
          {folderChildren.map((child) => renderLocalNode(child, folderPath))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({
  theme,
  fileSystem,
  currentFilePath,
  onOpenFile,
  onCreateNode,
  onRenameNode,
  onDeleteNode,
  savedSnippets,
  languages,
  onLoadSnippet,
}) => {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    node: null,
    path: [],
    type: null,
  });
  const [editingNode, setEditingNode] = useState(null);
  const [newNodeInput, setNewNodeInput] = useState('');
  const [openFolders, setOpenFolders] = useState([]); // Array of opened folder handles
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const toggleFolder = (path) => {
    const pathKey = path.join('/');
    setExpandedFolders((prev) => ({
      ...prev,
      [pathKey]: !prev[pathKey],
    }));
  };

  const isFolderExpanded = (path) => {
    const pathKey = path.join('/');
    return expandedFolders[pathKey];
  };

  const handleContextMenu = (e, node = null, path = [], type = 'background') => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
      node,
      path,
      type,
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, [closeContextMenu]);

  // Function to handle opening folder from local PC
  const handleOpenFolder = async () => {
    if (!window.showDirectoryPicker) {
      // Fallback for browsers that don't support File System Access API
      alert('Your browser does not support the File System Access API. Please use a modern browser like Chrome, Edge, or Safari.');
      return;
    }

    try {
      setIsLoading(true);
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      
      // Add to opened folders
      setOpenFolders(prev => {
        const existing = prev.find(folder => folder.name === dirHandle.name);
        if (existing) return prev;
        return [...prev, dirHandle];
      });
      
      setIsLoading(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error opening folder:', error);
        alert('Failed to open folder. Please try again.');
      }
      setIsLoading(false);
    }
  };

  // Function to close folder
  const closeFolder = (folderToClose) => {
    setOpenFolders(prev => prev.filter(folder => folder !== folderToClose));
  };

  // Function to get language from file extension
  const getLanguageFromExtension = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const extensionMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'javascript',
      'tsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'cpp',
      'html': 'html',
      'css': 'css',
      'json': 'javascript'
    };
    return extensionMap[extension] || 'javascript';
  };

  const handleCreateNode = (type) => {
    if (!newNodeInput.trim()) return;
    
    const newNode = {
      type,
      name: newNodeInput.trim(),
      ...(type === 'file' ? {
        language: getLanguageFromExtension(newNodeInput.trim()),
        content: '',
      } : {
        children: [],
      })
    };
    
    onCreateNode(contextMenu.path, newNode);
    setNewNodeInput('');
    
    // Expand folder if creating inside a collapsed folder
    if (contextMenu.path.length > 0) {
      const pathKey = contextMenu.path.join('/');
      setExpandedFolders(prev => ({ ...prev, [pathKey]: true }));
    }
    
    // If it's a file, open it for editing
    if (type === 'file') {
      onOpenFile([...contextMenu.path, newNodeInput.trim()]);
    }
    
    setContextMenu({ show: false, x: 0, y: 0, node: null, path: [], type: null });
  };

  const handleRenameNode = () => {
    if (!newNodeInput.trim() || !editingNode) return;
    onRenameNode(editingNode.path, newNodeInput.trim());
    setEditingNode(null);
    setNewNodeInput('');
  };

  // Original renderNode function for virtual file system
  const renderNode = (node, path = []) => {
    const nodePath = [...path, node.name];
    const pathKey = nodePath.join('/');
    const isSelected = currentFilePath.join('/') === pathKey;
    
    if (node.type === 'folder') {
      const expanded = isFolderExpanded(nodePath);
      
      return (
        <div 
          key={pathKey} 
          className="pl-2"
          onContextMenu={(e) => handleContextMenu(e, node, nodePath, 'folder')}
        >
          <div
            className={`flex items-center cursor-pointer select-none p-1 rounded ${
              theme === 'dark' 
                ? isSelected 
                  ? 'bg-blue-800 text-white' 
                  : 'text-white hover:bg-gray-700' 
                : isSelected 
                  ? 'bg-blue-200 text-blue-900' 
                  : 'text-gray-900 hover:bg-gray-200'
            }`}
            onClick={() => toggleFolder(nodePath)}
          >
            <span className="mr-1">
              {expanded ? <FiChevronDown /> : <FiChevronRight />}
            </span>
            <span className="mr-2">
              <FiFolder className="inline" />
            </span>
            {editingNode && editingNode.path.join('/') === pathKey ? (
              <input
                type="text"
                className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none"
                value={newNodeInput}
                onChange={(e) => setNewNodeInput(e.target.value)}
                onBlur={handleRenameNode}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameNode()}
                autoFocus
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>
          
          {expanded && node.children && (
            <div className="pl-4">
              {node.children.map((child) => renderNode(child, nodePath))}
              
              {/* Show input when creating new node inside this folder */}
              {contextMenu.show && contextMenu.path.join('/') === pathKey && 
               (contextMenu.type === 'newFile' || contextMenu.type === 'newFolder') && (
                <div className="flex items-center p-1">
                  <span className="mr-2">
                    {contextMenu.type === 'newFile' 
                      ? <FiFile className="inline" /> 
                      : <FiFolder className="inline" />}
                  </span>
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none"
                    value={newNodeInput}
                    onChange={(e) => setNewNodeInput(e.target.value)}
                    onBlur={() => handleCreateNode(contextMenu.type === 'newFile' ? 'file' : 'folder')}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNode(contextMenu.type === 'newFile' ? 'file' : 'folder')}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else if (node.type === 'file') {
      return (
        <div
          key={pathKey}
          className={`cursor-pointer select-none p-1 pl-6 rounded ${
            isSelected
              ? theme === 'dark'
                ? 'bg-blue-800 text-white'
                : 'bg-blue-200 text-blue-900'
              : theme === 'dark'
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-900 hover:bg-gray-200'
          }`}
          onClick={() => onOpenFile(nodePath)}
          onContextMenu={(e) => handleContextMenu(e, node, nodePath, 'file')}
        >
          <span className="mr-2">
            <FiFile className="inline" />
          </span>
          {editingNode && editingNode.path.join('/') === pathKey ? (
            <input
              type="text"
              className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none"
              value={newNodeInput}
              onChange={(e) => setNewNodeInput(e.target.value)}
              onBlur={handleRenameNode}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameNode()}
              autoFocus
            />
          ) : (
            <span className="truncate">{node.name}</span>
          )}
        </div>
      );
    }
    return null;
  };

  const handleContextMenuAction = (action) => {
    switch (action) {
      case 'newFile':
      case 'newFolder':
        setContextMenu(prev => ({ ...prev, type: action }));
        setNewNodeInput('');
        break;
      case 'rename':
        setEditingNode({ 
          node: contextMenu.node, 
          path: contextMenu.path 
        });
        setNewNodeInput(contextMenu.node.name);
        setContextMenu(prev => ({ ...prev, show: false }));
        break;
      case 'delete':
        onDeleteNode(contextMenu.path);
        setContextMenu(prev => ({ ...prev, show: false }));
        break;
      default:
        setContextMenu(prev => ({ ...prev, show: false }));
    }
  };

  return (
    <div
      className={
        theme === 'dark'
          ? 'w-80 bg-gray-800 border-gray-700 border-r overflow-y-auto text-white'
          : 'w-80 bg-white border-gray-200 border-r overflow-y-auto text-gray-900'
      }
      onContextMenu={(e) => handleContextMenu(e, null, [], 'background')}
    >
      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-50 rounded-md shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div
            className={`
              py-1 rounded-md shadow-lg
              ${theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-gray-900 border border-gray-200'}
            `}
          >
            {contextMenu.type === 'background' && (
              <>
                <div
                  className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('newFile')}
                >
                  <FiFilePlus className="mr-2" /> New File
                </div>
                <div
                  className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('newFolder')}
                >
                  <FiFolderPlus className="mr-2" /> New Folder
                </div>
              </>
            )}
            
            {contextMenu.type === 'folder' && (
              <>
                <div
                  className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('newFile')}
                >
                  <FiFilePlus className="mr-2" /> New File
                </div>
                <div
                  className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('newFolder')}
                >
                  <FiFolderPlus className="mr-2" /> New Folder
                </div>
                <div
                  className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('rename')}
                >
                  <FiEdit2 className="mr-2" /> Rename
                </div>
                <div
                  className="flex items-center px-4 py-2 hover:bg-red-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('delete')}
                >
                  <FiTrash2 className="mr-2" /> Delete
                </div>
              </>
            )}
            
            {contextMenu.type === 'file' && (
              <>
                <div
                  className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('rename')}
                >
                  <FiEdit2 className="mr-2" /> Rename
                </div>
                <div
                  className="flex items-center px-4 py-2 hover:bg-red-600 cursor-pointer"
                  onClick={() => handleContextMenuAction('delete')}
                >
                  <FiTrash2 className="mr-2" /> Delete
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="p-4 border-b border-gray-600">
        <h3 className="text-lg font-semibold mb-4">Explorer</h3>
        
        {/* Open Folder Button */}
        <button
          onClick={handleOpenFolder}
          disabled={isLoading}
          className={`
            w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors
            ${theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600'
              : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400'
            }
          `}
        >
          <MdFolderOpen className="mr-2" />
          {isLoading ? 'Opening...' : 'Open Folder'}
        </button>
      </div>

      {/* Opened Folders Section */}
      {openFolders.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">
            Opened Folders
          </h4>
          <div className="space-y-1">
            {openFolders.map((folderHandle, index) => (
              <LocalFolder
                key={`${folderHandle.name}-${index}`}
                folderHandle={folderHandle}
                theme={theme}
                currentFilePath={currentFilePath}
                onOpenFile={onOpenFile}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Virtual File System Section */}
      {fileSystem && fileSystem.children && fileSystem.children.length > 0 && (
        <div className="p-4 border-t border-gray-600">
          <h4 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">
            Workspace Files
          </h4>
          <div>
            {fileSystem.children.map((child) => renderNode(child, []))}
          </div>
        </div>
      )}
      
      {/* Saved Snippets Section */}
      <div className="p-4 border-t border-gray-600">
        <h4 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">
          Saved Snippets
        </h4>
        {savedSnippets.length === 0 ? (
          <p className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-500'}>
            No saved snippets yet
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedSnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => onLoadSnippet(snippet)}
                className={
                  theme === 'dark'
                    ? 'p-3 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-700 hover:bg-gray-600'
                    : 'p-3 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-100 hover:bg-gray-200'
                }
              >
                <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-gray-900'}>
                  {snippet.name}
                </div>
                <div className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-500'}>
                  {languages[snippet.language] ? languages[snippet.language].name : snippet.language}
                </div>
                <div className={theme === 'dark' ? 'text-xs text-gray-500' : 'text-xs text-gray-400'}>
                  {snippet.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;