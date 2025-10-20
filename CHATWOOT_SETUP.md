# 🔧 Guia de Configuração do Chatwoot

Este guia explica como configurar a integração entre o bot WhatsApp e o Chatwoot.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Obter Credenciais do Chatwoot](#obter-credenciais-do-chatwoot)
3. [Configurar o Bot](#configurar-o-bot)
4. [Testar a Integração](#testar-a-integração)
5. [Troubleshooting](#troubleshooting)

## Pré-requisitos

- ✅ Instância do Chatwoot funcionando (cloud ou self-hosted)
- ✅ Acesso administrativo ao Chatwoot
- ✅ Bot WhatsApp já instalado (veja README.md)

## Obter Credenciais do Chatwoot

### 1. Token de Acesso (API Token)

1. **Faça login no Chatwoot**

2. **Clique no seu avatar** (canto inferior esquerdo)

3. **Vá em "Profile Settings"**

4. **Clique em "Access Token"**

5. **Copie o token** que aparece
   - Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - ⚠️ **IMPORTANTE:** Guarde este token com segurança!

### 2. ID da Conta (Account ID)

O Account ID geralmente é `1` para a primeira conta.

Você pode confirmar olhando a URL do Chatwoot:
```
https://app.chatwoot.com/app/accounts/1/dashboard
                                        ↑
                                     Este é o Account ID
```

### 3. ID da Caixa de Entrada (Inbox ID)

1. **Vá em "Configurações" → "Caixas de Entrada"**

2. **Clique na sua Inbox de WhatsApp**
   - Se não tiver uma, crie uma nova Inbox do tipo WhatsApp

3. **Observe a URL:**
   ```
   https://app.chatwoot.com/app/accounts/1/settings/inboxes/5
                                                            ↑
                                                      Este é o Inbox ID
   ```

4. **Anote o ID** (no exemplo acima, é `5`)

### 4. ID da Equipe (Team ID)

1. **Vá em "Configurações" → "Equipes"**

2. **Clique na sua equipe**
   - Se não tiver uma, crie uma nova equipe
   - Exemplo: "Equipe de Atendimento"

3. **Observe a URL:**
   ```
   https://app.chatwoot.com/app/accounts/1/settings/teams/3
                                                           ↑
                                                      Este é o Team ID
   ```

4. **Anote o ID** (no exemplo acima, é `3`)

## Configurar o Bot

### 1. Criar arquivo .env

No diretório do bot, copie o arquivo de exemplo:

**Windows:**
```bash
copy env.example .env
```

**Linux/Mac:**
```bash
cp env.example .env
```

### 2. Editar o arquivo .env

Abra o arquivo `.env` com seu editor favorito e preencha:

```env
# URL da sua instância do Chatwoot (SEM barra no final)
CHATWOOT_BASE_URL=https://app.chatwoot.com

# Cole o token que você copiou
CHATWOOT_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ID da Caixa de Entrada que você anotou
CHATWOOT_INBOX_ID=5

# ID da Equipe que você anotou
CHATWOOT_TEAM_ID=3

# ID da Conta (geralmente 1)
CHATWOOT_ACCOUNT_ID=1
```

### 3. Exemplo Completo

```env
CHATWOOT_BASE_URL=https://chat.minhaempresa.com
CHATWOOT_API_TOKEN=abc123def456ghi789jkl012mno345pqr
CHATWOOT_INBOX_ID=7
CHATWOOT_TEAM_ID=2
CHATWOOT_ACCOUNT_ID=1
```

## Testar a Integração

### 1. Iniciar o Bot

```bash
node bot.js
```

Se tudo estiver correto, você verá:

```
┌────────────────────────────────────────┐
│   🤖 BOT DE TRIAGEM SAAE - INICIANDO  │
│      (Integrado com Chatwoot)         │
└────────────────────────────────────────┘

Aguarde... Inicializando navegador automatizado (Puppeteer)...
Isso pode demorar 20-40 segundos na primeira vez.

Cliente inicializado!
Carregando... 100% - WhatsApp
✓ Autenticação realizada com sucesso!
┌────────────────────────────────────────┐
│     ✓ BOT CONECTADO COM SUCESSO!      │
└────────────────────────────────────────┘
Bot iniciado em: 15/10/2025, 14:30:45

📡 Integração com Chatwoot ativa!
   URL: https://app.chatwoot.com
   Conta ID: 1
   Inbox ID: 5
   Team ID: 3

Aguardando mensagens...
```

### 2. Enviar Mensagem de Teste

De outro celular, envie uma mensagem para o WhatsApp conectado ao bot:

**Mensagem:** "Oi"

**O bot responde** com o menu

**Digite:** "1"

### 3. Verificar no Chatwoot

1. Acesse o painel do Chatwoot
2. Vá em "Conversas"
3. Você deve ver uma nova conversa criada!
4. A conversa deve estar atribuída à sua equipe

### 4. Logs Esperados

No terminal do bot, você deve ver:

```
📩 Mensagem recebida de: 5519987654321@c.us
Conteúdo: 1
→ Processando solicitação para: Faturas

📋 Processando solicitação no Chatwoot:
   Setor: Faturas
   Cliente: João Silva
   Telefone: 5519987654321
   🔍 Buscando contato no Chatwoot: +5519987654321
   ➕ Criando novo contato: João Silva (+5519987654321)
   ✓ Contato criado! ID: 123
   💬 Criando conversa para contato ID: 123
   ✓ Conversa criada! ID: 456
   ✓ Mensagem inicial enviada
   ✓ Conversa atribuída à equipe ID: 3
✅ Ticket criado com sucesso no Chatwoot!

✓ Confirmação enviada ao cliente
✓ Processo de triagem concluído!
```

## Troubleshooting

### ❌ Erro: CHATWOOT_API_TOKEN não configurado

**Problema:** O arquivo `.env` não existe ou está vazio

**Solução:**
1. Verifique se o arquivo `.env` existe no diretório do bot
2. Abra o arquivo e verifique se está preenchido
3. Certifique-se de que não há espaços extras

### ❌ Erro 401 - Unauthorized

**Problema:** Token de API inválido

**Solução:**
1. Verifique se copiou o token corretamente
2. Gere um novo token no Chatwoot
3. Certifique-se de que não há espaços no início/fim do token

### ❌ Erro 404 - Not Found

**Problema:** IDs incorretos (Inbox, Team, ou Account)

**Solução:**
1. Verifique os IDs na URL do Chatwoot
2. Certifique-se de que a Inbox existe
3. Certifique-se de que a Equipe existe

### ❌ Contato não criado

**Problema:** Permissões insuficientes ou formato do número incorreto

**Solução:**
1. Verifique se o token tem permissões de administrador
2. Verifique os logs para ver o formato do número
3. O número deve estar no formato internacional: +5519999999999

### ❌ Conversa criada mas não atribuída à equipe

**Problema:** Team ID incorreto ou equipe não tem acesso à Inbox

**Solução:**
1. Verifique o Team ID
2. No Chatwoot, vá em Configurações → Equipes
3. Edite a equipe e certifique-se de que ela tem acesso à Inbox

### 📝 Logs Detalhados

Se tiver problemas, ative logs mais detalhados editando o bot.js e adicionando:

```javascript
// No topo do arquivo, após os imports
axios.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2))
  return request
});

axios.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response.data, null, 2))
  return response
});
```

## 🔍 Verificar Configuração Manualmente

Você pode testar a conexão com a API do Chatwoot manualmente:

### Usando cURL (Terminal)

```bash
curl -X GET "https://app.chatwoot.com/api/v1/accounts/1/contacts" \
  -H "api_access_token: SEU_TOKEN_AQUI"
```

### Usando Postman

1. Crie uma nova requisição GET
2. URL: `https://app.chatwoot.com/api/v1/accounts/1/contacts`
3. Headers:
   - Key: `api_access_token`
   - Value: `seu_token_aqui`
4. Envie a requisição

Se funcionar, você verá uma lista de contatos (ou array vazio se não houver nenhum).

## 📚 Referências

- **Documentação da API do Chatwoot:** https://www.chatwoot.com/developers/api/
- **Criar Access Token:** https://www.chatwoot.com/docs/product/channels/api/create-channel
- **Gerenciar Equipes:** https://www.chatwoot.com/docs/user-guide/teams

## 🆘 Ainda com Problemas?

Se depois de seguir todos os passos ainda tiver problemas:

1. Abra uma issue no GitHub: https://github.com/lemosnuuk/Bot-SAAE/issues
2. Inclua:
   - Mensagem de erro completa
   - Logs do bot (remova informações sensíveis)
   - Versão do Chatwoot que está usando
   - Se é self-hosted ou cloud

---

**Dica Final:** Teste primeiro com uma equipe simples e uma inbox. Depois que tudo funcionar, você pode expandir para múltiplas equipes e setores! 🚀

