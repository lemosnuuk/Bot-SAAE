#!/bin/bash

# =============================================================================
# Script de Instalação do Chatwoot (SEM REBOOT)
# Para VM Proxmox já existente
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
echo "║      🚀 INSTALADOR CHATWOOT (SEM REBOOT) 🚀               ║"
echo "║                                                            ║"
echo "║      Para VM Proxmox existente                            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

print_info "Iniciando instalação do Chatwoot..."
echo ""

# Verificar se é root
if [ "$EUID" -eq 0 ]; then 
    print_error "Não execute este script como root!"
    print_info "Execute: bash install-chatwoot-no-reboot.sh"
    exit 1
fi

# 1. Atualizar sistema
print_info "Atualizando sistema..."
sudo apt update
print_success "Sistema atualizado!"
echo ""

# 2. Instalar dependências
print_info "Instalando dependências..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git openssl
print_success "Dependências instaladas!"
echo ""

# 3. Verificar/Instalar Docker
print_info "Verificando instalação do Docker..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker não encontrado. Instalando..."
    
    # Adicionar repositório Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Iniciar Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    
    print_success "Docker instalado!"
    print_warning "Usuário adicionado ao grupo docker"
else
    print_success "Docker já está instalado!"
    
    # Verificar se usuário já está no grupo
    if ! groups $USER | grep -q docker; then
        print_warning "Adicionando usuário ao grupo docker..."
        sudo usermod -aG docker $USER
    fi
fi
echo ""

# 4. Verificar Docker Compose
print_info "Verificando Docker Compose..."
if sudo docker compose version &> /dev/null; then
    print_success "Docker Compose está instalado!"
else
    print_error "Docker Compose não encontrado!"
    exit 1
fi
echo ""

# 5. Criar diretório
CHATWOOT_DIR="$HOME/chatwoot"
print_info "Criando diretório: $CHATWOOT_DIR"
mkdir -p $CHATWOOT_DIR
cd $CHATWOOT_DIR
print_success "Diretório criado!"
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
read -p "Escolha (1 ou 2) [1]: " url_choice
url_choice=${url_choice:-1}

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

# Gerar senha do PostgreSQL
POSTGRES_PASSWORD="chatwoot$(openssl rand -hex 8)"

# Atualizar .env
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|g" .env
sed -i "s|SECRET_KEY_BASE=.*|SECRET_KEY_BASE=$SECRET_KEY|g" .env
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|g" .env

print_success "Arquivo .env configurado!"
echo ""

# 8. Criar script auxiliar que usa newgrp
print_info "Criando script auxiliar..."
cat > /tmp/chatwoot-start.sh << 'EOFSCRIPT'
#!/bin/bash
cd ~/chatwoot

# Iniciar containers
echo "Iniciando containers Docker..."
docker compose up -d

# Aguardar containers iniciarem
echo "Aguardando containers iniciarem (30 segundos)..."
sleep 30

# Verificar status
if docker compose ps | grep -q "Up"; then
    echo "✓ Containers iniciados!"
else
    echo "✗ Erro ao iniciar containers!"
    docker compose logs
    exit 1
fi

# Preparar banco de dados
echo "Preparando banco de dados..."
docker compose exec -T chatwoot-rails bundle exec rails db:chatwoot_prepare

# Criar usuário admin
echo "Criando usuário administrador..."
docker compose exec -T chatwoot-rails bundle exec rails db:seed

echo "✓ Instalação concluída!"
EOFSCRIPT

chmod +x /tmp/chatwoot-start.sh

print_success "Script auxiliar criado!"
echo ""

# 9. Iniciar Chatwoot usando sudo (não precisa do grupo docker)
print_info "Iniciando containers Docker..."
print_warning "Isso pode demorar 2-5 minutos na primeira vez..."
echo ""

# Usar sudo para não precisar do grupo docker
sudo docker compose up -d

# Aguardar containers iniciarem
print_info "Aguardando containers iniciarem..."
sleep 40

# Verificar status
if sudo docker compose ps | grep -q "Up"; then
    print_success "Containers iniciados com sucesso!"
else
    print_warning "Verificando status dos containers..."
    sudo docker compose ps
fi
echo ""

# 10. Preparar banco de dados
print_info "Preparando banco de dados..."
sudo docker compose exec -T chatwoot-rails bundle exec rails db:chatwoot_prepare
print_success "Banco de dados preparado!"
echo ""

# 11. Criar usuário admin
print_info "Criando usuário administrador..."
sudo docker compose exec -T chatwoot-rails bundle exec rails db:seed
print_success "Usuário criado!"
echo ""

# 12. Criar alias para facilitar uso futuro
print_info "Criando alias para comandos Docker..."
cat >> ~/.bashrc << 'EOF'

# Alias para Chatwoot
alias chatwoot-status='cd ~/chatwoot && sudo docker compose ps'
alias chatwoot-logs='cd ~/chatwoot && sudo docker compose logs -f'
alias chatwoot-restart='cd ~/chatwoot && sudo docker compose restart'
alias chatwoot-stop='cd ~/chatwoot && sudo docker compose down'
alias chatwoot-start='cd ~/chatwoot && sudo docker compose up -d'
EOF

source ~/.bashrc 2>/dev/null || true
print_success "Alias criados!"
echo ""

# Informações finais
clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      ✅ CHATWOOT INSTALADO COM SUCESSO! ✅                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Instalação concluída SEM necessidade de reboot!"
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
echo "   - Aguarde 1-2 minutos antes de acessar"
echo "   - Altere a senha após o primeiro login!"
echo "   - Crie uma Inbox do tipo API para o bot"
echo "   - Crie uma Equipe e atribua a Inbox"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📁 LOCALIZAÇÃO DOS ARQUIVOS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Diretório: $CHATWOOT_DIR"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🔧 COMANDOS ÚTEIS (com sudo):"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Ver status:     chatwoot-status"
echo "   Ver logs:       chatwoot-logs"
echo "   Reiniciar:      chatwoot-restart"
echo "   Parar:          chatwoot-stop"
echo "   Iniciar:        chatwoot-start"
echo ""
echo "   OU use os comandos diretos:"
echo ""
echo "   cd ~/chatwoot"
echo "   sudo docker compose ps"
echo "   sudo docker compose logs -f"
echo "   sudo docker compose restart"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📚 PRÓXIMOS PASSOS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   1. Aguarde 1-2 minutos"
echo "   2. Acesse: $FRONTEND_URL"
echo "   3. Faça login: admin@chatwoot.com / chatwoot123"
echo "   4. ALTERE A SENHA!"
echo "   5. Crie Inbox API e Equipe"
echo "   6. Configure o bot com as credenciais"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "💡 DICA:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Para usar docker SEM sudo no futuro, faça logout e login"
echo "   Por enquanto, use 'sudo docker compose' para todos os comandos"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
print_success "Tudo pronto! O Chatwoot está rodando! 🚀"
echo ""

