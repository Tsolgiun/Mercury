import React from 'react';
import { Post, Block } from '../../context/PostContext';

interface ArticleViewProps {
  post: Post;
}

const ArticleView: React.FC<ArticleViewProps> = ({ post }) => {
  // Render a block based on its type
  const renderBlock = (block: Block, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-6 leading-long">
            {block.content}
          </p>
        );
        
      case 'heading':
        switch (block.level) {
          case 1:
            return (
              <h1 key={index} className="text-3xl font-bold mb-6 mt-8">
                {block.content}
              </h1>
            );
          case 2:
            return (
              <h2 key={index} className="text-2xl font-bold mb-4 mt-8">
                {block.content}
              </h2>
            );
          case 3:
            return (
              <h3 key={index} className="text-xl font-bold mb-4 mt-6">
                {block.content}
              </h3>
            );
          default:
            return (
              <h4 key={index} className="text-lg font-bold mb-4 mt-6">
                {block.content}
              </h4>
            );
        }
        
      case 'image':
        return (
          <figure key={index} className="mb-6">
            <img 
              src={block.url} 
              alt={block.content || 'Image'} 
              className="w-full rounded-md"
            />
            {block.content && (
              <figcaption className="text-sm text-muted text-center mt-2">
                {block.content}
              </figcaption>
            )}
          </figure>
        );
        
      case 'list':
        return (
          <ul key={index} className="list-disc pl-6 mb-6 space-y-2">
            {block.items?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        
      case 'quote':
        return (
          <blockquote 
            key={index} 
            className="border-l-4 border-fg pl-4 italic mb-6"
          >
            {block.content}
          </blockquote>
        );
        
      case 'code':
        return (
          <pre 
            key={index} 
            className="bg-hover p-4 rounded-md overflow-x-auto mb-6"
          >
            <code className="text-sm font-mono">
              {block.content}
            </code>
          </pre>
        );
        
      default:
        return null;
    }
  };

  return (
    <article className="article-content">
      {post.blocks.map((block, index) => renderBlock(block, index))}
    </article>
  );
};

export default ArticleView;
