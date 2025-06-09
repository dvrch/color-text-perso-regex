# Svelte Syntax Highlighter Plugin for Obsidian

## Description

This Obsidian plugin provides advanced syntax highlighting for files opened in your Obsidian vault, powered by Svelte. It enhances readability for various code and text formats by applying custom styling rules.

## Features

*   **Dynamic Syntax Highlighting**: Automatically highlights the content of the currently active file in the dedicated Syntax Highlighter view.
*   **Customizable Styles**: Utilizes CSS classes for easy customization of highlighting colors and fonts.
*   **Svelte Powered**: Built with Svelte 4 for efficient and reactive UI updates.

## Installation

### Manual Installation

Since this plugin is currently under development (or not yet officially released on the Obsidian community plugins list), you need to install it manually:

1.  **Download the latest release**: Go to the [Releases page (link to your GitHub releases page once available) or download the latest `main.js`, `manifest.json`, and `styles.css` files directly from this repository](https://github.com/dvrch/obsidian-sample-plugin/releases/latest). If you're building from source, you'll need the entire repository.
2.  **Locate your Obsidian Vault**: Open Obsidian and navigate to `Settings` -> `About` -> `Open vault folder`. This will open your vault's root directory.
3.  **Navigate to the plugins folder**: Inside your vault's folder, go to `.obsidian/plugins/`.
4.  **Create a new folder**: Create a new folder named `svelte-syntax-highlighter` (or any other descriptive name for the plugin).
5.  **Copy plugin files**: Copy the `main.js`, `manifest.json`, and `styles.css` files (and any other necessary assets from the release) into the newly created `svelte-syntax-highlighter` folder.
6.  **Enable the plugin**: Restart Obsidian. Go to `Settings` -> `Community plugins`. Under `Installed plugins`, toggle on `Svelte Syntax Highlighter`.

## Usage

1.  **Open the Syntax Highlighter View**: Once the plugin is enabled, you can open the dedicated syntax highlighting view by:
    *   Clicking the **dice icon** in the left ribbon (if enabled).
    *   Using the command palette (`Ctrl/Cmd + P`) and searching for "**Open Syntax Highlighter View**".
2.  **View Highlighted Content**: As you open different files (e.g., Markdown, code files) in your Obsidian workspace, the content of the active file will automatically be displayed with syntax highlighting in the Syntax Highlighter view.

## Development

If you wish to contribute to the plugin or build it from source, follow these steps:

### Prerequisites

*   Node.js (LTS version recommended)
*   pnpm (a fast, disk-space efficient package manager)

    ```bash
    npm install -g pnpm
    ```

### Getting Started

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/dvrch/obsidian-sample-plugin.git
    cd obsidian-sample-plugin
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Build the plugin** (for production):

    ```bash
    pnpm run build
    ```

    This will compile `main.ts` and `SyntaxHighlighter.svelte` into `main.js`, `manifest.json`, and `styles.css`.

4.  **Run in development mode** (with auto-rebuild on changes):

    ```bash
    pnpm run dev
    ```

    While `pnpm run dev` is running, any changes you make to the source files will automatically trigger a rebuild, making development faster.

### Troubleshooting

If you encounter issues like "Cannot use import statement outside a module" or similar bundling problems:

1.  **Ensure all dependencies are correctly installed and up-to-date**: Run `pnpm install` after pulling new changes or modifying `package.json`.
2.  **Clean build**: Sometimes a fresh build can resolve issues. Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` followed by `pnpm run build`.
3.  **Check `package.json` for correct versions**: Ensure `esbuild`, `esbuild-svelte`, and `esbuild-plugin-obsidian` are using the correct, available versions.
4.  **Verify `tsconfig.json` and `esbuild.config.mjs`**: Ensure `verbatimModuleSyntax` is `true` in `tsconfig.json` and that Svelte's `format` option is not set in `esbuild.config.mjs`.

## Contributing

Feel free to open issues or submit pull requests. All contributions are welcome!

## License

This plugin is licensed under the MIT License. See the `LICENSE` file for more details.

c est OK, ais affiche genre code source 
En plus il faut faire des allés-retoure : 1ere fois c est vide, il faut aller ailleur puis revenir dessus pour que  ça apparait 