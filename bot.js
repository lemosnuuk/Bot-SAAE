// ============================================================
// BOT DE TRIAGEM PARA WHATSAPP - SAAE
// Desenvolvido com Node.js e whatsapp-web.js
// ============================================================

// Importação das bibliotecas necessárias
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ============================================================
// CONFIGURAÇÃO DOS RESPONSÁVEIS (EDITE AQUI OS NÚMEROS)
// ============================================================
// Formato: 55 (código do país) + DDD + Número + @c.us
const RESPONSAVEIS = {
    faturas: '5518997587462@c.us',              // Número do responsável por Faturas
    duvidas: '5518997587462@c.us',              // Número do responsável por Dúvidas e Informações
    reportes: '5518997587462@c.us'              // Número do responsável por Reportes
};

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
// EVENTO: GERAÇÃO DO QR CODE
// ============================================================
// Este evento é disparado quando o bot precisa de autenticação
client.on('qr', (qr) => {
    console.log('┌────────────────────────────────────────┐');
    console.log('│  QR CODE GERADO - ESCANEIE COM O APP  │');
    console.log('└────────────────────────────────────────┘');
    qrcode.generate(qr, { small: true });
    console.log('\n✓ Abra o WhatsApp no seu celular');
    console.log('✓ Vá em Configurações > Aparelhos conectados');
    console.log('✓ Escaneie o QR Code acima\n');
});

// ============================================================
// EVENTO: CLIENTE PRONTO
// ============================================================
// Disparado quando o bot está conectado e pronto para uso
client.on('ready', () => {
    console.log('┌────────────────────────────────────────┐');
    console.log('│     ✓ BOT CONECTADO COM SUCESSO!      │');
    console.log('└────────────────────────────────────────┘');
    console.log(`Bot iniciado em: ${new Date().toLocaleString('pt-BR')}`);
    console.log('Aguardando mensagens...\n');
});

// ============================================================
// EVENTO: AUTENTICAÇÃO BEM-SUCEDIDA
// ============================================================
client.on('authenticated', () => {
    console.log('✓ Autenticação realizada com sucesso!');
    console.log('✓ Sessão salva localmente para próximas execuções.\n');
});

// ============================================================
// EVENTO: FALHA NA AUTENTICAÇÃO
// ============================================================
client.on('auth_failure', (message) => {
    console.error('✗ Falha na autenticação:', message);
    console.log('Tente deletar a pasta .wwebjs_auth e reiniciar o bot.\n');
});

// ============================================================
// EVENTO: DESCONEXÃO
// ============================================================
client.on('disconnected', (reason) => {
    console.log('✗ Bot desconectado. Motivo:', reason);
    console.log('Tentando reconectar...\n');
});

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
// FUNÇÃO: ENVIAR NOTIFICAÇÃO PARA RESPONSÁVEL
// ============================================================
async function notificarResponsavel(opcao, numeroCliente, nomeCliente) {
    try {
        const setorInfo = {
            '1': { nome: 'Faturas', responsavel: RESPONSAVEIS.faturas },
            '2': { nome: 'Dúvidas e Informações', responsavel: RESPONSAVEIS.duvidas },
            '3': { nome: 'Reportes', responsavel: RESPONSAVEIS.reportes }
        };

        const setor = setorInfo[opcao];
        if (!setor) return;

        // Formata o número do cliente para exibição (sem @c.us)
        const numeroFormatado = numeroCliente.replace('@c.us', '');

        const mensagemNotificacao = 
            `🔔 *NOVA SOLICITAÇÃO - ${setor.nome.toUpperCase()}*\n\n` +
            `👤 Cliente: ${nomeCliente || 'Não identificado'}\n` +
            `📱 Número: ${numeroFormatado}\n` +
            `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
            `O cliente está aguardando atendimento. Por favor, entre em contato.`;

        await client.sendMessage(setor.responsavel, mensagemNotificacao);
        
        console.log(`✓ Notificação enviada para ${setor.nome}: ${setor.responsavel}`);
    } catch (error) {
        console.error('✗ Erro ao enviar notificação:', error);
    }
}

// ============================================================
// FUNÇÃO: PROCESSAR OPÇÃO DO USUÁRIO
// ============================================================
async function processarOpcao(opcao, message) {
    const chat = await message.getChat();
    const contato = await message.getContact();
    const nomeCliente = contato.pushname || contato.name || '';

    let mensagemConfirmacao = '';
    let setorNome = '';

    switch (opcao) {
        case '1':
            setorNome = 'Faturas';
            mensagemConfirmacao = 
                `✅ *Solicitação Recebida - Faturas*\n\n` +
                `Sua solicitação foi enviada para a equipe de Faturas.\n` +
                `Em breve, um de nossos atendentes entrará em contato com você.\n\n` +
                `Obrigado pela sua paciência! 🙏`;
            break;

        case '2':
            setorNome = 'Dúvidas e Informações';
            mensagemConfirmacao = 
                `✅ *Solicitação Recebida - Dúvidas e Informações*\n\n` +
                `Sua solicitação foi enviada para a equipe de Dúvidas e Informações.\n` +
                `Em breve, um de nossos atendentes entrará em contato com você.\n\n` +
                `Obrigado pela sua paciência! 🙏`;
            break;

        case '3':
            setorNome = 'Reportes';
            mensagemConfirmacao = 
                `✅ *Solicitação Recebida - Reportes*\n\n` +
                `Sua solicitação foi enviada para a equipe de Reportes.\n` +
                `Em breve, um de nossos atendentes entrará em contato com você.\n\n` +
                `Obrigado pela sua paciência! 🙏`;
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

    // Envia mensagem de confirmação para o cliente
    await message.reply(mensagemConfirmacao);
    console.log('✓ Confirmação enviada ao cliente');

    // Envia notificação para o responsável do setor
    await notificarResponsavel(opcao, message.from, nomeCliente);
    console.log('✓ Processo de triagem concluído!\n');
}

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
