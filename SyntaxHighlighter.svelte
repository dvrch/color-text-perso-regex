<script lang="ts">
  export let content: string = "";
  let highlighted = "";

  // Regex inspirés de dj.sublime-syntax
  const patterns = [
    { regex: /#.*$/gm, cls: "comm-dj" },
    { regex: /\b(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|[0-9]+\.[0-9]*(?:[eE][+-]?[0-9]+)?|[0-9]+)\b/g, cls: "num-dj" },
    { regex: /[\+\-\*\/]|\/\/|\\|%|@|<<|>>|&|\^|~|<|>|<=|>=|==|!=|:=|=/g, cls: "op-dj" },
    { regex: /[.,;:?!|µ]/g, cls: "ponct-dj" },
    { regex: /\bclass\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, cls: "type-dj" },
    { regex: /[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g, cls: "func-dj" },
    { regex: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, cls: "key-dj" },
    { regex: /(?:^|[.!?]\s+)[A-Z]/g, cls: "sent-dj" },
    { regex: /[A-Z]/g, cls: "caps-dj" }
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

    const allMatches: { start: number; end: number; text: string; cls: string }[] = [];
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, 'g' + pattern.regex.flags.replace('g', ''));
      let match;
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          cls: pattern.cls
        });
      }
    }

    allMatches.sort((a, b) => a.start - b.start);

    for (const match of allMatches) {
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
