# Terminal Portfolio Generator

This project allows you to generate an interactive terminal-style portfolio from your user input. It supports different themes, a live terminal preview, and an export feature to save the portfolio as a standalone HTML file.

## Features

- **Portfolio Input Form:** Enter your personal information, skills, projects, experience, education, and contact links.
- **Live Terminal Preview:** View your portfolio in an interactive terminal UI in real-time as you type.
- **Theming System:** Choose from multiple themes (Classic Green, Blue, Amber, Light).
- **HTML Export:** Generate a standalone, dependency-free HTML page containing your stylized terminal portfolio.

## Architecture & File Structure

- \`index.html\` - The main UI containing the input form and the terminal preview panel.
- \`style.css\` - General styling for the application interface and form.
- \`theme.js\` - Manages the available terminal color schemes.
- \`portfolioEngine.js\` - Data model, validation, and handles the logic for terminal commands.
- \`exportHtml.js\` - Logic to export the user's terminal output into a single, standalone HTML file.
- \`script.js\` - Wires up the UI, handles state management, event listeners, and DOM updates.

## Project Startup Guide

Since this is a vanilla HTML/CSS/JavaScript project with no build steps or heavy dependencies, starting it up is very simple:

### Option 1: Open Directly in Browser
You can simply open the \`index.html\` file directly in your web browser:
1. Navigate to the project directory in your file explorer.
2. Double-click \`index.html\`, or drag it into your browser.

### Option 2: Run a Local Development Server (Recommended)
Running a local development server ensures that you don't run into any \`file://\` protocol restrictions, particularly if you decide to add modules or external assets later.

If you have Node.js installed, you can use \`npx\` to run a quick server:
\`\`\`bash
npx serve .
\`\`\`
Then open the provided local URL (usually \`http://localhost:3000\`) in your web browser.

Alternatively, if you have Python 3 installed:
\`\`\`bash
python3 -m http.server
\`\`\`
Then open \`http://localhost:8000\` in your web browser.

## How to use

1. Open the app in your browser.
2. Fill out the details in the form on the left.
3. Choose a theme that suits your style.
4. Interact with the terminal preview on the right (try typing \`help\`).
5. Click **Export HTML** to download your self-contained terminal portfolio!
