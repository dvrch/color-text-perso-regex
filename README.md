
# Custom Syntax Highlighter for Obsidian

**Author:** Your Name (from manifest.json)  
**Version:** 1.1.0 (from manifest.json)  
**Minimum Obsidian Version:** 1.0.0 (from manifest.json)  
**Author URL:** https://example.com (from manifest.json)
<!-- Optional: **Funding URL:** https://www.buymeacoffee.com/yourusername -->

## Overview

The Custom Syntax Highlighter plugin for Obsidian allows you to enhance your note-taking experience by defining custom regular expression-based syntax highlighting patterns. Tailor the appearance of your code blocks and text snippets with personalized colors, styles, and rules, drawing inspiration from flexible theming systems like those found in Sublime Text.

This plugin provides a dedicated view pane to see your highlighting rules in action on the content of your currently active Markdown file, updating in real-time as you type or change settings.

## Features

*   **User-Defined Regex Patterns:** Create highlighting rules using JavaScript-flavored regular expressions.
*   **Custom Colors:** Assign a unique color to each pattern.
*   **Enable/Disable Patterns:** Easily toggle individual highlighting rules on or off.
*   **Regex Flags:** Fine-tune regex behavior with flags like `g` (global), `m` (multiline), and `i` (case-insensitive) via an easy-to-use interface.
*   **CSS Classes:** Assign custom CSS classes to matched text for advanced styling (e.g., bold, italic, backgrounds) via Obsidian snippets.
*   **Capture Groups:** Highlight specific parts of your regex match using capture groups.
*   **Default Patterns:** Comes with a set of pre-configured patterns inspired by Monokai/Korokai themes, covering common elements like comments, keywords, numbers, operators, and content within delimiters (strings, parentheses, etc.). These defaults can be modified, disabled, or deleted.
*   **Live Settings UI:** Manage all your patterns through an intuitive settings panel within Obsidian.
*   **Dedicated Preview Pane:** Open a "Syntax Highlighter" view to see a live preview of your highlighting rules applied to the current note's content.

## Installation

### Via Community Plugins (Recommended)

1.  Open Obsidian's **Settings**.
2.  Navigate to **Community plugins**.
3.  Ensure **Restricted mode** is **OFF**.
4.  Click **Browse** to open the community plugins gallery.
5.  Search for "Custom Syntax Highlighter".
6.  Click **Install** on the plugin.
7.  Once installed, click **Enable**.

### Manual Installation

1.  Download the `main.js` and `manifest.json` files from the latest [Release](https.github.com/your-repo-url/releases/latest) (replace with your actual GitHub repo URL if you create one).
2.  In your Obsidian vault, navigate to the `.obsidian/plugins/` directory.
3.  Create a new folder named `obsidian-custom-syntax-highlighter` (or the ID from `manifest.json`).
4.  Copy the downloaded `main.js` and `manifest.json` files into this new folder.
5.  Reload Obsidian (Ctrl/Cmd+R or close and reopen).
6.  Go to **Settings** -> **Community plugins** and enable "Custom Syntax Highlighter" from the list of installed plugins.

## Usage

### Opening the Syntax Highlighter View

*   **Ribbon Icon:** Click the highlighter icon in Obsidian's left ribbon.
*   **Command Palette:** Open the command palette (Ctrl/Cmd+P) and search for "Open Syntax Highlighter View".

This view will display the content of your currently active Markdown file, with your custom syntax highlighting rules applied. It updates automatically as you edit the file or modify highlighting settings.

### Accessing Settings

1.  Open Obsidian's **Settings**.
2.  Go to **Community Plugins** in the sidebar.
3.  Find "Custom Syntax Highlighter" in the list of installed plugins.
4.  Click the **Options** (gear) icon next to it.

### Managing Highlighting Patterns

The settings panel allows you to configure all aspects of your syntax highlighting:

*   **Enable Global Syntax Highlighting:** A master switch to turn all custom highlighting on or off.

