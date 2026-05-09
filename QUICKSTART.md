# 🚀 Início Rápido - Neon Pool

## ⚡ Começar Agora (2 minutos)

### Via GitHub Pages (Recomendado)
1. **Abra:** https://seu-usuario.github.io/Sinuca-Liga-dos-Herois
   *(substitua seu-usuario pelo seu nome no GitHub)*

### Localmente
1. **Clone:**
   ```bash
   git clone https://github.com/seu-usuario/Sinuca-Liga-dos-Herois.git
   cd Sinuca-Liga-dos-Herois
   ```

2. **Abra no navegador:**
   - Duplo clique em `index.html`
   - Ou: `python3 -m http.server 8000` → http://localhost:8000

3. **Comece a jogar!** 🎱

## 🎮 Controles

| Ação | Controle |
|------|----------|
| **Apontar** | Mova o mouse |
| **Disparar** | Click + arraste para definir força |
| **Chat** | Clique no ícone de bolinha |
| **Pausa** | Pressione ESC |

## 🎯 Modos de Jogo

- **Treino**: Pratique contra um bot
- **Jogar Agora**: Partida rápida vs bot
- **Criar Sala**: Crie uma sala para amigos
- **Entrar em Sala**: Junte-se com código

## 🐛 Debug (Developer Console)

Pressione **F12** para abrir console:

```javascript
// Ver estatísticas em tempo real
debugger.runTests()

// Listar todas as bolas
debugger.listBalls()

// Resetar jogo
debugger.resetGame()

// Medir performance
debugger.measurePerformance()
```

## 🔧 Próximas Etapas

### Configurar Multiplayer (Opcional)

1. **Criar Firebase:**
   - Acesse https://firebase.google.com
   - Crie novo projeto
   - Ative "Realtime Database"

2. **Adicionar credenciais:**
   - Copie credenciais do Firebase
   - Cole em `firebase-config.js`
   - Descomente as linhas necessárias

3. **Testar:**
   - Abra dois navegadores
   - Criar sala em um, entrar em outro
   - Jogar em tempo real!

### Customizar

Veja arquivos:
- **Cores**: Edite `:root` em `style.css`
- **Física**: Edite `physics.js`
- **UI**: Edite `ui.js` e `script.js`

Veja [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) para guia completo.

## 📱 Mobile

- Funciona em celular/tablet
- Use toque em vez de mouse
- Landscape recomendado

## 🎓 Aprender

**Estrutura do Projeto:**

```
index.html          → HTML + estrutura
script.js           → Lógica principal (renderização + loop)
physics.js          → Motor de física (colisões + dinâmica)
ui.js               → Interface do usuário e eventos
multiplayer.js      → Sincronização online
style.css           → Design neon
debug.js            → Ferramentas de test
```

**Fluxo Básico:**

1. `script.js` cria `PoolGame`
2. `PoolGame` cria `PoolPhysics`
3. Game loop: `physics.update()` → `render()`
4. Canvas renderiza tudo
5. Multiplayer sincroniza via Firebase

## ❓ FAQ

**P: Como adicionar sons?**
R: Crie pasta `sounds/`, adicione `.mp3`, e use `new Audio()` em `script.js`

**P: Como mudar cores?**
R: Edite variáveis em `style.css` linha 10-15

**P: Pode rodar sem internet?**
R: Sim! Modo offline com bot automático funciona

**P: Como hospedar grátis?**
R: GitHub Pages (veja [GITHUB-PAGES.md](GITHUB-PAGES.md))

**P: Qual navegador precisa?**
R: Chrome, Firefox, Edge, Safari (Chrome recomendado)

## 💡 Dicas Pro

- Use DevTools (F12) para debugar
- Experimente com valores em `physics.js`
- Customize cores em `style.css`
- Leia comentários no código

## 📞 Suporte

- Dúvidas? Abra [Issue](https://github.com/seu-usuario/Sinuca-Liga-dos-Herois/issues)
- Sugestão? [Discussion](https://github.com/seu-usuario/Sinuca-Liga-dos-Herois/discussions)

## 🎉 Diversão Garantida!

**Compartilhe com amigos:** 
```
https://seu-usuario.github.io/Sinuca-Liga-dos-Herois
```

Desenvolvido com ❤️ em 2024

---

**Próximo passo:** Leia [README.md](README.md) para documentação completa
