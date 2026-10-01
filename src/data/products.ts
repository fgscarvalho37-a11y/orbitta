export type ProductStatus = "development" | "preview" | "available";

export type OrbittaProduct = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  previewUrl?: string;
  accessUrl?: string;
  androidUrl?: string;
  features: string[];
  en?: {
    category: string;
    shortDescription: string;
    description: string;
    features: string[];
  };
};

export const products: OrbittaProduct[] = [
  {
    slug: "pizzasystem",
    name: "PizzaSystem",
    category: "Food Commerce",
    shortDescription:
      "Seu cardápio, pedidos, pagamentos, cozinha e entregas em uma única operação.",
    description:
      "Uma plataforma completa para pizzarias e negócios de alimentação venderem pelo próprio canal, receberem pedidos sem comissão por pedido e administrarem a operação do atendimento à entrega.",
    status: "available",
    previewUrl: "/previews/pizzasystem.html",
    features: [
      "Cardápio online com fotos e ingredientes",
      "Categorias e organização do cardápio",
      "Produtos, adicionais e observações",
      "Bordas e complementos",
      "Pedidos online em tempo real",
      "Checkout próprio da loja",
      "Pix e cartão no Brasil",
      "Stripe Connect para operação internacional",
      "Dinheiro na entrega",
      "Cupons e promoções",
      "Taxa de entrega fixa ou por distância",
      "Faixas de entrega por quilômetro",
      "Quilometragem grátis configurável",
      "Cálculo de rota e distância",
      "Painel de pedidos",
      "Painel de cozinha",
      "Status do pedido do recebimento à entrega",
      "Controle de entregas",
      "Caixa",
      "Histórico de pedidos",
      "Relatórios de vendas",
      "Horários de funcionamento",
      "Personalização da loja",
      "Domínio e endereço público da loja",
      "Painel administrativo protegido",
      "Atualizações incluídas",
      "Suporte Orbitta",
    ],
    en: {
      category: "Food Commerce",
      shortDescription:
        "Your menu, orders, payments, kitchen and deliveries in one operation.",
      description:
        "A complete platform for pizzerias and food businesses to sell through their own channel, receive orders without per-order commissions, and manage everything from service to delivery.",
      features: [
        "Online menu with photos and ingredients",
        "Menu categories and organization",
        "Products, add-ons and order notes",
        "Crusts and extras",
        "Real-time online orders",
        "Store-owned checkout",
        "Brazilian Pix and card payments",
        "Stripe Connect for international operations",
        "Cash on delivery",
        "Coupons and promotions",
        "Fixed or distance-based delivery fees",
        "Delivery distance bands",
        "Configurable free-delivery radius",
        "Route and distance calculation",
        "Orders dashboard",
        "Kitchen dashboard",
        "Order status from received to delivered",
        "Delivery management",
        "Cash register",
        "Order history",
        "Sales reports",
        "Business hours",
        "Store personalization",
        "Public store domain and URL",
        "Protected admin dashboard",
        "Updates included",
        "Orbitta support",
      ],
    },
  },
  {
    slug: "condoflow",
    name: "CondoFlow",
    category: "Condominium Management",
    shortDescription:
      "Portaria e síndico conectados para organizar a rotina do condomínio.",
    description:
      "Reservas, correspondências, ocorrências e operação de portaria em uma experiência digital multi-condomínio.",
    status: "available",
    accessUrl: "https://condoflow.orbitta.space/quinta-do-conde",
    features: [
      "Painel do síndico",
      "Acesso da portaria",
      "Correspondências",
      "Cadastro de múltiplas correspondências",
      "Reservas de espaços",
      "Controle de utilização",
      "Ocorrências",
      "Logs administrativos",
      "Horários personalizados",
      "Operação multi-condomínio",
      "Web e Android",
      "Atualizações incluídas",
    ],
    en: {
      category: "Condominium Management",
      shortDescription:
        "Front desk teams and managers connected for smoother condominium operations.",
      description:
        "Reservations, deliveries, incidents and front-desk operations in one multi-condominium digital experience.",
      features: [
        "Manager dashboard",
        "Front desk access",
        "Deliveries and parcels",
        "Multiple parcel registration",
        "Space reservations",
        "Usage checkout",
        "Incidents",
        "Administrative logs",
        "Custom schedules",
        "Multi-condominium operation",
        "Web and Android",
        "Updates included",
      ],
    },
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function localizeProduct(
  product: OrbittaProduct,
  locale: "pt-BR" | "en-US"
): OrbittaProduct {
  if (locale !== "en-US" || !product.en) {
    return product;
  }

  return {
    ...product,
    category: product.en.category,
    shortDescription: product.en.shortDescription,
    description: product.en.description,
    features: product.en.features,
  };
}
