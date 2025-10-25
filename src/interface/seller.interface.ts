// ========================= SELLER INTERFACES =========================
// seller.interface.ts
export interface SellerRegistrationRequest {
    // Personal Information
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;

    // Education Information
    university: string;
    graduationYear: number;
    major: string;
    experience: 'beginner' | 'intermediate' | 'advanced';

    // Skills and Project Types
    skills: string[];
    projectTypes: string[];

    // Optional Additional Information
    portfolio?: string;
    expectedEarnings?: '0-500' | '500-1000' | '1000-2000' | '2000+';
    motivation?: string;
    availability?: '5-10' | '10-20' | '20-30' | '30+';
}

export interface Seller {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    university: string;
    graduationYear: number;
    major: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    skills: string[];
    projectTypes: string[];
    portfolio?: string;
    expectedEarnings?: '0-500' | '500-1000' | '1000-2000' | '2000+';
    motivation?: string;
    availability?: '5-10' | '10-20' | '20-30' | '30+';
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    reviewNotes?: string;
    reviewedBy?: number;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateSellerStatusRequest {
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    reviewNotes?: string;
}

export interface SellerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    experience?: 'beginner' | 'intermediate' | 'advanced';
    skills?: string;
    sortBy?: 'createdAt' | 'firstName' | 'email' | 'status' | 'graduationYear';
    sortOrder?: 'asc' | 'desc';
}