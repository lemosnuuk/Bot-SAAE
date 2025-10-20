// ============================================================
// BOT DE TRIAGEM PARA WHATSAPP - SAAE (Integrado com Chatwoot)
// Desenvolvido com Node.js e whatsapp-web.js
// ============================================================

// Carrega variáveis de ambiente
require('dotenv').config();

// Importação das bibliotecas necessárias
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// ============================================================
// CONFIGURAÇÕES DO CHATWOOT (via .env)
// ============================================================
const CHATWOOT_CONFIG = {
    baseURL: process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com',
    apiToken: process.env.CHATWOOT_API_TOKEN,
    accountId: process.env.CHATWOOT_ACCOUNT_ID || '1',
    inboxId: process.env.CHATWOOT_INBOX_ID || '1',
    teamId: process.env.CHATWOOT_TEAM_ID || '1'
};

// Validação das configurações
if (!CHATWOOT_CONFIG.apiToken) {
    console.error('❌ ERRO: CHATWOOT_API_TOKEN não configurado!');
    console.log('Por favor, crie um arquivo .env com as configurações necessárias.');
    console.log('Veja o arquivo env.example para referência.\n');
    process.exit(1);
}

// ============================================================
// CONFIGURAÇÃO DA API DO CHATWOOT
// ============================================================
const chatwootAPI = axios.create({
    baseURL: `${CHATWOOT_CONFIG.baseURL}/api/v1/accounts/${CHATWOOT_CONFIG.accountId}`,
    headers: {
        'api_access_token': CHATWOOT_CONFIG.apiToken,
        'Content-Type': 'application/json'
    }
});

// ============================================================
// INICIALIZAÇÃO DO CLIENTE WHATSAPP
// ============================================================
console.log('Criando cliente WhatsApp...');
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "saae-bot-triagem"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});
console.log('Cliente criado com sucesso!');

// ============================================================
// FUNÇÕES DE INTEGRAÇÃO COM CHATWOOT
// ============================================================

/**
 * Busca um contato no Chatwoot pelo número de telefone
 * @param {string} phoneNumber - Número no formato internacional (+5519999999999)
 * @returns {Object|null} - Objeto do contato ou null se não encontrado
 */
async function findContactByPhone(phoneNumber) {
    try {
        console.log(`   🔍 Buscando contato no Chatwoot: ${phoneNumber}`);
        
        const response = await chatwootAPI.get('/contacts/search', {
            params: { q: phoneNumber }
        });

        if (response.data && response.data.payload && response.data.payload.length > 0) {
            const contact = response.data.payload[0];
            console.log(`   ✓ Contato encontrado! ID: ${contact.id}`);
            return contact;
        }

        console.log('   ℹ️ Contato não encontrado');
        return null;
    } catch (error) {
        console.error('   ✗ Erro ao buscar contato:', error.message);
        return null;
    }
}

/**
 * Cria um novo contato no Chatwoot
 * @param {string} phoneNumber - Número no formato internacional (+5519999999999)
 * @param {string} name - Nome do contato
 * @returns {Object|null} - Objeto do contato criado ou null em caso de erro
 */
