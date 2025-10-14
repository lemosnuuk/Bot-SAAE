# 🤖 Bot de Triagem SAAE - WhatsApp

Bot automatizado de triagem para WhatsApp com interface de botões clicáveis, desenvolvido com Node.js e whatsapp-web.js.

## 📋 Funcionalidades

- ✅ Conexão via QR Code (apenas na primeira vez)
- ✅ Sessão persistente (não precisa escanear QR Code toda vez)
- ✅ Menu interativo com botões clicáveis
- ✅ Triagem automática para setores:
  - 💰 Faturas
  - ❓ Dúvidas e Informações
  - 📢 Reportes
- ✅ Notificação automática para responsáveis de cada setor
- ✅ Mensagens de confirmação para o cliente

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conexão com a internet

### Passos para Instalação

1. **Clone ou baixe este repositório**

2. **Instale as dependências:**
   ```bash
   npm install
   ```

## ⚙️ Configuração

### Configurar Números dos Responsáveis

Antes de iniciar o bot, você precisa configurar os números de WhatsApp dos responsáveis por cada setor.

Abra o arquivo `bot.js` e edite a seção de configuração no topo do arquivo:

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

### 3. Próximas Execuções

Nas próximas vezes, o bot se conectará automaticamente usando a sessão salva. Não será necessário escanear o QR Code novamente.

### 4. Funcionamento

- **Cliente envia qualquer mensagem** → Bot responde com menu de botões
- **Cliente clica em um botão** → Bot:
  1. Envia mensagem de confirmação para o cliente
  2. Notifica o responsável do setor com os dados do cliente

## 📱 Exemplo de Uso

**Cliente:** "Olá"

**Bot:** (Envia menu com botões)
- Faturas
- Dúvidas e Informações
- Reportes

**Cliente:** (Clica em "Faturas")

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

📱 Cliente: 5519912345678
⏰ Horário: 14/10/2025 10:30:45

O cliente está aguardando atendimento. Por favor, entre em contato.
```

## 🛠️ Solução de Problemas

### Erro de Autenticação

Se houver problemas de autenticação:
1. Feche o bot
2. Delete a pasta `.wwebjs_auth`
3. Reinicie o bot e escaneie o QR Code novamente

### Bot não responde

- Verifique se o bot está conectado (veja a mensagem "BOT CONECTADO COM SUCESSO!")
- Verifique se o número está no formato correto: `55DDDNUMERO@c.us`
- Certifique-se de que o bot não está bloqueado no WhatsApp

### Botões não aparecem

Se os botões não aparecerem para alguns usuários:
- Verifique se o WhatsApp do cliente está atualizado
- A funcionalidade de botões requer uma versão recente do WhatsApp

## 📦 Dependências

- `whatsapp-web.js` v1.23.0 - Biblioteca para integração com WhatsApp Web
- `qrcode-terminal` v0.12.0 - Exibição de QR Code no terminal

## 📝 Observações Importantes

- ⚠️ Mantenha o bot rodando continuamente para receber mensagens
- ⚠️ Não feche o terminal enquanto o bot estiver em uso
- ⚠️ A pasta `.wwebjs_auth` contém dados sensíveis da sessão - não compartilhe
- ⚠️ Para uso em produção, considere usar PM2 ou similar para manter o bot ativo

## 🔄 Manter o Bot Ativo 24/7

Para manter o bot rodando continuamente, recomenda-se usar o PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar o bot com PM2
pm2 start bot.js --name saae-bot

# Ver status
pm2 status

# Ver logs
pm2 logs saae-bot

# Parar o bot
pm2 stop saae-bot

# Reiniciar o bot
pm2 restart saae-bot
```

## 📄 Licença

ISC

## 👨‍💻 Suporte

Para dúvidas ou problemas, consulte a documentação do whatsapp-web.js:
https://wwebjs.dev/

---

Desenvolvido com ❤️ para SAAE

