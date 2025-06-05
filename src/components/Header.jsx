// File: src/components/Header.jsx
import React from 'react';
import { 
  FiPlay, 
  FiMoon, 
  FiSun, 
  FiSave, 
  FiShare2, 
  FiUploadCloud,
  FiFile
} from 'react-icons/fi';

const Header = ({
  theme,
  language,
  languages,
  onChangeLanguage,
  onToggleTheme,
  onRun,
  isRunning,
  onSave,
  onShare,
  onShowDriveModal,
  currentFileName = 'Untitled',
  hasUnsavedChanges = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-2 border-b ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'
      } transition-colors duration-300`}
    >
      {/* Left side - Logo and current file */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm"><img src="https://play-lh.googleusercontent.com/m3oqSZCwmitiZ-Im-CQu_rqT5eLHilOp5IudBynv3COJUumFzuQaP2dgTDxRL_03f4x2" alt="CodeLab Logo"/></span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            CodeLab
          </h1>
        </div>
        
        {/* Current file indicator */}
        <div className="flex items-center space-x-2">
          <FiFile className="text-gray-500" size={16} />
          <span className={`text-sm ${
            hasUnsavedChanges ? 'font-medium' : 'font-normal'
          } ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentFileName}
          </span>
        </div>
      </div>

      {/* Center - Language selector */}
      <div className="flex items-center space-x-4">
        <select
          value={language}
          onChange={(e) => onChangeLanguage(e.target.value)}
          className={`px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {Object.entries(languages).map(([key, lang]) => (
            <option key={key} value={key}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-3">
        {/* Save button */}
        <button
          onClick={onSave}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            hasUnsavedChanges
              ? theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
          title="Save (Ctrl+S)"
        >
          <FiSave size={16} />
          <span className="text-sm font-medium">Save</span>
        </button>

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          <FiPlay size={16} />
          <span className="text-sm font-medium">
            {isRunning ? 'Running...' : 'Run'}
          </span>
        </button>

        {/* Share button */}
        <button
          onClick={onShare}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Share"
        >
          <FiShare2 size={18} />
        </button>

        {/* Google Drive button */}
        <button
          onClick={onShowDriveModal}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Save to Google Drive"
        >
          <FiUploadCloud size={18} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-yellow-400'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Header;