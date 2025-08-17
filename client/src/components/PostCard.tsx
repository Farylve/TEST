import React from 'react';
import { Post } from '../types/post';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatContent = (content: string) => {
    // Ограничиваем длину контента для превью
    if (content.length > 200) {
      return content.substring(0, 200) + '...';
    }
    return content;
  };

  return (
    <article className={styles.postCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>{post.title}</h2>
        <div className={styles.meta}>
          <span className={styles.author}>
            {post.author.firstName} {post.author.lastName}
          </span>
          <span className={styles.date}>
            {formatDate(post.publishedAt)}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <p>{formatContent(post.content)}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.categories}>
          {post.categories.map((category) => (
            <span
              key={category.id}
              className={styles.category}
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          ))}
        </div>

        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className={styles.tag}
              style={{ borderColor: tag.color, color: tag.color }}
            >
              #{tag.name}
            </span>
          ))}
        </div>

        <div className={styles.stats}>
          <span className={styles.stat}>
            💬 {post.stats.comments}
          </span>
          <span className={styles.stat}>
            ❤️ {post.stats.likes}
          </span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;