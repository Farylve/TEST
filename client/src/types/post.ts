export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface PostStats {
  comments: number;
  likes: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  categories: Category[];
  tags: Tag[];
  stats: PostStats;
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      category?: string;
      tag?: string;
      search?: string;
    };
  };
}

export interface PostFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}