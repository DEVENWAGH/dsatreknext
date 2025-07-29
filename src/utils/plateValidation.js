// Utility functions for validating Plate.js content

/**
 * Check if a Plate.js value has actual content (not just empty paragraphs)
 * @param {Array} plateValue - The Plate.js value array
 * @returns {boolean} - True if content exists, false otherwise
 */
export const hasPlateContent = plateValue => {
  if (!plateValue || !Array.isArray(plateValue) || plateValue.length === 0) {
    return false;
  }

  return plateValue.some(node => hasNodeContent(node));
};

/**
 * Recursively check if a node has content
 * @param {Object} node - A Plate.js node
 * @returns {boolean} - True if node has content
 */
const hasNodeContent = node => {
  // Check if node has direct text content
  if (node.text && node.text.trim() !== '') {
    return true;
  }

  // Check if node has children with content
  if (node.children && Array.isArray(node.children)) {
    return node.children.some(child => hasNodeContent(child));
  }

  // Special handling for certain node types that might be considered content
  // even without text (like images, dividers, etc.)
  const contentNodeTypes = ['img', 'hr', 'media_embed', 'code_block'];
  if (contentNodeTypes.includes(node.type)) {
    return true;
  }

  return false;
};

/**
 * Extract plain text from Plate.js content
 * @param {Array} plateValue - The Plate.js value array
 * @returns {string} - Plain text content
 */
export const plateToPlainText = plateValue => {
  if (!plateValue || !Array.isArray(plateValue)) {
    return '';
  }

  return plateValue
    .map(node => extractTextFromNode(node))
    .join('\n')
    .trim();
};

/**
 * Extract text from a single node
 * @param {Object} node - A Plate.js node
 * @returns {string} - Text content of the node
 */
const extractTextFromNode = node => {
  if (node.text) {
    return node.text;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(child => extractTextFromNode(child)).join('');
  }

  return '';
};

/**
 * Check if Plate.js content is just empty paragraphs
 * @param {Array} plateValue - The Plate.js value array
 * @returns {boolean} - True if only empty paragraphs
 */
export const isEmptyPlateContent = plateValue => {
  if (!plateValue || !Array.isArray(plateValue)) {
    return true;
  }

  // Check if it's just a single empty paragraph
  if (plateValue.length === 1) {
    const node = plateValue[0];
    if (node.type === 'p' && node.children && node.children.length === 1) {
      const child = node.children[0];
      return child.text === '' || child.text === undefined;
    }
  }

  return false;
};

/**
 * Get content summary for debugging
 * @param {Array} plateValue - The Plate.js value array
 * @returns {Object} - Summary of content
 */
export const getPlateContentSummary = plateValue => {
  const hasContent = hasPlateContent(plateValue);
  const plainText = plateToPlainText(plateValue);
  const isEmpty = isEmptyPlateContent(plateValue);

  return {
    hasContent,
    isEmpty,
    plainTextLength: plainText.length,
    plainTextPreview: plainText.substring(0, 100),
    nodeCount: plateValue ? plateValue.length : 0,
    structure: plateValue
      ? plateValue.map(node => ({
          type: node.type,
          hasText: !!node.text,
          hasChildren: !!node.children,
          childrenCount: node.children ? node.children.length : 0,
        }))
      : [],
  };
};
