/**
 * CONFIGURAÇÃO DO FIREBASE (PARA PRODUÇÃO)
 * 
 * Instruções para usar:
 * 1. Crie um projeto em firebase.google.com
 * 2. Copie suas credenciais
 * 3. Descomente e preенcha os dados abaixo
 * 4. Remova import do Firebaselink no index.html se não usar
 */

// // ===== DESCOMENTE PARA USAR FIREBASE =====
// const firebaseConfig = {
//   apiKey: "SUA_API_KEY",
//   authDomain: "seu-projeto.firebaseapp.com",
//   projectId: "seu-projeto-id",
//   storageBucket: "seu-projeto.appspot.com",
//   messagingSenderId: "seu-sender-id",
//   databaseURL: "https://seu-projeto.firebaseio.com",
//   appId: "seu-app-id"
// };

// // Inicializar Firebase
// firebase.initializeApp(firebaseConfig);
// const database = firebase.database();

/* ===== ESTRUTURA DE DADOS NO FIREBASE =====

Rooms (Salas):
├── rooms/
│   └── {roomCode}/
│       ├── id: string (ID único)
│       ├── code: string (Código da sala)
│       ├── name: string (Nome da sala)
│       ├── host: string (ID do host)
│       ├── mode: string (1v1, 2v2, 3v3, ffa)
│       ├── type: string (ranked, casual, private)
│       ├── status: string (waiting, playing, finished)
│       ├── players: {id: playerData}
│       ├── teams: {teamA: [], teamB: []}
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── gameState: {...}

Players (Jogadores):
├── players/
│   └── {userId}/
│       ├── id: string
│       ├── name: string
│       ├── avatar: string (emoji)
│       ├── level: number
│       ├── xp: number
│       ├── coins: number
│       ├── wins: number
│       ├── losses: number
│       ├── rating: number (Elo)
│       └── stats: {...}

Matches (Histórico):
├── matches/
│   └── {matchId}/
│       ├── id: string
│       ├── roomId: string
│       ├── player1: {id, name}
│       ├── player2: {id, name}
│       ├── winner: string (ID do vencedor)
│       ├── duration: number (segundos)
│       ├── startedAt: timestamp
│       ├── endedAt: timestamp
│       ├── replay: {moves: [...]}
│       └── stats: {...}

Chat (Mensagens):
├── chat/
│   └── {roomId}/
│       └── {messageId}/
│           ├── sender: string
│           ├── message: string
│           ├── timestamp: timestamp
│           └── type: string (chat, system)

*/

// ===== REGRAS DE SEGURANÇA =====

/*
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": "auth != null",
      "$roomId": {
        ".validate": "newData.hasChildren(['id', 'code', 'host'])",
        "players": {
          ".validate": "newData.val().length <= 6"
        }
      }
    },
    "players": {
      ".read": true,
      ".write": "auth.uid == $uid",
      "$uid": {
        ".validate": "newData.hasChildren(['id', 'name'])"
      }
    },
    "matches": {
      ".read": true,
      ".write": "auth != null"
    },
    "chat": {
      ".read": true,
      ".write": "auth != null",
      "$roomId": {
        ".validate": "newData.child('sender').exists()"
      }
    }
  }
}
*/
