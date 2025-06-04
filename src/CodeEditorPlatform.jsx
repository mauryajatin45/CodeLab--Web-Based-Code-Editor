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
    sample: '# Welcome to CodeLab!\n# Select a language and start coding\n\ndef hello_world():\n    print("Hello, World!")\n    return "Success"\n\nhello_world()'
  },
  javascript: {
    name: 'JavaScript',
    sample: '// Welcome to CodeLab!\n// Select a language and start coding\n\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));'
  },
  java: {
    name: 'Java',
    sample: '// Welcome to CodeLab!\n// Select a language and start coding\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        System.out.println(fibonacci(10));\n    }\n    \n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n-1) + fibonacci(n-2);\n    }\n}'
  },
  cpp: {
    name: 'C++',
    sample: '// Welcome to CodeLab!\n// Select a language and start coding\n\n#include <iostream>\n\nint fibonacci(int n) {\n    if (n <= 1)\n        return n;\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n\nint main() {\n    std::cout << "Hello, World!\\n";\n    std::cout << fibonacci(10) << "\\n";\n    return 0;\n}'
  }
};

const CodeEditorPlatform = () => {
  const [code, setCode] = useState(languages.python.sample);
  const [language, setLanguage] = useState('python');
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
    spaceDetails: null
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

  const clearOutput = () => setOutput('');

  const startResize = (e) => {
    resizeData.current = {
      startY: e.clientY,
      startHeight: outputHeight
    };
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const delta = resizeData.current.startY - e.clientY;
      const newHeight = Math.max(100, Math.min(window.innerHeight - 100, resizeData.current.startHeight + delta));
      setOutputHeight(newHeight);
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

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    setCode(languages[newLang].sample);
    setOutput('');
    setComplexity({
      time: '',
      space: '',
      timeValue: 0,
      spaceValue: 0,
      timeGrowth: [],
      spaceGrowth: [],
      timeDetails: null,
      spaceDetails: null
    });
  };

  const saveSnippet = useCallback(() => {
    const snippet = {
      id: Date.now(),
      name: `Snippet ${savedSnippets.length + 1}`,
      language,
      code,
      timestamp: new Date().toLocaleString()
    };
    setSavedSnippets([...savedSnippets, snippet]);
  }, [code, language, savedSnippets]);

  const loadSnippet = (snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setOutput('');
    setComplexity({
      time: '',
      space: '',
      timeValue: 0,
      spaceValue: 0,
      timeGrowth: [],
      spaceGrowth: [],
      timeDetails: null,
      spaceDetails: null
    });
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // Step 1: Analyze complexity
      const { timeComplexity, spaceComplexity } = analyzeComplexity(code, language);
      const complexityData = getComplexityData(timeComplexity, spaceComplexity);
      setComplexity({
        time: timeComplexity,
        space: spaceComplexity,
        ...complexityData
      });

      // Step 2: Simulated code output (replace with API call if needed)
      setTimeout(() => {
        setOutput('Code executed successfully.');
        setIsRunning(false);
      }, 800);

    } catch (err) {
      setOutput(`Error: ${err.message}`);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSnippet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeCode, saveSnippet]);

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
        onSave={saveSnippet}
        onShare={() => {}}
        onShowDriveModal={() => setShowDriveModal(true)}
      />
      <div className="flex h-screen">
        <Sidebar
          theme={theme}
          savedSnippets={savedSnippets}
          languages={languages}
          onLoadSnippet={loadSnippet}
        />
        <div className="flex-1 flex flex-col">
          <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <CodeEditor
              code={code}
              language={language}
              theme={theme}
              onChange={(value) => setCode(value)}
            />
          </div>
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
