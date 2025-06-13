# Personalised Highlighter view for Obsidian

A powerful syntax highlighter for Obsidian that allows you to define custom regex-based highlighting patterns with personalized colors and styles.

## Features

* **User-Defined Regex Patterns:** Create highlighting rules using JavaScript-flavored regular expressions
* **Custom Colors:** Assign a unique color to each pattern
* **Enable/Disable Patterns:** Easily toggle individual highlighting rules on or off
* **Regex Flags:** Fine-tune regex behavior with flags like `g` (global), `m` (multiline), and `i` (case-insensitive)
* **CSS Classes:** Assign custom CSS classes to matched text for advanced styling
* **Capture Groups:** Highlight specific parts of your regex match using capture groups
* **Default Patterns:** Comes with pre-configured patterns inspired by Monokai/Korokai themes
* **Live Settings UI:** Manage all your patterns through an intuitive settings panel
* **Dedicated Preview Pane:** See a live preview of your highlighting rules applied to the current note's content

## Installation

### Via Community Plugins

1. Open Obsidian's **Settings**
2. Navigate to **Community plugins**
3. Ensure **Restricted mode** is **OFF**
4. Click **Browse** to open the community plugins gallery
5. Search for "Syntax Highlighter Perso"
6. Click **Install** on the plugin
7. Once installed, click **Enable**

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/your-username/obsidian-syntax-highlighter/releases/latest)
2. Extract the files into your `.obsidian/plugins/obsidian-syntax-highlighter` folder
3. Reload Obsidian
4. Enable the plugin in Settings -> Community Plugins

## Usage

### Opening the Syntax Highlighter View

* **Ribbon Icon:** Click the highlighter icon in Obsidian's left ribbon
* **Command Palette:** Open the command palette (Ctrl/Cmd+P) and search for "Open Syntax Highlighter View"

### Managing Highlighting Patterns

1. Open Obsidian's **Settings**
2. Go to **Community Plugins** in the sidebar
3. Find "Syntax Highlighter Perso" in the list
4. Click the **Options** (gear) icon

The settings panel allows you to:
* Enable/disable global syntax highlighting
* Add, edit, and delete highlighting patterns
* Configure regex patterns, colors, and CSS classes
* Set capture groups for precise highlighting

## Support

If you encounter any issues or have suggestions, please:
1. Check the [documentation](https://github.com/dvrch/obsidian-syntax-highlighter-perso/wiki)
2. Search for [existing issues](https://github.com/dvrch/obsidian-syntax-highlighter-perso/issues)
3. Create a new issue if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
