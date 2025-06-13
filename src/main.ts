/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { App, MarkdownView, Plugin, PluginSettingTab, ItemView, WorkspaceLeaf, type PluginManifest } from 'obsidian';
import SyntaxHighlighterSvelte from './SyntaxHighlighter.svelte';
import SettingsEditorSvelte from './SettingsEditor.svelte';
import { mount, unmount, type Svelte4Constructor } from './svelte-utils';
import type { SvelteComponent } from 'svelte';
import { DEFAULT_SETTINGS } from './SettingsDefaults.svelte';

// Interfaces for settings (remain in main.ts for type safety of plugin core logic)
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

// Define DEFAULT_PATTERNS, DEFAULT_SETTINGS, and normalizeAndMergeSettings here
// as their original files are being removed and content moved to main.ts.

// Placeholder/Example for DEFAULT_PATTERNS
/* REMOVED: This was moved to SettingsDefaults.svelte
export const DEFAULT_PATTERNS: CustomPatternConfig[] = [
  {
    id: 'uuid',
    name: 'UUID Pattern',
    enabled: true,
    regex: '\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b',
    flags: 'gi',
    cls: 'sh-uuid',
    color: '#D8A0DF',
    captureGroup: '0',
  },
  // Add other default patterns here
];
*/

// Placeholder/Example for DEFAULT_SETTINGS
/* REMOVED: This was moved to SettingsDefaults.svelte
export const DEFAULT_SETTINGS: MyPluginSettings = {
  enableGlobalSyntaxHighlighting: true,
  defaultTextColor: '#000000',
  customPatterns: JSON.parse(JSON.stringify(DEFAULT_PATTERNS)), // Initialize with a deep copy
};
*/

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

export default class MyPlugin extends Plugin {
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

    const ribbonIconEl = this.addRibbonIcon('highlighter', 'Open Syntax Highlighter View', (evt: MouseEvent) => { // Should now be recognized
      this.activateView();
    });
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    this.addCommand({ // Should now be recognized
      id: 'open-syntax-highlighter-view',
      name: 'Open Syntax Highlighter View',
      callback: () => {
        this.activateView();
      },
    });

    this.addSettingTab(new SyntaxHighlighterSettingTab(this.app, this)); // this.app should be fine, addSettingTab should be recognized

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
    const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_SYNTAX); // this.app should be fine
    if (existingLeaves.length > 0) {
      this.app.workspace.revealLeaf(existingLeaves[0]); // this.app should be fine
      return;
    }

    const leaf = this.app.workspace.getLeaf('split', 'vertical'); // this.app should be fine
    leaf.setViewState({
      type: VIEW_TYPE_SYNTAX,
      active: true,
    });
    this.app.workspace.revealLeaf(leaf); // this.app should be fine
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SYNTAX); // this.app should be fine
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
  plugin: MyPlugin;
  declare app: App;
  declare containerEl: HTMLElement;
  private svelteComponent: (SvelteComponent & { $set: (props: Partial<SettingsEditorProps>) => void } & { $on: (event: 'updateSettings', callback: (e: CustomEvent<MyPluginSettings>) => void) => void } ) | undefined;


  constructor(app: App, plugin: MyPlugin) {
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