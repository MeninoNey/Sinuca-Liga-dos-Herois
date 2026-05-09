#!/usr/bin/env bash
# 
# =====================================================
# NEON POOL v2.0 - SETUP E DEPLOY RÁPIDO
# =====================================================
#
# Este script ajuda no setup inicial do Neon Pool
# com multiplayer real via Firebase
#
# USO:
#   bash setup.sh
#
# =====================================================

echo "🎱 NEON POOL v2.0 - Setup Multiplayer Real"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Checklist de arquivos necessários
echo -e "${YELLOW}📋 Verificando arquivos necessários...${NC}"
echo ""

files_required=(
    "index.html"
    "style.css"
    "script.js"
    "physics.js"
    "ui.js"
    "multiplayer.js"
    "multiplayer-v2.js"
    "firebase-setup.js"
    "debug.js"
    "test-multiplayer.js"
)

missing=0
for file in "${files_required[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file - FALTANDO"
        missing=$((missing+1))
    fi
done

echo ""
if [ $missing -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os arquivos encontrados!${NC}"
else
    echo -e "${RED}❌ Faltam $missing arquivo(s)${NC}"
    echo "Execute: git pull origin main"
    exit 1
fi

echo ""
echo "=========================================="
echo "📚 PRÓXIMOS PASSOS"
echo "=========================================="
echo ""
echo "1. LEIA PRIMEIRO:"
echo "   - SETUP_INSTRUCTIONS.md (Guia passo a passo)"
echo "   - README_V2.md (Documentação completa)"
echo ""
echo "2. CONFIGURE FIREBASE:"
echo "   - Crie projeto em https://console.firebase.google.com"
echo "   - Copie credenciais para firebase-setup.js"
echo ""
echo "3. TESTE LOCALMENTE:"
echo "   - Abra index.html no navegador"
echo "   - F12 → Console"
echo "   - Digite: testFullScenario()"
echo ""
echo "4. FAÇA DEPLOY:"
echo "   - git add ."
echo "   - git commit -m 'Deploy v2.0'"
echo "   - git push origin main"
echo ""
echo "5. TESTE MULTIPLAYER:"
echo "   - Abra site em 2 abas/dispositivos"
echo "   - testCreateRoom() na aba 1"
echo "   - testJoinRoom('CODIGO') na aba 2"
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Setup completo! Divirta-se.${NC}"
echo "=========================================="
