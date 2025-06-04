import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Save, Share2, Sun, Moon, Copy, Check, Settings, Terminal, Clock, MemoryStick, Cloud, BarChart3 } from 'lucide-react';

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

  // Complexity visualization data
  const getComplexityData = (timeComplexity, spaceComplexity) => {
    const complexityValues = {
      'O(1)': { value: 1, color: '#10B981', label: 'Constant' },
      'O(log n)': { value: 2, color: '#3B82F6', label: 'Logarithmic' },
      'O(n)': { value: 3, color: '#F59E0B', label: 'Linear' },
      'O(n log n)': { value: 4, color: '#EF4444', label: 'Linearithmic' },
      'O(n^2)': { value: 5, color: '#8B5CF6', label: 'Quadratic' },
      'O(2^n)': { value: 6, color: '#DC2626', label: 'Exponential' },
      'O(n!)': { value: 7, color: '#991B1B', label: 'Factorial' }
    };

    const generateGrowthData = (complexity) => {
      const data = [];
      const points = [1, 2, 4, 8, 16, 32, 64];
      
      points.forEach(n => {
        let value;
        switch(complexity) {
          case 'O(1)': value = 1; break;
          case 'O(log n)': value = Math.log2(n); break;
          case 'O(n)': value = n; break;
          case 'O(n log n)': value = n * Math.log2(n); break;
          case 'O(n^2)': value = n * n; break;
          case 'O(2^n)': value = Math.pow(2, Math.min(n, 10)); break;
          case 'O(n!)': value = n <= 5 ? factorial(n) : 1000; break;
          default: value = n;
        }
        data.push({ n, value: Math.min(value, 1000) });
      });
      return data;
    };

    const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);

    return {
      timeDetails: complexityValues[timeComplexity] || { value: 0, color: '#6B7280', label: 'Unknown' },
      spaceDetails: complexityValues[spaceComplexity] || { value: 0, color: '#6B7280', label: 'Unknown' },
      timeGrowth: generateGrowthData(timeComplexity),
      spaceGrowth: generateGrowthData(spaceComplexity)
    };
  };

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
    
    // Simulate Google Drive API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fileName = driveFileName || `code_${language}_${Date.now()}`;
    const fileContent = {
      name: fileName,
      language,
      code,
      timestamp: new Date().toISOString(),
      complexity: complexity
    };
    
    // Mock saving to Google Drive
    console.log('Saving to Google Drive:', fileContent);
    
    setDriveSaving(false);
    setShowDriveModal(false);
    setDriveFileName('');
    alert(`Code saved to Google Drive as "${fileName}.${language}"`);
  };

  // Simulate code execution with JDoodle-like API
  const executeCode = useCallback(async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Mock execution results based on language
      const mockResults = {
        python: {
          output: 'Hello, World!\nSuccess',
          complexity: { 
            time: 'O(1)', 
            space: 'O(1)',
            timeValue: 1,
            spaceValue: 1
          }
        },
        javascript: {
          output: '120',
          complexity: { 
            time: 'O(n)', 
            space: 'O(n)',
            timeValue: 3,
            spaceValue: 3
          }
        },
        java: {
          output: 'Hello, World!\n55',
          complexity: { 
            time: 'O(2^n)', 
            space: 'O(n)',
            timeValue: 6,
            spaceValue: 3
          }
        },
        cpp: {
          output: 'Hello, World!\n55',
          complexity: { 
            time: 'O(2^n)', 
            space: 'O(n)',
            timeValue: 6,
            spaceValue: 3
          }
        }
      };

      const result = mockResults[language] || { 
        output: 'Code executed successfully', 
        complexity: { time: 'O(1)', space: 'O(1)', timeValue: 1, spaceValue: 1 } 
      };
      
      setOutput(result.output);
      
      // Enhanced complexity with graphical data
      const complexityData = getComplexityData(result.complexity.time, result.complexity.space);
      setComplexity({
        time: result.complexity.time,
        space: result.complexity.space,
        timeValue: result.complexity.timeValue,
        spaceValue: result.complexity.spaceValue,
        ...complexityData
      });
    } catch (error) {
      setOutput('Error: ' + error.message);
      setComplexity({ time: '', space: '', timeValue: 0, spaceValue: 0, timeGrowth: [], spaceGrowth: [], timeDetails: null, spaceDetails: null });
    }
    
    setIsRunning(false);
  }, [language]);

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