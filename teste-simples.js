const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('==============================================');
console.log('TESTE SIMPLES - CONEXÃO WHATSAPP');
console.log('==============================================\n');

console.log('[1/4] Carregando bibliotecas... OK');

const client = new Client({
    authStrategy: new LocalAuth()
});

console.log('[2/4] Cliente criado... OK');
console.log('[3/4] Inicializando (aguarde 20-40 segundos)...\n');

client.on('qr', (qr) => {
    console.log('✅ QR CODE GERADO!\n');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Escaneie o QR acima com seu WhatsApp!');
});

client.on('ready', () => {
    console.log('\n✅ CONECTADO COM SUCESSO!');
    console.log('✅ O bot está funcionando!');
    process.exit(0);
});

client.on('loading_screen', (percent) => {
    console.log(`⏳ Carregando... ${percent}%`);
});

client.on('auth_failure', (msg) => {
    console.error('\n❌ Falha na autenticação:', msg);
    process.exit(1);
});

client.initialize().catch(err => {
    console.error('\n❌ ERRO ao inicializar:', err.message);
    process.exit(1);
});

console.log('[4/4] Aguardando QR Code...\n');

// Timeout de segurança
setTimeout(() => {
    console.log('\n⚠️  TIMEOUT: Bot demorou mais de 60 segundos.');
    console.log('Possíveis causas:');
    console.log('- Conexão lenta');
    console.log('- Puppeteer/Chromium travado');
    console.log('- Firewall bloqueando');
    process.exit(1);
}, 60000);

