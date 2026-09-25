import Link from "next/link";

const version = "24/09/2026";

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-7 lg:py-16">
        <Link
          href="/"
          className="text-xs text-white/35 transition hover:text-white/70"
        >
          ← Voltar para Orbitta
        </Link>

        <p className="mt-10 text-[10px] uppercase tracking-[0.24em] text-cyan-300/55">
          Orbitta
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Termos de Uso
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/35">
          Versão {version}. Estes Termos regulam a contratação e o uso dos produtos, sistemas e serviços digitais disponibilizados pela Orbitta.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-white/55">
          <section>
            <h2 className="text-lg font-semibold text-white/80">1. Objeto</h2>
            <p className="mt-2">
              A Orbitta fornece acesso a plataformas de software como serviço (SaaS), incluindo ferramentas de gestão, operação, atendimento, vendas, cardápio, pedidos e outras funcionalidades descritas na página do produto contratado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">2. Conta e acesso</h2>
            <p className="mt-2">
              O cliente é responsável por fornecer informações verdadeiras, manter suas credenciais em segurança e controlar o acesso de pessoas autorizadas à sua conta e aos sistemas contratados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">3. Plano, cobrança e renovação</h2>
            <p className="mt-2">
              O preço mensal, eventual taxa de implantação, moeda e demais condições comerciais são exibidos no checkout antes do pagamento. Quando indicado como recorrente, o plano é renovado e cobrado periodicamente até seu cancelamento, conforme as condições apresentadas na contratação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">4. Cancelamento e suspensão</h2>
            <p className="mt-2">
              O cancelamento interrompe novas renovações. Quando houver período já pago, o acesso poderá permanecer disponível até o fim desse período. Falhas de pagamento, chargebacks, uso indevido ou encerramento do período contratado podem resultar em suspensão do acesso, sem exclusão automática dos dados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">5. Responsabilidades do estabelecimento</h2>
            <p className="mt-2">
              O cliente que utiliza produtos da Orbitta para vender bens ou serviços é responsável por seu próprio estabelecimento, preços, produtos, estoque, atendimento, entrega, tributos, emissão de documentos fiscais, informações ao consumidor e cumprimento das normas aplicáveis à sua atividade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">6. Pagamentos de clientes finais</h2>
            <p className="mt-2">
              Quando um produto Orbitta permitir pagamentos de consumidores finais, o processamento poderá ser realizado por provedores terceiros. As regras, taxas, disponibilidade e análise de transações desses provedores também se aplicam.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">7. Disponibilidade e manutenção</h2>
            <p className="mt-2">
              A Orbitta busca manter os serviços disponíveis e seguros, mas poderá realizar manutenções, atualizações e correções. Interrupções decorrentes de provedores de nuvem, internet, meios de pagamento, serviços de terceiros ou eventos fora do controle razoável da Orbitta podem afetar temporariamente o funcionamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">8. Uso permitido</h2>
            <p className="mt-2">
              É proibido utilizar a plataforma para atividades ilícitas, fraude, violação de direitos de terceiros, tentativa de invasão, abuso de infraestrutura ou qualquer uso que comprometa a segurança ou a disponibilidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">9. Dados e privacidade</h2>
            <p className="mt-2">
              O tratamento de dados pessoais relacionado à conta Orbitta segue a Política de Privacidade. Em produtos nos quais o estabelecimento cadastra ou recebe dados de seus próprios clientes, as responsabilidades de cada parte dependem da finalidade e da operação realizada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">10. Propriedade intelectual</h2>
            <p className="mt-2">
              O software, identidade visual, código, interfaces e demais ativos da Orbitta permanecem protegidos por direitos de propriedade intelectual. A assinatura concede apenas o direito de uso do serviço durante a vigência do plano.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">11. Alterações</h2>
            <p className="mt-2">
              Estes Termos podem ser atualizados para refletir mudanças legais, comerciais ou técnicas. Quando uma nova aceitação for necessária para determinada contratação, a versão correspondente será apresentada antes do pagamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">12. Contato</h2>
            <p className="mt-2">
              Dúvidas sobre contratação, conta, cobrança ou estes Termos podem ser encaminhadas pelos canais oficiais disponibilizados em orbitta.space.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs text-white/25">
          <Link
            href="/privacidade"
            className="transition hover:text-white/60"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </main>
  );
}
