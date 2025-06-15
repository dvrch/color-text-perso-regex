/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { App, MarkdownView, Plugin, PluginSettingTab, ItemView, WorkspaceLeaf, type PluginManifest } from 'obsidian';
import SyntaxHighlighterSvelte from './SyntaxHighlighter.svelte';
import SettingsEditorSvelte from './SettingsEditor.svelte';
import { mount, unmount, type Svelte4Constructor } from './svelte-utils';
import type { SvelteComponent } from 'svelte';

// Interfaces and Default Settings (defined here for TypeScript compatibility in main.ts)
export interface CustomPatternConfig {
  id: string;
  name: string;
  enabled: boolean;
  regex: string;
  flags: string;
  cls: string;
  color: string;
  captureGroup?: string;
}

export interface MyPluginSettings {
  enableGlobalSyntaxHighlighting: boolean;
  defaultTextColor: string;
  customPatterns: CustomPatternConfig[];
}

// Default patterns (plain JavaScript objects - duplicated for main.ts compatibility)
export const DEFAULT_PATTERNS: CustomPatternConfig[] = [
  { id: 'comment', name: 'Comments (#...)', enabled: true, regex: '#.*$', flags: 'gm', cls: 'comm-dj', color: '#16FF00', captureGroup: '' },
  { id: 'numbers', name: 'Numbers', enabled: true, regex: '\\b(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|[0-9]+\\.[0-9]*(?:[eE][+-]?[0-9]+)?|[0-9]+)\\b', flags: 'g', cls: 'num-dj', color: '#AE81FF', captureGroup: '' },
  { id: 'operators', name: 'Operators', enabled: true, regex: '\\+|-|\\*|\\/|\\/\\/|\\|\\||\\\\|%|@|<<|>>|&|\\||\\^|~|<|>|<=|>=|==|!=|:=|=', flags: 'g', cls: 'op-dj', color: '#F92672', captureGroup: '' },
  { id: 'punctuation', name: 'Punctuation', enabled: true, regex: '[.,;:?!|µ]', flags: 'g', cls: 'ponct-dj', color: '#A8F819', captureGroup: '' },
  { id: 'class-definition', name: 'Class Name', enabled: true, regex: '\\bclass\\s+([a-zA-Z_][a-zA-Z0-9_]*)', flags: 'g', cls: 'type-dj', color: '#66D9EF', captureGroup: '1' },
  { id: 'function-call', name: 'Function Names/Calls', enabled: true, regex: '([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(', flags: 'g', cls: 'func-dj', color: '#A6E22E', captureGroup: '1' },
  { id: 'sentence-caps', name: 'Sentence Start Capitals', enabled: true, regex: '(?:^|[.!?]\\s+)([A-Z])', flags: 'g', cls: 'sent-dj', color: '#66D9EF', captureGroup: '1' },
  { id: 'general-caps', name: 'Capital Letters', enabled: true, regex: '([A-Z])', flags: 'g', cls: 'caps-dj', color: '#A6E22E', captureGroup: '1' },
  { id: 'delimiter-open', name: 'Delimiters (Open)', enabled: true, regex: '\\(|\\{|\\[|\\"|«|<|_', flags: 'g', cls: 'delim-g-open-dj', color: '#E6AA74', captureGroup: '' },
  { id: 'delimiter-close', name: 'Delimiters (Close)', enabled: true, regex: '\\)|\\}|\\]|\\"|»|>|_', flags: 'g', cls: 'delim-g-close-dj', color: '#FF0000', captureGroup: '' },
  { id: 'keywords', name: 'Keywords', enabled: true, regex: '\\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\\b', flags: 'g', cls: 'key-dj', color: '#F92672', captureGroup: '' },
  { id: 'tag-pattern', name: 'Tag Pattern', enabled: true, regex: '#(\\w+)', flags: 'gi', cls: 'tag-dj', color: '#8be9fd', captureGroup: '1' },
  { id: 'date-pattern', name: 'Date Pattern', enabled: true, regex: '\\d{4}-\\d{2}-\\d{2}', flags: 'g', cls: 'date-dj', color: '#f1fa8c', captureGroup: '' },
];

// Default settings (plain JavaScript object - duplicated for main.ts compatibility)
export const DEFAULT_SETTINGS: MyPluginSettings = {
  enableGlobalSyntaxHighlighting: true,
  defaultTextColor: '#808080', // Gris par défaut
  customPatterns: JSON.parse(JSON.stringify(DEFAULT_PATTERNS)), // Deep copy for initial state
};

