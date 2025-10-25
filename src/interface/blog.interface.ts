// interface/blog.interface.ts
export interface Blog {
    id: number;
    title: string;
    content: string;
    image?: string;
    videoUrl?: string;
    categoryId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBlogInput 
       extends Omit<Blog, 'id'> { } // reuse User but omit `id` for create



