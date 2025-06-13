<script>
  // No longer importing CustomPatternConfig from './main'
  // Props are now plain JavaScript, types are not explicitly declared here.
  export let content = "";
  export let customPatterns = []; // Expects an array of pattern objects
  export let enableGlobalSyntaxHighlighting = true;
  export let defaultTextColor = '#808080'; // Add this new prop with a default value

  let highlighted = "";

  // Add this console.log to inspect the value of defaultTextColor
  $: console.log('SyntaxHighlighter: defaultTextColor is', defaultTextColor);

  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return String(str).replace(/[&<>"']/g, char => htmlEntities[char] || char);
  }
  
  function highlightContent(text, localCustomPatterns, globalEnable) {
    if (!text || !globalEnable) return escapeHtml(text);

    let result = "";
    let lastIndex = 0;
    const allMatches = []; // Match interface is implicitly defined by usage
    
    if (localCustomPatterns) {
      localCustomPatterns.forEach(patternConfig => {
        if (!patternConfig.enabled || !patternConfig.regex) return;
        try {
          const regex = new RegExp(patternConfig.regex, patternConfig.flags || 'g');
          let match;
          while ((match = regex.exec(text)) !== null) {
            const captureGroupIndex = patternConfig.captureGroup ? parseInt(patternConfig.captureGroup, 10) : undefined;
            const capturedText = captureGroupIndex !== undefined && !isNaN(captureGroupIndex) && match[captureGroupIndex] !== undefined ? match[captureGroupIndex] : match[0];
            
            if (capturedText === undefined || capturedText.length === 0) continue; 

            const start = match.index + (match[0].indexOf(capturedText));
            const end = start + capturedText.length;

            allMatches.push({
              start: start,
              end: end,
              text: capturedText,
              cls: patternConfig.cls || 'custom-highlight',
              style: patternConfig.color ? `color: ${patternConfig.color};` : ''
            });
          }
        } catch (e) {
          console.warn(`SyntaxHighlighter: Invalid regex for pattern "${patternConfig.name || patternConfig.regex}":`, e);
        }
      });
    }

    allMatches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.end - a.end; 
    });
    
    const nonOverlappingMatches = [];
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
    } catch (error) {
      console.error("SyntaxHighlighter.svelte - Erreur de mise à jour:", error);
      highlighted = `<span class="error-dj">Erreur de mise à jour: ${escapeHtml(error.message)}</span>`;
    }
  }
</script>

<div class="syntax-container-dj" role="region" aria-label="Highlighted Code Content">
  <span style="color: {defaultTextColor} !important;">{@html highlighted}</span>
</div>

<style>
  .syntax-container-dj {
    background-color: var(--background-primary);
    /* The color is now set via the style attribute directly on the div */
    font-family: var(--font-monospace, monospace);
    padding: 1em;
    border-radius: var(--radius-m, 4px);
    overflow-x: auto;
    white-space: pre-wrap; 
    word-wrap: break-word; 
    line-height: 1.6;
    font-size: var(--font-ui-small, 0.9em);
  }

  /* Remove these as the color is now set inline */
  /* .syntax-container-dj { */
  /*   color: var(--default-text-color, var(--text-normal, #808080)); */
  /* } */
  
  /* :global(.syntax-container-dj) { */
  /*   color: var(--default-text-color, var(--text-normal, #808080)); */
  /* } */

  /* Remove this global CSS variable definition from here, as it won't apply globally */
  /* :root { */
  /*   --default-text-color: #808080; */
  /* } */

  /* Adjust existing styles if they conflict */
  :global(.key-dj) { color: #F92672; font-weight: bold; }
  :global(.func-dj) { color: #A6E22E; }
  :global(.comm-dj) { color: #75715E; font-style: italic; }
  :global(.type-dj) { color: #66D9EF; font-style: italic; }
  :global(.op-dj) { color: #FD971F; }
  :global(.num-dj) { color: #AE81FF; }
  :global(.ponct-dj) { color: var(--text-muted); }
  :global(.sent-dj) { color: #E6DB74; }
  :global(.caps-dj) { color: #A6E22E; }
  :global(.custom-highlight) {}
  :global(.custom-dj-highlight) {}
  :global(.error-dj) {
    color: var(--text-error, #ff5555);
    font-weight: bold;
    background-color: var(--background-modifier-error, rgba(255, 0, 0, 0.1));
    padding: 0.2em 0.4em;
    border-radius: var(--radius-s, 2px);
  }
</style>