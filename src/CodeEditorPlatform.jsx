import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Save, Share2, Sun, Moon, Copy, Check, Settings, Terminal, Clock, MemoryStick, Cloud, BarChart3 } from 'lucide-react';
import axios from 'axios';

// Define languages object outside the component
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
  const [code, setCode] = useState('# Welcome to CodeLab!\n# Select a language and start coding\n\ndef hello_world():\n    print("Hello, World!")\n    return "Success"\n\nhello_world()');
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
  const editorRef = useRef(null);

// ✅ Judge0 API Constants
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = '9d5e851df8msh93b6b8c88948504p1e095djsnd531d8949a3d';
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';

const getComplexityData = (time, space) => {
  const complexityValues = {
    'O(1)': 1,
    'O(log n)': 2,
    'O(n)': 3,
    'O(n log n)': 4,
    'O(n^2)': 5,
    'O(n^3)': 6,
    'O(2^n)': 7,
    'O(n!)': 8
  };

  const complexityDescriptions = {
    'O(1)': 'Constant time/space — best performance, independent of input size.',
    'O(log n)': 'Logarithmic — good performance, input size increases exponentially.',
    'O(n)': 'Linear — performance grows proportionally with input size.',
    'O(n log n)': 'Linearithmic — common in efficient sorting algorithms.',
    'O(n^2)': 'Quadratic — nested loops, inefficient for large input.',
    'O(n^3)': 'Cubic — triple nested loops, very slow for large input.',
    'O(2^n)': 'Exponential — increases rapidly, typically recursion-heavy.',
    'O(n!)': 'Factorial — extremely inefficient, only for very small input sizes.'
  };

  const growthSamples = (value) => {
    const nValues = [1, 5, 10, 15, 20];
    switch (value) {
      case 'O(1)': return nValues.map(() => 1);
      case 'O(log n)': return nValues.map(n => Math.log2(n));
      case 'O(n)': return nValues.map(n => n);
      case 'O(n log n)': return nValues.map(n => n * Math.log2(n));
      case 'O(n^2)': return nValues.map(n => n * n);
      case 'O(n^3)': return nValues.map(n => n * n * n);
      case 'O(2^n)': return nValues.map(n => Math.pow(2, n));
      case 'O(n!)':
        return nValues.map(n => {
          let fact = 1;
          for (let i = 2; i <= n; i++) fact *= i;
          return fact;
        });
      default: return nValues.map(() => 0);
    }
  };

  const timeValue = complexityValues[time] || 0;
  const spaceValue = complexityValues[space] || 0;

  return {
    timeValue,
    spaceValue,
    timeDetails: {
      label: time,
      description: complexityDescriptions[time] || 'Unknown time complexity.',
      value: timeValue
    },
    spaceDetails: {
      label: space,
      description: complexityDescriptions[space] || 'Unknown space complexity.',
      value: spaceValue
    },
    timeGrowth: growthSamples(time),
    spaceGrowth: growthSamples(space)
  };
};


