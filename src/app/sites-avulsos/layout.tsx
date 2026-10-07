import type {
  Metadata,
} from "next";

export const metadata:
  Metadata = {
    title:
      "Sites Avulsos | Orbitta Space",
    description:
      "Sites e landing pages personalizados para empresas, com contratação avulsa ou integração ao PizzaSystem.",
  };

export default function StandaloneSitesLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return children;
}
