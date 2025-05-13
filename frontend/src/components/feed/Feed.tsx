import React from 'react';
import { Post } from '../../context/PostContext';
import FeedCard from './FeedCard';

interface FeedProps {
  posts: Post[];
}

const Feed: React.FC<FeedProps> = ({ posts }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Feed;
