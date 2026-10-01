"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

const version = "01/10/2026";

export default function PrivacidadePage() {
  const { isEnglish, text } = useLanguage();

  const sections = isEnglish
    ? [
        {
          title: "1. Information we process",
          body: "We may process account and contact information such as name, email and phone number; authentication and account data; plan, billing and payment history; security and usage logs; support communications; and information entered by users while using purchased products.",
        },
        {
          title: "2. Why we use information",
          body: "Information may be used to create and maintain accounts, authenticate users, provide purchased services, process subscriptions, provision products, provide support, prevent fraud and abuse, maintain security, comply with legal obligations and improve platform operations.",
        },
        {
          title: "3. Service providers",
          body: "Information may be shared with providers that are necessary to operate the service, including cloud infrastructure, databases, hosting, payment processors, email services and other technical vendors. We limit this sharing to what is reasonably required for the relevant service or legal purpose.",
        },
        {
          title: "4. Payments",
          body: "Sensitive payment credentials such as complete card details may be processed directly by a payment provider. Orbitta may receive transaction identifiers, status, amount, currency and other information required to manage a purchase or subscription without storing complete card data.",
        },
        {
          title: "5. Merchant customer data",
          body: "Products such as PizzaSystem may store information received by a merchant during its operations, including orders, delivery details and customer contact information. The merchant is responsible for using that information lawfully in its relationship with the end customer. Orbitta processes this data to provide and secure the contracted service.",
        },
        {
          title: "6. International data processing",
          body: "Orbitta and its service providers may process information using infrastructure located in countries different from the user's country. Where applicable, processing and transfers are handled subject to contractual, technical and legal safeguards appropriate to the service and applicable law.",
        },
        {
          title: "7. Security",
          body: "Orbitta uses technical and organizational measures intended to reduce risks of unauthorized access, loss, alteration or improper disclosure, including access controls, encrypted connections, session protections, request limiting and security monitoring. No internet-connected environment can be guaranteed to be completely immune from incidents.",
        },
        {
          title: "8. Retention and deletion",
          body: "Information is kept for as long as reasonably necessary to provide the service, comply with legal obligations, resolve disputes, prevent abuse and protect legal rights. Ending a subscription does not necessarily cause immediate deletion of every record when continued retention is legally or operationally justified.",
        },
        {
          title: "9. Privacy rights",
          body: "Depending on applicable law and the user's location, individuals may have rights to request access, correction, deletion or information about certain processing activities. This includes rights that may apply under Brazil's LGPD and applicable U.S. state privacy laws. Requests are subject to identity verification and lawful retention exceptions.",
        },
        {
          title: "10. Cookies and local preferences",
          body: "Orbitta uses essential cookies for authentication, sessions, security and necessary preferences. Optional measurement or analytics cookies, when implemented, remain disabled until the user makes the applicable consent choice. Cookie preferences may be stored so the platform can remember that choice.",
        },
        {
          title: "11. Changes and contact",
          body: "This Policy may be updated as the products, providers or legal requirements change. Privacy questions or rights requests may be sent through the official support channels available at orbitta.space.",
        },
      ]
    : [
        {
          title: "1. Dados tratados",
          body: "Podemos tratar dados de cadastro e contato, como nome, e-mail e telefone; informações de autenticação e conta; plano, cobrança e histórico de pagamentos; registros técnicos de segurança e uso; comunicações de suporte; e dados inseridos pelo usuário durante a utilização dos produtos contratados.",
        },
        {
          title: "2. Finalidades",
          body: "Os dados podem ser utilizados para criar e manter contas, autenticar usuários, fornecer os serviços contratados, processar assinaturas, provisionar produtos, prestar suporte, prevenir fraude e abuso, manter segurança, cumprir obrigações legais e melhorar a operação da plataforma.",
        },
        {
          title: "3. Prestadores de serviço",
          body: "Dados podem ser compartilhados com prestadores necessários à operação, incluindo infraestrutura em nuvem, banco de dados, hospedagem, meios de pagamento, e-mail e outros fornecedores técnicos. Esse compartilhamento é limitado ao que for razoavelmente necessário à finalidade do serviço ou ao cumprimento de obrigação legal.",
        },
        {
          title: "4. Pagamentos",
          body: "Credenciais financeiras sensíveis, como os dados completos do cartão, podem ser processadas diretamente pelo provedor de pagamento. A Orbitta pode receber identificadores, status, valor, moeda e outros dados necessários para controlar a contratação ou assinatura sem armazenar os dados completos do cartão.",
        },
        {
          title: "5. Dados dos clientes do estabelecimento",
          body: "Produtos como o PizzaSystem podem armazenar informações recebidas pelo estabelecimento durante sua operação, incluindo pedidos, dados de entrega e contato de consumidores. O estabelecimento é responsável por utilizar essas informações legalmente em sua relação com o consumidor final. A Orbitta trata esses dados para fornecer e proteger o serviço contratado.",
        },
        {
          title: "6. Tratamento internacional de dados",
          body: "A Orbitta e seus prestadores podem processar informações utilizando infraestrutura localizada em países diferentes do país do usuário. Quando aplicável, o tratamento e as transferências observam medidas contratuais, técnicas e legais adequadas ao serviço e à legislação aplicável.",
        },
        {
          title: "7. Segurança",
          body: "A Orbitta adota medidas técnicas e organizacionais destinadas a reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida, incluindo controles de acesso, conexões criptografadas, proteção de sessão, limitação de solicitações e monitoramento de segurança. Nenhum ambiente conectado à internet pode ser garantido como absolutamente imune a incidentes.",
        },
        {
          title: "8. Retenção e exclusão",
          body: "Os dados são mantidos pelo período razoavelmente necessário à prestação do serviço, ao cumprimento de obrigações legais, à prevenção de abuso, à resolução de disputas e à defesa de direitos. O encerramento da assinatura não implica necessariamente exclusão imediata de todos os registros quando houver justificativa legal ou operacional para conservação.",
        },
        {
          title: "9. Direitos de privacidade",
          body: "Conforme a legislação aplicável e a localização do titular, podem existir direitos de acesso, correção, exclusão ou obtenção de informações sobre determinadas atividades de tratamento. Isso inclui direitos que possam ser aplicáveis pela LGPD e por legislações estaduais dos Estados Unidos. Solicitações estão sujeitas à verificação de identidade e às hipóteses legais de conservação.",
        },
        {
          title: "10. Cookies e preferências",
          body: "A Orbitta utiliza cookies essenciais para autenticação, sessão, segurança e preferências necessárias. Cookies opcionais de medição ou analytics, quando implementados, permanecem desativados até que o usuário faça a escolha de consentimento aplicável. A preferência pode ser armazenada para que a plataforma se lembre dessa decisão.",
        },
        {
          title: "11. Alterações e contato",
          body: "Esta Política poderá ser atualizada conforme os produtos, prestadores ou requisitos legais mudarem. Dúvidas de privacidade ou solicitações de direitos podem ser encaminhadas pelos canais oficiais de suporte disponíveis em orbitta.space.",
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
          {text("Política de Privacidade", "Privacy Policy")}
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/35">
          {text(
            `Versão ${version}. Esta Política descreve como a Orbitta trata dados pessoais relacionados à conta, contratação e utilização de seus serviços.`,
            `Version ${version}. This Policy describes how Orbitta handles personal information related to accounts, purchases and use of its services.`
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
            href="/termos"
            className="transition hover:text-white/60"
          >
            {text("Termos de Uso", "Terms of Use")}
          </Link>
        </div>
      </div>
    </main>
  );
}
