# 📚 Guia Completo de Setup — Ricardo Naves
**Data:** 27/05/2026  
**Objetivo:** Reproduzir o ambiente completo em qualquer máquina

---

## 🖥️ AMBIENTE

- **Sistema:** Windows (PowerShell)
- **Node.js:** v26.1.0
- **Git:** 2.43.0

---

## ✅ O QUE FOI CONFIGURADO

### 1. GitHub
- **Conta:** ricardonaves1979
- **Email:** ricardonaves@gmail.com
- **Repositório:** meu-primeiro-projeto
- **URL:** https://github.com/ricardonaves1979/meu-primeiro-projeto
- **Token atual:** SEU_TOKEN_AQUI
  ⚠️ Token expira em 90 dias — gere novo em: https://github.com/settings/tokens

### 2. Supabase
- **Conta:** ricardonaves@gmail.com
- **Projeto:** Projeto database 1
- **URL:** https://hxwxipdooefxuhwfuoca.supabase.co
- **Região:** South America (São Paulo) — sa-east-1
- **Tabela criada:** contatos (id, created_at, nome, email)
- **RLS:** Desativado (para desenvolvimento)
- **Dashboard:** https://supabase.com/dashboard

### 3. Projeto Node.js
- **Localização atual:** C:\Users\ricardo.naves\Desktop\meu-primeiro-projeto
- **Pacotes instalados:** @supabase/supabase-js, dotenv

---

## 🚀 COMO REPRODUZIR NO NOTEBOOK NOVO

### Pré-requisitos (instalar primeiro)
```
1. Node.js: https://nodejs.org (versão LTS)
2. Git: https://git-scm.com/download/win
3. VS Code (opcional): https://code.visualstudio.com
```

### Passo a Passo

**1. Clonar o projeto do GitHub:**
```powershell
cd $HOME\Desktop
git clone https://github.com/ricardonaves1979/meu-primeiro-projeto.git
cd meu-primeiro-projeto
```

**2. Instalar dependências:**
```powershell
npm install
```

**3. Criar arquivo .env (NUNCA vai pro GitHub):**
```powershell
@"
SUPABASE_URL=https://hxwxipdooefxuhwfuoca.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4d3hpcGRvb2VmeHVod2Z1b2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDY3OTEsImV4cCI6MjA5NTQ4Mjc5MX0.7WVwjXkgdZ8_dhMRME9vagjRC1Ag1aANKkZus9WIi0Q
"@ | Out-File -FilePath .env -Encoding utf8
```

**4. Testar conexão:**
```powershell
node index.js
```

**5. Resultado esperado:**
```
✅ Contato inserido com sucesso!
✅ Contatos no banco: [...]
```

---

## 📁 ESTRUTURA DO PROJETO

```
meu-primeiro-projeto/
├── .env              ← Credenciais (NUNCA no GitHub)
├── .gitignore        ← Protege o .env
├── index.js          ← Código principal
├── package.json      ← Configuração Node.js
├── package-lock.json ← Versões exatas dos pacotes
├── README.md         ← Descrição do projeto
└── docs/
    └── SETUP-COMPLETO.md  ← Este arquivo
```

---

## 🔑 CREDENCIAIS IMPORTANTES

### GitHub Token
- **Onde gerar:** https://github.com/settings/tokens/new
- **Permissões necessárias:** repo, workflow, gist, user
- **Expiração:** 90 dias
- **Como usar no clone:**
```powershell
git clone https://SEU_TOKEN@github.com/ricardonaves1979/meu-primeiro-projeto.git
```

### Supabase Keys
- **Dashboard:** https://supabase.com/dashboard
- **Onde achar as chaves:** Project Settings → API Keys → Legacy anon
- **Chave anon (pública):** começa com eyJh... (segura para usar no código)
- **Chave service_role (secreta):** NUNCA coloque no código ou GitHub

---

## ⚠️ REGRAS DE SEGURANÇA

```
❌ NUNCA faça commit do arquivo .env
❌ NUNCA compartilhe o token do GitHub
❌ NUNCA compartilhe a chave service_role do Supabase
❌ NUNCA coloque senhas no código

✅ SEMPRE use variáveis de ambiente (.env)
✅ SEMPRE verifique o .gitignore antes de fazer push
✅ SEMPRE gere novo token se o anterior vazar
```

---

## 🛠️ COMANDOS ÚTEIS DO DIA A DIA

```powershell
# Entrar no projeto
cd $HOME\Desktop\meu-primeiro-projeto

# Rodar o projeto
node index.js

# Salvar mudanças no GitHub
git add .
git commit -m "Descrição do que mudou"
git push

# Baixar mudanças do GitHub
git pull

# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline
```

---

## 🌐 PRÓXIMOS PASSOS SUGERIDOS

1. **Instalar Claude Code** no notebook novo:
   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

2. **Criar mais tabelas** no Supabase conforme necessidade

3. **Adicionar autenticação** (login/senha) com Supabase Auth

4. **Criar um site** com os dados do banco usando Next.js ou HTML puro

5. **Deploy no Vercel** para colocar online:
   - Criar conta: https://vercel.com
   - Conectar com GitHub
   - Deploy automático a cada push

---

## 📞 SUPORTE

Se precisar de ajuda, abra o Claude (claude.ai) e diga:
> "Tenho um projeto Node.js com GitHub e Supabase configurados. 
> Me ajuda a continuar de onde parei."
> 
> E anexe este arquivo SETUP-COMPLETO.md

