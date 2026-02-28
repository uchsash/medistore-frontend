export type Category = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    medicines: number;
  };
};

export type CategoryListResponse = {
  success: boolean;
  message?: string;
  data: Category[];
};