// Placeholder/Example for normalizeAndMergeSettings
export function normalizeAndMergeSettings(
  loadedData: Partial<MyPluginSettings>,
  defaultSettings: MyPluginSettings
): MyPluginSettings {
  // Start with a deep copy of default settings
  const settings: MyPluginSettings = JSON.parse(JSON.stringify(defaultSettings));

  if (!loadedData) {
    return settings;
  }

  // Merge enableGlobalSyntaxHighlighting
  if (typeof loadedData.enableGlobalSyntaxHighlighting === 'boolean') {
    settings.enableGlobalSyntaxHighlighting = loadedData.enableGlobalSyntaxHighlighting;
  }

  // Merge defaultTextColor
  if (typeof loadedData.defaultTextColor === 'string') {
    settings.defaultTextColor = loadedData.defaultTextColor;
  }

  // Merge customPatterns
  // This is a simple merge strategy: update existing patterns by ID, add new ones.
  if (Array.isArray(loadedData.customPatterns)) {
    const loadedPatternsMap = new Map<string, CustomPatternConfig>();
    loadedData.customPatterns.forEach((p: CustomPatternConfig) => {
      if (p && typeof p.id === 'string') { // Basic validation
        loadedPatternsMap.set(p.id, p);
      }
    });

    const mergedPatterns: CustomPatternConfig[] = settings.customPatterns.map(
      (defaultPattern) => {
        const loadedPattern = loadedPatternsMap.get(defaultPattern.id);
        if (loadedPattern) {
          loadedPatternsMap.delete(defaultPattern.id); // Remove to track new patterns from loadedData
          return { ...defaultPattern, ...loadedPattern }; // Merge
        }
        return defaultPattern; // Keep default if not overridden
      }
    );

    // Add any new patterns from loadedData that were not in the defaults
    loadedPatternsMap.forEach((newPattern) => {
      mergedPatterns.push(newPattern);
    });

    settings.customPatterns = mergedPatterns;
  }

  return settings;
}


export const VIEW_TYPE_SYNTAX = 'syntax-highlighter-view';

// Define the expected Props for SyntaxHighlighterSvelte
interface SyntaxHighlighterViewProps {
  content: string;
  customPatterns: CustomPatternConfig[];
  enableGlobalSyntaxHighlighting: boolean;
  defaultTextColor: string;
}

export class SyntaxHighlighterView extends ItemView {
  declare app: App;
  declare contentEl: HTMLElement;

  private svelteComponent: (SvelteComponent & { $set: (props: Partial<SyntaxHighlighterViewProps>) => void }) | undefined;
  private currentContent: string = '';
  private currentSettings: MyPluginSettings;

  constructor(leaf: WorkspaceLeaf, settings: MyPluginSettings) {
    super(leaf);
    this.currentSettings = settings; 
  }

  getViewType() {
    return VIEW_TYPE_SYNTAX;
  }

  getDisplayText() {
    return 'Syntax Highlighter';
  }

  async onOpen() {
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.currentContent = await this.app.vault.read(activeFile);
    }

    this.contentEl.empty(); // Now contentEl should be recognized
    this.svelteComponent = mount(
      SyntaxHighlighterSvelte as unknown as Svelte4Constructor<SyntaxHighlighterViewProps>, 
      {
        target: this.contentEl, // And here
        props: {
          content: this.currentContent,
          customPatterns: this.currentSettings.customPatterns.map(p => ({ ...p })),
          enableGlobalSyntaxHighlighting: this.currentSettings.enableGlobalSyntaxHighlighting,
          defaultTextColor: this.currentSettings.defaultTextColor,
        }
      }
    );
  }

  async onClose() {
    if (this.svelteComponent) {
      unmount(this.svelteComponent);
      this.svelteComponent = undefined;
    }
  }

  async updateContent(newContent: string) {
    this.currentContent = newContent;
    if (this.svelteComponent) {
      this.svelteComponent.$set({ content: newContent });
    }
  }

  updateSettings(newSettings: MyPluginSettings) {
    this.currentSettings = newSettings;
    if (this.svelteComponent) {
      this.svelteComponent.$set({
        customPatterns: this.currentSettings.customPatterns.map(p => ({ ...p })),
        enableGlobalSyntaxHighlighting: this.currentSettings.enableGlobalSyntaxHighlighting,
        defaultTextColor: this.currentSettings.defaultTextColor,
      });
    }
  }
}

