# 📚 GUIA DE SETUP - NEON POOL v2.0

## ⚡ OPÇÃO RÁPIDA (5 MINUTOS)

Quer testar **imediatamente** sem Firebase? 

1. **Clonar e abrir:**
   ```bash
   git clone https://github.com/SEU_USUARIO/Sinuca-Liga-dos-Herois
   cd Sinuca-Liga-dos-Herois
   ```

2. **Abrir `index.html` no navegador:**
   - Firefox/Chrome/Edge (qualquer navegador moderno)
   - Joga offline vs IA
   - Sem multiplayer online (esperado)

3. **Pronto!** ✅ Jogo funciona localmente

---

## 🔥 OPÇÃO COMPLETA (30 MINUTOS)

Para ter **multiplayer real** entre dispositivos:

### PASSO 1: Criar Projeto Firebase

1. Vá para **[Firebase Console](https://console.firebase.google.com)**

2. Clique **"Criar Projeto"**
   - Nome: `neon-pool`
   - Desativar Google Analytics (opcional)
   - Criar

3. Copie seu **Project ID** (aparece em Settings)
   ```
   Exemplo: neon-pool-12345
   ```

### PASSO 2: Ativar Realtime Database

1. No Firebase, vá: **Build → Realtime Database**
2. Clique **"Criar Banco de Dados"**
3. Escolher região: **us-central1** (mais rápido)
4. Modo de início: **Modo Teste** (debug - teste depois muda)
5. Clique **Habilitar**

### PASSO 3: Registrar Web App

1. Firebase Console → Seu Projeto → Settings (⚙️)
2. Aba **"Seus Apps"**
3. Clique ícone **Web** (`</>`): "Adicionar app"
4. Nome: `Neon Pool`
5. Marcar: **"Também configurar Firebase Hosting"**
6. Continuar → **Copiar as credenciais**

A credencial parece assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P",
  authDomain: "neon-pool-12345.firebaseapp.com",
  projectId: "neon-pool-12345",
  storageBucket: "neon-pool-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef0123456789",
  databaseURL: "https://neon-pool-12345.firebaseio.com"
};
```

### PASSO 4: Configurar Projeto Localmente

1. Abra `firebase-setup.js`

2. **Linha 61**: Descomente:
   ```javascript
   const firebaseConfig = {
   ```

3. **Cole suas credenciais** do Passo 3

4. **Linha 68**: Mude para:
   ```javascript
   const USE_EMULATOR = false;
   ```
   (Estava `true`, mude para `false`)

5. **Salve o arquivo**

### PASSO 5: Configurar Firebase Rules

1. Firebase Console → Seu Projeto → **Realtime Database**
2. Aba **"Rules"**
3. **Deletar tudo** que está lá
4. **Cole** isto:
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
5. Clique **"Publicar"**

### PASSO 6: Deploy no GitHub Pages

1. **Commit suas mudanças:**
   ```bash
   git add .
   git commit -m "Setup Multiplayer v2.0"
   git push origin main
   ```

2. **GitHub faz deploy automático** (~1 min)

3. **Seu site:** `https://SEU_USUARIO.github.io/Sinuca-Liga-dos-Herois`

### PASSO 7: Testar Multiplayer

1. **Abra em 2 navegadores/abas:**
   ```
   https://seu-site.com   (Aba 1)
   https://seu-site.com   (Aba 2)
   ```

2. **Aba 1 (Jogador 1):**
   - Clique **"Nova Sala"**
   - Anota o código (ex: `AB3C2D`)

3. **Aba 2 (Jogador 2):**
   - Clique **"Entrar Sala"**
   - Coloca código: `AB3C2D`
   - Enter

4. **Ambos:**
   - Verão um ao outro na sala
   - Chat ativado
   - Clique **"Iniciar"**
   - **Joguem!** 🎱

---

## 🧪 VALIDAÇÕES

### ✅ Tudo OK? Você verá:

1. **Console (F12):**
   ```
   ✅ Firebase inicializado com sucesso!
   🎮 Multiplayer V2 inicializado
   ```

2. **Indicador canto superior direito:**
   - 🟢 **Conectado**

3. **Salas aparecem em tempo real**

### ❌ Algo errado? Debugging:

**Console (F12), execute:**

```javascript
// Teste 1: Firebase conectado?
firebaseSetup.testFirebaseConnection()

// Teste 2: MultiplayerV2 pronto?
console.log(window.multiplayerManager)

// Teste 3: Ver salas no banco:
firebase.database().ref('rooms').once('value').then(s => console.log(s.val()))

// Teste 4: Criar sala (teste rápido)
window.multiplayerManager.createRoom('Sala Teste')
```

---

## 📍 ERROS COMUNS

### ❌ "Firebase não configurado"

**Causa:** Credenciais não preenchidas  
**Solução:** Completar firebase-setup.js com todos os campos

### ❌ "Desconectado" no indicador

**Causa:** Credenciais inválidas ou Firebase Rules incorretas  
**Solução:**
1. Verificar credenciais (copy/paste exato)
2. Verificar Firebase Rules (passo 5)
3. Verificar internet

### ❌ "Sala não aparece no outro jogador"

**Causa:** Diferentes projetos Firebase  
**Solução:** Ambos usam **MESMO Project ID**

### ❌ "Bolas travadas no meio do jogo"

**Causa:** Lag na sincronização  
**Solução:** Aumentar velocidade internet ou ajustar `syncInterval` em multiplayer-v2.js

---

## 🚀 PRÓXIMOS PASSOS APÓS SETUP

### Customizações Opcionais:

1. **Mudar nome do jogador:**
   - Inspector (F12) → Storage → `playerName`
   - Ou: `localStorage.setItem('playerName', 'Seu Nome')`

2. **Adicionar Autenticação (Futuro):**
   - Login com Google/Discord (implementar depois)

3. **Melhorar Anti-Desync:**
   - Em `multiplayer-v2.js` linha 30, reduzir `syncInterval` para 50ms

4. **Deploy em produção:**
   - Usar Firebase Hosting ao invés de GitHub Pages (melhor performance)

---

## 📞 TROUBLESHOOTING FINAL

Se ainda não funcionar:

1. **Reload página:** `Ctrl+F5` (força reload sem cache)
2. **Limpar storage:** InspectorF12 → Storage → Clear All
3. **Verificar console:** F12 → Console (procurar erros vermelhos)
4. **Ver logs:** Digite `testFullScenario()` no console

---

## ✅ CHECKLIST DO SETUP

- [ ] Firebase Project criado
- [ ] Realtime Database ativado
- [ ] Web App registrado
- [ ] Credenciais copiadas para firebase-setup.js
- [ ] USE_EMULATOR = false
- [ ] Firebase Rules publicadas
- [ ] Commit feito e enviado para GitHub
- [ ] Aguardado 1 min pelo deploy
- [ ] Testado em 2 navegadores/devices
- [ ] Indicador mostra "Conectado"
- [ ] Salas funcionam
- [ ] Chat funciona
- [ ] Bolas sincronizam

---

**Pronto! 🎉 Seu Neon Pool Multiplayer está ONLINE!**

Para dúvidas: Abra uma Issue no GitHub
