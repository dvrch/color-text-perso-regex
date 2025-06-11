

import { App, Editor, MarkdownView, Modal, /* Notice, */ Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf, type PluginManifest, type MarkdownFileInfo } from 'obsidian';
import SyntaxHighlighterSvelte from './SyntaxHighlighter.svelte';
import SettingsEditorSvelte from './SettingsEditor.svelte'; // New Svelte component for settings
import { mount, unmount } from './svelte-utils';

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
  // Core lexical elements first
  { id: 'dj-comment', name: 'DJ Comments (#...)', enabled: true, regex: '#.*$', flags: 'gm', cls: 'comm-dj', color: '#16FF00', captureGroup: '' },
  { id: 'dj-keywords', name: 'DJ Keywords', enabled: true, regex: '\\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\\b', flags: 'g', cls: 'key-dj', color: '#F92672', captureGroup: '' },
  { id: 'dj-class-def', name: 'DJ Class Name', enabled: true, regex: '\\bclass\\s+([a-zA-Z_][a-zA-Z0-9_]*)', flags: 'g', cls: 'type-dj', color: '#66D9EF', captureGroup: '1' },
  { id: 'dj-function-call', name: 'DJ Function Names/Calls', enabled: true, regex: '([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(', flags: 'g', cls: 'func-dj', color: '#A6E22E', captureGroup: '1' },
  { id: 'dj-numbers', name: 'DJ Numbers', enabled: true, regex: '\\b(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|[0-9]+\\.[0-9]*(?:[eE][+-]?[0-9]+)?|[0-9]+)\\b', flags: 'g', cls: 'num-dj', color: '#AE81FF', captureGroup: '' },
  { id: 'dj-operators', name: 'DJ Operators', enabled: true, regex: '\\+|-|\\*|\\/|\\/\\/|\\|\\||\\\\|%|@|<<|>>|&|\\||\\^|~|<|>|<=|>=|==|!=|:=|=', flags: 'g', cls: 'op-dj', color: '#F92672', captureGroup: '' },
  { id: 'dj-punctuation', name: 'DJ Punctuation', enabled: true, regex: '[.,;:?!|µ]', flags: 'g', cls: 'ponct-dj', color: '#A8F819', captureGroup: '' },
  
  // Delimiters themselves
  { id: 'dj-delim-open', name: 'DJ Delimiters (Open)', enabled: true, regex: '\\(|\\{|\\[|\\"|«|<|_', flags: 'g', cls: 'delim-g-open-dj', color: '#E6AA74', captureGroup: '' },
  { id: 'dj-delim-close', name: 'DJ Delimiters (Close)', enabled: true, regex: '\\)|\\}|\\]|\\"|»|>|_', flags: 'g', cls: 'delim-g-close-dj', color: '#FF0000', captureGroup: '' },

  // Content within delimiters (using #E6DB74 from cont.g.dj)
  { id: 'dj-content-in-parens', name: 'DJ Content in Parentheses', enabled: true, regex: '\\(([^)]*)\\)', flags: 'g', cls: 'cont-dj', color: '#E6DB74', captureGroup: '1' },
  { id: 'dj-content-in-braces', name: 'DJ Content in Braces', enabled: true, regex: '\\{([^}]*)\\}', flags: 'g', cls: 'cont-dj', color: '#E6DB74', captureGroup: '1' },
  { id: 'dj-content-in-brackets', name: 'DJ Content in Brackets', enabled: true, regex: '\\[([^\\]]*)\\]', flags: 'g', cls: 'cont-dj', color: '#E6DB74', captureGroup: '1' }, // Note: \\] for literal ]
  { id: 'dj-content-in-double-quotes', name: 'DJ Content in Double Quotes', enabled: true, regex: '"([^"]*)"', flags: 'g', cls: 'cont-dj', color: '#E6DB74', captureGroup: '1' },
  { id: 'dj-content-in-guillemets', name: 'DJ Content in Guillemets', enabled: true, regex: '«([^»]*)»', flags: 'g', cls: 'cont-dj', color: '#E6DB74', captureGroup: '1' },
  // Content within underscores like _content_ (if _ is used as a symmetric delimiter)
  // { id: 'dj-content-in-underscores', name: 'DJ Content in Underscores', enabled: true, regex: '_([^_]*)_', flags: 'g', cls: 'cont-dj', color: '#E6DB74', captureGroup: '1' },
  // Content within angle brackets like <content> (could be very broad, use with caution)
  // { id: 'dj-content-in-angles', name: 'DJ Content in Angle Brackets', enabled: true, regex: '<([^>]*)>', flags: 'g', cls: 'cont-dj', color: '#E6DB74', captureGroup: '1' },

  // General text patterns (often broader or character-level)
  { id: 'dj-sentence-caps', name: 'DJ Sentence Start Capitals', enabled: true, regex: '(?:^|[.!?]\\s+)([A-Z])', flags: 'g', cls: 'sent-dj', color: '#66D9EF', captureGroup: '1' },
  { id: 'dj-general-caps', name: 'DJ Capital Letters', enabled: true, regex: '([A-Z])', flags: 'g', cls: 'caps-dj', color: '#A6E22E', captureGroup: '1' },
];


