import React from 'react';
import { Play, Save, Share2, Sun, Moon, Cloud, Terminal } from 'lucide-react';

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
  onShowDriveModal
}) => {
  return (
    <header className={theme === 'dark' ? 'bg-gray-800 border-gray-700 border-b px-6 py-4' : 'bg-white border-gray-200 border-b px-6 py-4'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className={theme === 'dark' ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
            <Terminal className="inline mr-2" size={24} />
            CodeLab
          </h1>
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className={theme === 'dark' ? 'px-3 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500' : 'px-3 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'}
          >
            {Object.entries(languages).map(([key, lang]) => (
              <option key={key} value={key}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onShowDriveModal}
            className={theme === 'dark' ? 'p-2 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-white' : 'p-2 rounded-lg transition-colors duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700'}
            title="Save to Google Drive"
          >
            <Cloud size={18} />
          </button>

          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <Play size={18} className="mr-2" />
            {isRunning ? 'Running...' : 'Run'}
          </button>

          <button
            onClick={onSave}
            className={theme === 'dark' ? 'p-2 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-white' : 'p-2 rounded-lg transition-colors duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700'}
            title="Save Snippet (Ctrl+S)"
          >
            <Save size={18} />
          </button>

          <button
            onClick={onShare}
            className={theme === 'dark' ? 'p-2 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-white' : 'p-2 rounded-lg transition-colors duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700'}
            title="Share Code"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={onToggleTheme}
            className={theme === 'dark' ? 'p-2 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-white' : 'p-2 rounded-lg transition-colors duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700'}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
