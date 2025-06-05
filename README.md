# CodeLab

CodeLab is a web-based code editor platform that supports multiple programming languages with features such as syntax highlighting, line numbering, auto-completion, code execution, complexity analysis, snippet saving, sharing, and Google Drive integration.

## Live Demo

The application is live and accessible at: [https://codelab.mauryajatin.me](https://codelab.mauryajatin.me)

## Features

- **Multi-language support:** Python, JavaScript, Java, C++
- **Code editor:** Powered by Monaco Editor with line numbering, syntax highlighting, and VS Code-like auto-completion
- **Code execution:** Runs code using Judge0 API with output display
- **Complexity analysis:** Time and space complexity analysis with detailed descriptions
- **Snippet management:** Save, load, and share code snippets
- **Google Drive integration:** Save code files directly to Google Drive
- **Theme toggle:** Switch between dark and light themes
- **Resizable output window:** Adjustable output panel height with drag slider
- **Keyboard shortcuts:** Ctrl+Enter to run code, Ctrl+S to save snippet

## Project Structure

- `src/CodeEditorPlatform.jsx`: Main component managing state and layout
- `src/components/`: Contains modular React components such as Header, Sidebar, CodeEditor, Output, etc.
- `src/utils/complexity.js`: Utility functions for complexity analysis
- `public/`: Static assets
- `package.json`: Project dependencies and scripts

## Usage

- Select a programming language from the dropdown.
- Write or edit code in the editor.
- Click **Run** or press **Ctrl+Enter** to execute the code.
- View output and complexity analysis in the output panel.
- Save snippets for later use or share them via generated URLs.
- Save code files to Google Drive after connecting your account.
- Resize the output panel by dragging the slider between editor and output.

## License

This project is licensed under the MIT License.

## Contact

For any questions or feedback, please contact the maintainer.

---

Enjoy coding with CodeLab!