/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { App, MarkdownView, Modal, Plugin, PluginSettingTab, ItemView, WorkspaceLeaf, type PluginManifest } from 'obsidian';
import SyntaxHighlighterSvelte from './SyntaxHighlighter.svelte';
import SettingsEditorSvelte from './SettingsEditor.svelte';
import { mount, unmount } from './svelte-utils'; 
import type { SvelteComponentTyped } from 'svelte';

// Import defaults and utility functions from JavaScript files
import { DEFAULT_PATTERNS, DEFAULT_SETTINGS } from './settings-defaults.js';
import { normalizeAndMergeSettings } from './settings-utils.js';


// Interfaces for settings (kept in main.ts for strong typing of the plugin's settings object)
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
  customPatterns: CustomPatternConfig[];
}

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
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.currentContent = await this.app.vault.read(activeFile);
    }

    this.contentEl.empty();
    this.svelteComponent = mount(SyntaxHighlighterSvelte, {
      target: this.contentEl,
      props: {
        content: this.currentContent,
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
      const newCustomPatterns = newSettings.customPatterns.map(p => ({ ...p }));
      this.svelteComponent.$set({
        customPatterns: newCustomPatterns,
        enableGlobalSyntaxHighlighting: newSettings.enableGlobalSyntaxHighlighting,
      });
    }
  }
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    // Initialize with a deep copy of DEFAULT_SETTINGS from the JS file
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
    // Use the utility function to merge and normalize settings
    // DEFAULT_SETTINGS and DEFAULT_PATTERNS are imported from settings-defaults.js
    this.settings = normalizeAndMergeSettings(loadedData, DEFAULT_SETTINGS, DEFAULT_PATTERNS);
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.notifyViewsOfSettingChanges();
  }
}

// Define the expected Props for SettingsEditorSvelte (still useful for TS part of main.ts)
interface SettingsEditorProps {
  settings: MyPluginSettings;
}

// Define the expected Events and their detail types for SettingsEditorSvelte
interface SettingsEditorEvents {
  updateSettings: CustomEvent<MyPluginSettings>; // main.ts still expects this structure from the event
}


class SyntaxHighlighterSettingTab extends PluginSettingTab {
  plugin: MyPlugin;
  private svelteComponent: SvelteComponentTyped<SettingsEditorProps, SettingsEditorEvents, any> | undefined;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // The mount function is now generic, so type arguments are allowed.
    this.svelteComponent = mount<SettingsEditorProps, SettingsEditorEvents, any>(SettingsEditorSvelte, {
      target: containerEl,
      props: {
        settings: this.plugin.settings
      }
    });

    if (this.svelteComponent && typeof this.svelteComponent.$on === 'function') {
      this.svelteComponent.$on('updateSettings', (event: CustomEvent<MyPluginSettings>) => {
        const newSettings = event.detail; 
        this.plugin.settings = newSettings;
        this.plugin.saveSettings();
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

class SampleModal extends Modal { 
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