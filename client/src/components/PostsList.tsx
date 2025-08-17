'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Post, PostsResponse, PostFilters } from '../types/post';
import PostCard from './PostCard';
import styles from './PostsList.module.css';

interface PostsListProps {
  initialFilters?: PostFilters;
}

const PostsList: React.FC<PostsListProps> = ({ initialFilters = {} }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PostFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchPosts = useCallback(async (currentFilters: PostFilters) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      if (currentFilters.page) queryParams.append('page', currentFilters.page.toString());
      if (currentFilters.limit) queryParams.append('limit', currentFilters.limit.toString());
      if (currentFilters.category) queryParams.append('category', currentFilters.category);
      if (currentFilters.tag) queryParams.append('tag', currentFilters.tag);
      if (currentFilters.search) queryParams.append('search', currentFilters.search);

      const response = await fetch(`${API_BASE_URL}/api/posts?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PostsResponse = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchPosts(filters);
  }, [filters, fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1, // Reset to first page when searching
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка постов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button 
            onClick={() => fetchPosts(filters)}
            className={styles.retryButton}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Посты</h1>
        
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по заголовку или содержимому..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              🔍
            </button>
          </div>
        </form>

        {(filters.search || filters.category || filters.tag) && (
          <div className={styles.activeFilters}>
            <span>Активные фильтры:</span>
            {filters.search && (
              <span className={styles.filterTag}>
                Поиск: &ldquo;{filters.search}&rdquo;
              </span>
            )}
            {filters.category && (
              <span className={styles.filterTag}>
                Категория: {filters.category}
              </span>
            )}
            {filters.tag && (
              <span className={styles.filterTag}>
                Тег: {filters.tag}
              </span>
            )}
            <button onClick={clearFilters} className={styles.clearFilters}>
              Очистить все
            </button>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Посты не найдены</h3>
          <p>Попробуйте изменить параметры поиска или очистить фильтры.</p>
        </div>
      ) : (
        <>
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={styles.pageButton}
              >
                ← Предыдущая
              </button>
              
              <span className={styles.pageInfo}>
                Страница {pagination.currentPage} из {pagination.totalPages}
                <br />
                <small>Всего постов: {pagination.totalCount}</small>
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={styles.pageButton}
              >
                Следующая →
              </button>
            </div>
          )}
        </>
      )}

      {loading && posts.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

export default PostsList;