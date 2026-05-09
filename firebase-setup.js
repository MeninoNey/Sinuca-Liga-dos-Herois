/**
 * CONFIGURAÇÃO FIREBASE - SETUP COMPLETO
 * 
 * INSTRUÇÕES DE SETUP:
 * 
 * 1. IDE PARA FIREBASE (https://firebase.google.com):
 *    - Crie novo projeto
 *    - Nome: "neon-pool" (ou seu nome)
 *    - Ative Realtime Database
 *    - Escolha: Iniciar em MODO TESTE
 * 
 * 2. COPIE CREDENCIAIS:
 *    - Settings → Service Accounts → Generate new private key (para backend)
 *    - Settings → Web App → Copie config
 * 
 * 3. DESCOMENTE E PREENCHA ABAIXO
 * 
 * 4. CONFIGURE .env COM:
 *    VITE_FIREBASE_API_KEY=seu-api-key
 *    VITE_FIREBASE_PROJECT_ID=seu-project-id
 *    etc...
 */

// ====== CONFIGURAÇÃO DO FIREBASE ======

const firebaseConfig = {
  // Descomente e preencha com suas credenciais do Firebase
  // Obtenha em: Firebase Console → Seu Projeto → Configurações
  
  // apiKey: "SEU_API_KEY_AQUI",
  // authDomain: "seu-projeto.firebaseapp.com",
  // projectId: "seu-projeto-id",
  // storageBucket: "seu-projeto.appspot.com",
  // messagingSenderId: "seu-sender-id",
  // appId: "seu-app-id",
  // databaseURL: "https://seu-projeto.firebaseio.com"
};

// Modo DESENVOLVIMENTO - Usar Firebase Emulator (local)
const USE_EMULATOR = true; // Mude para false após configurar Firebase real

// ====== INICIALIZAR ======

let firebaseReady = false;
let database = null;

/**
 * Inicializar Firebase
 */
function initializeFirebase() {
  // Verificar se já está configurado
  if (!firebaseConfig.apiKey) {
    console.warn('⚠️ Firebase não configurado. Veja firebase-setup.js para instruções.');
    console.log('📝 Modo OFFLINE ativado automaticamente');
    return false;
  }

  try {
    // Inicializar Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    database = firebase.database();

    // Usar emulator se em desenvolvimento
    if (USE_EMULATOR && location.hostname === 'localhost') {
      try {
        database.useEmulator('localhost', 9000);
        console.log('🔧 Usando Firebase Emulator em localhost:9000');
      } catch (e) {
        console.log('ℹ️ Emulator não disponível, usando Firebase real');
      }
    }

    firebaseReady = true;
    console.log('✅ Firebase inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    console.log('📡 Caindo para modo offline');
    return false;
  }
}

/**
 * Verificar conexão com Firebase
 */
function isFirebaseConnected() {
  return firebaseReady && database !== null;
}

/**
 * Obter referência do banco
 */
function getDatabase() {
  if (!firebaseReady) {
    console.warn('⚠️ Firebase não está pronto');
    return null;
  }
  return database;
}

/**
 * Testar conexão
 */
function testFirebaseConnection() {
  if (!isFirebaseConnected()) {
    console.warn('❌ Firebase não conectado');
    return false;
  }

  // Tentar escrever/ler um teste
  const testRef = database.ref('_test/connection');
  testRef.set({ timestamp: Date.now() }).then(() => {
    console.log('✅ Conexão Firebase funcionando!');
    testRef.remove();
    return true;
  }).catch(err => {
    console.error('❌ Erro na conexão:', err);
    return false;
  });
}

/**
 * ESTRUTURA DO BANCO DE DADOS
 * 
 * Rooms (Salas):
 * /rooms
 *   /{roomCode}
 *     /id: string
 *     /code: string
 *     /name: string
 *     /host: {id, name, avatar}
 *     /mode: string (1v1, 2v2, 3v3)
 *     /players: {playerId: {id, name, avatar, team}}
 *     /status: string (waiting, playing, finished)
 *     /createdAt: timestamp
 *     /updatedAt: timestamp
 *     /gameState: {...}
 * 
 * Game State (Sincronização):
 * /rooms/{roomCode}/gameState
 *   /balls: {id: {x, y, vx, vy, sunk}}
 *   /currentPlayer: playerId
 *   /currentTurn: number
 *   /lastShotTime: timestamp
 *   /active: boolean
 * 
 * Moves (Jogadas):
 * /rooms/{roomCode}/moves
 *   /{moveId}
 *     /player: playerId
 *     /power: number
 *     /angleX: number
 *     /angleY: number
 *     /timestamp: number
 * 
 * Chat:
 * /rooms/{roomCode}/chat
 *   /{messageId}
 *     /sender: {id, name}
 *     /message: string
 *     /timestamp: number
 * 
 * Players:
 * /players
 *   /{userId}
 *     /id: string
 *     /name: string
 *     /avatar: string
 *     /level: number
 *     /coins: number
 *     /wins: number
 *     /losses: number
 *     /lastSeen: timestamp
 */

/**
 * FIREBASE RULES (Copie para Firebase Console)
 * Settings → Rules
 */

const FIREBASE_RULES = `
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": "auth != null",
      "$roomCode": {
        ".validate": "newData.hasChildren(['code', 'host', 'players'])",
        "players": {
          ".validate": "newData.val().length <= 6"
        },
        "gameState": {
          ".write": "root.child('rooms').child($roomCode).child('host').val() == auth.uid"
        },
        "chat": {
          ".write": "auth != null"
        }
      }
    },
    "players": {
      ".read": true,
      ".write": "auth.uid == $uid",
      "$uid": {
        ".validate": "newData.hasChildren(['id', 'name'])"
      }
    }
  }
}
`;

// ====== INSTÂNCIA GLOBAL ======

window.firebaseSetup = {
  initializeFirebase,
  isFirebaseConnected,
  getDatabase,
  testFirebaseConnection,
  FIREBASE_RULES
};

// Auto-inicializar quando o script carregar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 Carregando Firebase...');
  initializeFirebase();
});
