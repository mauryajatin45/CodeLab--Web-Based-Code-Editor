# CodeLab - Web-based Multi-language Code Editor Platform

![CodeLab Logo](https://play-lh.googleusercontent.com/m3oqSZCwmitiZ-Im-CQu_rqT5eLHilOp5IudBynv3COJUumFzuQaP2dgTDxRL_03f4x2)

CodeLab is a modern web-based code editor that supports multiple programming languages with real-time execution and complexity analysis. Built with React and Vite, it provides a seamless coding experience with features like virtual file system, local file integration, and code sharing.

## Features

- **Multi-language Support**: Write and run code in Python, JavaScript, Java, and C++
- **File Management**:
  - Virtual file system with folders and files
  - Open and edit local files from your computer
  - Save snippets for quick access
- **Code Execution**:
  - Run code via Judge0 API
  - View output directly in the editor
- **Complexity Analysis**:
  - Automatic time and space complexity estimation
  - Detailed explanations of complexity classes
  - Growth rate visualization
- **UI Customization**:
  - Dark/light theme toggle
  - Resizable panels
  - Syntax highlighting
- **Sharing & Integration**:
  - Share code snippets
  - Google Drive integration (save to Drive)
- **Keyboard Shortcuts**:
  - Ctrl+S: Save file
  - Ctrl+Enter: Run code

## Supported Languages

| Language | Sample Starter Code |
|----------|---------------------|
| Python | `print("Hello, World!")` |
| JavaScript | `console.log("Hello, World!");` |
| Java | `System.out.println("Hello, World!");` |
| C++ | `std::cout << "Hello, World!";` |

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/codelab.git
cd codelab
```

2. Install dependencies:
```bash
npm install
```

3. Configure Judge0 API keys:
Create a `.env` file in the root directory with:
```
VITE_JUDGE0_RAPIDAPI_KEY=your_api_key_here
VITE_JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

### Running Locally
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

## Project Structure

```
codelab/
├── src/
│   ├── components/
│   │   ├── CodeEditor.jsx    # Monaco editor component
│   │   ├── Header.jsx        # Top navigation bar
│   │   ├── Output.jsx        # Execution output panel
│   │   └── Sidebar.jsx       # File explorer
│   ├── utils/
│   │   └── complexity.js     # Complexity analysis logic
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── public/                   # Static assets
├── vite.config.js            # Vite configuration
└── package.json              # Project dependencies
```

## Configuration

### Judge0 API Setup
1. Get a RapidAPI key from [Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Add it to your `.env` file as shown above

### Google Drive Integration
To enable Google Drive saving:
1. Create a Google Cloud Project
2. Enable Google Drive API
3. Add your client ID to the app configuration

## Usage

1. **Create/Open Files**:
   - Use the sidebar to create new files/folders
   - Open local files via the "Open Folder" button

2. **Edit Code**:
   - Write code in the editor with syntax highlighting
   - Save with Ctrl+S or the save button

3. **Run Code**:
   - Press Ctrl+Enter or click the Run button
   - View output and complexity analysis below

4. **Save & Share**:
   - Save snippets to your workspace
   - Share code via the share button
   - Save to Google Drive (if configured)

## Dependencies

- Frontend:
  - React 19
  - Vite
  - Monaco Editor
  - TailwindCSS
  - Lucide/React Icons
  - Axios

- APIs:
  - Judge0 CE (via RapidAPI)
  - Google Drive API (optional)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request
