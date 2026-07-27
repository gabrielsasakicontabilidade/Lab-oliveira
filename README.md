# Gestão Protético

App para iPhone (Expo SDK 54 / React Native + TypeScript) para controle de trabalhos de prótese e fechamento mensal por dentista/consultório. Roda 100% pelo Windows — não precisa de Mac nem Xcode.

O projeto já está criado, com todo o código pronto (`app/`, `components/`, `services/`, etc.), dependências instaladas, `.env` já preenchido com as chaves do Firebase, e `npx tsc --noEmit` / `npx expo-doctor` / `npx expo export` já rodaram sem erros.

## Rodar e testar no iPhone

1. Instale o app **Expo Go** na App Store do iPhone (a versão do SDK 54 é amplamente compatível com o Expo Go atual da loja).
2. Nesta pasta, rode (no Prompt de Comando/cmd, ou usando `npx.cmd` se estiver no PowerShell):

```bash
npx expo start
```

3. Aparece um QR code no terminal. Abra a câmera do iPhone, aponte pro QR code, e o app abre direto dentro do Expo Go — com hot-reload.

Login: use um dos e-mails/senhas já cadastrados no Firebase Authentication.

## Configuração do Firebase (já feita)

- Projeto `gestao-protetico` criado no Firebase Console
- Authentication com E-mail/senha ativado, contas de acesso já cadastradas
- Firestore Database criado (produção, região São Paulo)
- Regras de segurança em `firestore.rules` (aplique no Console, aba Regras, se ainda não fez)
- Índice composto em `firestore.indexes.json` (o app pede pra criar automaticamente na primeira consulta de histórico de fechamento de cada cliente — só clicar no link do erro)

## Gerar o build final para instalar fora do Expo Go (quando estiver pronto)

Quando quiserem um app "de verdade" (ícone próprio, sem depender do Expo Go), usa-se o **EAS Build** — compila na nuvem da Expo, sem precisar de Mac:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
```

Isso vai pedir sua conta Apple Developer ($99/ano) e gerar um `.ipa` que pode ser enviado direto ao **TestFlight** pela própria Expo (`eas submit`), sem nunca abrir Xcode.

## Estrutura do projeto

```
app/
  _layout.tsx              # controla login vs. app logado
  login.tsx
  (tabs)/
    _layout.tsx             # tab bar: Trabalhos / Clientes
    trabalhos/
      _layout.tsx           # Stack desta aba
      index.tsx             # lista + filtro por status
      novo.tsx               # criar trabalho
      [id].tsx               # editar/excluir + gerar recibo PDF
    clientes/
      _layout.tsx
      index.tsx
      novo.tsx               # criar/editar cliente
      [id].tsx                # perfil, fechar mês, histórico, editar/excluir
firebase/config.ts          # inicialização do Firebase
types/index.ts               # Cliente, Trabalho, Fechamento
context/AuthContext.tsx      # login/logout/estado do usuário
hooks/                       # useClientes, useTrabalhos, useFechamentosDoCliente
services/
  firestore.ts               # CRUD no Firestore
  pdf.ts                      # gera e compartilha os PDFs (recibo e fechamento)
components/                  # StatusBadge, SegmentedControl
```

Os imports usam o alias `@/` (ex: `@/services/firestore`), configurado em `tsconfig.json` apontando para a raiz do projeto.

## Observações importantes

- As contas de acesso são criadas manualmente no Console do Firebase — não há tela pública de cadastro no app, o que mantém o acesso restrito.
- Excluir um cliente apaga em cascata todos os trabalhos e fechamentos dele. Trabalhos que já entraram em um fechamento mensal não podem mais ser excluídos.
- Se der algum erro ao rodar `npx expo start`, me manda a mensagem que eu ajusto.
