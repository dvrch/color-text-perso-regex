

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

const DEFAULT_PATTERNS: CustomPatternConfig[] = [
  { id: 'default-comment', name: 'Comments (#...)', enabled: true, regex: '#.*$', flags: 'gm', cls: 'comm-dj', color: '#75715E', captureGroup: '' },
  { id: 'default-numbers', name: 'Numbers', enabled: true, regex: '\\b(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|[0-9]+\\.[0-9]*(?:[eE][+-]?[0-9]+)?|[0-9]+)\\b', flags: 'g', cls: 'num-dj', color: '#AE81FF', captureGroup: '' },
  { id: 'default-operators', name: 'Operators', enabled: true, regex: '\\+|-|\\*|\\/|\\/\\/|\\\\|%|@|<<|>>|&|\\||\\^|~|<|>|<=|>=|==|!=|:=|=', flags: 'g', cls: 'op-dj', color: '#FD971F', captureGroup: '' },
  { id: 'default-punctuation', name: 'Punctuation', enabled: true, regex: '[\\.,;:?!\\|µ]', flags: 'g', cls: 'ponct-dj', color: 'var(--text-muted)', captureGroup: '' },
  { id: 'default-class-def', name: 'Class Name (after class)', enabled: true, regex: '\\bclass\\s+([a-zA-Z_][a-zA-Z0-9_]*)', flags: 'g', cls: 'type-dj', color: '#66D9EF', captureGroup: '1' },
  { id: 'default-function-call', name: 'Function Names/Calls', enabled: true, regex: '([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(', flags: 'g', cls: 'func-dj', color: '#A6E22E', captureGroup: '1' },
  { id: 'default-keywords', name: 'Keywords', enabled: true, regex: '\\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\\b', flags: 'g', cls: 'key-dj', color: '#F92672', captureGroup: '' },
  { id: 'default-sentence-caps', name: 'Sentence Start Capitals', enabled: true, regex: '(?:^|[.!?]\\s+)([A-Z])', flags: 'g', cls: 'sent-dj', color: '#E6DB74', captureGroup: '1' },
  { id: 'default-general-caps', name: 'Capital Letters', enabled: true, regex: '([A-Z])', flags: 'g', cls: 'caps-dj', color: '#A6E22E', captureGroup: '1' }
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
    const baseSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); // Fresh defaults

    if (loadedData) {
        this.settings = {
            ...baseSettings, // Start with defaults
            ...loadedData,    // Override with loaded data
        };
        // Ensure customPatterns from loadedData is used if it exists, even if empty
        if (loadedData.customPatterns !== undefined) {
            this.settings.customPatterns = loadedData.customPatterns;
        }
    } else {
        this.settings = baseSettings; // No saved data, use fresh defaults
    }
    
    // Ensure customPatterns is always an array
    if (!Array.isArray(this.settings.customPatterns)) {
        this.settings.customPatterns = JSON.parse(JSON.stringify(DEFAULT_PATTERNS)); 
    }
    
    // Ensure all patterns have necessary fields, providing defaults for missing ones
    this.settings.customPatterns = this.settings.customPatterns.map((p: any, index: number) => {
        const defaultPatternScaffold = DEFAULT_PATTERNS.find(dp => dp.id === p.id) || 
                                     { name: `Pattern ${index + 1}`, enabled: true, regex: "", flags: "gm", cls: "custom-dj-highlight", color: "#FFFFFF", captureGroup: "" };
        return {
            id: p.id || `pattern-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            name: p.name || defaultPatternScaffold.name,
            enabled: typeof p.enabled === 'boolean' ? p.enabled : defaultPatternScaffold.enabled,
            regex: p.regex || defaultPatternScaffold.regex,
            flags: p.flags || defaultPatternScaffold.flags,
            cls: p.cls || defaultPatternScaffold.cls,
            color: p.color || defaultPatternScaffold.color,
            captureGroup: p.captureGroup || defaultPatternScaffold.captureGroup || ""
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