const DEFAULT_SETTINGS: MyPluginSettings = {
  enableGlobalSyntaxHighlighting: true,
  customPatterns: JSON.parse(JSON.stringify(DEFAULT_PATTERNS)), // Deep copy
};

export const VIEW_TYPE_SYNTAX = 'syntax-highlighter-view';

export class SyntaxHighlighterView extends ItemView {
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
    const activeFile = (this as ItemView).app.workspace.getActiveFile();
    if (activeFile) {
      this.currentContent = await (this as ItemView).app.vault.read(activeFile);
    }

    (this as ItemView).contentEl.empty(); // Clear contentEl before mounting
    this.svelteComponent = mount(SyntaxHighlighterSvelte, {
      target: (this as ItemView).contentEl,
      props: {
        content: this.currentContent,
        customPatterns: this.currentSettings.customPatterns,
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
      this.svelteComponent.$set({
        customPatterns: newSettings.customPatterns,
        enableGlobalSyntaxHighlighting: newSettings.enableGlobalSyntaxHighlighting,
      });
    }
  }
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  async onload() {
    await this.loadSettings();

    (this as Plugin).registerView(
      VIEW_TYPE_SYNTAX,
      (leaf) => new SyntaxHighlighterView(leaf, this.settings)
    );

    const ribbonIconEl = (this as Plugin).addRibbonIcon('highlighter', 'Open Syntax Highlighter View', (evt: MouseEvent) => {
      this.activateView();
    });
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    (this as Plugin).addCommand({
      id: 'open-syntax-highlighter-view',
      name: 'Open Syntax Highlighter View',
      callback: () => {
        this.activateView();
      },
    });
    
    (this as Plugin).addSettingTab(new SyntaxHighlighterSettingTab((this as Plugin).app, this));

    (this as Plugin).registerEvent(
      (this as Plugin).app.workspace.on('active-leaf-change', async (leaf) => {
        if (leaf && leaf.view instanceof MarkdownView) {
          const activeFile = leaf.view.file;
          if (activeFile) {
            const content = await (this as Plugin).app.vault.cachedRead(activeFile);
            this.updateAllSyntaxViews(content);
          }
        }
      })
    );
    
    (this as Plugin).registerEvent(
        (this as Plugin).app.workspace.on('editor-change', async (editor, markdownView) => {
            if (markdownView && markdownView.file) {
                 const content = editor.getValue();
                 this.updateAllSyntaxViews(content);
            }
        })
    );
    
    const activeLeaf = (this as Plugin).app.workspace.getActiveViewOfType(MarkdownView);
    if (activeLeaf && activeLeaf.file) {
        const content = await (this as Plugin).app.vault.cachedRead(activeLeaf.file);
        this.updateAllSyntaxViews(content);
    }
  }

  updateAllSyntaxViews(content: string) {
    (this as Plugin).app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX).forEach(leaf => {
      if (leaf.view instanceof SyntaxHighlighterView) {
        leaf.view.updateContent(content);
      }
    });
  }
  