async function createContact(phoneNumber, name) {
    try {
        console.log(`   ➕ Criando novo contato: ${name} (${phoneNumber})`);
        
        const response = await chatwootAPI.post('/contacts', {
            inbox_id: CHATWOOT_CONFIG.inboxId,
            name: name || 'Cliente WhatsApp',
            phone_number: phoneNumber
        });

        console.log(`   ✓ Contato criado! ID: ${response.data.payload.contact.id}`);
        return response.data.payload.contact;
    } catch (error) {
        console.error('   ✗ Erro ao criar contato:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Busca ou cria um contato no Chatwoot
 * @param {string} phoneNumber - Número no formato internacional
 * @param {string} name - Nome do contato
 * @returns {Object|null} - Objeto do contato
 */
async function findOrCreateContact(phoneNumber, name) {
    let contact = await findContactByPhone(phoneNumber);
    
    if (!contact) {
        contact = await createContact(phoneNumber, name);
    }
    
    return contact;
}

/**
 * Cria uma nova conversa no Chatwoot
 * @param {number} contactId - ID do contato no Chatwoot
 * @param {string} initialMessage - Mensagem inicial da conversa
 * @param {string} sourceId - ID da origem (número do WhatsApp do cliente)
 * @returns {Object|null} - Objeto da conversa criada
 */
async function createConversation(contactId, initialMessage, sourceId) {
    try {
        console.log(`   💬 Criando conversa para contato ID: ${contactId}`);
        
        // Cria a conversa
        const response = await chatwootAPI.post('/conversations', {
            source_id: sourceId,
            inbox_id: CHATWOOT_CONFIG.inboxId,
            contact_id: contactId,
            status: 'open'
        });

        const conversation = response.data;
        console.log(`   ✓ Conversa criada! ID: ${conversation.id}`);

        // Envia a mensagem inicial
        await chatwootAPI.post(`/conversations/${conversation.id}/messages`, {
            content: initialMessage,
            message_type: 'incoming',
            private: false
        });

        console.log(`   ✓ Mensagem inicial enviada`);

        // Atribui à equipe
        if (CHATWOOT_CONFIG.teamId) {
            await chatwootAPI.post(`/conversations/${conversation.id}/assignments`, {
                team_id: parseInt(CHATWOOT_CONFIG.teamId)
            });
            console.log(`   ✓ Conversa atribuída à equipe ID: ${CHATWOOT_CONFIG.teamId}`);
        }

        return conversation;
    } catch (error) {
        console.error('   ✗ Erro ao criar conversa:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Processa a solicitação do cliente e cria ticket no Chatwoot
 * @param {string} opcao - Opção escolhida (1, 2 ou 3)
 * @param {string} phoneNumber - Número do WhatsApp do cliente
 * @param {string} clientName - Nome do cliente
 * @returns {boolean} - true se sucesso, false se erro
 */
async function processarSolicitacaoChatwoot(opcao, phoneNumber, clientName) {
    try {
        const setorInfo = {
            '1': 'Faturas',
            '2': 'Dúvidas e Informações',
            '3': 'Reportes'
        };

        const setorNome = setorInfo[opcao];
        if (!setorNome) return false;

        console.log(`\n📋 Processando solicitação no Chatwoot:`);
        console.log(`   Setor: ${setorNome}`);
        console.log(`   Cliente: ${clientName}`);
        console.log(`   Telefone: ${phoneNumber}`);

        // Formata o número para formato internacional
        const internationalPhone = phoneNumber.replace('@c.us', '');
        const formattedPhone = `+${internationalPhone}`;

        // 1. Buscar ou criar contato
        const contact = await findOrCreateContact(formattedPhone, clientName);
        
        if (!contact) {
            console.error('   ✗ Falha ao obter/criar contato');
            return false;
        }

        // 2. Criar conversa com mensagem inicial
        const initialMessage = `🎫 **Nova Solicitação - ${setorNome}**\n\n` +
            `Cliente solicitou atendimento para o setor de ${setorNome}.\n\n` +
            `**Dados do Cliente:**\n` +
            `• Nome: ${clientName}\n` +
            `• Telefone: ${formattedPhone}\n` +
            `• Horário: ${new Date().toLocaleString('pt-BR')}`;

        const conversation = await createConversation(
            contact.id,
            initialMessage,
            internationalPhone
        );

        if (!conversation) {
            console.error('   ✗ Falha ao criar conversa');
            return false;
        }

        console.log(`✅ Ticket criado com sucesso no Chatwoot!\n`);
        return true;

    } catch (error) {
        console.error('✗ Erro ao processar solicitação:', error.message);
        return false;
    }
}

// ============================================================
// FUNÇÃO: CRIAR MENU PRINCIPAL
// ============================================================
function criarMenuPrincipal() {
    return `┌─────────────────────────────────┐
│  🤖 *ATENDIMENTO AUTOMATIZADO*  │
└─────────────────────────────────┘

Olá! 👋 Bem-vindo(a) ao atendimento SAAE.

Por favor, digite o *número* da opção desejada:

*1* - 💰 Faturas
*2* - ❓ Dúvidas e Informações  
*3* - 📢 Reportes

_Digite apenas o número (1, 2 ou 3)_`;
}

// ============================================================
// FUNÇÃO: PROCESSAR OPÇÃO DO USUÁRIO
// ============================================================
async function processarOpcao(opcao, message) {
    const chat = await message.getChat();
    const contato = await message.getContact();
    const nomeCliente = contato.pushname || contato.name || 'Cliente';

    let mensagemConfirmacao = '';
    let setorNome = '';

    switch (opcao) {
        case '1':
            setorNome = 'Faturas';
            mensagemConfirmacao = 
                `✅ *Solicitação Recebida - Faturas*\n\n` +
                `Entendido! Sua solicitação foi registrada e um de nossos especialistas ` +
                `já irá te atender nesta mesma conversa.\n\n` +
                `Aguarde um momento, por favor. 🙏`;
            break;

        case '2':
            setorNome = 'Dúvidas e Informações';
            mensagemConfirmacao = 
                `✅ *Solicitação Recebida - Dúvidas e Informações*\n\n` +
                `Entendido! Sua solicitação foi registrada e um de nossos especialistas ` +
                `já irá te atender nesta mesma conversa.\n\n` +
                `Aguarde um momento, por favor. 🙏`;
            break;

        case '3':
            setorNome = 'Reportes';
            mensagemConfirmacao = 
                `✅ *Solicitação Recebida - Reportes*\n\n` +
                `Entendido! Sua solicitação foi registrada e um de nossos especialistas ` +
                `já irá te atender nesta mesma conversa.\n\n` +
                `Aguarde um momento, por favor. 🙏`;
            break;

        default:
            // Opção inválida
            const mensagemErro = 
                `❌ *Opção inválida!*\n\n` +
                `Por favor, digite apenas *1*, *2* ou *3*.\n\n` +
                criarMenuPrincipal();
            await message.reply(mensagemErro);
            console.log(`✗ Opção inválida recebida: ${opcao}`);
            return;
    }

    console.log(`→ Processando solicitação para: ${setorNome}`);

    // Processa no Chatwoot
    const sucesso = await processarSolicitacaoChatwoot(opcao, message.from, nomeCliente);

    if (sucesso) {
        // Envia mensagem de confirmação para o cliente
        await message.reply(mensagemConfirmacao);
        console.log('✓ Confirmação enviada ao cliente');
        console.log('✓ Processo de triagem concluído!\n');
    } else {
        // Em caso de erro, notifica o cliente
        await message.reply(
            `⚠️ *Atenção*\n\n` +
            `Houve um problema ao registrar sua solicitação. ` +
            `Por favor, tente novamente em alguns instantes ou entre em contato diretamente.`
        );
        console.log('✗ Erro ao processar no Chatwoot\n');
    }
}

// ============================================================
// EVENTOS DO WHATSAPP
// ============================================================

client.on('qr', (qr) => {
    console.log('┌────────────────────────────────────────┐');
    console.log('│  QR CODE GERADO - ESCANEIE COM O APP  │');
    console.log('└────────────────────────────────────────┘');
    qrcode.generate(qr, { small: true });
    console.log('\n✓ Abra o WhatsApp no seu celular');
    console.log('✓ Vá em Configurações > Aparelhos conectados');
    console.log('✓ Escaneie o QR Code acima\n');
});

client.on('ready', () => {
    console.log('┌────────────────────────────────────────┐');
    console.log('│     ✓ BOT CONECTADO COM SUCESSO!      │');
    console.log('└────────────────────────────────────────┘');
    console.log(`Bot iniciado em: ${new Date().toLocaleString('pt-BR')}`);
    console.log('\n📡 Integração com Chatwoot ativa!');
    console.log(`   URL: ${CHATWOOT_CONFIG.baseURL}`);
    console.log(`   Conta ID: ${CHATWOOT_CONFIG.accountId}`);
    console.log(`   Inbox ID: ${CHATWOOT_CONFIG.inboxId}`);
    console.log(`   Team ID: ${CHATWOOT_CONFIG.teamId}`);
    console.log('\nAguardando mensagens...\n');
});

client.on('authenticated', () => {
    console.log('✓ Autenticação realizada com sucesso!');
    console.log('✓ Sessão salva localmente para próximas execuções.\n');
});

client.on('auth_failure', (message) => {
    console.error('✗ Falha na autenticação:', message);
    console.log('Tente deletar a pasta .wwebjs_auth e reiniciar o bot.\n');
});

client.on('disconnected', (reason) => {
    console.log('✗ Bot desconectado. Motivo:', reason);
    console.log('Tentando reconectar...\n');
});

// ============================================================
// EVENTO PRINCIPAL: RECEBIMENTO DE MENSAGENS
// ============================================================
client.on('message', async (message) => {
    try {
        // Ignora mensagens de status e mensagens enviadas pelo próprio bot
        if (message.from === 'status@broadcast' || message.fromMe) {
            return;
        }

        const remetente = message.from;
        const corpo = message.body.trim();

        console.log(`\n📩 Mensagem recebida de: ${remetente}`);
        console.log(`Conteúdo: ${corpo}`);

        // Verifica se a mensagem é uma opção válida (1, 2 ou 3)
        if (corpo === '1' || corpo === '2' || corpo === '3') {
            await processarOpcao(corpo, message);
        } else {
            // Qualquer outra mensagem exibe o menu
            console.log('→ Enviando menu de opções...');
            const menu = criarMenuPrincipal();
            await message.reply(menu);
            console.log('✓ Menu enviado com sucesso!\n');
        }

    } catch (error) {
        console.error('✗ Erro ao processar mensagem:', error);
    }
});

// ============================================================
// INICIALIZAÇÃO DO BOT
// ============================================================
console.log('┌────────────────────────────────────────┐');
console.log('│   🤖 BOT DE TRIAGEM SAAE - INICIANDO  │');
console.log('│      (Integrado com Chatwoot)         │');
console.log('└────────────────────────────────────────┘\n');

console.log('Aguarde... Inicializando navegador automatizado (Puppeteer)...');
console.log('Isso pode demorar 20-40 segundos na primeira vez.\n');

// Inicia o cliente
client.initialize()
    .then(() => {
        console.log('Cliente inicializado!');
    })
    .catch((err) => {
        console.error('ERRO ao inicializar cliente:', err);
    });

// ============================================================
// TRATAMENTO DE ERROS GLOBAIS
// ============================================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('\n✗ ERRO NÃO TRATADO (Rejection):', reason);
});

process.on('uncaughtException', (error) => {
    console.error('\n✗ EXCEÇÃO NÃO CAPTURADA:', error);
    process.exit(1);
});

// Log adicional de loading
client.on('loading_screen', (percent, message) => {
    console.log(`Carregando... ${percent}% - ${message}`);
});
