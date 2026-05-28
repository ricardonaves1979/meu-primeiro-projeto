# Como usar a Pesquisa de Treinamento de IA

## Estrutura de arquivos

```
public/
  index.html       <- pagina inicial (selecao de nome)
  pesquisa.html    <- formulario com 16 perguntas
  obrigada.html    <- tela de confirmacao
  admin.html       <- painel de resultados (protegido por senha)
  css/style.css    <- visual Grupo SN
  js/config.js     <- chaves Supabase + senha admin
  js/pesquisa.js   <- logica de envio
  js/admin.js      <- logica do painel

supabase/
  schema.sql       <- SQL para criar a tabela no Supabase
```

## Passo 1 - Criar a tabela no Supabase

1. Acesse https://supabase.com e entre no seu projeto
2. Va em "SQL Editor"
3. Cole o conteudo de `supabase/schema.sql` e clique em Run
4. Confirme que a tabela `respostas_treinamento` aparece em Table Editor

## Passo 2 - Ajustar os nomes das lideradas

Abra `public/index.html` e edite as 5 opcoes do dropdown:

```html
<option value="Nome Aqui">Nome Aqui</option>
```

Substitua "Liderada 1" ... "Liderada 5" pelos nomes reais.

## Passo 3 - Trocar a senha do admin (opcional)

Abra `public/js/config.js` e mude:

```js
window.ADMIN_SENHA = 'SN2026';
```

## Passo 4 - Testar localmente

No terminal, dentro da pasta do projeto:

```bash
npx serve public
```

Acesse http://localhost:3000 no navegador.
Teste o fluxo completo: selecionar nome -> preencher -> enviar -> verificar no Supabase.
Para o painel admin: http://localhost:3000/admin.html

## Passo 5 - Publicar (escolha uma opcao)

### Opcao A: Vercel (recomendado)
1. Acesse https://vercel.com e conecte sua conta GitHub
2. Importe o repositorio `meu-primeiro-projeto`
3. Em "Root Directory", coloque `public`
4. Clique Deploy
5. Pronto - voce recebe uma URL tipo `meu-primeiro-projeto.vercel.app`

### Opcao B: Netlify (drag-and-drop)
1. Acesse https://app.netlify.com
2. Arraste a pasta `public/` para a area de deploy
3. Receba a URL automaticamente

## Enviar o link para as lideradas

Envie pelo WhatsApp ou e-mail:

> "Ola! Preparei uma pesquisa rapida sobre o treinamento de IA.
> Leva 5 a 7 minutos. Pode responder quando quiser:
> [link aqui]"

## Ver os resultados

Acesse `[link]/admin.html`, digite a senha e veja:
- Total de respostas
- NPS calculado (Promotores / Neutros / Detratores)
- Medias de expectativa e confianca
- Todas as respostas abertas agrupadas
- Botao para baixar CSV

