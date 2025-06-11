

<script lang="ts">
  import type { CustomPatternConfig } from './main'; // Import the interface

  export let content: string = "";
  export let customPatterns: CustomPatternConfig[] = []; // This will now include default and user patterns
  export let enableGlobalSyntaxHighlighting: boolean = true;

  let highlighted: string = "";

  // builtInPatterns array is removed. All patterns come from the customPatterns prop.

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
    // priority: number; // Priority can be removed if all patterns are treated equally based on sort order
  }
  
  function highlightContent(text: string, localCustomPatterns: CustomPatternConfig[], globalEnable: boolean): string {
    if (!text || !globalEnable) return escapeHtml(text);

    let result = "";
    let lastIndex = 0;
    const allMatches: Match[] = [];
    
    // Process all patterns from localCustomPatterns (which now includes defaults)
    if (localCustomPatterns) {
      localCustomPatterns.forEach(patternConfig => {
        if (!patternConfig.enabled || !patternConfig.regex) return;
        try {
          const regex = new RegExp(patternConfig.regex, patternConfig.flags || 'g');
          let match;
          while ((match = regex.exec(text)) !== null) {
            const captureGroupIndex = patternConfig.captureGroup ? parseInt(patternConfig.captureGroup, 10) : undefined;
            // Ensure match[0] exists and is not empty before trying to access indexOf
            if (match[0] === undefined || match[0].length === 0) continue;

            const capturedText = captureGroupIndex !== undefined && !isNaN(captureGroupIndex) && match[captureGroupIndex] !== undefined ? match[captureGroupIndex] : match[0];
            
            // If capturedText (even after falling back to match[0]) is undefined or empty, skip this match.
            // This can happen if a capture group exists but captures an empty string, or if regex itself is problematic.
            if (capturedText === undefined || capturedText.length === 0) continue; 

            const start = match.index + (match[0].indexOf(capturedText)); // indexOf could be -1 if capturedText is not part of match[0] (should not happen with valid CG)
            if (start < match.index) continue; // Safety check if indexOf returned -1 and caused an issue.

            const end = start + capturedText.length;

            allMatches.push({
              start: start,
              end: end,
              text: capturedText,
              cls: patternConfig.cls || 'custom-highlight',
              style: patternConfig.color ? `color: ${patternConfig.color};` : ''
              // priority: 2 // Or remove priority if not differentiating anymore
            });
          }
        } catch (e) {
          console.warn(`SyntaxHighlighter: Invalid regex for pattern "${patternConfig.name || patternConfig.regex}":`, e);
        }
      });
    }

    // Sort matches: by start index, then by end index (longer matches first if at same start)
    allMatches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      // If priorities were kept, sort by b.priority - a.priority here
      return b.end - a.end; // Longer match first
    });
    
    const nonOverlappingMatches: Match[] = [];
    let currentCoverageEnd = -1;

    for (const match of allMatches) {
      if (match.start >= currentCoverageEnd) {
        nonOverlappingMatches.push(match);
        currentCoverageEnd = match.end;
      }
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
    white-space: pre-wrap; 
    word-wrap: break-word; 
    line-height: 1.6;
    font-size: var(--font-ui-small, 0.9em);
  }

  /* Default syntax highlighting styles (for patterns using these classes) */
  /* These can be overridden by inline styles from pattern.color */
  :global(.key-dj) { color: #F92672; font-weight: bold; }
  :global(.func-dj) { color: #A6E22E; }
  :global(.comm-dj) { color: #75715E; font-style: italic; } /* Adjusted to Monokai comment color */
  :global(.type-dj) { color: #66D9EF; font-style: italic; }
  :global(.op-dj) { color: #F92672; } /* Monokai operator color */
  :global(.num-dj) { color: #AE81FF; }
  :global(.ponct-dj) { color: var(--text-muted); } /* Defaulting to muted, can be overridden */
  :global(.sent-dj) { color: #E6DB74; } /* Monokai string/char color, good for sentences */
  :global(.caps-dj) { color: #A6E22E; } /* Reusing function color for emphasis */
  
  :global(.delim-g-open-dj) { /* color specified by pattern */ }
  :global(.delim-g-close-dj) { /* color specified by pattern */ }
  :global(.cont-dj) { /* color specified by pattern, e.g. #E6DB74 */ }


  /* Generic class for custom highlights if no specific class is given by user, or as a fallback */
  :global(.custom-highlight) {
    /* Base style, color will be overridden by inline style if provided */
  }
   /* Default class for newly added patterns if user doesn't specify one */
  :global(.custom-dj-highlight) {
    /* Can have a default appearance or be styled by inline color */
  }

  :global(.error-dj) {
    color: var(--text-error, #ff5555);
    font-weight: bold;
    background-color: var(--background-modifier-error, rgba(255, 0, 0, 0.1));
    padding: 0.2em 0.4em;
    border-radius: var(--radius-s, 2px);
  }
</style>
