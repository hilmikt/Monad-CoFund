"use client";

import { Category } from "@/lib/types";
import CategoryCard from "./CategoryCard";

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl tracking-tight">Budget Categories</h3>
        <span className="text-xs font-mono bg-surface-secondary border border-border px-2 py-1 rounded-pill">
          {categories.length} Buckets
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
