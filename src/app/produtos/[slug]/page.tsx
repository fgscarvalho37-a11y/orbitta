import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductPageClient from "@/components/product/ProductPageClient";
import { getProduct, products } from "@/data/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Orbitta Space",
    };
  }

  return {
    title: `${product.name} | Orbitta Space`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}