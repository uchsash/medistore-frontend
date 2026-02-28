import * as z from "zod";

export const addMedicineSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  manufacturer: z.string().min(2, { message: "Manufacturer must be at least 2 characters." }),

  // Keep as string in the form, convert in submit (avoids resolver mismatch issues completely)
  price: z.string().min(1, { message: "Price is required." }),
  stock: z.string().min(1, { message: "Stock is required." }),

  categoryId: z.string().min(1, { message: "Category is required." }),
  imageUrl: z.string().optional(), // validate in submit only if non-empty
});

export type AddMedicineValues = z.infer<typeof addMedicineSchema>;