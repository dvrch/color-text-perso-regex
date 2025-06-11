
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MyPluginSettings, CustomPatternConfig } from './main';

  export let settings: MyPluginSettings;
  export let onSettingsChange: (newSettings: MyPluginSettings) => void;

  const dispatch = createEventDispatcher();

  let internalSettings = JSON.parse(JSON.stringify(settings));

  function updateParentSettings() {
    onSettingsChange(JSON.parse(JSON.stringify(internalSettings)));
  }

  function addPattern() {
    internalSettings.customPatterns.push({
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      enabled: true,
      regex: "",
      flags: "gm",
      cls: "custom-dj-highlight", // Default class
      color: "#FFFFFF", // Default color
      captureGroup: ""
    });
    internalSettings.customPatterns = internalSettings.customPatterns; // Trigger Svelte reactivity
    updateParentSettings();
  }

  function deletePattern(id: string) {
    internalSettings.customPatterns = internalSettings.customPatterns.filter(p => p.id !== id);
    updateParentSettings();
  }

  function handlePatternChange() {
    // Debounce or directly update. For simplicity, direct update.
    updateParentSettings();
  }
  
  // Ensure customPatterns is always an array
  if (!Array.isArray(internalSettings.customPatterns)) {
      internalSettings.customPatterns = [];
  }

</script>

<div class="syntax-highlighter-settings">
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Enable Custom Syntax Highlighting</div>
      <div class="setting-item-description">Globally enable or disable all custom syntax highlighting patterns.</div>
    </div>
    <div class="setting-item-control">
      <input
        type="checkbox"
        class="slider"
        bind:checked={internalSettings.enableGlobalSyntaxHighlighting}
        on:change={updateParentSettings}
        id="enableGlobalSyntaxHighlightingToggle"
      />
      <label class="slider-label" for="enableGlobalSyntaxHighlightingToggle"></label>
    </div>
  </div>

  <h3 class="settings-section-header">Custom Highlighting Patterns</h3>

  {#if internalSettings.customPatterns.length === 0}
    <p class="no-patterns-message">No custom patterns defined. Click 'Add Pattern' to create one.</p>
  {/if}

  {#each internalSettings.customPatterns as pattern (pattern.id)}
    <div class="pattern-editor">
      <div class="pattern-header">
        <h4>Pattern <button class="delete-pattern" on:click={() => deletePattern(pattern.id)} aria-label="Delete pattern">🗑️</button></h4>
        <div class="setting-item-control pattern-enable-toggle">
             <input
                type="checkbox"
                class="slider"
                bind:checked={pattern.enabled}
                on:change={handlePatternChange}
                id="patternToggle-{pattern.id}"
              />
              <label class="slider-label" for="patternToggle-{pattern.id}"></label>
        </div>
      </div>
      
      <div class="pattern-field">
        <label for="regex-{pattern.id}">Regex Pattern:</label>
        <input type="text" id="regex-{pattern.id}" bind:value={pattern.regex} on:input={handlePatternChange} placeholder="/your-regex/" />
      </div>
      <div class="pattern-field">
        <label for="flags-{pattern.id}">Flags:</label>
        <input type="text" id="flags-{pattern.id}" bind:value={pattern.flags} on:input={handlePatternChange} placeholder="gm" />
      </div>
      <div class="pattern-field">
        <label for="cls-{pattern.id}">CSS Class:</label>
        <input type="text" id="cls-{pattern.id}" bind:value={pattern.cls} on:input={handlePatternChange} placeholder="custom-css-class" />
      </div>
      <div class="pattern-field">
        <label for="color-{pattern.id}">Color:</label>
        <input type="color" id="color-picker-{pattern.id}" bind:value={pattern.color} on:input={handlePatternChange} />
        <input type="text" class="color-hex-input" id="color-{pattern.id}" bind:value={pattern.color} on:input={handlePatternChange} placeholder="#RRGGBB" />
      </div>
      <div class="pattern-field">
        <label for="captureGroup-{pattern.id}">Capture Group (optional):</label>
        <input type="text" id="captureGroup-{pattern.id}" bind:value={pattern.captureGroup} on:input={handlePatternChange} placeholder="e.g., 1 (for $1)" />
      </div>
    </div>
  {/each}

  <button class="mod-cta add-pattern-button" on:click={addPattern}>+ Add Pattern</button>
</div>

<style>
  .syntax-highlighter-settings {
    padding: 10px; /* Consistent with Obsidian settings panes */
  }
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--background-modifier-border);
  }
  .setting-item-info {
    flex-grow: 1;
  }
  .setting-item-name {
    font-weight: bold;
    color: var(--text-normal);
  }
  .setting-item-description {
    font-size: var(--font-ui-small);
    color: var(--text-muted);
  }
  .setting-item-control {
    margin-left: 10px;
    display: flex;
    align-items: center;
  }

  /* Slider Toggle Switch */
  .slider {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider-label {
    display: block;
    width: 40px; /* Width of the toggle */
    height: 20px; /* Height of the toggle */
    background-color: var(--background-modifier-border);
    border-radius: 10px; /* Makes it pill-shaped */
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .slider-label::before {
    content: '';
    display: block;
    width: 16px; /* Diameter of the circle */
    height: 16px;
    background-color: white;
    border-radius: 50%; /* Makes it a circle */
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s ease;
  }
  .slider:checked + .slider-label {
    background-color: var(--interactive-accent);
  }
  .slider:checked + .slider-label::before {
    transform: translateX(20px); /* Moves circle to the right (40px width - 16px circle - 2x2px padding) */
  }

  .settings-section-header {
    margin-top: 20px;
    margin-bottom: 15px;
    font-size: 1.2em;
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 5px;
  }
  .no-patterns-message {
    color: var(--text-muted);
    margin-bottom: 15px;
  }

  .pattern-editor {
    background-color: var(--background-secondary);
    padding: 15px;
    border-radius: var(--radius-m);
    margin-bottom: 15px;
    border: 1px solid var(--background-modifier-border);
  }
  .pattern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .pattern-header h4 {
    margin: 0;
    font-size: 1.1em;
  }
  .delete-pattern {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.2em;
    padding: 5px;
  }
  .delete-pattern:hover {
    color: var(--text-error);
  }
  .pattern-enable-toggle {
    /* Uses .setting-item-control styles */
  }

  .pattern-field {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
  }
  .pattern-field label {
    font-size: var(--font-ui-small);
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  .pattern-field input[type="text"],
  .pattern-field input[type="color"] {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-s);
    background-color: var(--background-primary);
    color: var(--text-normal);
  }
  .pattern-field input[type="text"]:focus {
     border-color: var(--interactive-accent);
     box-shadow: 0 0 0 1px var(--interactive-accent);
  }

  .pattern-field input[type="color"] {
      width: 50px; /* Smaller for color picker */
      height: 30px;
      padding: 2px;
      margin-right: 5px;
      vertical-align: middle;
  }
  .pattern-field .color-hex-input {
      display: inline-block;
      width: calc(100% - 60px); /* Adjust based on color picker size and margin */
      vertical-align: middle;
  }


  .add-pattern-button {
    /* Uses Obsidian's .mod-cta for primary action buttons */
    margin-top: 10px;
  }
</style>
