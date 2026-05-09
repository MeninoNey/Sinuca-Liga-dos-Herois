# 🎱 NEON POOL - Guia Completo v2.0

## ✨ Novas Funcionalidades - MULTIPLAYER REAL

Este é o Neon Pool v2.0 com **multiplayer real e totalmente funcional** via Firebase Realtime Database.

### ✅ O que está implementado:

- ✅ **Sincronização em Tempo Real**: Sincronização de bolas entre jogadores
- ✅ **Sistema de Turnos**: Turnos automáticos e validação de jogadas  
- ✅ **Autoridade do Host**: Host valida todas as jogadas
- ✅ **Chat Online**: Mensagens em tempo real
- ✅ **Salas Privadas**: Criar e entrar em salas por código
- ✅ **Anti-Desync**: Detecção e correção automática de dessincronização
- ✅ **Reconexão Automática**: Reconecta automaticamente se desconectar
- ✅ **Cross-Platform**: PC, Tablet, Celular
- ✅ **Modo Offline**: Joga com IA se Firebase não disponível
- ✅ **GitHub Pages + Firebase**: Deploy pronto

---

## 🚀 INÍCIO RÁPIDO

### 1️⃣ Clonar/Atualizar Repositório

```bash
git clone https://github.com/SEU_USUARIO/Sinuca-Liga-dos-Herois
cd Sinuca-Liga-dos-Herois
git pull origin main
```

### 2️⃣ Configurar Firebase

#### **Opção A: Firebase Real (Produção)**

1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Crie novo projeto: "neon-pool"
3. Ative **Realtime Database**:
   - Região: `us-central1`
   - Modo: `TEST`
4. Registre Web App
5. Copie as credenciais
6. No arquivo `firebase-setup.js`:

```javascript
const firebaseConfig = {
  apiKey: "COLE_SEU_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id",
  databaseURL: "https://seu-projeto.firebaseio.com"
};
```

7. Descomente `firebaseConfig` em `firebase-setup.js` (linha 61)
8. Mude `USE_EMULATOR = false` (linha 68)

#### **Opção B: Emulador Firebase (Desenvolvimento Local)**

Para testar localmente sem Firebase real:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Iniciar emulator
firebase emulators:start --only database
```

- Porta: `localhost:9000`
- `USE_EMULATOR = true` já está configurado
- Nenhuma credencial necessária

### 3️⃣ Fazer Deploy

#### **GitHub Pages (Recomendado para começar)**

```bash
# Fazer commit e push
git add .
git commit -m "Deploy Neon Pool v2.0 - Multiplayer Real"
git push origin main

# Aguardar ~1 minuto
# Site em: https://SEU_USUARIO.github.io/Sinuca-Liga-dos-Herois
```

#### **Firebase Hosting (Alternativo)**

```bash
# Fazer deploy completo
firebase deploy

# Site em: https://seu-projeto.web.app
```

---

## 🎮 COMO JOGAR

### Fluxo de Jogo Multiplayer:

1. **Abra o site** em 2 navegadores/dispositivos:
   ```
   https://seu-site-deployed.com
   https://seu-site-deployed.com
   ```

2. **Jogador 1 - Cria Sala:**
   - Clique "Nova Sala"
   - Recebe código (ex: `AB3C2D`)
   - Sistema cria sala no Firebase
   - Aguarda 2º jogador

3. **Jogador 2 - Entra na Sala:**
   - Clique "Entrar Sala"
   - Coloque código: `AB3C2D`
   - Entra na mesma sala que J1

4. **Ambos Jogadores - Aguardando:**
   - Veem lista de jogadores
   - Chat ativo para comunicar
   - Botão "Iniciar" ativado quando completo

5. **Iniciar o Jogo:**
   - Clique "Iniciar o Jogo"
   - Ambos sincronizam automaticamente
   - J1 começa (host tem autoridade)

6. **Durante o Jogo:**
   - **Host (J1)**: Simula física localmente + envia para Firebase
   - **Cliente (J2)**: Recebe posições de J1, aplica suavemente
   - **Sincronização**: A cada 100ms (bolas, turnos, pontuação)
   - **Chat**: Mensagens em tempo real dentro do jogo

7. **Fim do Jogo:**
   - Sistema detecta bolas afundadas
   - Mostra resultado
   - Opção para "Revanche"

---

## 🔧 ARQUIVOS IMPORTANTES

### Novos Arquivos v2.0:

| Arquivo | Função |
|---------|--------|
| `firebase-setup.js` | Configuração e inicialização do Firebase |
| `multiplayer-v2.js` | Motor multiplayer REAL (sincronização, turnos, chat) |
| `DEPLOY_GUIDE.js` | Guia de deploy (referência) |

### Arquivos Originais (Atualizados):

| Arquivo | Mudanças |
|---------|----------|
| `index.html` | Adicionado indicador de conexão, novos scripts |
| `style.css` | Estilos para indicador de conexão |
| `script.js` | Inicialização de MultiplayerV2 |
| `ui.js` | Compatibilidade com MultiplayerV2 API |
| `multiplayer.js` | Mantido para compatibilidade (fallback) |

---

## 📊 ESTRUTURA DO BANCO DE DADOS

```
firebase-project/
├── rooms/
│   ├── {roomCode}/
│   │   ├── code: "ABC123"
│   │   ├── name: "Sala do João"
│   │   ├── host: {id, name, avatar}
│   │   ├── players:
│   │   │   ├── player_123: {id, name, team, connected}
│   │   │   └── player_456: {id, name, team, connected}
│   │   ├── status: "playing"
│   │   ├── gameState:
│   │   │   ├── balls: {0: {x, y, vx, vy}, ...}
│   │   │   ├── currentPlayer: "player_123"
│   │   │   ├── currentTurn: 5
│   │   │   └── active: true
│   │   ├── chat:
│   │   │   └── {timestamp}: {sender, message}
│   │   └── moves:
│   │       └── {player_timestamp}: {player, power, angle, validated}
│   └── {otherRoom}/
└── players/
    ├── player_123: {name, level, wins, losses}
    └── player_456: {name, level, wins, losses}
