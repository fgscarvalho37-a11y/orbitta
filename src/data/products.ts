export type ProductStatus = "development" | "preview" | "available";

export type OrbittaProduct = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  previewUrl?: string;
  features: string[];
};

export const products: OrbittaProduct[] = [
  {
    slug: "pizzasystem",
    name: "PizzaSystem",
    category: "Food Commerce",
    shortDescription:
      "Operação digital completa para delivery e negócios de alimentação.",
    description:
      "Uma plataforma para centralizar cardápio, pedidos, pagamentos, cozinha, entregas e administração em uma única operação.",
    status: "available",
    features: [
      "Cardápio online",
      "Pedidos",
      "Pagamentos",
      "Cozinha",
      "Entregas",
      "Gestão",
    ],
  },

  {
    slug: "condoflow",
    name: "CondoFlow",
    category: "Condominium Management",
    shortDescription:
      "Uma plataforma conectando moradores, portaria e administração.",
    description:
      "Reservas, encomendas, ocorrências, comunicados e gestão condominial reunidos em uma experiência digital.",
    status: "development",
    features: [
      "Reservas",
      "Encomendas",
      "Ocorrências",
      "Comunicados",
      "Moradores",
      "Administração",
    ],
  },

  {
    slug: "vitalsync",
    name: "VitalSync",
    category: "Health Platform",
    shortDescription:
      "Tecnologia para organizar a rotina de profissionais e pacientes.",
    description:
      "Agenda, pacientes, acompanhamento, atendimentos e gestão profissional integrados em uma plataforma de saúde.",
    status: "development",
    features: [
      "Agenda",
      "Pacientes",
      "Atendimentos",
      "Acompanhamento",
      "Feed",
      "Gestão",
    ],
  },

  {
    slug: "cafeflow",
    name: "CafeFlow",
    category: "Food Management",
    shortDescription:
      "Uma experiência digital para cafeterias e atendimento por comanda.",
    description:
      "Cardápio, comandas, pedidos, produtos e administração conectados para simplificar a operação da cafeteria.",
    status: "development",
    features: [
      "Cardápio",
      "Comandas",
      "Pedidos",
      "Produtos",
      "Atendimento",
      "Gestão",
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}