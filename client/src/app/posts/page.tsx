import React from 'react';
import PostsList from '../../components/PostsList';
import Layout from '../../components/Layout';

const PostsPage: React.FC = () => {
  return (
    <Layout>
      <div style={{ padding: '20px 0' }}>
        <PostsList />
      </div>
    </Layout>
  );
};

export default PostsPage;