// ✅ Complexity Analyzer
const analyzeComplexity = (code, language) => {
  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ');

  const nestedLoopPattern = /for.*for|while.*while|for.*while|while.*for/g;
  const singleLoopPattern = /for\s*\(|while\s*\(|for\s+\w+\s+in|for\s+\w+\s+of/g;
  const recursivePattern = /(\w+)\s*\([^)]*\)[\s\S]*?\1\s*\(/g;

  if (nestedLoopPattern.test(normalizedCode)) {
    const forCount = (normalizedCode.match(/for/g) || []).length;
    const whileCount = (normalizedCode.match(/while/g) || []).length;
    const totalLoops = forCount + whileCount;

    if (totalLoops >= 3) timeComplexity = 'O(n^3)';
    else if (totalLoops >= 2) timeComplexity = 'O(n^2)';
  } else if (singleLoopPattern.test(normalizedCode)) {
    if (normalizedCode.includes('log') || normalizedCode.includes('/= 2') || normalizedCode.includes('* 2')) {
      timeComplexity = 'O(n log n)';
    } else {
      timeComplexity = 'O(n)';
    }
  } else if (recursivePattern.test(normalizedCode)) {
    if (normalizedCode.includes('fibonacci') || normalizedCode.includes('fib')) timeComplexity = 'O(2^n)';
    else if (normalizedCode.includes('factorial')) timeComplexity = 'O(n!)';
    else timeComplexity = 'O(log n)';
  }

  let hasVariableArray = false;
  let has2DArray = false;
  let hasRecursion = false;
  let hasDynamicStructure = false;

  const arrayPatterns = [
    /new\s+\w+\[\s*\w+\s*\]/g,
    /\w+\[\s*\]\s*=\s*new\s+\w+\[\s*\w+\s*\]/g,
    /\w+\s*=\s*new\s+\w+\[\s*\w+\s*\]/g,
    /list\s*=\s*\[\]/g,
    /array\s*=\s*\[\]/g,
    /\w+\s*=\s*\[\s*\]/g
  ];
  const matrix2DPatterns = [
    /new\s+\w+\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/g,
    /\[\s*\[\s*\]\s*for/g,
    /matrix|grid|board/g
  ];
  const recursiveSpacePatterns = [ /(\w+)\s*\([^)]*\)[\s\S]*?\1\s*\(/g ];
  const dynamicStructurePatterns = [
    /vector|arraylist|list|set|map|dictionary|hashtable|stack|queue/gi,
    /append|push|add|insert|put/gi
  ];

  arrayPatterns.forEach(p => { if (p.test(normalizedCode)) hasVariableArray = true; });
  matrix2DPatterns.forEach(p => { if (p.test(normalizedCode)) has2DArray = true; });
  if (recursiveSpacePatterns.some(p => p.test(normalizedCode))) hasRecursion = true;
  if (dynamicStructurePatterns.some(p => p.test(normalizedCode))) hasDynamicStructure = true;

  if (has2DArray) spaceComplexity = 'O(n^2)';
  else if (hasVariableArray || hasDynamicStructure) spaceComplexity = 'O(n)';
  else if (hasRecursion) {
    if (normalizedCode.includes('fibonacci') || normalizedCode.includes('fib')) spaceComplexity = 'O(n)';
    else if (normalizedCode.includes('factorial')) spaceComplexity = 'O(n)';
    else spaceComplexity = 'O(log n)';
  } else spaceComplexity = 'O(1)';

  return { timeComplexity, spaceComplexity };
};

// ✅ Main executeCode function
const executeCode = useCallback(async () => {
  setIsRunning(true);
  setOutput('Running code...');

  try {
    const languageIds = {
      python: 71,
      javascript: 63,
      java: 62,
      cpp: 54
    };

    const postResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageIds[language] || 62,
        stdin: ''
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_API_HOST
        }
      }
    );

    const token = postResponse.data.token;

    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise(res => setTimeout(res, 1500));
      const resultResponse = await axios.get(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': JUDGE0_API_HOST
          }
        }
      );

      result = resultResponse.data;
      if (result.status.id >= 3) break;
    }

    let executionOutput = '';
    if (result.stdout) executionOutput = result.stdout.trim();
    else if (result.compile_output) executionOutput = `Compilation Error:\n${result.compile_output}`;
    else if (result.stderr) executionOutput = `Runtime Error:\n${result.stderr}`;
    else executionOutput = 'Unknown error occurred.';

    const { timeComplexity, spaceComplexity } = analyzeComplexity(code, language);

    const complexityData = getComplexityData(timeComplexity, spaceComplexity); // Assumes this exists
    setOutput(executionOutput);
    setComplexity({
      time: timeComplexity,
      space: spaceComplexity,
      timeValue: complexityData.timeDetails.value,
      spaceValue: complexityData.spaceDetails.value,
      ...complexityData
    });
  } catch (err) {
    console.error('Judge0 Error:', err);
    setOutput(`Error: ${err.message}`);
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
  }

  setIsRunning(false);
}, [code, language]);

  // Google Drive integration
  const initializeGoogleDrive = () => {
    // Simulate Google Drive initialization
    setTimeout(() => {
      setGoogleDriveAuth(true);
      alert('Google Drive connected successfully!');
    }, 1000);
  };