```

---

## 🔐 FIREBASE RULES

Configure em **Firebase Console → Realtime Database → Rules**:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": "auth != null || root.child('_allowTest').val() === true",
      "$roomCode": {
        ".validate": "newData.hasChildren(['code', 'host', 'players'])",
        "players": {
          ".validate": "newData.val().length <= 6"
        },
        "gameState": {
          ".write": "root.child('rooms').child($roomCode).child('host').child('id').val() == auth.uid"
        }
      }
    },
    "players": {
      ".read": true,
      ".write": "auth.uid == $uid"
    },
    "_allowTest": true
  }
}
```

---

## 📱 DETECÇÃO DE PROBLEMAS

### ✅ Tudo OK? Você verá:
- Indicador "🟢 Conectado" no canto superior direito
- Console: `✅ Firebase inicializado com sucesso!`
- Salas aparecem/atualizam em tempo real

### ❌ Firebase não conectado?

**Sintomas:**
- Indicador "🔴 Desconectado"  
- Modo OFFLINE ativado
- Console: `⚠️ Firebase não configurado`

**Soluções:**
1. Verificar credenciais em `firebase-setup.js`
2. Verificar conexão de internet
3. Se offline é intenção, tudo OK (joga solo vs IA)

### ❌ Sala não aparece no outro jogador?

**Causas possíveis:**
1. Credenciais Firebase incorretas (verificar mesmo projeto)
2. Firewall bloqueando conexão
3. Firebase Rules (copiar rules acima)
4. Código da sala inválido

**Debug:**
```javascript
// No console (F12):
firebase.database().ref('rooms').once('value').then(s => console.log(s.val()))
```

---

## 🚀 OPÇÕES AVANÇADAS

### Desativar Emulador para Firebase Real

Em `firebase-setup.js` linha 68:
```javascript
const USE_EMULATOR = false; // Mude para false
```

### Ajustar Frequência de Sincronização

Em `multiplayer-v2.js` linha ~30:
```javascript
this.syncInterval = 100; // Mude para 50ms para melhor precisão (mais dados)
```

### Aumentar Timeout de Reconexão

Em `multiplayer-v2.js` linha ~32:
```javascript
this.maxReconnectAttempts = 5; // Tentar reconectar até 5 vezes
this.reconnectDelay = 1000; // Inicial 1s, com backoff exponencial
```

### Modo DEBUG - Ver tudo que acontece

```javascript
// No console (F12):
console.log(window.multiplayerManager)   // Ver status
console.log(window.multiplayerManager.chatMessages) // Ver chat
```

---

## 📈 PRÓXIMAS MELHORIAS

- [ ] Autenticação com Google/Discord
- [ ] Sistema de ranking e pontuação
- [ ] Leaderboard global
- [ ] Efeitos sonoros 🔊
- [ ] Skins de bolas personalizadas
- [ ] Monetização (comprar itens)
- [ ] Partidas 2v2, 3v3
- [ ] Torneios
- [ ] Replay de partidas
- [ ] Anti-cheat system

---

## 🤝 CONTRIBUIR

1. Faça fork do repositório
2. Crie branch: `git checkout -b feature/sua-feature`
3. Commit: `git commit -m "Add: sua-feature"`
4. Push: `git push origin feature/sua-feature`
5. Abra Pull Request

---

## 📞 SUPORTE

Qualquer dúvida sobre:
- ✨ Multiplayer
- 🔥 Firebase
- 🚀 Deploy
- 🐛 Bugs

**Abra uma Issue** no GitHub!

---

## 📄 LICENÇA

[Verificar LICENSE.md](./LICENSE)

---

**Jogue, divirta-se e compartilhe com amigos! 🎱✨**

Desenvolvido com ❤️ para você.
