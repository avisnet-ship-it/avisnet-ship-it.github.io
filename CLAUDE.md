# Instruções para o Claude (e outros assistentes de código)

Este arquivo é lido automaticamente pelo Claude Code no começo de cada sessão (padrão `CLAUDE.md`). As regras completas ficam num lugar só, no repositório privado do projeto, `avisnet-ship-it/privado`.

- **Antes de qualquer coisa de versão, branch, tag ou Release, ler o `VERSIONING.md` do privado.** Quem faz o quê: o autor cria a tag anotada, com o Git, num codespace de cada repositório, e a Release, na tela do GitHub; o Claude grava os commits, cria as branches `stable/X.Y.Z` pela ferramenta do GitHub (a API), prepara os textos e os comandos e confere tudo pela leitura. O ambiente do Claude recusa enviar tags e branches pelo Git (HTTP 403).
- **Como o projeto é montado:** o `ARCHITECTURE.md` do privado. O registro de cada mudança: o `CHANGELOG.md` do privado.

- **As páginas deste site são feitas pelos programas do privado** (geradores e aplicadores, na esteira do `tools/confere_reconstrucao.py`). Uma mudança numa página vai para os programas, e a reconstrução tem de refazer o site exatamente.