const saveToGoogleDrive = async () => {
  if (!googleDriveAuth) {
    initializeGoogleDrive();
    return;
  }
  
  setDriveSaving(true);
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileName = driveFileName || `code_${language}_${Date.now()}`;
    const fileType = language === 'python' ? 'py' : 
                     language === 'javascript' ? 'js' : 
                     language === 'java' ? 'java' : 
                     language === 'cpp' ? 'cpp' : 'txt';
    
    // Create file content
    const fileContent = {
      name: `${fileName}.${fileType}`,
      content: code,
      metadata: {
        language,
        timestamp: new Date().toISOString(),
        complexity: {
          time: complexity.time,
          space: complexity.space
        }
      }
    };
    
    console.log('Saving to Google Drive:', fileContent);
    
    alert(`Code saved to Google Drive as "${fileContent.name}"`);
  } catch (error) {
    console.error('Google Drive save failed:', error);
    alert('Failed to save to Google Drive. Please try again.');
  } finally {
    setDriveSaving(false);
    setShowDriveModal(false);
    setDriveFileName('');
  }
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

  // Handle keyboard shortcuts
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

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    setCode(languages[newLang].sample);
    setOutput('');
    setComplexity({ time: '', space: '', timeValue: 0, spaceValue: 0, timeGrowth: [], spaceGrowth: [], timeDetails: null, spaceDetails: null });
  };

  const shareCode = () => {
    const shareData = btoa(JSON.stringify({ code, language }));
    const url = `${window.location.origin}?shared=${shareData}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSnippet = (snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setOutput('');
    setComplexity({ time: '', space: '', timeValue: 0, spaceValue: 0, timeGrowth: [], spaceGrowth: [], timeDetails: null, spaceDetails: null });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Terminal className="inline mr-2" size={24} />
              CodeLab
            </h1>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {Object.entries(languages).map(([key, lang]) => (
                <option key={key} value={key}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDriveModal(true)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Save to Google Drive"
            >
              <Cloud size={18} />
            </button>
            
            <button
              onClick={executeCode}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors duration-200"
            >
              <Play size={18} className="mr-2" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
            
            <button
              onClick={saveSnippet}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Save Snippet (Ctrl+S)"
            >
              <Save size={18} />
            </button>
            
            <button
              onClick={shareCode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Share Code"
            >
              <Share2 size={18} />
            </button>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`w-64 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r overflow-y-auto`}>
          <div className="p-4">
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Saved Snippets
            </h3>
            {savedSnippets.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No saved snippets yet
              </p>
            ) : (
              <div className="space-y-2">
                {savedSnippets.map((snippet) => (
                  <div
                    key={snippet.id}
                    onClick={() => loadSnippet(snippet)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {snippet.name}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {languages[snippet.language].name}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {snippet.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none ${
                  theme === 'dark' 
                    ? 'bg-gray-900 text-green-400' 
                    : 'bg-white text-gray-900'
                }`}
                placeholder="Start coding here..."
                spellCheck={false}
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className={`h-80 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Output
              </h3>
              <div className="text-sm text-gray-500">
                Press Ctrl+Enter to run
              </div>
            </div>
            
            <div className="p-4 h-32 overflow-y-auto">
              <pre className={`text-sm font-mono whitespace-pre-wrap ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {output || 'No output yet. Run your code to see results.'}
              </pre>
            </div>

            {/* Enhanced Complexity Analysis with Graphs */}
            {(complexity.time || complexity.space) && (
              <div className={`px-4 py-4 border-t ${
                theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-100'
              }`}>
                <h4 className={`font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <BarChart3 size={18} className="mr-2" />
                  Complexity Analysis
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Time Complexity */}
                  {complexity.time && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-blue-500" />
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Time Complexity: <span className="font-mono font-bold text-blue-500">{complexity.time}</span>
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {complexity.timeDetails?.label || 'Analysis'}
                        </span>
                      </div>
                      
                      {/* Time Complexity Bar */}
                      <div className="relative">
                        <div className={`w-full h-3 rounded-full ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        }`}>
                          <div 
                            className="h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${(complexity.timeValue / 7) * 100}%`,
                              backgroundColor: complexity.timeDetails?.color || '#3B82F6'
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-gray-500 select-none">
                          <span>Better</span>
                          <span>Worse</span>
                        </div>
                      </div>

                      {/* Growth Chart */}
                      {complexity.timeGrowth && complexity.timeGrowth.length > 0 && (
                        <div className="relative h-24 mt-3">
                          <svg className="w-full h-full" viewBox="0 0 280 80">
                            <defs>
                              <linearGradient id="timeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: complexity.timeDetails?.color || '#3B82F6', stopOpacity: 0.3}} />
                                <stop offset="100%" style={{stopColor: complexity.timeDetails?.color || '#3B82F6', stopOpacity: 0.1}} />
                              </linearGradient>
                            </defs>
                            
                            {/* Grid lines */}
                            {[20, 40, 60].map(y => (
                              <line key={y} x1="0" y1={y} x2="280" y2={y} 
                                    stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} strokeWidth="1" />
                            ))}
                            
                            {/* Growth curve */}
                            <polyline
                              fill="url(#timeGradient)"
                              stroke={complexity.timeDetails?.color || '#3B82F6'}
                              strokeWidth="2"
                              points={complexity.timeGrowth.map((point, i) => 
                                `${i * 40},${80 - (point.value / Math.max(...complexity.timeGrowth.map(p => p.value)) * 60)}`
                              ).join(' ')}
                            />
                            
                            {/* Data points */}
                            {complexity.timeGrowth.map((point, i) => (
                              <circle
                                key={i}
                                cx={i * 40}
                                cy={80 - (point.value / Math.max(...complexity.timeGrowth.map(p => p.value)) * 60)}
                                r="3"
                                fill={complexity.timeDetails?.color || '#3B82F6'}
                              />
                            ))}
                          </svg>
                          <div className="flex justify-between text-xs mt-1 text-gray-500">
                            <span>n=1</span>
                            <span>n=64</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Space Complexity */}
                  {complexity.space && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MemoryStick size={16} className="text-purple-500" />
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Space Complexity: <span className="font-mono font-bold text-purple-500">{complexity.space}</span>
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {complexity.spaceDetails?.label || 'Analysis'}
                        </span>
                      </div>
                      
                      {/* Space Complexity Bar */}
                      <div className="relative">
                        <div className={`w-full h-3 rounded-full ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        }`}>
                          <div 
                            className="h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${(complexity.spaceValue / 7) * 100}%`,
                              backgroundColor: complexity.spaceDetails?.color || '#8B5CF6'
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-gray-500 select-none">
                          <span>Better</span>
                          <span>Worse</span>
                        </div>
                      </div>

                      {/* Growth Chart */}
                      {complexity.spaceGrowth && complexity.spaceGrowth.length > 0 && (
                        <div className="relative h-24 mt-3">
                          <svg className="w-full h-full" viewBox="0 0 280 80">
                            <defs>
                              <linearGradient id="spaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: complexity.spaceDetails?.color || '#8B5CF6', stopOpacity: 0.3}} />
                                <stop offset="100%" style={{stopColor: complexity.spaceDetails?.color || '#8B5CF6', stopOpacity: 0.1}} />
                              </linearGradient>
                            </defs>
                            
                            {/* Grid lines */}
                            {[20, 40, 60].map(y => (
                              <line key={y} x1="0" y1={y} x2="280" y2={y} 
                                    stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} strokeWidth="1" />
                            ))}
                            
                            {/* Growth curve */}
                            <polyline
                              fill="url(#spaceGradient)"
                              stroke={complexity.spaceDetails?.color || '#8B5CF6'}
                              strokeWidth="2"
                              points={complexity.spaceGrowth.map((point, i) => 
                                `${i * 40},${80 - (point.value / Math.max(...complexity.spaceGrowth.map(p => p.value)) * 60)}`
                              ).join(' ')}
                            />
                            
                            {/* Data points */}
                            {complexity.spaceGrowth.map((point, i) => (
                              <circle
                                key={i}
                                cx={i * 40}
                                cy={80 - (point.value / Math.max(...complexity.spaceGrowth.map(p => p.value)) * 60)}
                                r="3"
                                fill={complexity.spaceDetails?.color || '#8B5CF6'}
                              />
                            ))}
                          </svg>
                          <div className="flex justify-between text-xs mt-1 text-gray-500">
                            <span>n=1</span>
                            <span>n=64</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Drive Save Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Cloud className="mr-2" size={20} />
              Save to Google Drive
            </h3>
            
            {!googleDriveAuth ? (
              <div className="space-y-4">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Connect your Google Drive account to save your code files directly to the cloud.
                </p>
                <button
                  onClick={initializeGoogleDrive}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Cloud className="mr-2" size={18} />
                  Connect Google Drive
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    File Name
                  </label>
                  <input
                    type="text"
                    value={driveFileName}
                    onChange={(e) => setDriveFileName(e.target.value)}
                    placeholder={`code_${language}_${Date.now()}`}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Language:</span>
                    <span className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {languages[language].name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Lines:</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {code.split('\n').length}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={saveToGoogleDrive}
                  disabled={driveSaving}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {driveSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving to Drive...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={18} />
                      Save to Drive
                    </>
                  )}
                </button>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowDriveModal(false);
                  setDriveFileName('');
                }}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Share Your Code
            </h3>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={`flex-1 px-3 py-2 rounded border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                } focus:outline-none`}
              />
              <button
                onClick={copyShareUrl}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowShareModal(false)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditorPlatform;