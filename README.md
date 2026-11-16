# OZ PLANNER — GitHub Pages + Supabase + Google

Site em HTML/CSS/JavaScript, sem React e sem Lovable. A interface mantém a identidade da SOZZA, com o logo OZ PLANNER, efeito líquido no dashboard, animações e responsividade.

## O que funciona

- Login com conta Google **depois de configurar** Google OAuth e Supabase.
- Lista de e-mails autorizados no banco, bloqueando acesso aos dados de pessoas não autorizadas.
- Dashboard, empresas, clientes, lotes mensais/avulsos, entregas, checklist, metas por lote, estágios, busca, filtros, calendário, prazos, backup JSON.
- Upload de imagem de perfil em cada empresa: imagem reduzida antes de salvar no registro da empresa no Supabase.
- Vários anexos por cliente, lote ou entrega: guarde links do Google Drive, um por linha, como `Contrato | https://drive.google.com/...`.
- Os arquivos **permanecem no Google Drive**; somente seus links ficam no OZ PLANNER. Configure o acesso e o compartilhamento no próprio Drive.
- Dados sincronizados em nuvem quando logado. Há também um modo demonstração separado e salvo apenas no navegador.

## Configuração necessária (uma vez)

1. Crie um projeto no Supabase (`supabase.com`) e abra **SQL Editor**.
2. Abra `database.sql`, substitua `SEU_EMAIL@gmail.com` pelo Gmail autorizado e execute o script no SQL Editor. Não compartilhe senhas ou chaves privadas.
3. Em **Authentication → Providers → Google**, habilite Google. No Google Cloud Console crie o OAuth Client ID do tipo Web Application, configure a tela de consentimento e adicione a URL de callback informada no painel Supabase como **Authorized redirect URI** (normalmente `https://<PROJECT_REF>.supabase.co/auth/v1/callback`). Copie Client ID e Client Secret **somente no painel Supabase**, nunca para o GitHub.
4. Em **Authentication → URL Configuration** do Supabase, coloque a URL publicada do GitHub Pages em **Site URL** e em **Redirect URLs**, por exemplo: `https://SEU_USUARIO.github.io/oz-planner/`.
5. No arquivo `config.js`, substitua a Project URL e a **anon/public/publishable key** do Supabase. Essas credenciais são públicas por definição. **Jamais use a `service_role` ou secret key aqui.**
6. Publique no GitHub Pages os arquivos `index.html`, `style.css`, `oz-app-v3.js`, `oz-cloud-v2.js`, `config.js` e a pasta `assets/` na **raiz** da branch `main`.
7. Em **Settings → Pages**, selecione **Deploy from a branch**, `main`, `/(root)` e salve. Ao abrir a URL publicada, escolha **Entrar com Google**.

> Para autenticação no Google, o projeto do Google Cloud pode exigir configuração de tela de consentimento, publicação para produção ou cadastro de usuários de teste. Verifique o status e os domínios autorizados conforme as instruções exibidas pelo Google e Supabase.

## Modo demonstração x modo conectado

O modo demonstração é apenas para testar. Ele usa `localStorage` e **não sincroniza** com o banco. Registros criados na demonstração não aparecem automaticamente quando você entra com Google. Você pode exportar o backup JSON e importar na sua conta conectada.

## Sobre a equipe

Nesta versão, a autenticação e os registros são individuais: cada Gmail autorizado tem seu próprio espaço privado. **Compartilhamento de lotes entre membros, convites e diferentes papéis (administrador, editor etc.) ainda não estão implementados**. Isso exigirá uma próxima fase com tabelas relacionais e permissões por empresa. Não convide colaboradores supondo que enxergarão seus registros.

## Anexos Drive: escolha de arquitetura

O OZ PLANNER não solicita permissão para ler nem escrever no Google Drive. Não é preciso conectar seu Drive à plataforma. Basta criar ou compartilhar uma pasta/arquivo no seu Drive, copiar o link e cadastrá-lo no lote ou na entrega. Isso economiza armazenamento, é mais simples de manter e reduz escopos sensíveis. Upload direto no Drive a partir do OZ PLANNER exigiria integração à Drive API e autorizações OAuth adicionais.

## Limitações importantes

- A interface depende de JavaScript e, no modo conectado, da biblioteca pública do Supabase carregada de um CDN.
- Sem conexão com internet, alterações feitas no modo conectado podem falhar. Se houver erro, exporte um backup local imediatamente.
- Esta versão usa um documento JSON por usuário no Supabase. É adequada à primeira fase individual, mas **não** oferece edição simultânea multiusuário sem risco de sobrescrita.
- Imagens de perfil são miniaturas, não arquivos originais; são salvas no mesmo registro JSON. Para imagens grandes ou arquivos de trabalho, use Drive.
- O backup JSON exportado pode conter dados privados e links para arquivos: armazene-o com cuidado.

## Correção de versão da interface
Esta versão carrega oz-app-v2.js e oz-cloud-v2.js para evitar conflitos com scripts antigos no cache. Publique todos os arquivos da pasta na raiz do repositório e force a atualização com Ctrl+Shift+R.

## NOVO: Ficha do cliente e etapas por lote

- Clique no card de um cliente para abrir a ficha completa (não abre mais a edição diretamente).
- **Editar cliente** permite cadastrar múltiplos links do Google Drive no campo de anexos.
- A ficha apresenta os lotes do cliente e um checklist por lote, com etapas: roteiros criados, enviados, aprovados, gravação realizada, edição finalizada, material enviado e material final aprovado.
- Os itens são salvos com cada lote; a marcação não altera automaticamente o status individual dos vídeos. Isso evita confundir a aprovação geral do lote com o andamento de uma entrega.
- **Ver lote de produção** abre o lote existente e suas entregas; **Novo lote** cria o lote já com o cliente selecionado.
- Os anexos são **links** para arquivos hospedados no Drive, não upload direto: copie o link de compartilhamento do Google Drive e cole no cadastro.

Para atualizar no GitHub Pages, envie todos os arquivos do ZIP, substitua os anteriores e aguarde a publicação. O HTML referencia `oz-app-v3.js` para não reutilizar a versão antiga do script por cache.
