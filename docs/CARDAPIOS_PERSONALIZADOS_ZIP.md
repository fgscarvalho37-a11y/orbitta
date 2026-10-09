# Cardápios personalizados — ZIP para PizzaSystem

**Admin:** `/admin/cardapios-personalizados`

O módulo permite associar um ZIP **HTML + CSS + JS** ao `storeSlug` real de uma pizzaria no PizzaSystem. O site público fica em `https://orbitta.space/p/<siteSlug>`. O ZIP é mantido como **rascunho** após importar; o admin precisa publicar explicitamente.

## Formato do ZIP (raiz)

```
index.html
style.css
app.js
assets/logo.png          # opcional
assets/banner.webp       # opcional
```

Outros arquivos não são aceitos; tamanho máximo comprimido 4 MB. Não use ZIP de código-fonte de React/Next.js: **use vanilla JS**, sem `npm`, imports ou chamadas externas. O runtime extrai o corpo do HTML, injeta CSS/JS e executa o código em um **iframe sandbox** sem cookies, `localStorage`, permissões do admin nem acesso ao DOM pai.

## API do ZIP

```js
window.OrbittaStore.ready(function (data) {
  console.log(data.storeSlug, data.displayName);
  console.log(data.products, data.crusts, data.status, data.profile);
  // Renderize seu cardápio a partir dos produtos reais.
});

// Quando o usuário clicar em "Finalizar pedido":
window.OrbittaStore.checkout([
  {
    productId: 123,       // ID real de data.products
    quantity: 2,          // 1 a 25
    observation: "Sem cebola", // até 300 caracteres
    crustId: null,        // ou ID real de data.crusts
    addonIds: []          // IDs reais de data.products[*].addonGroups[*].addons
  }
]);
```

A Orbitta consulta a API do PizzaSystem para produtos, fotos, adicionais, bordas, perfil e disponibilidade da **loja vinculada**. Confere IDs e formatos do carrinho e redireciona o cliente ao checkout original do PizzaSystem com `store=<storeSlug>` e `importCart=<token>`. No checkout, o PizzaSystem **carrega novamente dados do produto, dos adicionais e bordas**, ignorando qualquer preço vindo da interface. O cálculo final de frete, cupom, pagamento, acompanhamento e painel administrativo permanece no PizzaSystem.

## Para publicar para um cliente

1. Crie e configure a pizzaria no PizzaSystem, com slug próprio, produtos, fotos, adicionais, bordas e formas de pagamento.
2. Entre na Orbitta como administrador e acesse **Cardápios personalizados**.
3. Preencha o nome, o slug da URL Orbitta (`/p/minha-pizzaria`) e o slug real do PizzaSystem.
4. Envie o ZIP seguindo o contrato acima. Por padrão, o site fica como **rascunho**.
5. Verifique os itens e a sacola. Publique. Teste pelo menos **um pedido de retirada** e, se habilitado, **um pedido online** no estabelecimento real usando os meios de teste do gateway.
6. Para atualizar o visual, importe novo ZIP com o **mesmo siteSlug**. Ele voltará a rascunho até você publicar.

## Segurança e limitações atuais

- Templates executam em iframe de origem opaca, não na sessão do administrador.
- Não coloque tokens, secrets, senhas, IDs privados ou chaves de gateway nos arquivos.
- Não é um compilador de ZIP React/Next.js: somente HTML/CSS/JS simples.
- Não há prévia privada do rascunho nesta primeira versão; a publicação deve ser feita apenas depois de verificar os dados vinculados.
- A entrega em produção depende dos deploys de **ambos** os repositórios, Orbitta e PizzaSystem. Não declare o checkout operacional sem testar os dois.
- `/p/<siteSlug>` contém o cardápio personalizado; o checkout pode abrir no domínio oficial do PizzaSystem para preservar o fluxo de pagamento.
- No navegador, bloqueios de anúncios/privacidade ou URLs muito grandes podem afetar transferências de carrinho; limites: 35 linhas e token de até 5500 caracteres.
- Valores anunciados na Orbitta têm o mesmo **número nominal** por região configurada (ex.: 79,90 BRL / 79,90 USD); o Mercado Pago processa a cobrança em BRL com conversão quando aplicável.
