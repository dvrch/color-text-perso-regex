/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { App, Editor, MarkdownView, Modal as ObsidianModal, Plugin as ObsidianPlugin, PluginSettingTab as ObsidianPluginSettingTab, Setting, ItemView as ObsidianItemView, WorkspaceLeaf, type PluginManifest, type MarkdownFileInfo } from 'obsidian';
import SyntaxHighlighterSvelte from './SyntaxHighlighter.svelte';
import SettingsEditorSvelte from './SettingsEditor.svelte'; // New Svelte component for settings
import { mount, unmount } from './svelte-utils';
import type { SvelteComponentTyped } from 'svelte'; // For typing Svelte component instances

// Removed the 'declare module "obsidian"' block.
// Standard Obsidian typings are expected to provide these properties.
// If errors persist, it implies the project's Obsidian type definitions might be incomplete or not correctly picked up.


// Interfaces for settings
export interface CustomPatternConfig {
  id: string;
  name: string; // Added for user-friendly identification
  enabled: boolean;
  regex: string;
  flags: string;
  cls: string;
  color: string;
  captureGroup?: string;
}

export interface MyPluginSettings {
  enableGlobalSyntaxHighlighting: boolean;
  customPatterns: CustomPatternConfig[];
}

// Updated DEFAULT_PATTERNS based on user's Sublime Text .tmTheme and .sublime-syntax
const DEFAULT_PATTERNS: CustomPatternConfig[] = [
  // From sublime-syntax and tmTheme
  { id: 'dj-comment', name: 'DJ Comments (#...)', enabled: true, regex: '#.*$', flags: 'gm', cls: 'comm-dj', color: '#16FF00', captureGroup: '' },
  { id: 'dj-numbers', name: 'DJ Numbers', enabled: true, regex: '\\b(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|[0-9]+\\.[0-9]*(?:[eE][+-]?[0-9]+)?|[0-9]+)\\b', flags: 'g', cls: 'num-dj', color: '#AE81FF', captureGroup: '' },
  { id: 'dj-operators', name: 'DJ Operators', enabled: true, regex: '\\+|-|\\*|\\/|\\/\\/|\\|\\||\\\\|%|@|<<|>>|&|\\||\\^|~|<|>|<=|>=|==|!=|:=|=', flags: 'g', cls: 'op-dj', color: '#F92672', captureGroup: '' }, // Color from op.dj in theme
  { id: 'dj-punctuation', name: 'DJ Punctuation', enabled: true, regex: '[.,;:?!|µ]', flags: 'g', cls: 'ponct-dj', color: '#A8F819', captureGroup: '' },
  { id: 'dj-class-def', name: 'DJ Class Name', enabled: true, regex: '\\bclass\\s+([a-zA-Z_][a-zA-Z0-9_]*)', flags: 'g', cls: 'type-dj', color: '#66D9EF', captureGroup: '1' },
  { id: 'dj-function-call', name: 'DJ Function Names/Calls', enabled: true, regex: '([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(', flags: 'g', cls: 'func-dj', color: '#A6E22E', captureGroup: '1' },
  { id: 'dj-keywords', name: 'DJ Keywords', enabled: true, regex: '\\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\\b', flags: 'g', cls: 'key-dj', color: '#F92672', captureGroup: '' }, // Color from key.dj in theme
  { id: 'dj-sentence-caps', name: 'DJ Sentence Start Capitals', enabled: true, regex: '(?:^|[.!?]\\s+)([A-Z])', flags: 'g', cls: 'sent-dj', color: '#66D9EF', captureGroup: '1' }, // Color from sent.dj in theme
  { id: 'dj-general-caps', name: 'DJ Capital Letters', enabled: true, regex: '([A-Z])', flags: 'g', cls: 'caps-dj', color: '#A6E22E', captureGroup: '1' }, // Color from caps.dj in theme
  // Delimiters from sublime-syntax
  { id: 'dj-delim-open', name: 'DJ Delimiters (Open)', enabled: true, regex: '\\(|\\{|\\[|\\"|«|<|_', flags: 'g', cls: 'delim-g-open-dj', color: '#E6AA74', captureGroup: '' },
  { id: 'dj-delim-close', name: 'DJ Delimiters (Close)', enabled: true, regex: '\\)|\\}|\\]|\\"|»|>|_', flags: 'g', cls: 'delim-g-close-dj', color: '#FF0000', captureGroup: '' },
];


