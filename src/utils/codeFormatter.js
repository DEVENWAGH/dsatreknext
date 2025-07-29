export const formatRuby = code => {
  // Basic Ruby formatting: indent after 'do', 'def', 'class', 'module', '{', and decrease after 'end', '}', etc.
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    // Decrease indent for 'end' or closing brace
    if (/^(end|\})/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push('    '.repeat(indentLevel) + trimmed);

    // Increase indent after block starters
    if (
      /^(def|class|module|do|if|unless|while|for|case|begin|\{)/.test(
        trimmed
      ) ||
      trimmed.endsWith('do') ||
      trimmed.endsWith('{')
    ) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
};

export const formatCsharp = code => {
  // Basic C# formatting: similar to C++/Java
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    // Decrease indent for closing braces
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push('    '.repeat(indentLevel) + trimmed);

    // Increase indent after opening braces
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
};
// Simple code formatters for languages not supported by Prettier

export const formatPython = code => {
  // Basic Python formatting - proper indentation
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    // Decrease indent for closing statements
    if (trimmed.match(/^(except|elif|else|finally):/)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add proper indentation
    formattedLines.push('    '.repeat(indentLevel) + trimmed);

    // Increase indent after colon
    if (trimmed.endsWith(':')) {
      indentLevel++;
    }

    // Decrease indent after certain statements
    if (
      trimmed.match(/^(break|continue|pass|return|raise)/) &&
      !trimmed.endsWith(':')
    ) {
      // These don't change indentation
    }
  }

  return formattedLines.join('\n');
};

export const formatCpp = code => {
  // Basic C++ formatting
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    // Decrease indent for closing braces
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add proper indentation
    formattedLines.push('    '.repeat(indentLevel) + trimmed);

    // Increase indent after opening braces
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
};

export const formatJava = code => {
  // Basic Java formatting (similar to C++)
  return formatCpp(code);
};

export const formatGo = code => {
  // Basic Go formatting
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    // Decrease indent for closing braces
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add proper indentation (Go uses tabs, but we'll use spaces for consistency)
    formattedLines.push('    '.repeat(indentLevel) + trimmed);

    // Increase indent after opening braces
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
};

export const formatRust = code => {
  // Basic Rust formatting (similar to C++)
  return formatCpp(code);
};
