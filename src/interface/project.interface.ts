// project.interface.ts
export interface Project {
    id: number;
    title: string;
    description: string;
    shortDescription: string;
    tags: string[];
    techStack: string[];
    price: number;
    isFree: boolean;
    sellerId: number;
    sellerName?: string;
    sellerAvatar?: string;
    githubUrl?: string;
    demoUrl?: string;
    downloadUrl?: string;
    images: string[];
    downloads: number;
    rating: number;
    isActive: boolean;
    reviews?: Review[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Review {
    id: number;
    projectId: number;
    userId: number;
    userName?: string;
    rating: number;
    comment: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProjectInput {
    title: string;
    description: string;
    shortDescription: string;
    tags: string[];
    techStack: string[];
    price: number;
    isFree: boolean;
    githubUrl?: string;
    demoUrl?: string;
    downloadUrl?: string;
    images: string[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
    id: number;
}

export interface CreateReviewInput {
    projectId: number;
    rating: number;
    comment: string;
}


export interface UserDashboardData {
  totalProjects: number;
  totalDownloads: number;
  totalEarnings: number;
  averageRating: number;
}