export default class SyntaxHighlighterPlugin extends Plugin {
  settings: MyPluginSettings;
  declare app: App;
  // manifest: PluginManifest; // Also inherited, declare if used directly and causing errors

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as MyPluginSettings;
  }

  async onload() {
    await this.loadSettings();

    this.registerView( // Should now be recognized
      VIEW_TYPE_SYNTAX,
      (leaf) => new SyntaxHighlighterView(leaf, this.settings)
    );

    this.addRibbonIcon('highlighter', 'Open Syntax Highlighter View', (evt: MouseEvent) => {
      this.activateView();
    });

    this.addCommand({
      id: 'open-syntax-highlighter-view',
      name: 'Open Syntax Highlighter View',
      callback: () => {
        this.activateView();
      },
    });

    this.addSettingTab(new SyntaxHighlighterSettingTab(this.app, this)); // Renommé

    this.registerEvent( // Should now be recognized
      this.app.workspace.on('active-leaf-change', async (leaf) => { // this.app should be fine
        if (leaf && leaf.view instanceof MarkdownView && leaf.view.file) {
          const content = await this.app.vault.cachedRead(leaf.view.file); // this.app should be fine
          this.updateAllSyntaxViews(content);
        }
      })
    );

    this.registerEvent( // Should now be recognized
        this.app.workspace.on('editor-change', async (editor, markdownView) => { // this.app should be fine
            if (markdownView && markdownView.file) {
                 const content = editor.getValue();
                 this.updateAllSyntaxViews(content);
            }
        })
    );

    // Initial load for active editor view
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView); // this.app should be fine
    if (activeView && activeView.file) {
        const content = await this.app.vault.cachedRead(activeView.file); // this.app should be fine
        this.updateAllSyntaxViews(content);
    }
  }

  updateAllSyntaxViews(content: string) {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX).forEach(leaf => { // this.app should be fine
      if (leaf.view instanceof SyntaxHighlighterView) {
        leaf.view.updateContent(content);
      }
    });
  }

  notifyViewsOfSettingChanges() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX).forEach(leaf => { // this.app should be fine
      if (leaf.view instanceof SyntaxHighlighterView) {
        leaf.view.updateSettings(this.settings);
      }
    });
  }

  activateView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX);
    if (leaves.length > 0) {
      this.app.workspace.revealLeaf(leaves[0]);
      return;
    }

    const leaf = this.app.workspace.getLeaf('split', 'vertical');
    leaf.setViewState({ type: VIEW_TYPE_SYNTAX, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  onunload() {
  }

  async loadSettings() {
    const loadedData = await this.loadData(); // Should now be recognized
    // Use the normalizeAndMergeSettings defined in this file
    this.settings = normalizeAndMergeSettings(loadedData, DEFAULT_SETTINGS);
  }

  async saveSettings() {
    await this.saveData(this.settings); // Should now be recognized
    this.notifyViewsOfSettingChanges();
  }
}

interface SettingsEditorProps {
  settings: MyPluginSettings;
}

// SettingsEditorEvents is not directly used in the provided snippet for $on, 
// but it's good practice for defining component event contracts.
// interface SettingsEditorEvents {
//   updateSettings: CustomEvent<MyPluginSettings>;
// }


class SyntaxHighlighterSettingTab extends PluginSettingTab {
  plugin: SyntaxHighlighterPlugin;
  declare app: App;
  declare containerEl: HTMLElement;
  private svelteComponent: (SvelteComponent & { $set: (props: Partial<SettingsEditorProps>) => void } & { $on: (event: 'updateSettings', callback: (e: CustomEvent<MyPluginSettings>) => void) => void } ) | undefined;


  constructor(app: App, plugin: SyntaxHighlighterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this; // Should now be recognized
    containerEl.empty();

    this.svelteComponent = mount(
        SettingsEditorSvelte as unknown as Svelte4Constructor<SettingsEditorProps>, 
      {
        target: containerEl,
        props: {
          settings: this.plugin.settings
        }
      }
    );
    
    if (this.svelteComponent && typeof this.svelteComponent.$on === 'function') {
      this.svelteComponent.$on('updateSettings', (event: CustomEvent<MyPluginSettings>) => {
        if (event.detail) { // Ensure detail exists
            this.plugin.settings = event.detail;
            this.plugin.saveSettings();
        }
      });
    }
  }

  hide(): void {
    if (this.svelteComponent) {
      unmount(this.svelteComponent);
      this.svelteComponent = undefined;
    }
  }
}