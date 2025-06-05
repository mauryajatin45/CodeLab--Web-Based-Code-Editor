// File: src/CodeEditorPlatform.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import Output from './components/Output';
import { getComplexityData, analyzeComplexity } from './utils/complexity';

const languages = {
  python: {
    name: 'Python',
    sample: [
      '# Welcome to CodeLab!',
      '# Select a language and start coding',
      '',
      'def hello_world():',
      '    print("Hello, World!")',
      '    return "Success"',
      '',
      'hello_world()',
    ].join('\n'),
  },
  javascript: {
    name: 'JavaScript',
    sample: [
      '// Welcome to CodeLab!',
      '// Select a language and start coding',
      '',
      'function factorial(n) {',
      '  if (n <= 1) return 1;',
      '  return n * factorial(n - 1);',
      '}',
      '',
      'console.log(factorial(5));',
    ].join('\n'),
  },
  java: {
    name: 'Java',
    sample: [
      '// Welcome to CodeLab!',
      '// Select a language and start coding',
      '',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        System.out.println("Hello, World!");',
      '        System.out.println(fibonacci(10));',
      '    }',
      '    ',
      '    public static int fibonacci(int n) {',
      '        if (n <= 1) return n;',
      '        return fibonacci(n - 1) + fibonacci(n - 2);',
      '    }',
      '}',
    ].join('\n'),
  },
  cpp: {
    name: 'C++',
    sample: [
      '// Welcome to CodeLab!',
      '// Select a language and start coding',
      '',
      '#include <iostream>',
      '',
      'int fibonacci(int n) {',
      '    if (n <= 1)',
      '        return n;',
      '    return fibonacci(n - 1) + fibonacci(n - 2);',
      '}',
      '',
      'int main() {',
      '    std::cout << "Hello, World!\\n";',
      '    std::cout << fibonacci(10) << "\\n";',
      '    return 0;',
      '}',
    ].join('\n'),
  },
};