  notifyViewsOfSettingChanges() {
    (this as Plugin).app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX).forEach(leaf => {
      if (leaf.view instanceof SyntaxHighlighterView) {
        leaf.view.updateSettings(this.settings);
      }
    });
  }

  activateView() {
    const existingLeaves = (this as Plugin).app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX);
    if (existingLeaves.length > 0) {
      (this as Plugin).app.workspace.revealLeaf(existingLeaves[0]);
      return;
    }

    const leaf = (this as Plugin).app.workspace.getLeaf('split', 'vertical');
    leaf.setViewState({
      type: VIEW_TYPE_SYNTAX,
      active: true,
    });
    (this as Plugin).app.workspace.revealLeaf(leaf);
  }

  onunload() {
    (this as Plugin).app.workspace.detachLeavesOfType(VIEW_TYPE_SYNTAX);
  }

  async loadSettings() {
    const loadedData = await (this as Plugin).loadData();
    const baseSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); // Fresh defaults based on new DEFAULT_PATTERNS

    if (loadedData) {
        this.settings = {
            ...baseSettings, // Start with new defaults
            enableGlobalSyntaxHighlighting: loadedData.enableGlobalSyntaxHighlighting !== undefined 
                                              ? loadedData.enableGlobalSyntaxHighlighting 
                                              : baseSettings.enableGlobalSyntaxHighlighting,
            customPatterns: [], // Will be populated below
        };

        const loadedPatterns = loadedData.customPatterns || [];
        const finalPatterns: CustomPatternConfig[] = [];
        const loadedPatternIds = new Set(loadedPatterns.map((p: CustomPatternConfig) => p.id));
        const defaultPatternIds = new Set(baseSettings.customPatterns.map((p: CustomPatternConfig) => p.id));

        // 1. Add/update patterns based on new defaults
        for (const defaultPattern of baseSettings.customPatterns) {
            const userVersion = loadedPatterns.find((p: CustomPatternConfig) => p.id === defaultPattern.id);
            if (userVersion) {
                // User has a version of this default pattern, use theirs but ensure all fields are present
                finalPatterns.push({
                    ...defaultPattern, // provides structure and new fields if any
                    ...userVersion,    // user's overrides
                    name: userVersion.name || defaultPattern.name, // Ensure name is present
                });
            } else {
                // User doesn't have this new default pattern, add it
                finalPatterns.push(defaultPattern);
            }
        }

        // 2. Add user's custom patterns that are not part of the new defaults
        for (const loadedPattern of loadedPatterns) {
            if (!defaultPatternIds.has(loadedPattern.id)) {
                // This is a purely custom pattern by the user, ensure it has all necessary fields
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
        this.settings = baseSettings; // No saved data, use fresh new defaults
    }
    
    // Final sanitization pass to ensure all patterns have essential fields
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
    await (this as Plugin).saveData(this.settings);
    this.notifyViewsOfSettingChanges();
  }
}

class SyntaxHighlighterSettingTab extends PluginSettingTab {
  plugin: MyPlugin;
  private svelteComponent: SettingsEditorSvelte | undefined;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = (this as PluginSettingTab);
    containerEl.empty();

    this.svelteComponent = mount(SettingsEditorSvelte, {
      target: containerEl,
      props: {
        settings: this.plugin.settings,
        onSettingsChange: (newSettings: MyPluginSettings) => {
          this.plugin.settings = newSettings;
          this.plugin.saveSettings();
        }
      }
    });
  }

  hide(): void {
    if (this.svelteComponent) {
      unmount(this.svelteComponent);
      this.svelteComponent = undefined;
    }
  }
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = (this as Modal);
		contentEl.setText('Syntax Highlighter Plugin Active');
	}

	onClose() {
		const {contentEl} = (this as Modal);
		contentEl.empty();
	}
}
