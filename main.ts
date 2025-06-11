
import { App, Editor, MarkdownView, Modal, /* Notice, */ Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf, type PluginManifest, type MarkdownFileInfo } from 'obsidian';
import SyntaxHighlighterSvelte from './SyntaxHighlighter.svelte';
import SettingsEditorSvelte from './SettingsEditor.svelte'; // New Svelte component for settings
import { mount, unmount } from './svelte-utils';

// Interfaces for settings
export interface CustomPatternConfig {
  id: string;
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
  // mySetting: string; // This can be removed if no longer needed, or kept for other purposes
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  enableGlobalSyntaxHighlighting: true,
  customPatterns: [
    // Example default custom pattern (optional)
    // {
    //   id: 'default-example-1',
    //   enabled: true,
    //   regex: "\\bIMPORTANT\\b",
    //   flags: "g",
    //   cls: "custom-important",
    //   color: "#FFBF00",
    //   captureGroup: ""
    // }
  ],
  // mySetting: 'default'
};

export const VIEW_TYPE_SYNTAX = 'syntax-highlighter-view';
// export const VIEW_TYPE_EXAMPLE = 'example-view'; // Not used in current context

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
    // Initialize with a default-like structure, loadSettings will overwrite
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
    
    // This adds a settings tab so the user can configure various aspects of the plugin
    (this as Plugin).addSettingTab(new SyntaxHighlighterSettingTab((this as Plugin).app, this));

    // Update view when active file changes or content is modified
    this.registerEvent(
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
    
    this.registerEvent(
        (this as Plugin).app.workspace.on('editor-change', async (editor, markdownView) => {
            if (markdownView && markdownView.file) {
                 const content = editor.getValue();
                 this.updateAllSyntaxViews(content);
            }
        })
    );
    
    // Initial content load for already open markdown files
    const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeLeaf && activeLeaf.file) {
        const content = await this.app.vault.cachedRead(activeLeaf.file);
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
    // Ensure all parts of DEFAULT_SETTINGS are present if not in loadedData
    this.settings = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), loadedData);
    
    // Ensure customPatterns is always an array
    if (!Array.isArray(this.settings.customPatterns)) {
        this.settings.customPatterns = [];
    }
    // Ensure each pattern has an ID (for Svelte keying, especially for older data)
    this.settings.customPatterns = this.settings.customPatterns.map(p => ({
        ...p,
        id: p.id || `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
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

    // Mount the Svelte component for settings
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
    // Unmount Svelte component when tab is closed
    if (this.svelteComponent) {
      unmount(this.svelteComponent);
      this.svelteComponent = undefined;
    }
  }
}

// Minimal SampleModal and other classes if needed, or remove if not central to this feature
// For brevity, keeping SampleModal minimal as it's not the focus
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
