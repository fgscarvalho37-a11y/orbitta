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
      "Operação digital completa para delivery e negócios de alimentação.",
    description:
      "Uma plataforma para centralizar cardápio, pedidos, pagamentos, cozinha, entregas e administração em uma única operação.",
    status: "available",
    previewUrl:
      "/previews/pizzasystem.html",
    en: {
      category: "Food Commerce",
      shortDescription:
        "A complete digital operation for delivery and food businesses.",
      description:
        "A platform that brings menus, orders, payments, kitchen operations, deliveries and management into one place.",
      features: [
        "Online menu",
        "Orders",
        "Payments",
        "Kitchen",
        "Deliveries",
        "Management",
      ],
    },
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
    en: {
      category: "Condominium Management",
      shortDescription:
        "A platform connecting residents, front desk teams and management.",
      description:
        "Reservations, deliveries, incidents, announcements and condominium management in one digital experience.",
      features: [
        "Reservations",
        "Deliveries",
        "Incidents",
        "Announcements",
        "Residents",
        "Management",
      ],
    },
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
    en: {
      category: "Health Platform",
      shortDescription:
        "Technology to organize the routine of professionals and patients.",
      description:
        "Scheduling, patients, follow-up, appointments and professional management integrated into a healthcare platform.",
      features: [
        "Schedule",
        "Patients",
        "Appointments",
        "Follow-up",
        "Feed",
        "Management",
      ],
    },
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
    en: {
      category: "Food Management",
      shortDescription:
        "A digital experience for cafés and tab-based service.",
      description:
        "Menus, tabs, orders, products and management connected to simplify café operations.",
      features: [
        "Menu",
        "Tabs",
        "Orders",
        "Products",
        "Service",
        "Management",
      ],
    },
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
