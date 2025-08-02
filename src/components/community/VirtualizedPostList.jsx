'use client';

import React, { memo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PostItem = memo(({ index, style, data }) => {
  const { posts, PostCard } = data;
  const post = posts[index];

  return (
    <div style={style}>
      <div className="px-4 pb-6">
        <PostCard post={post} />
      </div>
    </div>
  );
});

PostItem.displayName = 'PostItem';

const VirtualizedPostList = memo(({ posts, PostCard, height = 600 }) => {
  const itemData = { posts, PostCard };

  if (!posts?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No posts yet. Be the first to start the conversation!
        </p>
      </Card>
    );
  }

  return (
    <List
      height={height}
      itemCount={posts.length}
      itemSize={300} // Approximate post height
      itemData={itemData}
      overscanCount={2}
    >
      {PostItem}
    </List>
  );
});

VirtualizedPostList.displayName = 'VirtualizedPostList';

export default VirtualizedPostList;
