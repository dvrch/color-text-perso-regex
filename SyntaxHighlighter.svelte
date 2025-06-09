<script lang="ts">
  export let content: string = "";
  let highlighted = "";

  // Regex inspirés de dj.sublime-syntax
  const patterns = [
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

  function escapeHtml(str: string): string {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, char => htmlEntities[char] || char);
  }

  function highlight(text: string): string {
    if (!text) return "";

    let result = "";
    let lastIndex = 0;

    const allMatches: { start: number; end: number; text: string; cls: string; }[] = [];

    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, 'g' + pattern.regex.flags.replace('g', ''));
      let match;
      while ((match = regex.exec(text)) !== null) {
        const capturedText = pattern.captureGroup !== undefined ? match[pattern.captureGroup] : match[0];
        const start = match.index + (match[0].indexOf(capturedText));
        const end = start + capturedText.length;

        allMatches.push({
          start: start,
          end: end,
          text: capturedText,
          cls: pattern.cls
        });
      }
    }

    // Sort matches by start index, then by end index to prioritize more specific matches (longer or earlier ending)
    allMatches.sort((a, b) => a.start - b.start || b.end - a.end);

    // Filter out overlapping matches, prioritizing earlier and longer matches
    const nonOverlappingMatches: typeof allMatches = [];
    let currentCoverageEnd = -1;

    for (const match of allMatches) {
        if (match.start >= currentCoverageEnd) {
            // This match does not overlap with previous accepted matches
            nonOverlappingMatches.push(match);
            currentCoverageEnd = match.end;
        } else if (match.end > currentCoverageEnd) {
            // This match overlaps, but extends further. Potentially a more inclusive match.
            // For simplicity, we'll keep the first one that covers the range most broadly.
            // A more complex solution might merge or select based on pattern specificity.
            // For now, we'll just extend coverage if this match goes beyond current accepted.
            currentCoverageEnd = match.end;
        }
    }

    for (const match of nonOverlappingMatches) {
      // Append the text before the current match, escaping it
      result += escapeHtml(text.substring(lastIndex, match.start));
      // Append the highlighted match, escaping its content
      result += `<span class="${match.cls}">${escapeHtml(match.text)}</span>`;
      lastIndex = match.end;
    }

    // Append any remaining text at the end, escaping it
    result += escapeHtml(text.substring(lastIndex));

    return result;
  }

  // Réactivité Svelte
  $: {
    try {
      highlighted = highlight(content);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      highlighted = `<span class="error">Erreur de mise à jour: ${escapeHtml(error.message)}</span>`;
    }
  }
</script>

<div class="syntax-container" role="code">
  {@html highlighted}
</div>

<style>
  .syntax-container {
    background-color: var(--background-primary);
    color: var(--text-normal);
    font-family: var(--font-monospace);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    line-height: 1.5;
  }

  /* Coloration syntaxique */
  :global(.key-dj) {
    color: #F92672;
    font-style: italic;
    font-weight: bold;
  }

  :global(.func-dj) {
    color: #A6E22E;
    font-weight: bold;
  }

  :global(.comm-dj) {
    color: #16FF00;
    font-style: italic;
  }

  :global(.type-dj) {
    color: #66D9EF;
    font-style: italic;
  }

  :global(.op-dj) {
    color: #F92672;
  }

  :global(.num-dj) {
    color: #AE81FF;
  }

  :global(.ponct-dj) {
    color: #A8F819;
  }

  :global(.sent-dj) {
    color: #66D9EF;
  }

  :global(.caps-dj) {
    color: #A6E22E;
  }

  :global(.error) {
    color: #ff5555;
    font-weight: bold;
    background-color: rgba(255, 0, 0, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 2px;
  }
</style>
