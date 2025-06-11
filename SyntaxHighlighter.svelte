
<script lang="ts">
  import type { CustomPatternConfig } from './main'; // Import the interface

  export let content: string = "";
  export let customPatterns: CustomPatternConfig[] = [];
  export let enableGlobalSyntaxHighlighting: boolean = true;

  let highlighted: string = "";

  // Built-in patterns (can be kept as a base)
  const builtInPatterns = [
    { regex: /#.*$/gm, cls: "comm-dj" },
    { regex: /\b(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|[0-9]+\.[0-9]*(?:[eE][+-]?[0-9]+)?|[0-9]+)\b/g, cls: "num-dj" },
    { regex: /[\+\-\*\/]|\/\/|\\|%|@|<<|>>|&|\^|~|<|>|<=|>=|==|!=|:=|=/g, cls: "op-dj" },
    { regex: /[.,;:?!|µ]/g, cls: "ponct-dj" },
    { regex: /\bclass\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, cls: "type-dj", captureGroup: 1 },
    { regex: /[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g, cls: "func-dj" },
    { regex: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, cls: "key-dj" },
    { regex: /(?:^|[.!?]\s+)([A-Z])/g, cls: "sent-dj", captureGroup: 1 },
    { regex: /([A-Z])/g, cls: "caps-dj", captureGroup: 1 }
  ];

  function escapeHtml(str: string | undefined | null): string {
    if (str === undefined || str === null) return "";
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return String(str).replace(/[&<>"']/g, char => htmlEntities[char] || char);
  }

  interface Match {
    start: number;
    end: number;
    text: string;
    cls?: string;
    style?: string;
    priority: number; // For sorting: custom patterns might have higher priority
  }
  
  function highlightContent(text: string, localCustomPatterns: CustomPatternConfig[], globalEnable: boolean): string {
    if (!text || !globalEnable) return escapeHtml(text);

    let result = "";
    let lastIndex = 0;
    const allMatches: Match[] = [];

    // Process built-in patterns
    builtInPatterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex.source, 'g' + pattern.regex.flags.replace('g', ''));
      let match;
      while ((match = regex.exec(text)) !== null) {
        const captureGroupIndex = typeof pattern.captureGroup === 'string' ? parseInt(pattern.captureGroup,10) : pattern.captureGroup;
        const capturedText = captureGroupIndex !== undefined && !isNaN(captureGroupIndex) && match[captureGroupIndex] !== undefined ? match[captureGroupIndex] : match[0];
        const start = match.index + (match[0].indexOf(capturedText));
        const end = start + capturedText.length;
        if (capturedText.length === 0) continue; // Skip empty matches

        allMatches.push({
          start: start,
          end: end,
          text: capturedText,
          cls: pattern.cls,
          priority: 1 // Lower priority for built-in
        });
      }
    });
    
    // Process custom patterns
    if (localCustomPatterns) {
      localCustomPatterns.forEach(customPattern => {
        if (!customPattern.enabled || !customPattern.regex) return;
        try {
          const regex = new RegExp(customPattern.regex, customPattern.flags || 'g');
          let match;
          while ((match = regex.exec(text)) !== null) {
            const captureGroupIndex = customPattern.captureGroup ? parseInt(customPattern.captureGroup, 10) : undefined;
            const capturedText = captureGroupIndex !== undefined && !isNaN(captureGroupIndex) && match[captureGroupIndex] !== undefined ? match[captureGroupIndex] : match[0];
            
            if (capturedText === undefined || capturedText.length === 0) continue; // Skip empty or undefined matches

            const start = match.index + (match[0].indexOf(capturedText));
            const end = start + capturedText.length;

            allMatches.push({
              start: start,
              end: end,
              text: capturedText,
              cls: customPattern.cls || 'custom-highlight',
              style: customPattern.color ? `color: ${customPattern.color};` : '',
              priority: 2 // Higher priority for custom
            });
          }
        } catch (e) {
          console.warn(`SyntaxHighlighter: Invalid regex for custom pattern "${customPattern.regex}":`, e);
        }
      });
    }

    // Sort matches: by start index, then by priority (custom over built-in), then by end index (longer matches first if at same start)
    allMatches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      if (a.priority !== b.priority) return b.priority - a.priority; // Higher priority first
      return b.end - a.end; // Longer match first
    });
    
    const nonOverlappingMatches: Match[] = [];
    let currentCoverageEnd = -1;

    for (const match of allMatches) {
      if (match.start >= currentCoverageEnd) {
        nonOverlappingMatches.push(match);
        currentCoverageEnd = match.end;
      }
      // Simple overlap handling: if a higher priority or longer match starts at the same point, it would have been sorted earlier.
      // This greedy approach takes the first valid match. More complex scenarios might need refinement.
    }

    for (const match of nonOverlappingMatches) {
      result += escapeHtml(text.substring(lastIndex, match.start));
      const styleAttr = match.style ? ` style="${escapeHtml(match.style)}"` : "";
      const classAttr = match.cls ? ` class="${escapeHtml(match.cls)}"` : "";
      result += `<span${classAttr}${styleAttr}>${escapeHtml(match.text)}</span>`;
      lastIndex = match.end;
    }

    result += escapeHtml(text.substring(lastIndex));
    return result;
  }

  $: {
    try {
      highlighted = highlightContent(content, customPatterns, enableGlobalSyntaxHighlighting);
    } catch (error: any) {
      console.error("SyntaxHighlighter.svelte - Erreur de mise à jour:", error);
      highlighted = `<span class="error-dj">Erreur de mise à jour: ${escapeHtml(error.message)}</span>`;
    }
  }
</script>

<div class="syntax-container-dj" role="region" aria-label="Highlighted Code Content">
  {@html highlighted}
</div>

<style>
  .syntax-container-dj {
    background-color: var(--background-primary);
    color: var(--text-normal);
    font-family: var(--font-monospace, monospace);
    padding: 1em;
    border-radius: var(--radius-m, 4px);
    overflow-x: auto;
    white-space: pre-wrap; /* Allows wrapping and preserves spaces/tabs */
    word-wrap: break-word; /* Break long words to prevent overflow */
    line-height: 1.6;
    font-size: var(--font-ui-small, 0.9em);
  }

  /* Default syntax highlighting styles (for built-in patterns or custom patterns without specific colors) */
  :global(.key-dj) { color: #F92672; font-weight: bold; }
  :global(.func-dj) { color: #A6E22E; }
  :global(.comm-dj) { color: #75715E; font-style: italic; } /* Adjusted for better visibility on dark themes */
  :global(.type-dj) { color: #66D9EF; font-style: italic; }
  :global(.op-dj) { color: #FD971F; } /* Orange for operators */
  :global(.num-dj) { color: #AE81FF; }
  :global(.ponct-dj) { color: var(--text-muted); } /* More subtle punctuation */
  :global(.sent-dj) { color: #E6DB74; } /* Yellow for sentences/strings often */
  :global(.caps-dj) { color: #A6E22E; }

  /* Generic class for custom highlights if no specific class is given by user, or as a fallback */
  :global(.custom-highlight) {
    /* Base style, color will be overridden by inline style if provided */
  }

  :global(.error-dj) {
    color: var(--text-error, #ff5555);
    font-weight: bold;
    background-color: var(--background-modifier-error, rgba(255, 0, 0, 0.1));
    padding: 0.2em 0.4em;
    border-radius: var(--radius-s, 2px);
  }
</style>
