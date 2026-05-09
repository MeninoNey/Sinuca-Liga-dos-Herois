# 📖 Guia GitHub Pages

## Como Hospedar seu Jogo no GitHub Pages

### 1️⃣ Pré-requisitos

- [x] Conta GitHub
- [x] Git instalado
- [x] Repositório criado

### 2️⃣ Configurar GitHub Pages

**Via GitHub Web:**

1. Vá para **Settings** do seu repositório
2. Navegue para **Pages** (à esquerda)
3. Em "Source", selecione **Deploy from a branch**
4. Escolha a branch `main` e pasta `/ (root)`
5. Clique em **Save**

Seu site estará disponível em:
```
https://seunome.github.io/Sinuca-Liga-dos-Herois
```

### 3️⃣ Fazer Push do Código

```bash
# Clonar (primeira vez)
git clone https://github.com/seu-usuario/Sinuca-Liga-dos-Herois.git
cd Sinuca-Liga-dos-Herois

# Adicionar mudanças
git add .
git commit -m "Atualizar jogo de sinuca"
git push origin main
```

### 4️⃣ Verificar Status

GitHub Pages processa automaticamente. Verifique em:
- **Settings** → **Pages** → Build and deployment
- Veja os últimos deploys lá

Isso pode levar **1-5 minutos** na primeira vez.

## 🔧 Troubleshooting

### ❌ "404 - Página não encontrada"

**Solução:**
1. Verifique se `index.html` está na raiz
2. Aguarde 5 minutos para o GitHub processar
3. Limpe cache (Ctrl+Shift+Del)

### ❌ Jogo não funciona

**Verifique:**
```bash
# Ver logs do servidor
python3 -m http.server 8000

# Testar localmente
open http://localhost:8000
```

### ❌ Canvas branco (sem jogo)

1. Abra DevTools (F12)
2. Vá para Console
3. Procure por mensagens de erro vermelho
4. Compartilhe os erros para ajuda

## 📱 Testar no Celular

### Android
1. Acesse: `https://seu-usuario.github.io/Sinuca-Liga-dos-Herois`
2. Função de botão de tela cheia
3. Toque e arraste para jogar

### iOS
1. Safari → Endereço
2. Cole a URL do GitHub Pages
3. Toque para jogar

## 🚀 Deploy Contínuo (Opcional)

Configurar CI/CD com GitHub Actions:

1. Crie `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

2. Commit e push - depployará automaticamente!

## 🌐 Domínio Personalizado (Opcional)

Para usar seu próprio domínio:

1. Compre domínio (ex: vercelcheap.com)
2. Configure DNS records:
   ```
   exemplo.com → A record → IP do GitHub
   ```
3. Em **Settings** → **Pages** → **Custom domain**
4. Digite `exemplo.com`

Mais info: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## 📊 Analytics (Opcional)

Adicionar rastreamento com Google Analytics:

```html
<!-- No final do index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## ✅ Tudo Pronto!

Seu jogo está live! 🎉

**Compartilhe:** https://seu-usuario.github.io/Sinuca-Liga-dos-Herois

Divirta-se jogando! 🎱