*   **Highlighting Patterns List:** Each pattern is managed in its own collapsible section.
    *   **Pattern Name:** A descriptive name for your rule (e.g., "Python Keywords", "TODO Comments"). This is for your reference in the settings.
    *   **Enabled Checkbox:** Toggle this specific pattern on or off.
    *   **Regex:** The core of your rule. Enter a JavaScript-compatible regular expression here.
        *   *Do not include* the leading and trailing slashes (`/`). For example, for `/\b(TODO|FIXME)\b/gm`, you would enter `\b(TODO|FIXME)\b`.
    *   **Flags:**
        *   **g (Global):** Finds all matches in the text, not just the first one. Almost always recommended.
        *   **m (Multiline):** When enabled, `^` and `$` will match the start and end of a line, respectively (respecting newlines), in addition to the start and end of the whole string.
        *   **i (Case-Insensitive):** Makes the regex match both uppercase and lowercase letters.
    *   **CSS Class:** (Optional) Assign a custom CSS class name to the matched text. This allows for more advanced styling (like `font-weight: bold;` or `font-style: italic;`) by defining this class in your Obsidian CSS snippets. For example, if you enter `my-keyword`, you can add `.my-keyword { font-weight: bold; }` to your `obsidian.css` or a custom snippet file.
    *   **Color:** Choose the text color for the highlighted match using a color picker. This is applied directly as an inline style.
    *   **Capture Group:** (Optional) If your regex uses capturing groups (e.g., `(text)`), you can specify which group's content should be highlighted.
        *   Enter a number (e.g., `1`, `2`).
        *   If left blank, `0`, or an invalid number, the entire match (group 0) is highlighted.
        *   Example: For regex `(class)\s+([A-Za-z_]+)` and capture group `2`, only the class name (e.g., `MyClass`) would be highlighted, not "class MyClass".
    *   **Delete Pattern:** Click the "×" button to remove a pattern.

*   **+ Add New Pattern:** Click this button to create a new, empty pattern configuration block.

### Default Patterns

The plugin includes several default patterns based on common syntax elements (comments, keywords, numbers, operators, strings/content in delimiters). You are free to:
*   Disable them if they conflict with your needs.
*   Modify their regex, color, or other properties.
*   Delete them entirely.

### Understanding Overlaps & Priority

The highlighting engine processes your patterns and applies them to the text.
1.  All enabled patterns are used to find matches in the text.
2.  Matches are sorted primarily by their starting position in the text.
3.  If multiple matches start at the same position, the longer match takes precedence.
4.  The plugin then applies these sorted, non-overlapping matches. This means if one pattern highlights "function foo()", another pattern that only matches "foo" within that segment might not be applied if the broader "function foo()" match is processed first.

Content within delimiters (e.g., text inside quotes defined by `dj-content-in-double-quotes`) will be styled with its own color, and the delimiters themselves (e.g., the quotes, styled by `dj-delim-open`/`dj-delim-close`) will also be styled according to their patterns.

## Troubleshooting & Notes

*   **Invalid Regex:** If a regex pattern is invalid, it will be ignored, and a warning may appear in Obsidian's developer console (View -> Toggle Developer Tools).
*   **Instant Updates:** Changes made in the settings panel should reflect immediately in the "Syntax Highlighter" view pane if it's open. The highlighting in actual editor panes for Markdown code blocks is typically handled by Obsidian's built-in Prism.js or CodeMirror and is not directly modified by this plugin's preview specific highlighting. This plugin primarily provides a *customizable preview* and the ability to define styles that *could* be used more broadly with custom CSS.
*   **Advanced Styling (Bold, Italic, etc.):** For styles beyond simple text color (e.g., bold, italic, background colors), use the "CSS Class" field for a pattern. Then, define that CSS class in your Obsidian snippets file. You can create/edit snippets via **Settings -> Appearance -> CSS snippets**.
    *   Example:
        *   In plugin settings for a pattern: `CSS Class: important-keyword`
        *   In your `Vault/.obsidian/snippets/custom-styles.css` (enable the snippet in Appearance settings):
            ```css
            .important-keyword {
              font-weight: bold;
              background-color: yellow;
            }
            ```
*   **Performance:** While generally efficient, an extremely large number of complex regex patterns on very large files could potentially impact performance. If you notice slowdowns, try disabling some less-used or complex patterns.

## Feedback and Contributions

If you have feedback, find a bug, or want to contribute, please visit the plugin's GitHub repository (if/when available).
<!-- Example: [GitHub Repository](https://github.com/your-username/obsidian-custom-syntax-highlighter) -->

---

This README is designed to be a comprehensive guide. Adjust any placeholders like "Your Name" or repository URLs as needed.