const DEFAULT_SETTINGS: MyPluginSettings = {
  enableGlobalSyntaxHighlighting: true,
  customPatterns: JSON.parse(JSON.stringify(DEFAULT_PATTERNS)), // Deep copy
};

export const VIEW_TYPE_SYNTAX = 'syntax-highlighter-view';

export class SyntaxHighlighterView extends ObsidianItemView {
  private svelteComponent: SyntaxHighlighterSvelte | undefined;
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

    this.contentEl.empty(); // Clear contentEl before mounting
    this.svelteComponent = mount(SyntaxHighlighterSvelte, {
      target: this.contentEl,
      props: {
        content: this.currentContent,
        // Pass copies to ensure Svelte reactivity if objects/arrays are mutated elsewhere
        customPatterns: this.currentSettings.customPatterns.map(p => ({ ...p })),
        enableGlobalSyntaxHighlighting: this.currentSettings.enableGlobalSyntaxHighlighting,
      }
    });
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
      // Create new references for props passed to Svelte component
      // to ensure reactivity is triggered, especially for arrays of objects.
      const newCustomPatterns = newSettings.customPatterns.map(p => ({ ...p }));
      
      this.svelteComponent.$set({
        customPatterns: newCustomPatterns,
        enableGlobalSyntaxHighlighting: newSettings.enableGlobalSyntaxHighlighting,
      });
    }
  }
}

