<script context="module">
  // SettingsUtils.svelte
  // This component exports utility functions for settings management.
  // These functions are plain JavaScript and expect objects matching
  // CustomPatternConfig and MyPluginSettings structures from main.ts.
  // It has no visual output.

  /**
   * Ensures a pattern object has all necessary fields.
   * @param {Partial<CustomPatternConfig>} pattern - Input can be partial.
   * @param {number} index - Index for generating unique ID if needed.
   * @param {ReadonlyArray<CustomPatternConfig>} defaultPatternsList - Reference for defaults.
   * @param {Readonly<CustomPatternConfig>} [originalDefaultPattern] - Original default if basing on one.
   * @returns {CustomPatternConfig} A complete CustomPatternConfig object.
   */
  export function ensurePatternIntegrity(
      pattern,
      index,
      defaultPatternsList,
      originalDefaultPattern
  ) {
      const scaffold = {
          id: `pattern-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
          name: `Pattern ${index + 1}`,
          enabled: true,
          regex: "",
          flags: "gm",
          cls: "custom-dj-highlight",
          color: "#00FFFF",
          captureGroup: ""
      };

      const base = originalDefaultPattern || 
                   (defaultPatternsList && defaultPatternsList.find(dp => dp.id === pattern.id)) || 
                   scaffold;

      return {
          id: typeof pattern.id === 'string' && pattern.id.trim() !== '' ? pattern.id : scaffold.id,
          name: typeof pattern.name === 'string' && pattern.name.trim() !== '' ? pattern.name : base.name,
          enabled: typeof pattern.enabled === 'boolean' ? pattern.enabled : base.enabled,
          regex: typeof pattern.regex === 'string' ? pattern.regex : base.regex,
          flags: typeof pattern.flags === 'string' ? pattern.flags : base.flags,
          cls: typeof pattern.cls === 'string' && pattern.cls.trim() !== '' ? pattern.cls : base.cls,
          color: typeof pattern.color === 'string' && pattern.color.trim() !== '' ? pattern.color : base.color,
          captureGroup: typeof pattern.captureGroup === 'string' ? pattern.captureGroup : (base.captureGroup || "")
      };
  }

  /**
   * Merges loaded settings with default settings and ensures all patterns are well-formed.
   * @param {Partial<MyPluginSettings> | null | undefined} loadedData - Data from loadData().
   * @param {Readonly<MyPluginSettings>} defaultSettings - Default settings structure.
   * @param {ReadonlyArray<CustomPatternConfig>} defaultPatternsRef - Reference array of default patterns.
   * @returns {MyPluginSettings} A complete MyPluginSettings object.
   */
  export function normalizeAndMergeSettings(
    loadedData,
    defaultSettings,
    defaultPatternsRef
  ) {
    const localDefaultPatterns = JSON.parse(JSON.stringify(defaultPatternsRef || []));
    const baseSettings = JSON.parse(JSON.stringify(defaultSettings));

    if (!loadedData) {
      baseSettings.customPatterns = localDefaultPatterns.map((p, index) =>
          ensurePatternIntegrity(p, index, localDefaultPatterns, p)
      );
      return baseSettings;
    }

    const finalSettings = {
      ...baseSettings,
      enableGlobalSyntaxHighlighting: typeof loadedData.enableGlobalSyntaxHighlighting === 'boolean'
                                        ? loadedData.enableGlobalSyntaxHighlighting
                                        : baseSettings.enableGlobalSyntaxHighlighting,
      customPatterns: [],
    };

    const loadedPatterns = Array.isArray(loadedData.customPatterns) ? loadedData.customPatterns : [];
    const finalPatterns = [];
    const defaultPatternIds = new Set(localDefaultPatterns.map(p => p.id));

    for (const defaultPattern of localDefaultPatterns) {
      const userVersion = loadedPatterns.find(p => p.id === defaultPattern.id);
      if (userVersion) {
        finalPatterns.push(ensurePatternIntegrity({ ...defaultPattern, ...userVersion }, -1, localDefaultPatterns, defaultPattern));
      } else {
        finalPatterns.push(ensurePatternIntegrity(defaultPattern, -1, localDefaultPatterns, defaultPattern));
      }
    }

    for (const loadedPattern of loadedPatterns) {
      if (!defaultPatternIds.has(loadedPattern.id)) {
        finalPatterns.push(ensurePatternIntegrity(loadedPattern, finalPatterns.length, localDefaultPatterns));
      }
    }

    finalSettings.customPatterns = finalPatterns;
    return finalSettings;
  }
</script>

<!-- This Svelte component is used only for its module script to export utility functions. -->
<!-- It does not render any HTML. -->
