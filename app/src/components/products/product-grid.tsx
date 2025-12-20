import { Product } from "@/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4 | 5;
  showActions?: boolean;
}

export function ProductGrid({ 
  products, 
  columns = 4,
  showActions = true 
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  if (products.length === 0) {
    return (
      <div className="text-center">
        <p className="text-third text-lg">No products found</p>
        <p className="text-third text-sm mt-2">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-5`}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          showActions={showActions}
        />
      ))}
    </div>
  );
}
