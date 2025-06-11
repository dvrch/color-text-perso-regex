
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MyPluginSettings, CustomPatternConfig } from './main';

  export let settings: MyPluginSettings;
  // The onSettingsChange prop is implicitly handled by Svelte's reactivity
  // when bind:value is used and the parent component listens for changes.
  // However, explicit dispatching is good practice for complex objects or immediate feedback.

  const dispatch = createEventDispatcher<{ updateSettings: MyPluginSettings }>();

  function notifyChange() {
    // This function ensures that any change triggers an update to the plugin's core settings.
    dispatch('updateSettings', settings);
  }

  function addPattern() {
    const newPattern: CustomPatternConfig = {
      id: `custom-pattern-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `New Pattern ${settings.customPatterns.length + 1}`,
      enabled: true,
      regex: "",
      flags: "gm",
      cls: "custom-dj-highlight",
      color: "#FFFFFF", // Default to white, user can change
      captureGroup: ""
    };
    settings.customPatterns = [...settings.customPatterns, newPattern];
    notifyChange();
  }

  function deletePattern(idToDelete: string) {
    settings.customPatterns = settings.customPatterns.filter(p => p.id !== idToDelete);
    notifyChange();
  }

  // Ensure settings.customPatterns is always an array
  if (!Array.isArray(settings.customPatterns)) {
    settings.customPatterns = [];
    notifyChange(); // if it was somehow not an array, fix and notify
  }
</script>

<div class="settings-container-dj">
  <div class="setting-item global-toggle">
    <label for="enableGlobalSyntaxHighlighting" class="global-toggle-label">
      Enable Global Syntax Highlighting
    </label>
    <input 
      type="checkbox" 
      id="enableGlobalSyntaxHighlighting" 
      bind:checked={settings.enableGlobalSyntaxHighlighting} 
      on:change={notifyChange}
      aria-labelledby="enableGlobalSyntaxHighlightingLabel"
    />
  </div>

  <h3 class="patterns-heading">Highlighting Patterns</h3>
  
  {#each settings.customPatterns as pattern (pattern.id)}
    <div class="pattern-editor-item" role="group" aria-labelledby={`pattern-name-${pattern.id}`}>
      <div class="pattern-header">
        <input 
          type="text" 
          placeholder="Pattern Name" 
          bind:value={pattern.name} 
          on:input={notifyChange} 
          class="pattern-name-input"
          id={`pattern-name-${pattern.id}`}
          aria-label="Pattern name"
        />
        <div class="pattern-controls">
          <label class="enabled-toggle" title="Enable/Disable this pattern">
            <input 
              type="checkbox" 
              bind:checked={pattern.enabled} 
              on:change={notifyChange} 
              aria-label="Enable pattern {pattern.name}"
            />
            <span>Enabled</span>
          </label>
          <button 
            on:click={() => deletePattern(pattern.id)} 
            class="delete-button" 
            aria-label="Delete pattern {pattern.name}"
            title="Delete this pattern"
          >
            &times;
          </button>
        </div>
      </div>
      <div class="pattern-grid">
        <div class="pattern-field">
          <label for={`regex-${pattern.id}`}>Regex</label>
          <input 
            id={`regex-${pattern.id}`} 
            type="text" 
            placeholder="Regular Expression" 
            bind:value={pattern.regex} 
            on:input={notifyChange}
            aria-label="Regular expression for pattern {pattern.name}"
          />
        </div>
        <div class="pattern-field">
          <label for={`flags-${pattern.id}`}>Flags</label>
          <input 
            id={`flags-${pattern.id}`} 
            type="text" 
            placeholder="e.g., gm" 
            bind:value={pattern.flags} 
            on:input={notifyChange}
            aria-label="Regex flags for pattern {pattern.name}"
          />
        </div>
        <div class="pattern-field">
          <label for={`cls-${pattern.id}`}>CSS Class</label>
          <input 
            id={`cls-${pattern.id}`} 
            type="text" 
            placeholder="CSS class name" 
            bind:value={pattern.cls} 
            on:input={notifyChange}
            aria-label="CSS class for pattern {pattern.name}"
          />
        </div>
        <div class="pattern-field">
          <label for={`color-${pattern.id}`}>Color</label>
          <input 
            id={`color-${pattern.id}`} 
            type="color" 
            bind:value={pattern.color} 
            on:input={notifyChange}
            aria-label="Highlight color for pattern {pattern.name}"
            class="color-input"
          />
        </div>
        <div class="pattern-field capture-group-field">
          <label for={`captureGroup-${pattern.id}`}>Capture Group</label>
          <input 
            id={`captureGroup-${pattern.id}`} 
            type="text" 
            placeholder="e.g., 0 or 1" 
            bind:value={pattern.captureGroup} 
            on:input={notifyChange}
            aria-label="Capture group index for pattern {pattern.name}"
          />
        </div>
      </div>
    </div>
  {/each}

  <button on:click={addPattern} class="add-pattern-button">
    + Add New Pattern
  </button>
</div>

<style>
  .settings-container-dj {
    padding: 5px; /* Reduced padding for overall container */
    max-width: 100%;
    box-sizing: border-box;
  }

  .global-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: var(--background-secondary-alt);
    border-radius: var(--radius-m);
    margin-bottom: 15px;
  }

  .global-toggle-label {
    margin-right: 10px;
    font-weight: 500;
  }
  
  .global-toggle input[type="checkbox"] {
    transform: scale(1.1); /* Slightly larger checkbox */
  }

  .patterns-heading {
    font-size: var(--font-ui-large);
    margin-bottom: 10px;
    margin-top: 0;
    color: var(--text-normal);
  }

  .pattern-editor-item {
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-m);
    padding: 10px; /* Reduced padding */
    margin-bottom: 12px; /* Reduced margin */
    background-color: var(--background-secondary);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .pattern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px; /* Reduced margin */
  }

  .pattern-name-input {
    flex-grow: 1;
    font-size: var(--font-ui-medium);
    font-weight: 500;
    padding: 6px 8px; /* Compact padding */
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-s);
    background-color: var(--background-primary); /* Match theme */
    color: var(--text-normal);
  }
  .pattern-name-input:focus {
    border-color: var(--interactive-accent);
    box-shadow: 0 0 0 1px var(--interactive-accent);
  }

  .pattern-controls {
    display: flex;
    align-items: center;
    gap: 8px; /* Reduced gap */
    margin-left: 10px; /* Space from name input */
  }

  .enabled-toggle {
    display: flex;
    align-items: center;
    gap: 4px; /* Reduced gap */
    font-size: var(--font-ui-small);
    color: var(--text-muted);
    cursor: pointer;
  }
  .enabled-toggle input[type="checkbox"] {
    margin: 0;
    transform: scale(0.9);
  }

  .delete-button {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.4em; /* Slightly larger for easier click */
    cursor: pointer;
    padding: 0 5px; /* Minimal padding */
    line-height: 1;
  }
  .delete-button:hover {
    color: var(--text-error);
  }

  .pattern-grid {
    display: grid;
    /* Autofit columns, try to make them at least 150px, but allow flexibility */
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px 10px; /* Reduced gap */
    align-items: end; /* Align form elements nicely if they have different heights */
  }

  .pattern-field {
    display: flex;
    flex-direction: column;
  }
  
  .pattern-field label {
    font-size: var(--font-ui-smaller);
    margin-bottom: 3px; /* Reduced margin */
    color: var(--text-muted);
    font-weight: 500;
  }

  .pattern-field input[type="text"],
  .pattern-field input[type="color"] {
    width: 100%;
    padding: 6px 8px; /* Compact padding */
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-s);
    background-color: var(--background-primary);
    color: var(--text-normal);
    font-size: var(--font-ui-small);
    box-sizing: border-box; /* Important for 100% width with padding */
  }
  
  .pattern-field input[type="color"] {
    padding: 4px; /* Color inputs often need less vertical padding */
    min-height: 30px; /* Ensure color input is not too small */
  }

  .pattern-field input:focus {
     border-color: var(--interactive-accent);
     box-shadow: 0 0 0 1px var(--interactive-accent);
  }
  
  /* Make capture group field potentially smaller if needed, or let grid handle it */
  /* .capture-group-field { max-width: 120px; } */

  .add-pattern-button {
    margin-top: 15px; /* Space above button */
    padding: 8px 15px; /* Standard button padding */
    font-size: var(--font-ui-small); /* Consistent font size */
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: var(--radius-m);
    cursor: pointer;
    font-weight: 500;
  }
  .add-pattern-button:hover {
    background-color: var(--interactive-accent-hover);
  }

  /* Accessibility improvements */
  input:focus-visible, button:focus-visible {
    outline: 2px solid var(--interactive-accent);
    outline-offset: 1px;
  }

</style>
