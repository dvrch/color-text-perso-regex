/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Merges loaded settings with default settings and ensures all patterns are well-formed.
 * @param {object | null | undefined} loadedData - The settings data loaded from storage.
 * @param {object} defaultSettings - The default settings structure.
 * @param {Array<object>} defaultPatterns - The array of default pattern configurations.
 * @returns {object} The merged and normalized settings object.
 */
export function normalizeAndMergeSettings(loadedData, defaultSettings, defaultPatternsRef) {
  // Ensure defaultPatternsRef is used for its structure/defaults, not mutated directly
  const defaultPatterns = JSON.parse(JSON.stringify(defaultPatternsRef));
  const baseSettings = JSON.parse(JSON.stringify(defaultSettings)); // Deep copy

  if (!loadedData) {
    // If no data loaded, ensure all default patterns are correctly structured
    baseSettings.customPatterns = defaultPatterns.map((p, index) => 
        ensurePatternIntegrity(p, index, defaultPatternsRef)
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
  const defaultPatternIds = new Set(defaultPatterns.map(p => p.id));

  // Process default patterns: update from loaded or use default
  for (const defaultPattern of defaultPatterns) {
    const userVersion = loadedPatterns.find(p => p.id === defaultPattern.id);
    if (userVersion) {
      finalPatterns.push(ensurePatternIntegrity({ ...defaultPattern, ...userVersion }, -1, defaultPatternsRef, defaultPattern));
    } else {
      finalPatterns.push(ensurePatternIntegrity(defaultPattern, -1, defaultPatternsRef, defaultPattern));
    }
  }

  // Add any new patterns from loadedData that are not in defaults
  for (const loadedPattern of loadedPatterns) {
    if (!defaultPatternIds.has(loadedPattern.id)) {
      finalPatterns.push(ensurePatternIntegrity(loadedPattern, finalPatterns.length, defaultPatternsRef));
    }
  }
  
  finalSettings.customPatterns = finalPatterns;
  return finalSettings;
}


/**
 * Ensures a pattern object has all necessary fields and correct types.
 * @param {object} pattern - The pattern object to check.
 * @param {number} index - The index of the pattern (used for generating fallback IDs/names).
 * @param {Array<object>} defaultPatternsList - The list of default patterns (for reference).
 * @param {object | undefined} originalDefaultPattern - The original default pattern if this pattern is based on one.
 * @returns {object} The validated and potentially corrected pattern object.
 */
function ensurePatternIntegrity(pattern, index, defaultPatternsList, originalDefaultPattern) {
    const scaffold = {
        name: `Pattern ${index + 1}`,
        enabled: true,
        regex: "",
        flags: "gm",
        cls: "custom-dj-highlight",
        color: "#FFFFFF",
        captureGroup: ""
    };

    const base = originalDefaultPattern || defaultPatternsList.find(dp => dp.id === pattern.id) || scaffold;

    return {
        id: pattern.id || `pattern-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        name: typeof pattern.name === 'string' && pattern.name.trim() !== '' ? pattern.name : base.name,
        enabled: typeof pattern.enabled === 'boolean' ? pattern.enabled : base.enabled,
        regex: typeof pattern.regex === 'string' ? pattern.regex : base.regex,
        flags: typeof pattern.flags === 'string' ? pattern.flags : base.flags,
        cls: typeof pattern.cls === 'string' && pattern.cls.trim() !== '' ? pattern.cls : base.cls,
        color: typeof pattern.color === 'string' && pattern.color.trim() !== '' ? pattern.color : base.color,
        captureGroup: typeof pattern.captureGroup === 'string' ? pattern.captureGroup : (base.captureGroup || "")
    };
}
