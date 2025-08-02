'use client';

import * as React from 'react';
import { jsonToPlate } from '@/utils/plateUtils';
import { EnhancedCodeBlock } from '@/components/ui/enhanced-code-block';
import { OptimizedImage } from '@/components/ui/optimized-image';

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Simple Plate content renderer that doesn't require full editor context
function PlateContentRenderer({ content, className = '' }) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return <div className={className}>No content available</div>;
  }

  // Helper to render nodes recursively, passing parent type for context
  const renderNode = (node, index, parentType = null) => {
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
            className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground border border-border/30"
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
        renderNode(child, `${index}-${childIndex}`, node.type)
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
              className="border-l-4 border-primary/50 pl-6 pr-4 py-4 my-6 italic text-muted-foreground bg-muted/20 rounded-r-lg"
            >
              <div className="not-italic text-foreground/90">{children}</div>
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
        case 'code_block': {
          // Enhanced code block with copy functionality
          const language = node.lang || 'plaintext';

          // Extract all text content from code_line children
          const extractTextFromCodeLines = children => {
            if (!children || !Array.isArray(children)) return '';

            return children
              .map(child => {
                if (child.type === 'code_line' && child.children) {
                  return child.children
                    .map(textNode => textNode.text || '')
                    .join('');
                }
                return '';
              })
              .join('\n');
          };

          const codeContent = extractTextFromCodeLines(node.children);

          // Check if this is a test case (contains Input: or Output:)
          const isTestCase =
            codeContent.includes('Input:') || codeContent.includes('Output:');

          if (isTestCase) {
            // Render test case without copy button
            return (
              <div key={index} className="my-6">
                <div className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-t-lg border-b-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Test Case
                  </span>
                </div>
                <div className="relative overflow-x-auto bg-muted/50 border border-border rounded-b-lg">
                  <pre className="p-4 text-sm font-mono leading-relaxed text-foreground overflow-x-auto">
                    <code className="text-foreground">{codeContent}</code>
                  </pre>
                </div>
              </div>
            );
          }

          return (
            <EnhancedCodeBlock key={index} language={language} className="my-6">
              {codeContent}
            </EnhancedCodeBlock>
          );
        }
        case 'code_line':
          // For individual code lines outside of code_block, render as simple code
          return (
            <div
              key={index}
              className="font-mono text-sm bg-muted/50 px-2 py-1 rounded"
            >
              {children}
            </div>
          );
        case 'hr':
          return (
            <hr
              key={index}
              className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60"
            />
          );
        case 'table':
          return (
            <div key={index} className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm bg-card/50">
                <tbody>{children}</tbody>
              </table>
            </div>
          );
        case 'tr':
          return (
            <tr
              key={index}
              className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
            >
              {children}
            </tr>
          );
        case 'th':
          return (
            <th
              key={index}
              className="border-r border-border last:border-r-0 px-4 py-3 bg-muted/30 font-semibold text-left text-foreground text-sm"
            >
              {children}
            </th>
          );
        case 'td':
          return (
            <td
              key={index}
              className="border-r border-border last:border-r-0 px-4 py-3 text-foreground text-sm"
            >
              {children}
            </td>
          );
        case 'img': {
          if (node.src) {
            return (
              <OptimizedImage
                key={index}
                src={node.src}
                alt={node.alt || 'Problem illustration'}
                className="mx-auto my-6"
                fallbackText={node.alt}
              />
            );
          }
          return null;
        }

        case 'video': {
          if (node.url) {
            const videoId = getYouTubeVideoId(node.url);
            if (videoId) {
              return (
                <div key={index} className="my-8">
                  <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg bg-muted border border-border">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video"
                      className="absolute inset-0 w-full h-full border-0"
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
                  className="my-6 p-4 border border-border rounded-lg bg-muted/20"
                >
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <span className="text-lg">📹</span>
                    <span>Video: {node.url}</span>
                  </a>
                </div>
              );
            }
          }
          return null;
        }
        case 'p': {
          // If parent is a list, render as <li> to avoid <p> inside <p>
          if (parentType === 'ul' || parentType === 'ol') {
            return (
              <li key={index} className="mb-1 text-foreground">
                {children}
              </li>
            );
          }
          // Handle paragraphs with proper styling based on node properties
          const pStyle = {};
          if (node.align) pStyle.textAlign = node.align;
          if (node.indent) pStyle.paddingLeft = `${node.indent * 1.5}rem`;

          const pClassNames = ['mb-4 last:mb-0 text-foreground'];
          // Check if this is a list item paragraph
          const isListItem =
            node.listStyleType !== undefined &&
            parentType !== 'ul' &&
            parentType !== 'ol';

          if (isListItem) {
            // Use div instead of p for list items to avoid nesting p tags
            const listItemClassNames = [
              'mb-4 last:mb-0 text-foreground list-item ml-6',
            ];
            if (node.listStyleType === '') {
              listItemClassNames.push('list-disc');
            }

            return (
              <div
                key={index}
                className={listItemClassNames.join(' ')}
                style={pStyle}
              >
                {children}
              </div>
            );
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

export function ProblemDisplay({ description, editorial, className = '' }) {
  const descriptionContent = React.useMemo(() => {
    return jsonToPlate(description);
  }, [description]);

  const editorialContent = React.useMemo(() => {
    return jsonToPlate(editorial);
  }, [editorial]);

  return (
    <div className={className}>
      {/* Problem Description */}
      <div className="prose prose-sm max-w-none mb-6">
        <PlateContentRenderer
          content={descriptionContent}
          className="text-sm"
        />
      </div>

      {/* Editorial (if provided) */}
      {editorial && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Editorial</h3>
          <div className="prose prose-sm max-w-none">
            <PlateContentRenderer
              content={editorialContent}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
