"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

const version = "01/10/2026";

export default function TermosPage() {
  const { isEnglish, text } = useLanguage();

  const sections = isEnglish
    ? [
        {
          title: "1. Service",
          body: "Orbitta provides access to software-as-a-service (SaaS) products, including management, operations, ordering, menu, payment, delivery and other tools described on the page of the product purchased.",
        },
        {
          title: "2. Account and access",
          body: "Customers must provide accurate information, keep credentials secure and control access by authorized users. Accounts may not be shared in a way that compromises security or allows unauthorized use.",
        },
        {
          title: "3. Plans, pricing and renewal",
          body: "The price, currency, any setup fee, billing cycle and access period are shown before payment. Monthly plans may renew automatically when clearly indicated. When offered, the annual plan provides 12 months of access for the equivalent of 10 monthly payments unless a different promotion is expressly shown at checkout. Annual renewal only occurs when automatic renewal is clearly disclosed and accepted.",
        },
        {
          title: "4. International billing",
          body: "Prices may be presented in a regional currency. For some international purchases, a third-party payment processor may process, settle or display the final charge in another supported currency. Before confirming payment, the customer must review the final amount, currency and processor terms shown on the payment page.",
        },
        {
          title: "5. Cancellation, suspension and refunds",
          body: "Cancellation stops future renewals. Access for an already-paid period may remain available until that period ends. Failed payments, chargebacks, misuse or expiration of the purchased period may result in suspension. Any refund that applies will follow the commercial conditions shown at purchase, the payment processor rules and mandatory applicable law.",
        },
        {
          title: "6. Merchant responsibilities",
          body: "A customer using Orbitta products to sell goods or services remains responsible for its own business, pricing, products, taxes, receipts or invoices, customer service, delivery, consumer disclosures and compliance with laws applicable to its activity.",
        },
        {
          title: "7. End-customer payments",
          body: "When an Orbitta product enables payments from a merchant's end customers, processing may be performed by third-party providers such as payment gateways. Their fees, eligibility rules, availability, risk reviews and transaction decisions also apply. Unless expressly stated otherwise, Orbitta is not the seller of the merchant's goods or food orders.",
        },
        {
          title: "8. Availability and maintenance",
          body: "Orbitta works to keep its services available and secure, but maintenance, updates and corrective work may occur. Cloud providers, internet services, payment processors and other third parties may also cause temporary interruptions outside Orbitta's reasonable control.",
        },
        {
          title: "9. Acceptable use",
          body: "The services may not be used for unlawful activity, fraud, infringement of third-party rights, intrusion attempts, infrastructure abuse, automated attacks or conduct that compromises the security or availability of the platform.",
        },
        {
          title: "10. Data and privacy",
          body: "Personal data related to Orbitta accounts is handled under the Privacy Policy. When a merchant uses an Orbitta product to collect or store information about its own customers, each party's responsibilities depend on the relevant purpose and applicable law.",
        },
        {
          title: "11. Intellectual property",
          body: "Orbitta software, code, interfaces, brand and other intellectual property remain protected. A subscription grants a limited right to use the service during the applicable subscription period and does not transfer ownership of the platform.",
        },
        {
          title: "12. Changes and contact",
          body: "These Terms may be updated to reflect legal, commercial or technical changes. When a new acceptance is required for a purchase, the applicable version will be presented before payment. Questions about accounts, billing or these Terms may be sent through the official channels available at orbitta.space.",
        },
      ]
    : [
        {
          title: "1. Objeto",
          body: "A Orbitta fornece acesso a plataformas de software como serviço (SaaS), incluindo ferramentas de gestão, operação, atendimento, vendas, cardápio, pedidos, pagamentos, entrega e outras funcionalidades descritas na página do produto contratado.",
        },
        {
          title: "2. Conta e acesso",
          body: "O cliente deve fornecer informações verdadeiras, manter suas credenciais em segurança e controlar o acesso de pessoas autorizadas. A conta não deve ser compartilhada de forma que comprometa a segurança ou permita uso não autorizado.",
        },
        {
          title: "3. Plano, preço e renovação",
          body: "O preço, moeda, eventual taxa de implantação, ciclo de cobrança e período de acesso são exibidos antes do pagamento. Planos mensais podem ter renovação automática quando isso estiver claramente indicado. Quando oferecido, o plano anual concede 12 meses de acesso pelo equivalente a 10 mensalidades, salvo promoção diferente expressamente exibida no checkout. Uma nova cobrança anual só ocorre quando a renovação automática estiver claramente informada e aceita.",
        },
        {
          title: "4. Cobrança internacional",
          body: "Os preços podem ser apresentados em moeda regional. Em determinadas compras internacionais, o provedor de pagamento poderá processar, liquidar ou exibir a cobrança final em outra moeda suportada. Antes de confirmar, o cliente deve conferir o valor final, a moeda e as condições exibidas na página do provedor de pagamento.",
        },
        {
          title: "5. Cancelamento, suspensão e reembolso",
          body: "O cancelamento interrompe novas renovações. O acesso referente a período já pago poderá continuar até o fim desse período. Falhas de pagamento, chargebacks, uso indevido ou encerramento do período contratado podem resultar em suspensão. Eventual reembolso seguirá as condições comerciais exibidas na contratação, as regras do provedor de pagamento e a legislação obrigatória aplicável.",
        },
        {
          title: "6. Responsabilidades do estabelecimento",
          body: "O cliente que utiliza produtos Orbitta para vender bens ou serviços continua responsável por seu próprio estabelecimento, preços, produtos, tributos, documentos fiscais, atendimento, entrega, informações ao consumidor e cumprimento das normas aplicáveis à sua atividade.",
        },
        {
          title: "7. Pagamentos de consumidores finais",
          body: "Quando um produto Orbitta permitir pagamentos dos clientes finais do estabelecimento, o processamento poderá ser realizado por provedores terceiros. Também se aplicam as taxas, regras de elegibilidade, disponibilidade, análises de risco e decisões transacionais desses provedores. Salvo indicação expressa em contrário, a Orbitta não é a vendedora dos produtos ou pedidos do estabelecimento.",
        },
        {
          title: "8. Disponibilidade e manutenção",
          body: "A Orbitta busca manter os serviços disponíveis e seguros, mas poderá realizar manutenções, atualizações e correções. Provedores de nuvem, internet, meios de pagamento e outros terceiros também podem causar interrupções temporárias fora do controle razoável da Orbitta.",
        },
        {
          title: "9. Uso permitido",
          body: "É proibido utilizar os serviços para atividades ilícitas, fraude, violação de direitos de terceiros, tentativa de invasão, abuso de infraestrutura, ataques automatizados ou qualquer conduta que comprometa a segurança ou a disponibilidade da plataforma.",
        },
        {
          title: "10. Dados e privacidade",
          body: "O tratamento de dados pessoais relacionados à conta Orbitta segue a Política de Privacidade. Quando um estabelecimento utiliza um produto Orbitta para coletar ou armazenar dados de seus próprios clientes, as responsabilidades de cada parte dependem da finalidade e da legislação aplicável.",
        },
        {
          title: "11. Propriedade intelectual",
          body: "O software, código, interfaces, marca e demais ativos de propriedade intelectual da Orbitta permanecem protegidos. A assinatura concede direito limitado de uso durante o período contratado e não transfere a propriedade da plataforma.",
        },
        {
          title: "12. Alterações e contato",
          body: "Estes Termos podem ser atualizados para refletir mudanças legais, comerciais ou técnicas. Quando uma nova aceitação for necessária para uma contratação, a versão aplicável será apresentada antes do pagamento. Dúvidas sobre conta, cobrança ou estes Termos podem ser encaminhadas pelos canais oficiais disponíveis em orbitta.space.",
        },
      ];

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-7 lg:py-16">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xs text-white/35 transition hover:text-white/70"
          >
            {text("← Voltar para Orbitta", "← Back to Orbitta")}
          </Link>

          <LanguageSwitcher compact />
        </div>

        <p className="mt-10 text-[10px] uppercase tracking-[0.24em] text-cyan-300/55">
          Orbitta
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          {text("Termos de Uso", "Terms of Use")}
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/35">
          {text(
            `Versão ${version}. Estes Termos regulam a contratação e o uso dos produtos, sistemas e serviços digitais disponibilizados pela Orbitta.`,
            `Version ${version}. These Terms govern the purchase and use of digital products, systems and services provided by Orbitta.`
          )}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-white/55">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-white/80">
                {section.title}
              </h2>
              <p className="mt-2">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs text-white/25">
          <Link
            href="/privacidade"
            className="transition hover:text-white/60"
          >
            {text("Política de Privacidade", "Privacy Policy")}
          </Link>
        </div>
      </div>
    </main>
  );
}
