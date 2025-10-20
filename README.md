# 🤖 Bot de Triagem SAAE - WhatsApp + Chatwoot

Bot automatizado de triagem para WhatsApp integrado com **Chatwoot** (plataforma open-source de atendimento). Desenvolvido com Node.js e whatsapp-web.js.

## ✨ Novidade: Integração com Chatwoot!

O bot agora cria tickets automaticamente no painel do Chatwoot ao invés de apenas enviar notificações! 🎉

## 📋 Funcionalidades

- ✅ Conexão via QR Code (apenas na primeira vez)
- ✅ Sessão persistente (não precisa escanear QR Code toda vez)
- ✅ Menu interativo com opções numeradas (1, 2, 3)
- ✅ Triagem automática para setores:
  - 💰 Faturas
  - ❓ Dúvidas e Informações
  - 📢 Reportes
- ✅ **Integração completa com Chatwoot**
  - Criação automática de contatos
  - Criação de conversas (tickets)
  - Atribuição à equipe configurada
- ✅ Mensagens de confirmação para o cliente
- ✅ Logs detalhados de todas as interações

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conexão com a internet
- **Instância do Chatwoot** (pode ser self-hosted ou cloud)

### Passos para Instalação

1. **Clone ou baixe este repositório**

```bash
git clone https://github.com/lemosnuuk/Bot-SAAE.git
cd Bot-SAAE
```

2. **Instale as dependências:**
```bash
npm install
```

## ⚙️ Configuração

### 1. Configurar Chatwoot

Antes de iniciar o bot, você precisa configurar a integração com o Chatwoot.

#### 1.1. Obter Token de Acesso

1. Acesse seu Chatwoot
2. Vá em **Perfil** (canto inferior esquerdo) → **Profile Settings**
3. Clique em **Access Token**
4. Copie o token gerado

#### 1.2. Obter IDs Necessários

**ID da Conta (Account ID):**
- Normalmente é `1` para a primeira conta
- Aparece na URL: `/app/accounts/1/...`

**ID da Caixa de Entrada (Inbox ID):**
1. Vá em **Configurações** → **Caixas de Entrada**
2. Clique na sua inbox de WhatsApp
3. O ID aparece na URL: `/app/accounts/1/settings/inboxes/123` (o `123` é o ID)

**ID da Equipe (Team ID):**
1. Vá em **Configurações** → **Equipes**
2. Clique na sua equipe
3. O ID aparece na URL: `/app/accounts/1/settings/teams/456` (o `456` é o ID)

### 2. Criar arquivo .env

Copie o arquivo `env.example` para `.env`:

```bash
copy env.example .env
```

Ou no Linux/Mac:
```bash
cp env.example .env
```

Edite o arquivo `.env` e preencha com suas credenciais:

```env
# URL da sua instância do Chatwoot (sem barra no final)
CHATWOOT_BASE_URL=https://app.chatwoot.com

# Token de acesso da API
CHATWOOT_API_TOKEN=seu_token_aqui

# ID da Caixa de Entrada
CHATWOOT_INBOX_ID=1

# ID da Equipe
CHATWOOT_TEAM_ID=1

# ID da Conta
CHATWOOT_ACCOUNT_ID=1
```

**Exemplo real:**
```env
CHATWOOT_BASE_URL=https://chat.suaempresa.com
CHATWOOT_API_TOKEN=abc123def456ghi789jkl
CHATWOOT_INBOX_ID=5
CHATWOOT_TEAM_ID=3
CHATWOOT_ACCOUNT_ID=1
```

## 🎯 Como Usar

### 1. Iniciar o Bot

Execute o comando:
```bash
npm start
```

Ou diretamente:
```bash
node bot.js
```

### 2. Primeira Conexão (QR Code)

Na primeira execução, um QR Code será exibido no terminal:

1. Abra o WhatsApp no seu celular
2. Vá em **Configurações** → **Aparelhos Conectados**
3. Toque em **Conectar um aparelho**
4. Escaneie o QR Code exibido no terminal

⏳ **Aguarde 20-40 segundos** para o QR Code aparecer (o Puppeteer precisa inicializar o navegador automatizado).

### 3. Próximas Execuções

Nas próximas vezes, o bot se conectará automaticamente usando a sessão salva. Não será necessário escanear o QR Code novamente.

### 4. Funcionamento

1. **Cliente envia qualquer mensagem** → Bot responde com menu de opções
2. **Cliente digita 1, 2 ou 3** → Bot:
   - Busca ou cria o contato no Chatwoot
   - Cria uma nova conversa (ticket)
   - Atribui à equipe configurada
   - Envia mensagem de confirmação para o cliente

## 📱 Fluxo de Atendimento

### Do lado do Cliente (WhatsApp)

**Cliente:** "Olá" (ou qualquer mensagem)

**Bot responde:**
```
┌─────────────────────────────────┐
│  🤖 ATENDIMENTO AUTOMATIZADO    │
└─────────────────────────────────┘

Olá! 👋 Bem-vindo(a) ao atendimento SAAE.

Por favor, digite o número da opção desejada:

1 - 💰 Faturas
2 - ❓ Dúvidas e Informações  
3 - 📢 Reportes

Digite apenas o número (1, 2 ou 3)
```

**Cliente:** `1`

**Bot:**
```
✅ Solicitação Recebida - Faturas

Entendido! Sua solicitação foi registrada e um de nossos especialistas 
já irá te atender nesta mesma conversa.

Aguarde um momento, por favor. 🙏
```

### Do lado do Atendente (Chatwoot)

No painel do Chatwoot, um novo ticket será criado automaticamente com:

