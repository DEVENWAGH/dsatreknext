# Rich Text Editor Integration

## Overview

The problem creation form now includes Plate.js rich text editors for the **Description** and **Editorial** fields, providing a modern WYSIWYG editing experience.

## Features

### Rich Text Editing

- **Bold**, _Italic_, <u>Underline</u>, and `Code` formatting
- Headings (H1, H2, H3)
- Bulleted and numbered lists
- Blockquotes and code blocks
- Links and basic formatting

### Edit/Preview Mode

- **Edit Tab**: Full rich text editing with toolbar
- **Preview Tab**: Read-only preview of formatted content

### Toolbar Features

- Text formatting buttons (Bold, Italic, Underline, Code)
- Heading buttons (H1, H2, H3)
- List buttons (Bulleted, Numbered)
- Block elements (Blockquote, Code Block)

## Components

### ProblemRichTextEditor

Main rich text editor component with toolbar and formatting options.

```jsx
<ProblemRichTextEditor
  value={content}
  onChange={newValue => setContent(newValue)}
  placeholder="Enter content..."
  minHeight="200px"
/>
```

### ProblemContentPreview

Read-only preview component for displaying formatted content.

```jsx
<ProblemContentPreview content={content} className="min-h-[200px]" />
```

### ProblemEditorToolbar

Formatting toolbar with common editing options.

## Utilities

### plateUtils.js

- `plateToText(plateValue)` - Convert Plate.js format to plain text
- `textToPlate(text)` - Convert plain text to Plate.js format
- `plateToHtml(plateValue)` - Convert Plate.js format to HTML

## Usage in Forms

The rich text editors are integrated into the problem creation form with:

1. **State Management**: Separate state for rich text content
2. **Form Integration**: Automatic conversion to text for form submission
3. **Preview Mode**: Toggle between edit and preview modes
4. **Validation**: Works with existing form validation

## Example Content

The form now includes sample content demonstrating:

- Structured problem descriptions
- Editorial content with headings and lists
- Proper formatting for coding problems

## Database Storage

Content is stored as plain text in the database, converted from the rich text format using the `plateToText` utility function. This ensures compatibility with existing database schemas while providing rich editing capabilities.

## Keyboard Shortcuts

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + U**: Underline
- **Ctrl/Cmd + `**: Code
- **Markdown shortcuts**: `# ` for H1, `## ` for H2, `* ` for lists, etc.

## Customization

The editor can be customized by:

- Modifying the `ProblemEditorKit` plugin array
- Adjusting toolbar buttons in `ProblemEditorToolbar`
- Styling with Tailwind CSS classes
- Adding new formatting options or plugins
