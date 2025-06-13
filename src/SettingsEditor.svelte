<script>
  import { createEventDispatcher } from 'svelte';
  import { DEFAULT_SETTINGS, DEFAULT_PATTERNS } from './SettingsDefaults.svelte';
  // No longer importing MyPluginSettings, CustomPatternConfig from './main'
  // Props are now plain JavaScript, types are not explicitly declared here.

  export let settings; // Expects an object with enableGlobalSyntaxHighlighting and customPatterns array

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
    const newPattern = { // Plain JavaScript object, matches CustomPatternConfig structure
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

  function deletePattern(idToDelete) {
    settings.customPatterns = settings.customPatterns.filter(p => p.id !== idToDelete);
    notifyChange();
  }

  function resetToDefaults() {
    settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    notifyChange();
  }

  function getDefaultValue(field) {
    return DEFAULT_SETTINGS[field];
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
        on:change={notifyChange}
        aria-labelledby="enableGlobalSyntaxHighlightingLabel"
      />
      <span class="default-value">Default: {getDefaultValue('enableGlobalSyntaxHighlighting') ? 'Enabled' : 'Disabled'}</span>
    </div>
  </div>

  <div class="setting-item default-color">
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
  </div>

  <div class="settings-actions">
    <button on:click={resetToDefaults} class="reset-button" title="Reset to default settings">
      Reset to Defaults
    </button>
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
          <div class="pattern-field css-class-field header-field">
            <label for={`cls-${pattern.id}`} class="visually-hidden">CSS Class</label>
            {#if !availableCssClasses.includes(pattern.cls)}
              <input
                id={`cls-${pattern.id}`}
                type="text"
                placeholder="css class"
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
                on:change={(e) => {
                    if (e.target.value === 'custom-input') {
                        pattern.cls = ''; // Clear value to allow custom input
                    } else {
                        pattern.cls = e.target.value; // Set value from dropdown
                    }
                    notifyChange();
                }}
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
      <div class="pattern-content-grid">
        <div class="pattern-field regex-field">
          <label for={`regex-${pattern.id}`} class="visually-hidden">Regex</label>
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
            id={`captureGroup-${pattern.id}`} 
            type="number" 
            min="0"
            max="9"
            placeholder="0-9" 
            bind:value={pattern.captureGroup} 
            on:input={notifyChange}
            aria-label="Capture group index for pattern [0-9] {pattern.name}"
            size="4"
          />
        </div>
        <div class="pattern-field flags-field">
          <div class="flags-group">
            <div 
              id={`flags-group-${pattern.id}`}
              class="flags-container" 
              role="group" 
              aria-labelledby={`flags-label-${pattern.id}`}
            >
              <label class="flag-checkbox" for={`flag-g-${pattern.id}`}>
                <input 
                  id={`flag-g-${pattern.id}`}
                  type="checkbox" 
                  checked={pattern.flags.includes('g')}
                  on:change={(e) => {
                    const newFlags = e.target.checked 
                      ? pattern.flags + 'g'
                      : pattern.flags.replace('g', '');
                    pattern.flags = newFlags;
                    notifyChange();
                  }}
                />
                <span>g</span>
              </label>
              <label class="flag-checkbox" for={`flag-m-${pattern.id}`}>
                <input 
                  id={`flag-m-${pattern.id}`}
                  type="checkbox" 
                  checked={pattern.flags.includes('m')}
                  on:change={(e) => {
                    const newFlags = e.target.checked 
                      ? pattern.flags + 'm'
                      : pattern.flags.replace('m', '');
                    pattern.flags = newFlags;
                    notifyChange();
                  }}
                />
                <span>m</span>
              </label>
              <label class="flag-checkbox" for={`flag-i-${pattern.id}`}>
                <input 
                  id={`flag-i-${pattern.id}`}
                  type="checkbox" 
                  checked={pattern.flags.includes('i')}
                  on:change={(e) => {
                    const newFlags = e.target.checked 
                      ? pattern.flags + 'i'
                      : pattern.flags.replace('i', '');
                    pattern.flags = newFlags;
                    notifyChange();
                  }}
                />
                <span>i</span>
              </label>
            </div>
          </div>
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
    padding: 20px;
  }

  .setting-item {
    margin-bottom: 15px;
  }

  .setting-control {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .default-value {
    color: #666;
    font-size: 0.9em;
  }

  .color-preview {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid #ccc;
    border-radius: 2px;
    margin-right: 5px;
    vertical-align: middle;
  }

  .default-color {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .default-color-label {
    min-width: 120px;
  }

  .default-color input[type="color"] {
    width: 50px;
    height: 30px;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }

  .settings-actions {
    margin: 15px 0;
    display: flex;
    justify-content: flex-end;
  }

  .reset-button {
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .reset-button:hover {
    background-color: #ff0000;
  }

  .reset-button:active {
    background-color: #cc0000;
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
    transform: scale(1.1);
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
    padding: 10px; 
    margin-bottom: 12px;
    background-color: var(--background-secondary);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    width: 100%;
    box-sizing: border-box;
  }
  .pattern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .pattern-name-input {
    flex-grow: 1;
    font-size: var(--font-ui-medium);
    font-weight: 500;
    padding: 6px 8px;
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-s);
    background-color: var(--background-primary); 
    color: var(--text-normal);
    min-width: 150px;
  }
  .pattern-name-input:focus {
    border-color: var(--interactive-accent);
    box-shadow: 0 0 0 1px var(--interactive-accent);
  }
  .pattern-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 10px;
    flex-shrink: 0;
  }
  .enabled-toggle {
    display: flex;
    align-items: center;
    gap: 4px; 
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
    font-size: 1.4em;
    cursor: pointer;
    padding: 0 5px;
    line-height: 1;
  }
  .delete-button:hover {
    color: var(--text-error);
  }
  .pattern-content-grid {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: end;
  }
  .pattern-field {
    display: flex;
    flex-direction: column;
  }
  .pattern-field label {
    font-size: var(--font-ui-smaller);
    margin-bottom: 3px;
    color: var(--text-muted);
    font-weight: 500;
  }
  .pattern-field input[type="text"] {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-s);
    background-color: var(--background-primary);
    color: var(--text-normal);
    font-size: var(--font-ui-small);
    box-sizing: border-box;
  }
  .pattern-field input:focus,
  .pattern-name-input:focus,
  input:focus-visible, 
  button:focus-visible {
     border-color: var(--interactive-accent);
     box-shadow: 0 0 0 1px var(--interactive-accent);
     outline: 2px solid var(--interactive-accent);
     outline-offset: 1px;
  }
  .add-pattern-button {
    margin-top: 15px;
    padding: 8px 15px;
    font-size: var(--font-ui-small);
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
  .flags-group {
    margin-top: 0;
  }
  .flags-container {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap; 
  }
  .flags-container label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .flags-container label input[type="checkbox"] {
    margin: 0;
  }
  .flags-container label span {
    font-size: 0.9em; 
  }
  .color-circle-wrapper {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid var(--background-modifier-border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }
  .color-input-circle {
    width: 150%; 
    height: 150%;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  .color-input-circle::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .color-input-circle::-webkit-color-swatch,
  .color-input-circle::-moz-color-swatch {
    border: none;
    border-radius: 50%;
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

  .header-field {
    flex-basis: 100px;
    flex-shrink: 1;
    min-width: 0;
  }

  /* Responsive adjustments for specific fields */
  @media (max-width: 768px) {
    .pattern-content-grid {
      grid-template-columns: 1fr; /* Stack all fields */
    }
    .pattern-header {
      flex-direction: column;
      align-items: flex-start;
    }
    .pattern-controls {
      margin-top: 10px;
      margin-left: 0;
      width: 100%;
      justify-content: flex-end; 
    }
    .pattern-name-input,
    .header-field {
      width: 100%;
    }
  }

  /* New styles for the dropdown and custom input toggle button */
  .pattern-css-class-select {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background-color: var(--background-primary);
    color: var(--text-normal);
    font-size: var(--font-ui-small);
    margin-right: 10px; /* Space between select and other controls if needed */
  }

  .reset-to-dropdown-button {
    background-color: var(--interactive-accent);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.2s;
    margin-left: 10px; /* Adjust spacing as needed */
  }

  .reset-to-dropdown-button:hover {
    background-color: var(--interactive-accent-hover);
  }

  .reset-to-dropdown-button:active {
    background-color: var(--interactive-accent-active);
  }

  /* Adjust the pattern-field to accommodate the button */
  .pattern-field.css-class-field {
      display: flex;
      align-items: center;
      gap: 10px; /* Space between input/select and button */
  }

  .empty-placeholder::placeholder {
    color: #888; /* Grey color for placeholder */
    font-style: italic;
  }

  .empty-placeholder {
    color: #888; /* Ensure actual text is also grey if nothing is typed */
  }
</style>
