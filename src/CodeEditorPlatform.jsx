// File: src/CodeEditorPlatform.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import Output from './components/Output';
import { getComplexityData, analyzeComplexity } from './utils/complexity';

/*
  This component now calls Judge0 CE via RapidAPI. 
  We assume two globals (set in public/index.html):
  
    window.__JUDGE0_RAPIDAPI_KEY__ = "<your-rapidapi-key>";
    window.__JUDGE0_RAPIDAPI_HOST__ = "judge0-ce.p.rapidapi.com";
    
  Because Judge0 CE on RapidAPI requires:
    • "X-RapidAPI-Key" header
    • "X-RapidAPI-Host" header
  and a valid POST endpoint.
*/

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

  const clearOutput = () => setOutput('');

  // Handle the vertical resize of the output pane
  const startResize = (e) => {
    resizeData.current = {
      startY: e.clientY,
      startHeight: outputHeight,
    };
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const delta = resizeData.current.startY - e.clientY;
      const newHeight = Math.max(
        100,
        Math.min(window.innerHeight - 100, resizeData.current.startHeight + delta)
      );
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
  }, [isResizing, outputHeight]);

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
      spaceDetails: null,
    });
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
      spaceDetails: null,
    });
  };

  const getLanguageId = (lang) => {
    const languageMap = {
      python: 71,        // Python 3
      javascript: 63,    // Node.js
      java: 62,          // Java
      cpp: 50,           // C++ (GCC 9.2.0)
    };
    return languageMap[lang] || 71;
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
      // If Axios can’t reach the endpoint (wrong URL / no CORS / network down),
      // it throws "Error: Network Error"
      setOutput(`Error: ${err.message}`);
    } finally {
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