export default class MyPlugin extends ObsidianPlugin {
  settings: MyPluginSettings;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_SYNTAX,
      (leaf) => new SyntaxHighlighterView(leaf, this.settings)
    );

    const ribbonIconEl = this.addRibbonIcon('highlighter', 'Open Syntax Highlighter View', (evt: MouseEvent) => {
      this.activateView();
    });
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    this.addCommand({
      id: 'open-syntax-highlighter-view',
      name: 'Open Syntax Highlighter View',
      callback: () => {
        this.activateView();
      },
    });
    
    this.addSettingTab(new SyntaxHighlighterSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', async (leaf) => {
        if (leaf && leaf.view instanceof MarkdownView) {
          const activeFile = leaf.view.file;
          if (activeFile) {
            const content = await this.app.vault.cachedRead(activeFile);
            this.updateAllSyntaxViews(content);
          }
        }
      })
    );
    
    this.registerEvent(
        this.app.workspace.on('editor-change', async (editor, markdownView) => {
            if (markdownView && markdownView.file) {
                 const content = editor.getValue();
                 this.updateAllSyntaxViews(content);
            }
        })
    );
    
    const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeLeaf && activeLeaf.file) {
        const content = await this.app.vault.cachedRead(activeLeaf.file);
        this.updateAllSyntaxViews(content);
    }
  }

  updateAllSyntaxViews(content: string) {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX).forEach(leaf => {
      if (leaf.view instanceof SyntaxHighlighterView) {
        leaf.view.updateContent(content);
      }
    });
  }
  
  notifyViewsOfSettingChanges() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX).forEach(leaf => {
      if (leaf.view instanceof SyntaxHighlighterView) {
        leaf.view.updateSettings(this.settings);
      }
    });
  }

  activateView() {
    const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX);
    if (existingLeaves.length > 0) {
      this.app.workspace.revealLeaf(existingLeaves[0]);
      return;
    }

    const leaf = this.app.workspace.getLeaf('split', 'vertical');
    leaf.setViewState({
      type: VIEW_TYPE_SYNTAX,
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SYNTAX);
  }

  async loadSettings() {
    const loadedData = await this.loadData();
    const baseSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); 

    if (loadedData) {
        this.settings = {
            ...baseSettings, 
            enableGlobalSyntaxHighlighting: loadedData.enableGlobalSyntaxHighlighting !== undefined 
                                              ? loadedData.enableGlobalSyntaxHighlighting 
                                              : baseSettings.enableGlobalSyntaxHighlighting,
            customPatterns: [], 
        };

        const loadedPatterns = loadedData.customPatterns || [];
        const finalPatterns: CustomPatternConfig[] = [];
        const defaultPatternIds = new Set(baseSettings.customPatterns.map((p: CustomPatternConfig) => p.id));

        for (const defaultPattern of baseSettings.customPatterns) {
            const userVersion = loadedPatterns.find((p: CustomPatternConfig) => p.id === defaultPattern.id);
            if (userVersion) {
                finalPatterns.push({
                    ...defaultPattern, 
                    ...userVersion,    
                    name: userVersion.name || defaultPattern.name, 
                });
            } else {
                finalPatterns.push(defaultPattern);
            }
        }

        for (const loadedPattern of loadedPatterns) {
            if (!defaultPatternIds.has(loadedPattern.id)) {
                const scaffold = { name: `Custom Pattern`, enabled: true, regex: "", flags: "gm", cls: "custom-dj-highlight", color: "#FFFFFF", captureGroup: "" };
                finalPatterns.push({
                    id: loadedPattern.id || `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: loadedPattern.name || scaffold.name,
                    enabled: typeof loadedPattern.enabled === 'boolean' ? loadedPattern.enabled : scaffold.enabled,
                    regex: loadedPattern.regex || scaffold.regex,
                    flags: loadedPattern.flags || scaffold.flags,
                    cls: loadedPattern.cls || scaffold.cls,
                    color: loadedPattern.color || scaffold.color,
                    captureGroup: loadedPattern.captureGroup || scaffold.captureGroup || ""
                });
            }
        }
        this.settings.customPatterns = finalPatterns;

    } else {
        this.settings = baseSettings; 
    }
    
    this.settings.customPatterns = this.settings.customPatterns.map((p: any, index: number) => {
        const defaultScaffold = { 
            name: `Pattern ${index + 1}`, 
            enabled: true, 
            regex: "", 
            flags: "gm", 
            cls: "custom-dj-highlight", 
            color: "#FFFFFF", 
            captureGroup: "" 
        };
        return {
            id: p.id || `pattern-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            name: p.name || defaultScaffold.name,
            enabled: typeof p.enabled === 'boolean' ? p.enabled : defaultScaffold.enabled,
            regex: typeof p.regex === 'string' ? p.regex : defaultScaffold.regex,
            flags: typeof p.flags === 'string' ? p.flags : defaultScaffold.flags,
            cls: typeof p.cls === 'string' ? p.cls : defaultScaffold.cls,
            color: typeof p.color === 'string' ? p.color : defaultScaffold.color,
            captureGroup: typeof p.captureGroup === 'string' ? p.captureGroup : defaultScaffold.captureGroup
        };
    });
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.notifyViewsOfSettingChanges();
  }
}

// Define the expected Props for SettingsEditorSvelte
interface SettingsEditorProps {
  settings: MyPluginSettings;
}

// Define the expected Events and their detail types for SettingsEditorSvelte
interface SettingsEditorEvents {
  updateSettings: CustomEvent<MyPluginSettings>;
}


class SyntaxHighlighterSettingTab extends ObsidianPluginSettingTab {
  plugin: MyPlugin;
  private svelteComponent: SvelteComponentTyped<SettingsEditorProps, SettingsEditorEvents, any> | undefined;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Mount the Svelte component with explicit generic types for mount function
    this.svelteComponent = mount<SettingsEditorProps, SettingsEditorEvents, any>(SettingsEditorSvelte, {
      target: containerEl,
      props: {
        settings: this.plugin.settings
      }
    });

    // Listen for the 'updateSettings' event dispatched by SettingsEditorSvelte
    if (this.svelteComponent && typeof this.svelteComponent.$on === 'function') {
      this.svelteComponent.$on('updateSettings', (event: CustomEvent<MyPluginSettings>) => {
        // Svelte dispatches custom event data in event.detail
        const newSettings = event.detail;
        this.plugin.settings = newSettings; // Update the plugin's settings object
        this.plugin.saveSettings();       // This will persist settings and notify views
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

class SampleModal extends ObsidianModal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Syntax Highlighter Plugin Active');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
