#!/bin/bash

# =============================================================================
# Script de Instalação Automática do Chatwoot
# Para Ubuntu/Debian
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Banner
clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      🚀 INSTALADOR AUTOMÁTICO DO CHATWOOT 🚀              ║"
echo "║                                                            ║"
echo "║      Para Ubuntu/Debian com Docker                        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se é root
if [ "$EUID" -eq 0 ]; then 
    print_error "Não execute este script como root!"
    print_info "Execute: bash install-chatwoot.sh"
    exit 1
fi

print_info "Iniciando instalação do Chatwoot..."
echo ""

# 1. Atualizar sistema
print_info "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema atualizado!"
echo ""

# 2. Instalar dependências
print_info "Instalando dependências..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git
print_success "Dependências instaladas!"
echo ""

# 3. Instalar Docker
print_info "Verificando instalação do Docker..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker não encontrado. Instalando..."
    
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    sudo usermod -aG docker $USER
    print_success "Docker instalado!"
else
    print_success "Docker já está instalado!"
fi
echo ""

# 4. Verificar Docker Compose
print_info "Verificando Docker Compose..."
if docker compose version &> /dev/null; then
    print_success "Docker Compose está instalado!"
else
    print_error "Docker Compose não encontrado!"
    exit 1
fi
echo ""

# 5. Criar diretório
print_info "Criando diretório para Chatwoot..."
CHATWOOT_DIR="$HOME/chatwoot"
mkdir -p $CHATWOOT_DIR
cd $CHATWOOT_DIR
print_success "Diretório criado: $CHATWOOT_DIR"
echo ""

# 6. Baixar arquivos
print_info "Baixando arquivos de configuração..."
curl -fsSL https://raw.githubusercontent.com/chatwoot/chatwoot/develop/docker-compose.production.yaml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/chatwoot/chatwoot/develop/.env.example -o .env
print_success "Arquivos baixados!"
echo ""

# 7. Configurar .env
print_info "Configurando variáveis de ambiente..."
echo ""

# Obter IP do servidor
SERVER_IP=$(hostname -I | awk '{print $1}')
print_info "IP detectado do servidor: $SERVER_IP"
echo ""

# Perguntar URL frontend
print_warning "Como você quer acessar o Chatwoot?"
echo "  1) Usar IP (http://$SERVER_IP:3000)"
echo "  2) Usar domínio personalizado"
read -p "Escolha (1 ou 2): " url_choice

if [ "$url_choice" == "2" ]; then
    read -p "Digite o domínio (ex: chat.suaempresa.com): " domain
    FRONTEND_URL="https://$domain"
else
    FRONTEND_URL="http://$SERVER_IP:3000"
fi

print_info "URL do Frontend: $FRONTEND_URL"
echo ""

# Gerar SECRET_KEY_BASE
print_info "Gerando chave secreta..."
SECRET_KEY=$(openssl rand -hex 64)
print_success "Chave gerada!"
echo ""

# Atualizar .env
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|g" .env
sed -i "s|SECRET_KEY_BASE=.*|SECRET_KEY_BASE=$SECRET_KEY|g" .env
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=chatwoot$(openssl rand -hex 8)|g" .env

print_success "Arquivo .env configurado!"
echo ""

# 8. Iniciar containers
print_info "Iniciando containers Docker..."
print_warning "Isso pode demorar 2-5 minutos na primeira vez..."
echo ""

# Verificar se grupo docker está ativo (necessário após usermod)
if ! groups | grep -q docker; then
    print_warning "Você foi adicionado ao grupo docker."
    print_warning "Para aplicar as mudanças, execute: newgrp docker"
    print_warning "Ou faça logout e login novamente."
    echo ""
    print_info "Execute novamente este script após fazer logout/login"
    exit 0
fi

docker compose up -d

# Aguardar containers iniciarem
print_info "Aguardando containers iniciarem..."
sleep 30

# Verificar status
if docker compose ps | grep -q "Up"; then
    print_success "Containers iniciados com sucesso!"
else
    print_error "Erro ao iniciar containers!"
    print_info "Execute: docker compose logs para ver detalhes"
    exit 1
fi
echo ""

# 9. Preparar banco de dados
print_info "Preparando banco de dados..."
docker compose exec -T chatwoot-rails bundle exec rails db:chatwoot_prepare
print_success "Banco de dados preparado!"
echo ""

# 10. Criar usuário admin
print_info "Criando usuário administrador..."
docker compose exec -T chatwoot-rails bundle exec rails db:seed
print_success "Usuário criado!"
echo ""

# Informações finais
clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      ✅ CHATWOOT INSTALADO COM SUCESSO! ✅                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Instalação concluída!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📋 INFORMAÇÕES DE ACESSO:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 URL de Acesso:"
echo "   $FRONTEND_URL"
echo ""
echo "👤 Credenciais Padrão:"
echo "   Email: admin@chatwoot.com"
echo "   Senha: chatwoot123"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Altere a senha após o primeiro login!"
echo "   - Crie uma Inbox do tipo API para o bot"
echo "   - Crie uma Equipe e atribua a Inbox"
echo "   - Obtenha o API Token em Profile Settings"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📁 LOCALIZAÇÃO DOS ARQUIVOS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Diretório: $CHATWOOT_DIR"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🔧 COMANDOS ÚTEIS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Ver status:     docker compose ps"
echo "   Ver logs:       docker compose logs -f"
echo "   Reiniciar:      docker compose restart"
echo "   Parar:          docker compose down"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📚 PRÓXIMOS PASSOS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   1. Acesse: $FRONTEND_URL"
echo "   2. Faça login com as credenciais acima"
echo "   3. ALTERE A SENHA!"
echo "   4. Siga o guia CHATWOOT_SETUP.md para configurar o bot"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
print_success "Instalação finalizada! Bom uso! 🚀"
echo ""

