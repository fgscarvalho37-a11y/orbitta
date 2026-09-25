import Link from "next/link";

const version = "24/09/2026";

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/35">
          Versão {version}. Esta Política descreve, de forma geral, como a Orbitta trata dados pessoais relacionados à conta, contratação e utilização de seus serviços.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-white/55">
          <section>
            <h2 className="text-lg font-semibold text-white/80">1. Dados tratados</h2>
            <p className="mt-2">
              Podemos tratar dados de cadastro e contato, como nome, e-mail e telefone; informações de conta e autenticação; dados de contratação, plano, cobrança e histórico de pagamentos; registros técnicos de segurança e uso; e dados inseridos pelo próprio usuário nas funcionalidades contratadas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">2. Finalidades</h2>
            <p className="mt-2">
              Os dados podem ser utilizados para criar e manter contas, autenticar usuários, fornecer os serviços contratados, processar assinaturas, prestar suporte, prevenir fraude e abuso, manter segurança, cumprir obrigações legais e melhorar a operação da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">3. Compartilhamento</h2>
            <p className="mt-2">
              Dados podem ser compartilhados com prestadores necessários à operação, como infraestrutura em nuvem, banco de dados, hospedagem, meios de pagamento, e-mail e outros fornecedores técnicos, sempre de acordo com a finalidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">4. Pagamentos</h2>
            <p className="mt-2">
              Informações financeiras sensíveis podem ser processadas diretamente pelo provedor de pagamento. A Orbitta pode receber identificadores, status, valores e demais dados necessários para controlar a contratação e a assinatura sem armazenar os dados completos do cartão.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">5. Dados dos clientes do estabelecimento</h2>
            <p className="mt-2">
              Produtos como o PizzaSystem podem armazenar dados inseridos ou recebidos pelo estabelecimento durante sua operação, como pedidos e dados de consumidores. O estabelecimento deve utilizar essas informações de forma compatível com a legislação aplicável e com sua relação com o consumidor final.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">6. Segurança</h2>
            <p className="mt-2">
              A Orbitta adota medidas técnicas e organizacionais destinadas a reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida. Nenhum ambiente digital, porém, é absolutamente imune a incidentes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">7. Retenção e exclusão</h2>
            <p className="mt-2">
              Os dados são mantidos pelo período necessário à prestação do serviço, ao cumprimento de obrigações legais e à defesa de direitos. O encerramento da assinatura não implica necessariamente exclusão imediata de todos os registros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">8. Direitos do titular</h2>
            <p className="mt-2">
              Nos termos da legislação aplicável, inclusive a LGPD quando pertinente, o titular pode solicitar informações sobre o tratamento de seus dados e exercer os direitos previstos em lei, observadas as hipóteses de conservação obrigatória ou legítima.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">9. Cookies e sessão</h2>
            <p className="mt-2">
              A plataforma pode utilizar cookies e mecanismos de sessão necessários para autenticação, segurança e funcionamento de áreas logadas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">10. Alterações e contato</h2>
            <p className="mt-2">
              Esta Política pode ser atualizada. Dúvidas ou solicitações relacionadas à privacidade podem ser encaminhadas pelos canais oficiais disponibilizados em orbitta.space.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs text-white/25">
          <Link
            href="/termos"
            className="transition hover:text-white/60"
          >
            Termos de Uso
          </Link>
        </div>
      </div>
    </main>
  );
}
