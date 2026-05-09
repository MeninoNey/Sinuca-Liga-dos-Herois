/**
 * COMO FAZER DEPLOY NO GITHUB PAGES + FIREBASE
 * 
 * ===========================================
 * PASSO 1: PREPARAR GITHUB PAGES
 * ===========================================
 * 
 * 1.1. No repositório GitHub:
 *      - Vá a Settings → Pages
 *      - Source: Deploy from a branch
 *      - Branch: main (ou main/)
 *      - Folder: / (root)
 *      - Salvar
 * 
 * 1.2. Seu site estará em:
 *      https://SEU_USUARIO.github.io/Sinuca-Liga-dos-Herois
 * 
 * ===========================================
 * PASSO 2: CONFIGURAR FIREBASE
 * ===========================================
 * 
 * 2.1. Criar Projeto:
 *      - Firebase Console: https://console.firebase.google.com
 *      - Novo Projeto → "neon-pool"
 *      - Aceitar termos
 *      - Desativar Google Analytics (opcional)
 *      - Criar
 * 
 * 2.2. Ativar Realtime Database:
 *      - Build → Realtime Database
 *      - Criar banco de dados
 *      - Região: us-central1 (mais rápido)
 *      - Modo TESTE (para dev)
 *      - Criar
 * 
 * 2.3. Ativar Web App:
 *      - Settings → General → Register App
 *      - Escolher "Ícone Web" (</> )
 *      - Appname: "Neon Pool"
 *      - Marcar "Configurar Hosting"
 *      - Registrar
 *      - COPIAR as credenciais
 * 
 * 2.4. Copiar Credenciais para firebase-setup.js:
 *      - Abra firebase-setup.js neste projeto
 *      - Descomente firebaseConfig
 *      - Preencha com suas credenciais:
 * 
 *      const firebaseConfig = {
 *        apiKey: "COPIE_AQUI",
 *        authDomain: "seu-projeto.firebaseapp.com",
 *        projectId: "seu-projeto-id",
 *        storageBucket: "seu-projeto.appspot.com",
 *        messagingSenderId: "SUA_SENDER_ID",
 *        appId: "SEU_APP_ID",
 *        databaseURL: "https://seu-projeto.firebaseio.com"
 *      };
 * 
 * ===========================================
 * PASSO 3: CONFIGURAR FIREBASE RULES
 * ===========================================
 * 
 * 3.1. No Firebase Console:
 *      - Seu Projeto → Realtime Database
 *      - Aba "Rules"
 *      - Copie as regras abaixo:
 * 
 * {
 *   "rules": {
 *     "rooms": {
 *       ".read": true,
 *       ".write": "auth != null || root.child('_allowTest').val() === true",
 *       "$roomCode": {
 *         ".validate": "newData.hasChildren(['code', 'host', 'players'])",
 *         "players": {
 *           ".validate": "newData.val().length <= 6"
 *         },
 *         "gameState": {
 *           ".write": "root.child('rooms').child($roomCode).child('host').child('id').val() == auth.uid"
 *         }
 *       }
 *     },
 *     "players": {
 *       ".read": true,
 *       ".write": "auth.uid == $uid"
 *     },
 *     "_allowTest": true
 *   }
 * }
 * 
 * 3.2. Publicar as regras (Publish)
 * 
 * ===========================================
 * PASSO 4: PREPARAR PROJETO LOCALMENTE
 * ===========================================
 * 
 * 4.1. Criar .firebaserc na raiz do projeto:
 * 
 *      {
 *        "projects": {
 *          "default": "seu-projeto-id"
 *        },
 *        "targets": {}
 *      }
 * 
 * 4.2. Instalar Firebase CLI (se não tiver):
 *      npm install -g firebase-tools
 * 
 * 4.3. Login no Firebase:
 *      firebase login
 * 
 * ===========================================
 * PASSO 5: FAZER DEPLOY
 * ===========================================
 * 
 * OPÇÃO A: Deploy via GitHub Pages (SIMPLES)
 * 
 *   - Fazer push para GitHub main branch
 *   - Aguardar ~1 minuto
 *   - Site estará em:
 *     https://SEU_USUARIO.github.io/Sinuca-Liga-dos-Herois
 * 
 *   Comandos:
 *   git add .
 *   git commit -m "Deploy v2.0 - Multiplayer Real"
 *   git push origin main
 * 
 * OPÇÃO B: Deploy via Firebase Hosting (RECOMENDADO)
 * 
 *   firebase deploy
 * 
 *   Seu site estará em:
 *   https://seu-projeto.web.app
 * 
 * ===========================================
 * PASSO 6: TESTAR MULTIPLAYER
 * ===========================================
 * 
 * 6.1. Abrir site em dois navegadores/dispositivos:
 *      https://seu-site-deployed.com
 * 
 * 6.2. Jogador 1:
 *      - Clicar "Nova Sala"
 *      - Copiar código da sala
 * 
 * 6.3. Jogador 2:
 *      - Clicar "Entrar Sala"
 *      - Colar código
 * 
 * 6.4. Ambos:
 *      - Quando 2 jogadores na sala, clique "Iniciar"
 *      - Jogar!
 * 
 * ===========================================
 * PASSO 7: DEBUGGING
 * ===========================================
 * 
 * Abrir Console do Navegador (F12):
 * 
 * - Verificar logs de conexão:
 *   ✅ Se vir "Firebase inicializado com sucesso!"
 *      → Configuração OK
 * 
 * - Testar conexão:
 *   firebaseSetup.testFirebaseConnection()
 * 
 * - Ver status multiplayer:
 *   multiplayerManager.getRoomStatus()
 * 
 * - Monitorar sincronização:
 *   console.log(window.multiplayerManager)
 * 
 * ===========================================
 * TROUBLESHOOTING
 * ===========================================
 * 
 * ❌ "Firebase não configurado"
 *    → Preencha firebase-setup.js com credenciais
 * 
 * ❌ "Modo OFFLINE ativado automaticamente"
 *    → Firebase não iniciou, verificar console (F12)
 * 
 * ❌ "Sala não encontrada"
 *    → Código de sala incorreto ou sala expirou
 * 
 * ❌ "Sala cheia"
 *    → Máximo de jogadores atingido (2 para 1v1)
 * 
 * ❌ "Física sincronizada mas desincronizada"
 *    → Normal em conexões lentas, aguarde anti-desync
 * 
 * ❌ "Não consigo entrar em salas de outro"
 *    → Verificar Firebase Rules (passo 3.1)
 * 
 * ===========================================
 * ESTRUTURA DO BANCO DE DADOS
 * ===========================================
 * 
 * {
 *   "rooms": {
 *     "ABC123": {
 *       "code": "ABC123",
 *       "name": "Sala do João",
 *       "host": { id, name, avatar },
 *       "players": {
 *         "player_123": { id, name, team, connected },
 *         "player_456": { id, name, team, connected }
 *       },
 *       "status": "playing",
 *       "gameState": {
 *         "balls": { "0": {x, y, vx, vy}, ... },
 *         "currentPlayer": "player_123",
 *         "currentTurn": 5,
 *         "active": true
 *       },
 *       "chat": {
 *         "1234567890": { sender, message, timestamp }
 *       },
 *       "moves": {
 *         "player_123_1234567890": { player, power, angle, validated }
 *       }
 *     }
 *   }
 * }
 * 
 * ===========================================
 * PRÓXIMOS PASSOS APÓS DEPLOY
 * ===========================================
 * 
 * ✅ Testar multiplayer entre 2 dispositivos
 * ✅ Verificar sincronização de bolas
 * ✅ Testar chat em tempo real
 * ✅ Testar reconexão
 * ✅ Otimizar física para menos lag
 * ✅ Adicionar autenticação (opcional)
 * ✅ Implementar ranking liderança
 * ✅ Adicionar efeitos sonoros
 * 
 */

// Arquivo de guia - não é código executável
window.deployGuide = {
  version: "2.0",
  firebase: "Realtime Database",
  hosting: "GitHub Pages + Firebase",
  status: "PRONTO PARA DEPLOY"
};
