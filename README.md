# Personalised Text Coloring for Obsidian

A powerful and highly customizable text coloring plugin for Obsidian, allowing you to define custom regex-based text coloring patterns with personalized colors, styles, and advanced control over text appearance.

## Features

*   **User-Defined Regex Patterns:** Create powerful coloring rules using JavaScript-flavored regular expressions.
*   **Custom Colors:** Assign a unique color to each coloring pattern.
*   **Default Text Color:** Set a global default color for all text, acting as a base before specific patterns are applied.
*   **Flexible CSS Class Assignment:** Choose from a curated list of known CSS classes or enter your own custom class for advanced styling of matched text.
*   **Capture Groups:** Color specific parts of your regex match using capture groups (e.g., `1` for the first group).
*   **Regex Flags with Tooltips:** Fine-tune regex behavior with intuitive `g` (global), `m` (multiline), and `i` (case-insensitive) flags, each providing helpful tooltips on hover.
*   **Enable/Disable Patterns:** Easily toggle individual coloring rules on or off.
*   **Enhanced Default Patterns:** Comes with an expanded set of pre-configured patterns inspired by various themes, ready to use out-of-the-box.
*   **Streamlined Settings UI:** Manage all your patterns through an intuitive settings panel with a refined layout.
    *   "Add Pattern" button conveniently located at the top for quick access.
    *   Patterns are displayed in reverse chronological order (newest first) for easy management.
    *   "Reset to Defaults" button at the bottom allows you to quickly revert all settings to their initial state.
*   **Dedicated Preview Pane:** See a live preview of your coloring rules applied to the current note's content.

## Installation

### Via Community Plugins

1.  Open Obsidian's **Settings** (`Ctrl/Cmd+,`).
2.  Navigate to **Community plugins**.
3.  Ensure **Restricted mode** is **OFF**.
4.  Click **Browse** to open the community plugins gallery.
5.  Search for "color text perso regex".
6.  Click **Install** on the plugin.
7.  Once installed, click **Enable**.

### Manual Installation

1.  Download the latest release from the [Releases page](https://github.com/dvrch/syntax-highlighter/releases/latest).
2.  Extract the files (`main.js`, `manifest.json`, `versions.json`) into your vault's plugin folder: `.obsidian/plugins/syntax-highlighter`.
3.  Reload Obsidian.
4.  Enable the plugin in Settings -> Community Plugins.

## Usage

### Opening the Text Coloring View

*   **Ribbon Icon:** Click the coloring icon in Obsidian's left ribbon.
*   **Command Palette:** Open the command palette (`Ctrl/Cmd+P`) and search for "Open Text Coloring View".

### Managing Coloring Patterns

1.  Open Obsidian's **Settings** (`Ctrl/Cmd+,`).
2.  Go to **Community Plugins** in the sidebar.
3.  Find "color text perso regex" in the list.
4.  Click the **Options** (gear) icon next to it.

The settings panel allows you to:
*   **Enable/Disable Global Text Coloring:** A main toggle for the entire coloring feature.
*   **Default Text Color:** Use the color picker to set a base text color for your notes.
*   **Add New Patterns:** Click the "Add Pattern" button at the top to create a new coloring rule.
*   **Edit Existing Patterns:**
    *   **Pattern Name:** Give your pattern a descriptive name.
    *   **CSS Class:** Select a known CSS class from the dropdown or click "Enter Custom..." to type your own. The input field will show a "css-class" placeholder when empty.
    *   **Color:** Choose a coloring color using the color picker.
    *   **Enabled:** Toggle the checkbox to enable or disable the pattern.
    *   **Regular Expression:** Enter your regex.
    *   **Capture Group:** Specify a capture group (e.g., `1` for the first captured group, `0` for the entire match).
    *   **Flags (g, m, i):** Check the boxes for Global, Multiline, or Case-insensitive matching. Hover over each letter for a tooltip.
*   **Delete Patterns:** Click the red '×' button next to each pattern to remove it.
*   **Reset to Defaults:** Click the "Reset to Defaults" button at the bottom to revert all patterns and global settings to their initial configurations.

## Support

If you encounter any issues or have suggestions, please:
1.  Check the [documentation](https://github.com/dvrch/syntax-highlighter/wiki).
2.  Search for [existing issues](https://github.com/dvrch/syntax-highlighter/issues).
3.  Create a [new issue](https://github.com/dvrch/syntax-highlighter/issues/new) if needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
