// Utility functions for Plate.js editor content conversion

export const plateToText = plateValue => {
  if (!plateValue || !Array.isArray(plateValue)) return '';

  return plateValue
    .map(node => extractTextFromNode(node))
    .join('\n')
    .trim();
};

export const textToPlate = text => {
  if (!text || typeof text !== 'string') {
    return [{ type: 'p', children: [{ text: '' }] }];
  }

  return text.split('\n').map(line => ({
    type: 'p',
    children: [{ text: line }],
  }));
};

export const plateToJson = plateValue => {
  if (!plateValue || !Array.isArray(plateValue)) return '[]';
  return JSON.stringify(plateValue);
};

export const jsonToPlate = jsonValue => {
  // Handle null or undefined
  if (!jsonValue) {
    return [{ type: 'p', children: [{ text: '' }] }];
  }

  // If it's already an array (object), validate and return it
  if (Array.isArray(jsonValue)) {
    // Validate the array has proper structure
    if (jsonValue.length === 0) {
      return [{ type: 'p', children: [{ text: '' }] }];
    }

    // Check if each item has the required structure
    const isValid = jsonValue.every(
      item =>
        item &&
        typeof item === 'object' &&
        typeof item.type === 'string' &&
        Array.isArray(item.children)
    );

    if (isValid) {
      return jsonValue;
    }

    // If not valid, convert to text
    return [{ type: 'p', children: [{ text: JSON.stringify(jsonValue) }] }];
  }

  // If it's a string, try to parse it
  if (typeof jsonValue === 'string') {
    // If it's an empty string, return default
    if (jsonValue.trim() === '') {
      return [{ type: 'p', children: [{ text: '' }] }];
    }

    try {
      const parsed = JSON.parse(jsonValue);

      // If parsed result is an array, validate it recursively
      if (Array.isArray(parsed)) {
        return jsonToPlate(parsed);
      }

      // If it's not an array after parsing, treat as text
      return [{ type: 'p', children: [{ text: jsonValue }] }];
    } catch {
      // If parsing fails, treat as plain text
      return [{ type: 'p', children: [{ text: jsonValue }] }];
    }
  }

  // For any other type, convert to string and wrap in paragraph
  return [{ type: 'p', children: [{ text: String(jsonValue) }] }];
};

const extractTextFromNode = node => {
  if (typeof node === 'string') return node;
  if (node.text !== undefined) return node.text;
  if (node.children) {
    return node.children.map(child => extractTextFromNode(child)).join('');
  }
  return '';
};
