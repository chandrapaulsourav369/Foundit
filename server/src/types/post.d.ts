export type PostCategory =
  | 'PHONE'
  | 'WALLET'
  | 'ID_CARD'
  | 'PET'
  | 'KEYS'
  | 'ELECTRONICS'
  | 'BAG'
  | 'DOCUMENT'
  | 'CLOTHING'
  | 'OTHER';

export type PostStatus = 'LOST' | 'FOUND';

export type PostImageDto = {
  url: string;
  order: number;
};

export type CreatePostDto = {
  title: string;
  description: string;
  category: PostCategory;
  status: PostStatus;
  location: string;
  itemDate: Date;
  images: PostImageDto[];
  authorId: string;
};

export type UpdatePostDto = {
  title?: string;
  description?: string;
  category?: PostCategory;
  status?: PostStatus;
  location?: string;
  itemDate?: Date;
  images?: PostImageDto[];
};

export type ListPostsQuery = {
  cursor?: string;
  limit: number;
  search?: string;
  category?: PostCategory;
  status?: PostStatus;
  resolved?: boolean;
};

export type PublicPost = {
  id: string;
  title: string;
  description: string;
  category: PostCategory;
  status: PostStatus;
  isResolved: boolean;
  resolvedAt: Date | null;
  location: string;
  itemDate: Date;
  images: PostImageDto[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ListPostsResult = {
  posts: PublicPost[];
  nextCursor: string | null;
};
