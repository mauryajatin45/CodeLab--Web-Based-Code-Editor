import React from 'react';
import { BarChart3, Clock, MemoryStick } from 'lucide-react';

const Output = ({ theme, output, clearOutput, complexity }) => {
  return (
    <div
      className={theme === 'dark' ? 'bg-gray-800 border-gray-700 flex flex-col' : 'bg-gray-50 border-gray-200 flex flex-col'}
      style={{ height: 300 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h3 className={theme === 'dark' ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
          Output
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Press Ctrl+Enter to run</span>
          <button
            onClick={clearOutput}
            className={theme === 'dark' ? 'text-xs p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300' : 'text-xs p-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700'}
            title="Clear Output"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <pre
          className={theme === 'dark' ? 'text-sm font-mono whitespace-pre-wrap text-gray-300' : 'text-sm font-mono whitespace-pre-wrap text-gray-700'}
        >
          {output || 'No output yet. Run your code to see results.'}
        </pre>
      </div>

      {(complexity.time || complexity.space) && (
        <div
          className={theme === 'dark' ? 'px-4 py-3 border-t border-gray-700 bg-gray-750' : 'px-4 py-3 border-t border-gray-200 bg-gray-100'}
        >
          <h4
            className={theme === 'dark' ? 'font-semibold mb-2 flex items-center text-white' : 'font-semibold mb-2 flex items-center text-gray-900'}
          >
            <BarChart3 size={18} className="mr-2" />
            Complexity Analysis
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complexity.time && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-blue-500" />
                    <span
                      className={theme === 'dark' ? 'text-sm font-medium text-gray-300' : 'text-sm font-medium text-gray-700'}
                    >
                      Time Complexity
                    </span>
                  </div>
                  <span
                    className={theme === 'dark' ? 'text-sm font-mono font-bold text-blue-400' : 'text-sm font-mono font-bold text-blue-600'}
                  >
                    {complexity.time}
                  </span>
                </div>

                <div className="flex items-center">
                  <span
                    className={theme === 'dark' ? 'text-xs px-2 py-1 rounded bg-blue-900 text-blue-200' : 'text-xs px-2 py-1 rounded bg-blue-100 text-blue-800'}
                  >
                    {complexity.timeDetails?.label || 'Analysis'}
                  </span>
                  <div className="ml-2 text-xs text-gray-500">
                    {complexity.timeDetails?.description || ''}
                  </div>
                </div>
              </div>
            )}

            {complexity.space && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MemoryStick size={16} className="text-purple-500" />
                    <span
                      className={theme === 'dark' ? 'text-sm font-medium text-gray-300' : 'text-sm font-medium text-gray-700'}
                    >
                      Space Complexity
                    </span>
                  </div>
                  <span
                    className={theme === 'dark' ? 'text-sm font-mono font-bold text-purple-400' : 'text-sm font-mono font-bold text-purple-600'}
                  >
                    {complexity.space}
                  </span>
                </div>

                <div className="flex items-center">
                  <span
                    className={theme === 'dark' ? 'text-xs px-2 py-1 rounded bg-purple-900 text-purple-200' : 'text-xs px-2 py-1 rounded bg-purple-100 text-purple-800'}
                  >
                    {complexity.spaceDetails?.label || 'Analysis'}
                  </span>
                  <div className="ml-2 text-xs text-gray-500">
                    {complexity.spaceDetails?.description || ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Output;
