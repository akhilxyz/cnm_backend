import { Project } from "./project.interface";
import { User } from "./user.interface";

// Enhanced Interfaces
export interface Purchase {
  id: number;
  buyerId: number;
  projectId: number;
  sellerId: number;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'wallet';
  transactionId?: string;
  paymentGatewayResponse?: object;
  purchaseDate?: Date;
  downloadCount: number;
  maxDownloads: number;
  isRefunded: boolean;
  refundReason?: string;
  hasRated: boolean;
  ratingId?: number;
  licenseType: 'personal' | 'commercial' | 'extended';
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  project?: Project;
  buyer?: User;
  seller?: User;
  rating?: Rating;
}

export interface Rating {
  id: number;
  buyerId: number;
  sellerId: number;
  projectId: number;
  purchaseId: number;
  rating: number;
  review?: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  buyer?: User;
  seller?: User;
  project?: Project;
  purchase?: Purchase;
}

export interface CreatePurchaseInput {
  projectId: number;
  paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'wallet';
  amount: number;
  currency?: string;
  licenseType?: 'personal' | 'commercial' | 'extended';
}

export interface CreateRatingInput {
  purchaseId: number;
  rating: number;
  review?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  clientSecret?: string;
  orderId?: string;
  keyId?: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}