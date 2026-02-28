import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MedicineListItem } from "@/types/medicine";

function calcAvgRating(reviews: Array<{ rating: number }> | undefined) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function MedicineCard({ medicine }: { medicine: MedicineListItem }) {
  const avg = calcAvgRating(medicine.reviews);
  const reviewCount = medicine._count?.reviews ?? 0;

  const imgSrc = medicine.imageUrl?.trim() ? medicine.imageUrl : "/placeholder-medicine.png";

  return (
    <Card className="overflow-hidden">
      <div className="relative h-44 w-full bg-muted">
        <Image
          src={imgSrc}
          alt={medicine.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <CardHeader className="space-y-1">
        <CardTitle className="line-clamp-1">{medicine.name}</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          {medicine.category?.name ? (
            <Badge>{medicine.category.name}</Badge>
          ) : (
            <Badge>Uncategorized</Badge>
          )}

          <Badge variant={medicine.stock > 0 ? "outline" : "destructive"}>
            {medicine.stock > 0 ? `In stock: ${medicine.stock}` : "Out of stock"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-1">
          {medicine.manufacturer}
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {medicine.description}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tk. {medicine.price} </p>

          <p className="text-sm text-muted-foreground">
            {avg ? `${avg} ⭐` : "No rating"}{" "}
            {reviewCount ? `(${reviewCount})` : ""}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end">
        <Button asChild variant="default" className="rounded-xl">
          <Link href={`/medicine/${medicine.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}