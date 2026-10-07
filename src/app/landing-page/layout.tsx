import type {
  Metadata,
} from "next";

export const metadata:
  Metadata = {
    title:
      "Landing Page Personalizada | Orbitta Space",
    description:
      "Landing pages personalizadas, rápidas e responsivas para marcas que querem uma presença digital exclusiva, com integração opcional ao PizzaSystem.",
  };

export default function LandingPageLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return children;
}
