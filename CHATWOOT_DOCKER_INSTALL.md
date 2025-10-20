# 🐳 Instalação do Chatwoot com Docker (Self-Hosted)

Guia completo para instalar o Chatwoot em seu próprio servidor usando Docker e Docker Compose.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Rápida (Docker Compose)](#instalação-rápida-docker-compose)
3. [Configuração Inicial](#configuração-inicial)
4. [Obter Credenciais para o Bot](#obter-credenciais-para-o-bot)
5. [Migração para Proxmox](#migração-para-proxmox)
6. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Requisitos Mínimos

- **CPU:** 2 cores
- **RAM:** 4GB (recomendado 8GB)
- **Disco:** 20GB
- **Sistema Operacional:** 
  - Ubuntu 20.04 ou 22.04 (recomendado)
  - Debian 11 ou superior
  - CentOS 8 ou superior
  - Qualquer distro Linux com Docker

### Software Necessário

- Docker (versão 20.10 ou superior)
- Docker Compose (versão 2.0 ou superior)
- Git (para clonar repositório)

---

## Instalação Rápida (Docker Compose)

### 1. Instalar Docker e Docker Compose

#### No Ubuntu/Debian:

```bash
# Atualizar pacotes
sudo apt update
sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar seu usuário ao grupo docker (para não precisar usar sudo)
sudo usermod -aG docker $USER

# Aplicar mudanças (ou faça logout/login)
newgrp docker

# Verificar instalação
docker --version
docker compose version
```

#### No CentOS/RHEL:

```bash
# Instalar Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker --version
docker compose version
```

### 2. Criar Diretório para Chatwoot

```bash
# Criar diretório
mkdir -p ~/chatwoot
cd ~/chatwoot

# Baixar arquivos de configuração do Chatwoot
curl -fsSL https://raw.githubusercontent.com/chatwoot/chatwoot/develop/docker-compose.production.yaml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/chatwoot/chatwoot/develop/.env.example -o .env
```

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```bash
nano .env
```

**Configurações essenciais para modificar:**

```env
# ===========================================
# CONFIGURAÇÕES OBRIGATÓRIAS
# ===========================================

# Domínio ou IP do servidor (SEM http://)
# Se for usar IP, coloque o IP aqui
# Se for usar domínio, coloque o domínio
FRONTEND_URL=http://192.168.1.100:3000
# OU
# FRONTEND_URL=https://chat.suaempresa.com

# Chave secreta (gere uma aleatória)
# Para gerar: openssl rand -hex 64
SECRET_KEY_BASE=cole_aqui_uma_chave_aleatoria_bem_longa

# ===========================================
# BANCO DE DADOS (Deixe assim)
# ===========================================
POSTGRES_HOST=postgres
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=chatwoot123
POSTGRES_DATABASE=chatwoot_production

# ===========================================
# REDIS (Deixe assim)
# ===========================================
REDIS_URL=redis://redis:6379

# ===========================================
# EMAIL (Configure depois)
# ===========================================
MAILER_SENDER_EMAIL=noreply@suaempresa.com
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_DOMAIN=gmail.com
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true

# ===========================================
# STORAGE (Deixe assim para local)
# ===========================================
ACTIVE_STORAGE_SERVICE=local

# ===========================================
# OUTROS
# ===========================================
RAILS_ENV=production
NODE_ENV=production
INSTALLATION_ENV=docker
```

**Gerar SECRET_KEY_BASE:**

```bash
# Execute este comando para gerar uma chave aleatória
openssl rand -hex 64
```

Copie o resultado e cole no `.env` no campo `SECRET_KEY_BASE`.

### 4. Iniciar Chatwoot

```bash
# Baixar e iniciar containers
docker compose up -d

# Ver logs (opcional)
docker compose logs -f

# Aguarde cerca de 2-3 minutos para tudo inicializar
```

**Containers que serão criados:**
- `postgres` - Banco de dados
- `redis` - Cache e filas
- `chatwoot-rails` - Backend da aplicação
- `chatwoot-sidekiq` - Processamento de jobs

### 5. Criar Primeiro Usuário (Admin)

```bash
# Executar comando dentro do container
docker compose exec chatwoot-rails bundle exec rails db:chatwoot_prepare

# Criar conta de administrador
docker compose exec chatwoot-rails bundle exec rails db:seed
```

**Credenciais padrão criadas:**
- **Email:** `admin@chatwoot.com`
- **Senha:** `chatwoot123` (você deve alterar depois!)

---

## Configuração Inicial

### 1. Acessar Chatwoot

Abra o navegador e acesse:

```
http://IP-DO-SERVIDOR:3000
```

Exemplo:
```
http://192.168.1.100:3000
```

### 2. Fazer Login

Use as credenciais padrão:
- Email: `admin@chatwoot.com`
- Senha: `chatwoot123`

### 3. Alterar Senha

⚠️ **IMPORTANTE:** Altere a senha imediatamente!

1. Clique no avatar (canto inferior esquerdo)
2. Vá em "Profile Settings"
3. Altere a senha

### 4. Criar Conta/Workspace

1. Após login, você verá um wizard
2. Dê um nome para sua conta (ex: "SAAE Atendimento")
3. Complete o setup inicial

### 5. Criar Caixa de Entrada (Inbox) - API

Para integrar com o bot, você precisa criar uma Inbox do tipo **API**:

1. Vá em **Configurações** (⚙️) → **Caixas de Entrada**
2. Clique em **Adicionar Caixa de Entrada**
3. Escolha **API**
4. Dê um nome: "Bot WhatsApp SAAE"
5. Clique em **Criar Canal API**
6. **ANOTE O WEBHOOK URL e TOKEN** (você precisará depois para recursos avançados)
7. **ANOTE O ID DA INBOX** (aparece na URL)

### 6. Criar Equipe

1. Vá em **Configurações** → **Equipes**
2. Clique em **Criar Nova Equipe**
3. Nome: "Atendimento Geral"
4. Descrição: "Equipe de atendimento SAAE"
5. **Importante:** Adicione a Inbox criada à equipe
6. **ANOTE O ID DA EQUIPE** (aparece na URL)

---

## Obter Credenciais para o Bot

### 1. Obter API Token

1. Clique no seu **avatar** (canto inferior esquerdo)
2. Vá em **Profile Settings**
3. Clique em **Access Token**
4. **Copie o token** que aparece
5. Guarde com segurança

### 2. Identificar IDs

#### Account ID:
Olhe a URL:
```
http://192.168.1.100:3000/app/accounts/1/dashboard
                                        ↑
                                  Account ID = 1
```

#### Inbox ID:
1. Vá em Configurações → Caixas de Entrada
2. Clique na sua inbox
3. Olhe a URL:
```
http://192.168.1.100:3000/app/accounts/1/settings/inboxes/5
                                                           ↑
                                                     Inbox ID = 5
```

#### Team ID:
1. Vá em Configurações → Equipes
2. Clique na sua equipe
3. Olhe a URL:
```
http://192.168.1.100:3000/app/accounts/1/settings/teams/3
                                                         ↑
                                                   Team ID = 3
```

### 3. Configurar o Bot

No arquivo `.env` do bot:

```env
CHATWOOT_BASE_URL=http://192.168.1.100:3000
CHATWOOT_API_TOKEN=seu_token_copiado_aqui
CHATWOOT_INBOX_ID=5
CHATWOOT_TEAM_ID=3
CHATWOOT_ACCOUNT_ID=1
```

---

## Migração para Proxmox

### Opção 1: Migrar Docker Compose Diretamente

#### 1. Criar VM no Proxmox

```bash
# Especificações recomendadas:
- OS: Ubuntu 22.04 LTS
- CPU: 2-4 cores
- RAM: 4-8 GB
- Disco: 50 GB
- Rede: Bridge (para ter IP próprio)
```

#### 2. Instalar Docker na VM

Siga os mesmos passos da seção "Instalar Docker e Docker Compose"

#### 3. Copiar Dados

Do servidor atual para a VM:

```bash
# No servidor ORIGINAL
cd ~/chatwoot
tar -czf chatwoot-backup.tar.gz .

# Copiar para a VM (substitua IP_DA_VM)
scp chatwoot-backup.tar.gz usuario@IP_DA_VM:~/

# Na VM
cd ~
tar -xzf chatwoot-backup.tar.gz -C chatwoot
cd chatwoot
```

#### 4. Iniciar na VM

```bash
# Atualizar o FRONTEND_URL no .env se o IP mudou
nano .env
# Altere FRONTEND_URL para o novo IP

# Iniciar
docker compose up -d
```

### Opção 2: Backup e Restore Completo

#### Fazer Backup dos Dados

```bash
# Parar containers
docker compose down

# Backup do banco de dados
docker compose run --rm postgres pg_dump -U postgres -d chatwoot_production > chatwoot_db.sql

# Backup dos uploads/arquivos
tar -czf chatwoot-storage.tar.gz ./storage

# Backup do .env
cp .env env-backup

# Criar pacote completo
tar -czf chatwoot-full-backup.tar.gz .env chatwoot_db.sql chatwoot-storage.tar.gz docker-compose.yml
```

#### Restaurar na VM Proxmox

```bash
# Na VM nova, copiar o backup
scp chatwoot-full-backup.tar.gz usuario@IP_VM_PROXMOX:~/

# Na VM
mkdir -p ~/chatwoot
cd ~/chatwoot
tar -xzf ~/chatwoot-full-backup.tar.gz

# Extrair storage
tar -xzf chatwoot-storage.tar.gz

# Atualizar .env com novo IP
nano .env

# Iniciar containers
docker compose up -d

# Aguardar containers iniciarem (2-3 minutos)

# Restaurar banco de dados
docker compose exec -T postgres psql -U postgres -d chatwoot_production < chatwoot_db.sql

# Reiniciar
docker compose restart
```

---

## Comandos Úteis

### Gerenciar Containers

```bash
# Ver status
docker compose ps

# Ver logs
docker compose logs -f

# Reiniciar tudo
docker compose restart

# Parar tudo
docker compose down

# Parar e remover volumes (CUIDADO!)
docker compose down -v

# Atualizar Chatwoot
docker compose pull
docker compose up -d
```

### Backup Automático

Criar script de backup:

```bash
nano ~/backup-chatwoot.sh
```

Conteúdo:

```bash
#!/bin/bash
BACKUP_DIR="/backup/chatwoot"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

cd ~/chatwoot

# Backup DB
docker compose exec -T postgres pg_dump -U postgres -d chatwoot_production > $BACKUP_DIR/db_$DATE.sql

# Backup storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz ./storage

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completo: $DATE"
```

Tornar executável:

```bash
chmod +x ~/backup-chatwoot.sh
```

Agendar com cron (diário às 2h):

```bash
crontab -e
```

Adicione:

```
0 2 * * * /home/seu-usuario/backup-chatwoot.sh >> /var/log/chatwoot-backup.log 2>&1
```

---

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs chatwoot-rails

# Ver todos os logs
docker compose logs
```

### Erro de permissão

```bash
# Ajustar permissões
sudo chown -R $USER:$USER ~/chatwoot
```

### Porta 3000 já em uso

Edite o `docker-compose.yml` e mude a porta:

```yaml
services:
  chatwoot-rails:
    ports:
      - "8080:3000"  # Mude para outra porta
```

### Espaço em disco cheio

```bash
# Limpar Docker (remove imagens não usadas)
docker system prune -a

# Ver uso de espaço
docker system df
```

### Reset completo (CUIDADO!)

```bash
# Para e remove TUDO (perde dados!)
docker compose down -v
rm -rf storage/*
docker compose up -d
docker compose exec chatwoot-rails bundle exec rails db:chatwoot_prepare
docker compose exec chatwoot-rails bundle exec rails db:seed
```

---

## Configurações Avançadas (Opcional)

### SSL/HTTPS com Nginx

Se quiser expor na internet com domínio:

```bash
# Instalar nginx e certbot
sudo apt install nginx certbot python3-certbot-nginx

# Configurar nginx
sudo nano /etc/nginx/sites-available/chatwoot
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name chat.suaempresa.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/chatwoot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obter certificado SSL
sudo certbot --nginx -d chat.suaempresa.com
```

Atualizar `.env`:

```env
FRONTEND_URL=https://chat.suaempresa.com
```

---

## Recursos e Documentação

- **Documentação Oficial:** https://www.chatwoot.com/docs/self-hosted
- **Docker Install:** https://www.chatwoot.com/docs/self-hosted/deployment/docker
- **GitHub:** https://github.com/chatwoot/chatwoot
- **Comunidade:** https://chatwoot.com/community

---

## 📊 Checklist de Instalação

- [ ] Docker e Docker Compose instalados
- [ ] Arquivos baixados em `~/chatwoot`
- [ ] `.env` configurado (SECRET_KEY_BASE, FRONTEND_URL)
- [ ] Containers iniciados (`docker compose up -d`)
- [ ] Acesso via navegador funcionando
- [ ] Login com credenciais padrão
- [ ] Senha alterada
- [ ] Inbox API criada
- [ ] Equipe criada
- [ ] API Token obtido
- [ ] IDs anotados (Account, Inbox, Team)
- [ ] `.env` do bot configurado
- [ ] Bot testado e funcionando

---

**Pronto! Seu Chatwoot está rodando em self-hosted!** 🎉

**Próximo passo:** Configure o arquivo `.env` do bot com as credenciais que você obteve! 🚀

