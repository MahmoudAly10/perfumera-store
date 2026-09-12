import { PRODUCTS } from "@/lib/data";
import ProductClient from "./client";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default function ProductPage() {
  return <ProductClient />;
}
