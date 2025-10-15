# 🤖 Bot de Triagem SAAE - WhatsApp

Bot automatizado de triagem para WhatsApp com menu interativo de opções numeradas, desenvolvido com Node.js e whatsapp-web.js.

## 📋 Funcionalidades

- ✅ Conexão via QR Code (apenas na primeira vez)
- ✅ Sessão persistente (não precisa escanear QR Code toda vez)
- ✅ Menu interativo com opções numeradas (1, 2, 3)
- ✅ Triagem automática para setores:
  - 💰 Faturas
  - ❓ Dúvidas e Informações
  - 📢 Reportes
- ✅ Notificação automática para responsáveis de cada setor
- ✅ Mensagens de confirmação para o cliente
- ✅ Logs detalhados de todas as interações

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conexão com a internet

### Passos para Instalação

1. **Clone ou baixe este repositório**

```bash
git clone https://github.com/CAFFD/SAAE---Bot.git
cd SAAE---Bot
```

2. **Instale as dependências:**
```bash
npm install
```

## ⚙️ Configuração

### Configurar Números dos Responsáveis

Antes de iniciar o bot, você precisa configurar os números de WhatsApp dos responsáveis por cada setor.

Abra o arquivo `bot.js` e edite a seção de configuração no topo do arquivo (linhas 13-17):

```javascript
const RESPONSAVEIS = {
    faturas: '5511999999999@c.us',      // Substitua pelo número real
    duvidas: '5511988888888@c.us',      // Substitua pelo número real
    reportes: '5511977777777@c.us'      // Substitua pelo número real
};
```

**Formato do número:**
- `55` = Código do país (Brasil)
- `11` = DDD
- `999999999` = Número do celular (9 dígitos)
- `@c.us` = Sufixo obrigatório do WhatsApp

**Exemplo real:**
```javascript
faturas: '5519987654321@c.us'  // (19) 98765-4321
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
   - Envia mensagem de confirmação para o cliente
   - Notifica o responsável do setor com os dados do cliente

## 📱 Exemplo de Uso

### Passo 1: Cliente inicia conversa

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

### Passo 2: Cliente escolhe opção

**Cliente:** `1`

### Passo 3: Bot processa e notifica

**Bot para o Cliente:**
```
✅ Solicitação Recebida - Faturas

Sua solicitação foi enviada para a equipe de Faturas.
Em breve, um de nossos atendentes entrará em contato com você.

Obrigado pela sua paciência! 🙏
```

**Bot para o Responsável:**
```
🔔 NOVA SOLICITAÇÃO - FATURAS

👤 Cliente: João Silva
📱 Número: 5519912345678
⏰ Horário: 14/10/2025 15:44:21

O cliente está aguardando atendimento. Por favor, entre em contato.
```

## 🛠️ Solução de Problemas

### Erro de Autenticação

Se houver problemas de autenticação:
1. Feche o bot (Ctrl+C no terminal)
2. Delete a pasta `.wwebjs_auth`
3. Reinicie o bot e escaneie o QR Code novamente

### Bot não responde

- Verifique se o bot está conectado (veja a mensagem "✓ BOT CONECTADO COM SUCESSO!")
- Verifique se o número está no formato correto: `55DDDNUMERO@c.us`
- Certifique-se de que o bot não está bloqueado no WhatsApp
- Verifique os logs no terminal para identificar erros

### QR Code não aparece

Se o QR Code demorar muito ou não aparecer:
- Aguarde até 40 segundos (o Puppeteer precisa baixar o Chromium na primeira vez)
- Verifique sua conexão com a internet
- Tente rodar: `type bot.js | node` (Windows) ou `cat bot.js | node` (Linux/Mac)
- Verifique se não há firewall bloqueando

### Opção Inválida

Se o usuário digitar algo diferente de 1, 2 ou 3, o bot automaticamente reenvia o menu com as opções.

## 📦 Dependências

- `whatsapp-web.js` v1.23.0 - Biblioteca para integração com WhatsApp Web
- `qrcode-terminal` v0.12.0 - Exibição de QR Code no terminal

## 📝 Observações Importantes

- ⚠️ Mantenha o bot rodando continuamente para receber mensagens
- ⚠️ Não feche o terminal enquanto o bot estiver em uso
- ⚠️ A pasta `.wwebjs_auth` contém dados sensíveis da sessão - não compartilhe
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

Este arquivo é útil para:
- Verificar se as dependências estão instaladas corretamente
- Testar a conexão com WhatsApp
- Identificar problemas antes de rodar o bot completo

## 📂 Estrutura do Projeto

```
SAAE---Bot/
├── bot.js              # Bot principal com lógica de triagem
├── teste-simples.js    # Script de teste de conexão
├── package.json        # Dependências do projeto
├── package-lock.json   # Lock de versões
├── README.md           # Este arquivo
├── .gitignore          # Arquivos ignorados pelo Git
└── .wwebjs_auth/       # Pasta de sessão (não versionada)
```

## 🚀 Melhorias Futuras

Possíveis melhorias para implementar:

- [ ] Adicionar banco de dados para histórico de atendimentos
- [ ] Implementar horário de funcionamento (fora do horário envia mensagem automática)
- [ ] Adicionar mais setores de atendimento
- [ ] Criar dashboard web para monitoramento
- [ ] Implementar respostas automáticas para perguntas frequentes
- [ ] Adicionar sistema de fila de atendimento

## 📄 Licença

ISC

## 👨‍💻 Suporte e Documentação

- **Documentação do whatsapp-web.js:** https://wwebjs.dev/
- **Repositório oficial:** https://github.com/pedroslopez/whatsapp-web.js
- **Issues do projeto:** https://github.com/CAFFD/SAAE---Bot/issues

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Desenvolvido com ❤️ para SAAE**

**Versão:** 1.0.0  
**Última atualização:** Outubro 2025
