'use client';

import * as React from 'react';

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Simple Plate content renderer that doesn't require full editor context
function PlateContentRenderer({ content, className = '' }) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return <div className={className}>No content to preview</div>;
  }

  const renderNode = (node, index) => {
    if (typeof node === 'string') {
      return node;
    }

    if (node.text !== undefined) {
      let textElement = node.text;

      // Apply text formatting with proper dark/light mode styling
      if (node.bold) textElement = <strong key={index}>{textElement}</strong>;
      if (node.italic) textElement = <em key={index}>{textElement}</em>;
      if (node.underline) textElement = <u key={index}>{textElement}</u>;
      if (node.code) {
        textElement = (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded text-sm font-mono bg-muted border text-foreground"
            style={{
              backgroundColor: node.backgroundColor || undefined,
              color: node.color || undefined,
              fontSize: node.fontSize || undefined,
              fontFamily: node.fontFamily || undefined,
            }}
          >
            {textElement}
          </code>
        );
      }

      // Handle superscript
      if (node.superscript) {
        textElement = <sup key={index}>{textElement}</sup>;
      }

      return textElement;
    }

    if (node.children && Array.isArray(node.children)) {
      const children = node.children.map((child, childIndex) =>
        renderNode(child, `${index}-${childIndex}`)
      );

      switch (node.type) {
        case 'h1':
          return (
            <h1 key={index} className="text-3xl font-bold mb-6 text-foreground">
              {children}
            </h1>
          );
        case 'h2':
          return (
            <h2 key={index} className="text-2xl font-bold mb-4 text-foreground">
              {children}
            </h2>
          );
        case 'h3':
          return (
            <h3 key={index} className="text-xl font-bold mb-3 text-foreground">
              {children}
            </h3>
          );
        case 'h4':
          return (
            <h4 key={index} className="text-lg font-bold mb-2 text-foreground">
              {children}
            </h4>
          );
        case 'h5':
          return (
            <h5
              key={index}
              className="text-base font-bold mb-2 text-foreground"
            >
              {children}
            </h5>
          );
        case 'h6':
          return (
            <h6 key={index} className="text-sm font-bold mb-2 text-foreground">
              {children}
            </h6>
          );
        case 'blockquote':
          return (
            <blockquote
              key={index}
              className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground bg-muted/20 py-2 rounded-r"
            >
              {children}
            </blockquote>
          );
        case 'ul':
          return (
            <ul key={index} className="list-disc pl-6 mb-4 text-foreground">
              {children}
            </ul>
          );
        case 'ol':
          return (
            <ol key={index} className="list-decimal pl-6 mb-4 text-foreground">
              {children}
            </ol>
          );
        case 'li':
          return (
            <li key={index} className="mb-1 text-foreground">
              {children}
            </li>
          );
        case 'code_block':
        case 'code_line':
          return (
            <div
              key={index}
              className="bg-muted border rounded p-3 overflow-x-auto mb-4 font-mono text-sm"
            >
              <code className="text-foreground">{children}</code>
            </div>
          );
        case 'hr':
          return <hr key={index} className="my-6 border-border" />;
        case 'table':
          return (
            <div key={index} className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border rounded-lg">
                <tbody>{children}</tbody>
              </table>
            </div>
          );
        case 'tr':
          return (
            <tr key={index} className="border-b border-border">
              {children}
            </tr>
          );
        case 'th':
          return (
            <th
              key={index}
              className="border border-border px-4 py-2 bg-muted font-semibold text-left text-foreground"
            >
              {children}
            </th>
          );
        case 'td':
          return (
            <td
              key={index}
              className="border border-border px-4 py-2 text-foreground"
            >
              {children}
            </td>
          );
        case 'video': {
          if (node.url) {
            const videoId = getYouTubeVideoId(node.url);
            if (videoId) {
              return (
                <div key={index} className="my-6">
                  <div className="aspect-video w-full max-w-2xl mx-auto">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video"
                      className="w-full h-full rounded-lg border border-border"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="my-4 p-4 border border-border rounded bg-muted/20"
                >
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    📹 Video: {node.url}
                  </a>
                </div>
              );
            }
          }
          return null;
        }
        case 'p': {
          // Handle paragraphs with proper styling based on node properties
          const pStyle = {};
          if (node.align) pStyle.textAlign = node.align;
          if (node.indent) pStyle.paddingLeft = `${node.indent * 1.5}rem`;

          const pClassNames = ['mb-4 last:mb-0 text-foreground'];
          if (node.listStyleType !== undefined) {
            // This is likely a list item disguised as a paragraph
            pClassNames.push('list-item ml-6');
            if (node.listStyleType === '') {
              pClassNames.push('list-disc');
            }
          }

          return (
            <p key={index} className={pClassNames.join(' ')} style={pStyle}>
              {children}
            </p>
          );
        }
        default:
          return (
            <div key={index} className="mb-4 last:mb-0 text-foreground">
              {children}
            </div>
          );
      }
    }

    return null;
  };

  return (
    <div className={className}>
      {content.map((node, index) => renderNode(node, index))}
    </div>
  );
}

export function ProblemContentPreview({ content, className = '' }) {
  if (!content) {
    return (
      <div className={`text-muted-foreground p-4 ${className}`}>
        No content to preview
      </div>
    );
  }

  return (
    <div
      className={`prose prose-sm max-w-none p-4 border rounded-md bg-muted/20 ${className}`}
    >
      <PlateContentRenderer content={content} />
    </div>
  );
}
