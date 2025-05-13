import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePost } from '../hooks/use-post';
import { useAuth } from '../hooks/use-auth';
import { getToast } from '../hooks/use-toast';
import { Post, Block, PostType } from '../context/PostContext';
import RichTextEditor from '../components/editor/RichTextEditor';

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { fetchPostById, createPost, updatePost } = usePost();
  
  // Editor state
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([
    { type: 'paragraph', content: '' }
  ]);
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [postType, setPostType] = useState<PostType>('long');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load post data if editing an existing post
  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const post = await fetchPostById(id);
        
        if (!post) {
          setError('Post not found');
          return;
        }
        
        // Check if current user is the author
        if (currentUser?.uid !== post.author.firebaseUid) {
          setError('You do not have permission to edit this post');
          return;
        }
        
        // Set editor state from post data
        setTitle(post.title || '');
        setBlocks(post.blocks);
        setCoverImage(post.coverImage || '');
        setTags(post.tags);
        setPostType(post.type);
        setIsEditing(true);
      } catch (error: any) {
        console.error('Error loading post:', error);
        setError(error.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadPost();
    }
  }, [id, fetchPostById, currentUser]);
  
  // Handle block content change
  const handleBlockContentChange = (index: number, content: string) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], content };
    setBlocks(updatedBlocks);
  };
  
  // Add a new block
  const addBlock = (type: Block['type'], index: number) => {
    const newBlock: Block = { type, content: '' };
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index + 1, 0, newBlock);
    setBlocks(updatedBlocks);
  };
  
  // Remove a block
  const removeBlock = (index: number) => {
    if (blocks.length <= 1) return; // Keep at least one block
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index, 1);
    setBlocks(updatedBlocks);
  };
  
  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  
  // Add a tag
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (tags.includes(tag)) {
      getToast()?.showToast('Tag already exists', 'info');
      return;
    }
    if (tags.length >= 5) {
      getToast()?.showToast('Maximum 5 tags allowed', 'info');
      return;
    }
    
    setTags([...tags, tag]);
    setTagInput('');
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle tag input key press (add tag on Enter)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // Calculate reading time
  const calculateReadingTime = (): number => {
    const wordsPerMinute = 200;
    const text = blocks
      .filter(block => block.type !== 'image')
      .map(block => block.content || '')
      .join(' ');
    
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return Math.max(1, readingTime); // Minimum 1 minute
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      getToast()?.showToast('Please log in to publish', 'error');
      return;
    }
    
    // Validate form
    if (postType === 'long' && !title.trim()) {
      getToast()?.showToast('Please add a title', 'error');
      return;
    }
    
    if (!blocks.some(block => block.content && block.content.trim())) {
      getToast()?.showToast('Please add some content', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare post data
      const postData: Partial<Post> = {
        type: postType,
        title: title.trim() || undefined,
        blocks: blocks.filter(block => block.content && block.content.trim()),
        tags,
        coverImage: coverImage || undefined,
        readingTime: calculateReadingTime()
      };
      
      let result;
      
      if (isEditing && id) {
        // Update existing post
        result = await updatePost(id, postData);
        getToast()?.showToast('Post updated successfully', 'success');
      } else {
        // Create new post
        result = await createPost(postData);
        getToast()?.showToast('Post published successfully', 'success');
      }
      
      // Navigate to the post page
      navigate(`/post/${result._id}`);
    } catch (error: any) {
      console.error('Error saving post:', error);
      getToast()?.showToast(error.message || 'Failed to save post', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Render block editor based on type
  const renderBlockEditor = (block: Block, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <div className="mb-4">
            <textarea
              value={block.content || ''}
              onChange={(e) => handleBlockContentChange(index, e.target.value)}
              placeholder="Start writing..."
              className="w-full p-3 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
              rows={3}
            />
          </div>
        );
        
      case 'heading':
        return (
          <div className="mb-4">
            <input
              type="text"
              value={block.content || ''}
              onChange={(e) => handleBlockContentChange(index, e.target.value)}
              placeholder="Heading"
              className="w-full p-3 text-xl font-bold border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
            />
            <select
              value={block.level || 2}
              onChange={(e) => {
                const updatedBlocks = [...blocks];
                updatedBlocks[index] = { 
                  ...updatedBlocks[index], 
                  level: parseInt(e.target.value) 
                };
                setBlocks(updatedBlocks);
              }}
              className="mt-1 p-2 border border-outline rounded-md"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </div>
        );
        
      case 'image':
        return (
          <div className="mb-4">
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => {
                const updatedBlocks = [...blocks];
                updatedBlocks[index] = { 
                  ...updatedBlocks[index], 
                  url: e.target.value 
                };
                setBlocks(updatedBlocks);
              }}
              placeholder="Image URL"
              className="w-full p-3 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg mb-2"
            />
            <input
              type="text"
              value={block.content || ''}
              onChange={(e) => handleBlockContentChange(index, e.target.value)}
              placeholder="Image caption (optional)"
              className="w-full p-3 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
            />
            {block.url && (
              <div className="mt-2">
                <img 
                  src={block.url} 
                  alt={block.content || 'Preview'} 
                  className="max-h-64 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
        );
        
      case 'quote':
        return (
          <div className="mb-4">
            <textarea
              value={block.content || ''}
              onChange={(e) => handleBlockContentChange(index, e.target.value)}
              placeholder="Quote"
              className="w-full p-3 border-l-4 border-fg bg-hover rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
              rows={2}
            />
          </div>
        );
        
      case 'code':
        return (
          <div className="mb-4">
            <textarea
              value={block.content || ''}
              onChange={(e) => handleBlockContentChange(index, e.target.value)}
              placeholder="Code"
              className="w-full p-3 font-mono bg-hover border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
              rows={5}
            />
            <input
              type="text"
              value={block.language || ''}
              onChange={(e) => {
                const updatedBlocks = [...blocks];
                updatedBlocks[index] = { 
                  ...updatedBlocks[index], 
                  language: e.target.value 
                };
                setBlocks(updatedBlocks);
              }}
              placeholder="Language (optional, e.g. javascript, python)"
              className="w-full mt-1 p-2 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="container-narrow py-12">
        <div className="flex justify-center">
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container-narrow py-12">
        <div className="flex flex-col items-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-narrow py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Post' : 'Create New Post'}
      </h1>
      
      <form onSubmit={handleSubmit}>
        {/* Post type selector */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Post Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="short"
                checked={postType === 'short'}
                onChange={() => setPostType('short')}
                className="mr-2"
              />
              Short Post
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="long"
                checked={postType === 'long'}
                onChange={() => setPostType('long')}
                className="mr-2"
              />
              Long Article
            </label>
          </div>
        </div>
        
        {/* Title (for long posts) */}
        {postType === 'long' && (
          <div className="mb-6">
            <label htmlFor="title" className="block mb-2 font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              className="w-full p-3 text-xl border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
            />
          </div>
        )}
        
        {/* Cover image URL */}
        <div className="mb-6">
          <label htmlFor="coverImage" className="block mb-2 font-medium">
            Cover Image URL (optional)
          </label>
          <input
            id="coverImage"
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
          />
          {coverImage && (
            <div className="mt-2">
              <img 
                src={coverImage} 
                alt="Cover preview" 
                className="max-h-64 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                }}
              />
            </div>
          )}
        </div>
        
        {/* Content blocks - Notion-like Editor */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Content</label>
          <RichTextEditor 
            initialBlocks={blocks} 
            onChange={setBlocks} 
          />
        </div>
        
        {/* Tags */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Tags (up to 5)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div 
                key={tag} 
                className="flex items-center bg-hover px-2 py-1 rounded-full"
              >
                <span className="mr-1">#{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-muted hover:text-fg"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={handleTagKeyPress}
              placeholder="Add a tag"
              className="flex-1 p-2 border border-outline rounded-l-md focus:outline-none focus:ring-1 focus:ring-fg"
              disabled={tags.length >= 5}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-fg text-bg rounded-r-md hover:bg-opacity-90"
              disabled={!tagInput.trim() || tags.length >= 5}
            >
              Add
            </button>
          </div>
          <p className="text-xs text-muted mt-1">
            Press Enter to add a tag. {5 - tags.length} tags remaining.
          </p>
        </div>
        
        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-outline"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Editor;
