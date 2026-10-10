# Orbitta — prévias públicas e substituíveis para clientes

## Para apresentar antes de vender

O admin da Orbitta possui **Prévias para clientes** em `/admin/previas`.
Envie um ZIP com um frontend estático e escolha o identificador `mini-pizza-matos`.

O cliente abre, **sem login**:

`https://orbitta.space/preview/mini-pizza-matos`

Para atualizar a proposta, **suba um ZIP novo com o mesmo identificador**.
O link que já foi compartilhado continua válido, não é necessário publicar
um novo projeto no GitHub nem criar um site na Vercel/Netlify por cliente.
Se precisar ocultar a proposta, use **Ocultar** na lista do admin.

Prévias são apenas demonstrações, não representam uma loja ativa e **não
recebem pagamentos/pedidos reais**. O iframe impede acesso a cookies da Orbitta.

## Formato do ZIP

```text
index.html              (obrigatório)
style.css               (opcional)
app.js                  (opcional)
assets/
  logo.png              (opcional)
  fachada.webp          (opcional)
```

- ZIP na raiz, **sem pasta pai**. Máximo **4 MB** compactado.
- Aceita HTML, CSS, JavaScript puro (sem Node, React source ou Next.js source).
- Imagens locais em `assets/*.png`, `assets/*.jpg`, `assets/*.jpeg`, `assets/*.webp`.
- CSS/JS de `style.css` e `app.js` são injetados automaticamente.
- Scripts e CSS dentro do próprio HTML também são aceitos. *Scripts externos* e chamadas `fetch` diretas são bloqueados pelo sandbox; use imagens remotas HTTPS ou imagens no ZIP.
- A proposta deve usar dados ilustrativos claramente identificados e carrinhos simulados; **nenhum checkout real**.

## Depois que vender — ativar PizzaSystem

O produto definitivo está em **Admin → Cardápios personalizados**:
`/admin/cardapios-personalizados`, com rota pública `/p/<slug>`.

1. Cadastre a pizzaria real no PizzaSystem e confira o `storeSlug` dela.
2. Gere o ZIP real que utiliza o contrato `window.OrbittaStore.ready(...)` e
   `window.OrbittaStore.checkout([...])`; veja `docs/CARDAPIOS_PERSONALIZADOS_ZIP.md`.
3. Acesse **Cardápios personalizados**, informe os slugs e importe o ZIP.
4. Confira a prévia administrativa do cardápio, publique e realize pedidos de teste.
5. O carrinho passa para checkout do PizzaSystem, com backend e gateway originais.

**Importante:** o site de vendas não deve ser confundido com a demo da proposta.
A rota `/preview/*` nunca habilita compra. A rota `/p/*` depende da loja
ativa no PizzaSystem e da publicação do frontend atualizado em ambos os sistemas.

## Prompt para outro chat

> Gere um ZIP de **prévia pública estática**, para ser importado na Orbitta em
> `/admin/previas`, contendo **index.html na raiz**, `style.css`,
> `app.js` e imagens em `assets/`, até 4 MB.
> O design deve seguir as referências da pizzaria que eu enviar, ser completo,
> responsivo e visualmente distinto dos demais. **Não use React, Next.js, npm,
> Vite, CDN JavaScript, fetch, backend, pagamento ou checkout de verdade.**
> Pode simular navegação por categorias, carrinho e formulário de orçamento
> apenas na interface, com aviso de demonstração e sem gravar pedidos.
> Todas as imagens locais devem usar `assets/arquivo.png`; não inclua uma
> pasta extra envolvendo os arquivos. Entregue um ZIP pronto para importar.
