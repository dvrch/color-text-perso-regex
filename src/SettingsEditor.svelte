<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { DEFAULT_SETTINGS, DEFAULT_PATTERNS, type MyPluginSettings, type CustomPatternConfig } from './SettingsDefaults.svelte';

  export let settings: MyPluginSettings; // Expects an object with enableGlobalSyntaxHighlighting and customPatterns array

  const dispatch = createEventDispatcher(); // Event detail will be a plain JS object

  const availableCssClasses = [
      "custom-dj-highlight",
      "tag-dj",
      "date-dj",
      "key-dj",
      "func-dj",
      "comm-dj",
      "type-dj",
      "op-dj",
      "num-dj",
      "ponct-dj",
      "sent-dj",
      "caps-dj",
      "delim-g-open-dj",
      "delim-g-close-dj",
      "cm-s-obsidian",
      "cm-formatting-hashtag",
      "cm-hashtag",
      "cm-url",
      "cm-strong",
      "cm-em",
      "cm-comment",
      "is-active",
      "mod-warning",
  ];

  function notifyChange() {
    // Dispatch the current state of settings.
    // The receiving end in main.ts still expects an object matching MyPluginSettings structure.
    dispatch('updateSettings', settings);
  }

  function addPattern() {
    const newPattern: CustomPatternConfig = { // Plain JavaScript object, matches CustomPatternConfig structure
      id: `custom-pattern-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `New Pattern ${settings.customPatterns.length + 1}`,
      enabled: true,
      regex: "",
      flags: "gm",
      cls: availableCssClasses[0], // Set initial class to a default from the list
      color: "#FFFF00",
      captureGroup: ""
    };
    settings.customPatterns = [...settings.customPatterns, newPattern];
    notifyChange();
  }

  function deletePattern(idToDelete: string) {
    settings.customPatterns = settings.customPatterns.filter(p => p.id !== idToDelete);
    notifyChange();
  }

  function resetToDefaults() {
    settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    notifyChange();
  }

  function getDefaultValue<T extends keyof MyPluginSettings>(field: T): MyPluginSettings[T] {
    return DEFAULT_SETTINGS[field];
  }

  // Function to handle CSS class selection from dropdown
  function handleClsSelection(e: Event, pattern: CustomPatternConfig) {
    const target = e.target as HTMLSelectElement;
    if (target.value === 'custom-input') {
      pattern.cls = ''; // Clear value to allow custom input
    } else {
      pattern.cls = target.value; // Set value from dropdown
    }
    notifyChange();
  }

  // Function to handle checkbox changes (e.g., enabled, flags)
  function handleCheckboxChange(e: Event, bindingTarget: any, property: string) {
    const target = e.target as HTMLInputElement;
    bindingTarget[property] = target.checked;
    notifyChange();
  }

  // Function to handle flag changes (g, m, i)
  function handleFlagChange(e: Event, pattern: CustomPatternConfig, flag: 'g' | 'm' | 'i') {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      if (!pattern.flags.includes(flag)) {
        pattern.flags += flag;
      }
    } else {
      pattern.flags = pattern.flags.replace(flag, '');
    }
    notifyChange();
  }
</script>

<div class="settings-container-dj">
  <div class="setting-item global-toggle">
    <label for="enableGlobalSyntaxHighlighting" class="global-toggle-label">
      Enable Global Syntax Highlighting
    </label>
    <div class="setting-control">
      <input 
        type="checkbox" 
        id="enableGlobalSyntaxHighlighting" 
        bind:checked={settings.enableGlobalSyntaxHighlighting} 
        on:change={(e) => handleCheckboxChange(e, settings, 'enableGlobalSyntaxHighlighting')}
        aria-labelledby="enableGlobalSyntaxHighlightingLabel"
      />
      <span class="default-value">Default: {getDefaultValue('enableGlobalSyntaxHighlighting') ? 'Enabled' : 'Disabled'}</span>
    </div>
  </div>

  <div class="setting-item default-color add-pattern-row">
    <label for="defaultTextColor" class="default-color-label">
      Default Text Color
    </label>
    <div class="setting-control">
      <input 
        type="color" 
        id="defaultTextColor" 
        bind:value={settings.defaultTextColor} 
        on:input={notifyChange}
        aria-label="Default text color"
      />
      <span class="default-value">Default: <span class="color-preview" style="background-color: {getDefaultValue('defaultTextColor')}"></span> {getDefaultValue('defaultTextColor')}</span>
    </div>
    <button on:click={addPattern} class="add-pattern-button" title="Add a new pattern">
      Add Pattern
    </button>
  </div>

  <h3 class="patterns-heading">Highlighting Patterns</h3>
  
  {#each settings.customPatterns.slice().reverse() as pattern (pattern.id)}
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
        <div class="pattern-field css-class-field header-field">
            {#if !availableCssClasses.includes(pattern.cls)}
              <input
                id={`cls-${pattern.id}`}
                type="text"
                placeholder="css-class"
                bind:value={pattern.cls}
                on:input={notifyChange}
                aria-label="Custom CSS class for pattern {pattern.name}"
                class="{pattern.cls === '' ? 'empty-placeholder' : ''}"
              />
              <button on:click={() => {pattern.cls = availableCssClasses[0]; notifyChange();}} class="reset-to-dropdown-button">
                Select from list
              </button>
            {:else}
              <select
                id={`cls-${pattern.id}`}
                bind:value={pattern.cls}
                on:change={(e) => handleClsSelection(e, pattern)}
                aria-label="CSS class for pattern {pattern.name}"
                class="pattern-css-class-select"
              >
                {#each availableCssClasses as clsOption}
                  <option value={clsOption}>{clsOption}</option>
                {/each}
                <option value="custom-input">Enter Custom...</option>
              </select>
            {/if}
        </div>
        <div class="pattern-controls">
          <div class="color-circle-wrapper">
            <label for={`color-${pattern.id}`} class="visually-hidden">Color</label>
            <input 
              id={`color-${pattern.id}`} 
              type="color" 
              bind:value={pattern.color} 
              on:input={notifyChange}
              aria-label="Highlight color for pattern {pattern.name}"
              class="color-input-circle"
            />
          </div>
          <label class="enabled-toggle" title="Enable/Disable this pattern">
            <input 
              type="checkbox" 
              bind:checked={pattern.enabled} 
              on:change={(e) => handleCheckboxChange(e, pattern, 'enabled')} 
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
      <div class="pattern-content-grid">
        <div class="pattern-field regex-field-only">
          <input 
            id={`regex-${pattern.id}`} 
            type="text" 
            placeholder="Regular Expression" 
            bind:value={pattern.regex} 
            on:input={notifyChange}
            aria-label="Regular expression for pattern {pattern.name}"
          />
        </div>
        <div class="pattern-field capture-group-field">
          <input 
            id={`capture-group-${pattern.id}`} 
            type="text" 
            placeholder="e.g., 0-99" 
            bind:value={pattern.captureGroup} 
            on:input={notifyChange}
            aria-label="Capture group for pattern {pattern.name}"
          />
        </div>
        <div class="pattern-field flags-field">
          <div class="flags-checkboxes">
            <label title="Global match (find all matches rather than stopping after the first)">
              <input
                type="checkbox"
                checked={pattern.flags.includes('g')}
                on:change={(e) => handleFlagChange(e, pattern, 'g')}
              /> g
            </label>
            <label title="Multiline match (allow ^ and $ to match start/end of lines)">
              <input
                type="checkbox"
                checked={pattern.flags.includes('m')}
                on:change={(e) => handleFlagChange(e, pattern, 'm')}
              /> m
            </label>
            <label title="Case-insensitive match (ignore case)">
              <input
                type="checkbox"
                checked={pattern.flags.includes('i')}
                on:change={(e) => handleFlagChange(e, pattern, 'i')}
              /> i
            </label>
          </div>
        </div>
      </div>
    </div>
  {/each}

  <div class="settings-actions">
    <button on:click={resetToDefaults} class="reset-button" title="Reset to default settings">
      Reset to Defaults
    </button>
  </div>
</div>

<style>
  /* =========================================
     Global Settings and Base Elements
     ========================================= */
  .settings-container-dj {
    padding: 20px;
  }

  /* Generic flex container for form items */
  .setting-item, .setting-control, .default-color, .global-toggle, .pattern-header, .pattern-controls, .enabled-toggle, .pattern-content-grid, .color-circle-wrapper {
    display: flex;
    align-items: center;
  }

  .setting-item {
    margin-bottom: 15px;
    gap: 15px;
  }

  /* General spacing for specific items */
  .default-color.add-pattern-row { gap: 10px; }
  .pattern-header { justify-content: space-between; margin-bottom: 8px; flex-wrap: nowrap; gap: 10px; }
  .pattern-controls { gap: 8px; margin-left: 10px; flex-shrink: 0; }
  .enabled-toggle { gap: 4px; font-size: var(--font-ui-small); color: var(--text-muted); cursor: pointer; }
  .pattern-content-grid { gap: 10px; }
  .settings-actions { margin: 15px 0; justify-content: flex-end; } /* Grouped with general spacing */

  /* Default text appearance */
  .default-value { color: #666; font-size: 0.9em; }
  .default-color-label { min-width: 120px; }

  /* Common styles for inputs (text, number) and selects */
  .pattern-name-input,
  .pattern-field input[type='text'],
  .pattern-field select {
    font-size: var(--font-ui-small);
    padding: 6px 8px;
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-s);
    background-color: var(--background-primary);
    color: var(--text-normal);
    box-sizing: border-box;
    width: 100%; /* Default to full width of parent flex item */
  }

  /* Common focus styles for interactive elements */
  input:focus, button:focus, select:focus, input:focus-visible, button:focus-visible, select:focus-visible {
     border-color: var(--interactive-accent);
     box-shadow: 0 0 0 1px var(--interactive-accent);
     outline: 2px solid var(--interactive-accent);
     outline-offset: 1px;
  }

  /* =========================================
     Buttons
     ========================================= */
  /* Accent buttons (Add Pattern, Reset to Dropdown) */
  .add-pattern-button, .reset-to-dropdown-button {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    font-weight: 500;
  }
  .add-pattern-button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    padding: 8px 15px;
    font-size: var(--font-ui-small);
  }
  .reset-to-dropdown-button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    padding: 6px 12px;
    font-size: 13px;
  }

  /* Hover/Active states for accent buttons */
  .add-pattern-button:hover, .reset-to-dropdown-button:hover { background-color: var(--interactive-accent-hover); }
  .add-pattern-button:active, .reset-to-dropdown-button:active { background-color: var(--interactive-accent-active); }

  /* Destructive button (Reset to Defaults) */
  .reset-button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    background-color: #ff4444;
    color: white;
    font-size: 14px;
    padding: 8px 16px;
  }
  .reset-button:hover { background-color: #ff0000; }
  .reset-button:active { background-color: #cc0000; }

  /* Text-only button (Delete Pattern) */
  .delete-button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    background: none;
    color: var(--text-muted);
    font-size: 1.4em;
    padding: 0 5px;
    line-height: 1;
  }
  .delete-button:hover { color: var(--text-error); }

  /* =========================================
     Specific Components and Layouts
     ========================================= */
  .global-toggle {
    justify-content: space-between;
    padding: 10px;
    background-color: var(--background-secondary-alt);
    border-radius: var(--radius-m);
    margin-bottom: 15px;
  }
  .global-toggle input[type='checkbox'] { transform: scale(1.1); }

  .patterns-heading {
    font-size: var(--font-ui-large);
    margin: 0 0 10px 0;
    color: var(--text-normal);
  }

  .pattern-editor-item {
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-m);
    padding: 10px;
    margin-bottom: 12px;
    background-color: var(--background-secondary);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    width: 100%;
    box-sizing: border-box;
  }

  /* Pattern header flex distribution */
  .pattern-name-input { flex: 1 5 80px; font-weight: 500; }
  .pattern-field.css-class-field.header-field {
    flex: 0 0 220px; /* flex-grow flex-shrink flex-basis; fixed width for full text */
  }

  .pattern-field.css-class-field.header-field input,
  .pattern-field.css-class-field.header-field select {
    width: 100%; /* Occupy full width within its flex item */
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
    text-align: center; /* Center text as requested */
    margin: 0; /* Remove default input margin */
  }

  .pattern-field.css-class-field.header-field .empty-placeholder {
    color: var(--text-muted);
  }

  .reset-to-dropdown-button {
    margin-left: 10px;
    white-space: nowrap; /* Prevent text wrapping */
    background-color: var(--background-modifier-form-field);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
  }

  .reset-to-dropdown-button:hover {
    background-color: var(--background-modifier-border);
  }

  .pattern-css-class-select {
    -webkit-appearance: none; /* Remove default browser styling for dropdown */
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M208.49%2093.49L128%20173.98l-80.49-80.49a12%2012%200%200%200-17%2017l88%2088a12%2012%200%200%200%2017%200l88-88a12%2012%200%200%200-17-17z%22%2F%3E%3C%2Fsvg%3E'); /* Custom arrow */
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 12px;
    padding-right: 30px; /* Make space for the arrow */
  }

  .pattern-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto; /* Push controls to the right */
  }

  .color-input-circle {
    width: 30px;
    height: 30px;
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid var(--background-modifier-border);
  }

  .color-input-circle::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input-circle::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  .enabled-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }

  .pattern-content-grid {
    display: flex; /* Use flexbox */
    align-items: center; /* Align items vertically */
    gap: 10px; /* Space between fields */
    width: 100%;
  }

  .pattern-content-grid input[type="text"] {
    flex: 1; /* Allow inputs to grow and shrink */
  }

  .pattern-field.regex-field-only {
    flex: 3; /* Give more space to regex */
  }

  .pattern-field.capture-group-field {
    flex: 1; /* Less space for capture group */
  }

  .pattern-field.flags-field {
    flex: 0 0 auto; /* Fixed size for flags */
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  .flags-checkboxes {
    display: flex;
    gap: 10px; /* Space between flag checkboxes */
  }

  .flags-checkboxes label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
