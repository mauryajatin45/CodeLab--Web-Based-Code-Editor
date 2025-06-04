import React, { useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';

// Configure Monaco loader base URL if needed
// loader.config({ paths: { vs: '/path-to-monaco-editor/min/vs' } });

const languageMap = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp'
};

const CodeEditor = ({ code, language, theme, onChange }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor options for auto-completion and line numbers
    editor.updateOptions({
      lineNumbers: 'on',
      automaticLayout: true,
      minimap: { enabled: false },
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: 14,
      wordWrap: 'on',
      tabSize: 2,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      autoClosingBrackets: 'always',
      autoIndent: 'advanced',
      formatOnType: true,
      formatOnPaste: true
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={languageMap[language] || 'javascript'}
      language={languageMap[language] || 'javascript'}
      value={code}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        lineNumbers: 'on',
        automaticLayout: true,
        minimap: { enabled: false },
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: 14,
        wordWrap: 'on',
        tabSize: 2,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        parameterHints: { enabled: true },
        autoClosingBrackets: 'always',
        autoIndent: 'advanced',
        formatOnType: true,
        formatOnPaste: true
      }}
    />
  );
};

export default CodeEditor;