const CodeEditorPlatform = () => {
  // Virtual file system state: folders and files (empty by default)
  const [fileSystem, setFileSystem] = useState({
    type: 'folder',
    name: 'root',
    children: [],
  });

  // Current open file path as array of folder/file names
  const [currentFilePath, setCurrentFilePath] = useState([]);
  const [code, setCode] = useState('// Welcome to CodeLab!\n// Open a folder or create a new file to start coding');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('dark');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [complexity, setComplexity] = useState({
    time: '',
    space: '',
    timeValue: 0,
    spaceValue: 0,
    timeGrowth: [],
    spaceGrowth: [],
    timeDetails: null,
    spaceDetails: null,
  });
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [googleDriveAuth, setGoogleDriveAuth] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveFileName, setDriveFileName] = useState('');
  const [driveSaving, setDriveSaving] = useState(false);
  const [outputHeight, setOutputHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const resizeData = useRef({ startY: 0, startHeight: 0 });

  // Current file state to track if it's a local file or virtual file
  const [currentFile, setCurrentFile] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper function to get language from file extension
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
      'json': 'javascript',
      'md': 'javascript'
    };
    return extensionMap[extension] || 'javascript';
  };

  // Handler for opening file from local folder (called from Sidebar)
  const handleOpenFile = async (path, fileData = null) => {
    // If fileData is provided, it's a local file
    if (fileData && fileData.isLocal) {
      setCurrentFilePath(path);
      setCode(fileData.content);
      setLanguage(fileData.language);
      setCurrentFile(fileData);
      setHasUnsavedChanges(false);
      setOutput('');
      setComplexity({
        time: '',
        space: '',
        timeValue: 0,
        spaceValue: 0,
        timeGrowth: [],
        spaceGrowth: [],
        timeDetails: null,
        spaceDetails: null,
      });
    } else {
      // Virtual file system file
      const node = findNodeByPath(path);
      if (node && node.type === 'file') {
        setCurrentFilePath(path);
        setCode(node.content);
        setLanguage(node.language);
        setCurrentFile(null);
        setHasUnsavedChanges(false);
        setOutput('');
        setComplexity({
          time: '',
          space: '',
          timeValue: 0,
          spaceValue: 0,
          timeGrowth: [],
          spaceGrowth: [],
          timeDetails: null,
          spaceDetails: null,
        });
      }
    }
  };

  // Save current file (local or virtual)
  const saveCurrentFile = async () => {
    if (currentFile && currentFile.isLocal && currentFile.handle) {
      try {
        // Save to local file system using File System Access API
        const writable = await currentFile.handle.createWritable();
        await writable.write(code);
        await writable.close();
        setHasUnsavedChanges(false);
        setOutput('File saved successfully!');
      } catch (error) {
        console.error('Error saving file:', error);
        setOutput(`Error saving file: ${error.message}`);
      }
    } else if (currentFilePath.length > 0) {
      // Save virtual file
      updateFileContent(currentFilePath, code);
      setHasUnsavedChanges(false);
      setOutput('File saved to workspace!');
    }
  };

  // Helper function to find a file or folder node by path
  const findNodeByPath = (path, node = fileSystem) => {
    if (path.length === 0) return node;
    if (!node.children) return null;
    const [head, ...tail] = path;
    const child = node.children.find((c) => c.name === head);
    if (!child) return null;
    return findNodeByPath(tail, child);
  };

  // Update file content in fileSystem by path
  const updateFileContent = (path, newContent) => {
    const updateNode = (node, currentPath) => {
      if (currentPath.length === 0) {
        if (node.type === 'file') {
          return { ...node, content: newContent };
        }
        return node;
      }
      if (!node.children) return node;
      const [head, ...tail] = currentPath;
      return {
        ...node,
        children: node.children.map((child) =>
          child.name === head ? updateNode(child, tail) : child
        ),
      };
    };
    setFileSystem((prev) => updateNode(prev, path));
  };

  // Create new file or folder in a folder path
  const createNode = (parentPath, newNode) => {
    const addNode = (node, currentPath) => {
      if (currentPath.length === 0) {
        if (node.type === 'folder') {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        return node;
      }
      if (!node.children) return node;
      const [head, ...tail] = currentPath;
      return {
        ...node,
        children: node.children.map((child) =>
          child.name === head ? addNode(child, tail) : child
        ),
      };
    };
    setFileSystem((prev) => addNode(prev, parentPath));
  };

  // Rename a file or folder by path
  const renameNode = (path, newName) => {
    const rename = (node, currentPath) => {
      if (currentPath.length === 1) {
        if (node.children) {
          return {
            ...node,
            children: node.children.map((child) =>
              child.name === currentPath[0] ? { ...child, name: newName } : child
            ),
          };
        }
        return node;
      }
      if (!node.children) return node;
      const [head, ...tail] = currentPath;
      return {
        ...node,
        children: node.children.map((child) =>
          child.name === head ? rename(child, tail) : child
        ),
      };
    };
    setFileSystem((prev) => rename(prev, path));
    // If renaming current open file, update currentFilePath
    if (currentFilePath.length === path.length && currentFilePath.every((v, i) => v === path[i])) {
      const newPath = [...path.slice(0, -1), newName];
      setCurrentFilePath(newPath);
    }
  };

  // Delete a file or folder by path
  const deleteNode = (path) => {
    const removeNode = (node, currentPath) => {
      if (currentPath.length === 1) {
        if (!node.children) return node;
        return {
          ...node,
          children: node.children.filter((child) => child.name !== currentPath[0]),
        };
      }
      if (!node.children) return node;
      const [head, ...tail] = currentPath;
      return {
        ...node,
        children: node.children.map((child) =>
          child.name === head ? removeNode(child, tail) : child
        ),
      };
    };
    setFileSystem((prev) => removeNode(prev, path));
    // If deleting current open file, clear editor
    if (currentFilePath.length === path.length && currentFilePath.every((v, i) => v === path[i])) {
      setCurrentFilePath([]);
      setCode('// File deleted\n// Create a new file or open another file to start coding');
      setLanguage('javascript');
      setCurrentFile(null);
      setHasUnsavedChanges(false);
    }
  };

  // Update code state and track unsaved changes
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setHasUnsavedChanges(true);
    
    // Auto-save for virtual files
    if (currentFilePath.length > 0 && (!currentFile || !currentFile.isLocal)) {
      updateFileContent(currentFilePath, newCode);
    }
  };

  const saveSnippet = useCallback(() => {
    const snippet = {
      id: Date.now(),
      name: `Snippet ${savedSnippets.length + 1}`,
      language,
      code,
      timestamp: new Date().toLocaleString(),
    };
    setSavedSnippets((prev) => [...prev, snippet]);
  }, [code, language, savedSnippets]);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    setCode(languages[newLang].sample);
    setCurrentFilePath([]);
    setCurrentFile(null);
    setHasUnsavedChanges(false);
    setOutput('');
    setComplexity({
      time: '',
      space: '',
      timeValue: 0,
      spaceValue: 0,
      timeGrowth: [],
      spaceGrowth: [],
      timeDetails: null,
      spaceDetails: null,
    });
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // 1) Complexity analysis (client‐side)
      const { timeComplexity, spaceComplexity } = analyzeComplexity(code, language);
      const complexityData = getComplexityData(timeComplexity, spaceComplexity);
      setComplexity({
        time: timeComplexity,
        space: spaceComplexity,
        ...complexityData,
      });

      // 2) Read RapidAPI key + host from window globals
      const RAPIDAPI_KEY = window.__JUDGE0_RAPIDAPI_KEY__;
      const RAPIDAPI_HOST = window.__JUDGE0_RAPIDAPI_HOST__;
      const JUDGE0_URL =
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";

      if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
        throw new Error(
          'RapidAPI key or host is missing. Make sure you set ' +
          '`window.__JUDGE0_RAPIDAPI_KEY__` and `window.__JUDGE0_RAPIDAPI_HOST__` in index.html.'
        );
      }

      // 3) POST to Judge0 CE on RapidAPI
      const response = await axios.post(
        JUDGE0_URL,
        {
          source_code: code,
          language_id: getLanguageId(language),
          stdin: '',
          args: [],
          expected_output: '',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        }
      );

      // 4) Process the result
      const { stdout, stderr, status } = response.data;
      if (status && status.id === 3) {
        setOutput(`Compilation Error: ${stderr}`);
      } else if (stdout) {
        setOutput(stdout);
      } else if (stderr) {
        setOutput(`Error: ${stderr}`);
      } else {
        setOutput('No output returned.');
      }
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const loadSnippet = (snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setCurrentFilePath([]);
    setCurrentFile(null);
    setHasUnsavedChanges(false);
    setOutput('');
    setComplexity({
      time: '',
      space: '',
      timeValue: 0,
      spaceValue: 0,
      timeGrowth: [],
      spaceGrowth: [],
      timeDetails: null,
      spaceDetails: null,
    });
  };

  const startResize = (e) => {
    resizeData.current = {
      startY: e.clientY,
      startHeight: outputHeight,
    };
    setIsResizing(true);
  };

  const clearOutput = () => setOutput('');

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, currentFile, currentFilePath]);

  // Handle mouse move for resizing output panel
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const deltaY = e.clientY - resizeData.current.startY;
      const newHeight = resizeData.current.startHeight - deltaY;
      setOutputHeight(Math.max(100, Math.min(window.innerHeight - 200, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const getLanguageId = (lang) => {
    const langIds = {
      python: 71,
      javascript: 63,
      java: 62,
      cpp: 54,
    };
    return langIds[lang] || 71;
  };

  // Get current file display name
  const getCurrentFileName = () => {
    if (currentFilePath.length > 0) {
      const fileName = currentFilePath[currentFilePath.length - 1];
      return hasUnsavedChanges ? `${fileName} •` : fileName;
    }
    return hasUnsavedChanges ? 'Untitled •' : 'Untitled';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Header
        theme={theme}
        language={language}
        languages={languages}
        onChangeLanguage={changeLanguage}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onRun={executeCode}
        isRunning={isRunning}
        onSave={saveCurrentFile}
        onShare={() => {}}
        onShowDriveModal={() => setShowDriveModal(true)}
        currentFileName={getCurrentFileName()}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="flex h-screen">
        <Sidebar
          theme={theme}
          fileSystem={fileSystem}
          currentFilePath={currentFilePath}
          onOpenFile={handleOpenFile}
          onCreateNode={createNode}
          onRenameNode={renameNode}
          onDeleteNode={deleteNode}
          savedSnippets={savedSnippets}
          languages={languages}
          onLoadSnippet={loadSnippet}
        />
        
        <div className="flex-1 flex flex-col">
          {/* File tab bar */}
          {currentFilePath.length > 0 && (
            <div className={`flex items-center px-4 py-2 border-b ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            }`}>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {getCurrentFileName()}
              </span>
              {hasUnsavedChanges && (
                <button
                  onClick={saveCurrentFile}
                  className={`ml-2 px-2 py-1 text-xs rounded ${
                    theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Save
                </button>
              )}
            </div>
          )}

          <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <CodeEditor
              code={code}
              language={language}
              theme={theme}
              onChange={handleCodeChange}
            />
          </div>

          {/* Draggable bar to resize the output pane */}
          <div
            className="w-full h-2 cursor-row-resize bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 relative"
            onMouseDown={startResize}
          >
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex justify-center">
              <div className="w-16 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
            </div>
          </div>

          <Output
            theme={theme}
            output={output}
            clearOutput={clearOutput}
            complexity={complexity}
            height={outputHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPlatform;