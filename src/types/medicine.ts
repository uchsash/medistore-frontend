export type MedicineListItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  manufacturer: string;
  stock: number;
  imageUrl?: string | null;
  categoryId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;

  category?: {
    name: string;
  };

  _count?: {
    reviews: number;
  };

  reviews?: Array<{
    rating: number;
  }>;
};

export type MedicinesResponse = {
  data: MedicineListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};