- **Contato:** Nome e telefone do cliente
- **Primeira Mensagem:**
  ```
  🎫 Nova Solicitação - Faturas

  Cliente solicitou atendimento para o setor de Faturas.

  Dados do Cliente:
  • Nome: João Silva
  • Telefone: +5519987654321
  • Horário: 15/10/2025 14:30:45
  ```
- **Status:** Aberto
- **Atribuído à:** Equipe configurada

## 🛠️ Solução de Problemas

### Erro: CHATWOOT_API_TOKEN não configurado

Se aparecer este erro ao iniciar o bot:
```
❌ ERRO: CHATWOOT_API_TOKEN não configurado!
```

**Solução:**
1. Verifique se o arquivo `.env` existe
2. Verifique se o token está preenchido corretamente
3. Reinicie o bot

### Erro ao criar contato/conversa

Se houver erros relacionados à API do Chatwoot:

**Possíveis causas:**
- Token de API inválido
- IDs incorretos (inbox, team, account)
- Permissões insuficientes do token
- URL do Chatwoot incorreta

**Solução:**
1. Verifique todos os valores no arquivo `.env`
2. Teste o token manualmente:
   ```bash
   curl -X GET "https://app.chatwoot.com/api/v1/accounts/1/contacts" \
   -H "api_access_token: seu_token_aqui"
   ```
3. Verifique os logs do bot para mais detalhes

### Bot não responde

- Verifique se o bot está conectado (veja a mensagem "✓ BOT CONECTADO COM SUCESSO!")
- Verifique se o Chatwoot está acessível
- Certifique-se de que o bot não está bloqueado no WhatsApp

### QR Code não aparece

Se o QR Code demorar muito ou não aparecer:
- Aguarde até 40 segundos (o Puppeteer precisa baixar o Chromium na primeira vez)
- Verifique sua conexão com a internet
- Verifique se não há firewall bloqueando

## 📦 Dependências

- `whatsapp-web.js` v1.23.0 - Biblioteca para integração com WhatsApp Web
- `qrcode-terminal` v0.12.0 - Exibição de QR Code no terminal
- `axios` - Cliente HTTP para chamadas à API do Chatwoot
- `dotenv` - Gerenciamento de variáveis de ambiente

## 📝 Observações Importantes

- ⚠️ Mantenha o bot rodando continuamente para receber mensagens
- ⚠️ Não feche o terminal enquanto o bot estiver em uso
- ⚠️ A pasta `.wwebjs_auth` contém dados sensíveis da sessão - não compartilhe
- ⚠️ O arquivo `.env` contém credenciais sensíveis - NUNCA faça commit dele no Git
- ⚠️ Para uso em produção, considere usar PM2 ou similar para manter o bot ativo
- ℹ️ O bot ignora mensagens enviadas por ele mesmo e status do WhatsApp
- ℹ️ Todos os logs são exibidos no console para facilitar o monitoramento

## 🔄 Manter o Bot Ativo 24/7

Para manter o bot rodando continuamente em produção, recomenda-se usar o PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar o bot com PM2
pm2 start bot.js --name saae-bot

# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs saae-bot

# Parar o bot
pm2 stop saae-bot

# Reiniciar o bot
pm2 restart saae-bot

# Remover do PM2
pm2 delete saae-bot

# Configurar para iniciar automaticamente ao reiniciar o servidor
pm2 startup
pm2 save
```

## 🧪 Arquivo de Teste

O repositório inclui um arquivo `teste-simples.js` para testar a conexão básica com o WhatsApp sem toda a lógica do bot. Para usar:

```bash
node teste-simples.js
```

## 📂 Estrutura do Projeto

```
Bot-SAAE/
├── bot.js              # Bot principal integrado com Chatwoot
├── teste-simples.js    # Script de teste de conexão
├── package.json        # Dependências do projeto
├── package-lock.json   # Lock de versões
├── env.example         # Exemplo de configuração (copiar para .env)
├── .env                # Configurações (NÃO versionar!)
├── README.md           # Este arquivo
├── .gitignore          # Arquivos ignorados pelo Git
└── .wwebjs_auth/       # Pasta de sessão (não versionada)
```

## 🔧 Arquitetura da Integração

```
Cliente WhatsApp
    ↓
Bot (whatsapp-web.js)
    ↓
1. Recebe mensagem
2. Exibe menu
3. Cliente escolhe opção
    ↓
API do Chatwoot
    ↓
4. Busca/Cria contato
5. Cria conversa (ticket)
6. Atribui à equipe
    ↓
Painel do Atendente
    ↓
7. Atendente visualiza ticket
8. Responde pelo Chatwoot
```

## 🚀 Melhorias Futuras

Possíveis melhorias para implementar:

- [ ] Suporte a múltiplas equipes (cada setor uma equipe diferente)
- [ ] Integração bidirecional (mensagens do Chatwoot para WhatsApp)
- [ ] Dashboard web para monitoramento
- [ ] Implementar horário de funcionamento
- [ ] Adicionar respostas automáticas para perguntas frequentes
- [ ] Histórico de atendimentos com banco de dados
- [ ] Métricas e relatórios de atendimento

## 📄 Licença

ISC

## 👨‍💻 Suporte e Documentação

- **Documentação do whatsapp-web.js:** https://wwebjs.dev/
- **Documentação da API do Chatwoot:** https://www.chatwoot.com/developers/api/
- **Repositório do projeto:** https://github.com/lemosnuuk/Bot-SAAE
- **Issues:** https://github.com/lemosnuuk/Bot-SAAE/issues

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Desenvolvido com ❤️ para SAAE**

**Versão:** 2.0.0 (Com integração Chatwoot)  
**Última atualização:** Outubro 2025
