import React from 'react';

const Sidebar = ({ theme, savedSnippets, languages, onLoadSnippet }) => {
  return (
    <div className={theme === 'dark' ? 'w-64 bg-gray-800 border-gray-700 border-r overflow-y-auto' : 'w-64 bg-white border-gray-200 border-r overflow-y-auto'}>
      <div className="p-4">
        <h3 className={theme === 'dark' ? 'text-lg font-semibold mb-4 text-white' : 'text-lg font-semibold mb-4 text-gray-900'}>
          Saved Snippets
        </h3>
        {savedSnippets.length === 0 ? (
          <p className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-500'}>
            No saved snippets yet
          </p>
        ) : (
          <div className="space-y-2">
            {savedSnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => onLoadSnippet(snippet)}
                className={theme === 'dark' ? 'p-3 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-700 hover:bg-gray-600' : 'p-3 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-100 hover:bg-gray-200'}
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
