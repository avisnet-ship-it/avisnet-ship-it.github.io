```text
Developed-by: Sena JG <senajg@senajg.com>

(Sena JG is a Systems Architect, Information Technology Professional, Information and Communications Technology Professional, Computer Science Graduate, Web Designer, Webmaster, DevOps Engineer, Systems Analyst, and Computer Graphics and 3D Systems Developer)
Developer of the world's first 3D CASE tool
(Sena JG é Arquiteto de Sistemas, Profissional de Tecnologia da Informação, Profissional de Tecnologia da Informação e Comunicação, Graduado em Ciência da Computação, Web Designer, Webmaster, Engenheiro DevOps, Analista de Sistemas e Desenvolvedor de Sistemas de Computação Gráfica e em 3D)
Desenvolvedor da primeira ferramenta CASE 3D do mundo

Co-developed-by: Anthropic Claude Opus 5.5 <noreply@anthropic.com>
```

# IMPORTANT: Unbreakable Guidelines

> Read this first. These are the author's unbreakable guidelines.

## 1. Confirm with the author before recording and before sending

1. This is rule 15 of the private repository's `AGENTS.md`, an unbreakable guideline (the author's decision, 2026-11-26).
2. Before the local commit (the author's word is "grave"), the agent shows the author exactly what will be recorded:
   1. the files;
   2. the text;
   3. the commit message, as `git show` will show it.
3. Then the agent waits for the author's confirmation.
4. Before sending to GitHub (the author's word is "commit"), the agent does the same.
5. Without the confirmation, nothing is recorded or sent, even if it seems obvious.
6. This guideline is written in more than one place on purpose, so that it stands out (the author's decision, 2026-11-27).

## 2. Why the repositories keep copies

1. GitHub owns the Releases and hosts them, outside the author's repositories.
2. GitHub is not the author's company. If GitHub deletes a Release, or it disappears, the author loses it.
3. The repositories belong to the author. They keep faithful copies.

## 3. What goes into the Releases

1. Everything that has changed.
2. Down to the smallest details, such as those of the metal buttons, exactly as they turned out.

## 4. The Release files

1. In each of the four repositories:
   1. **One file per Release:**
      1. Besides the Release on GitHub, each version gets a physical file inside the repository.
      2. The file mirrors the Release: it is identical to the text published on GitHub.
      3. It is written before the publication, so that it is already inside the Release package.
      4. Its name is the version number, in the market's official form.
      5. Each file holds one Release only.
   2. **One file with the sum of all the Releases:**
      1. It sits in the root of the repository.
      2. It is called "Releases".
      3. It holds every Release published in the repository, down to the oldest.
      4. The newest comes first; then the second newest; then the third newest; down to the first.
2. In the private repository:
   1. The same two kinds of file, only with the private repository's Releases, in the same places.
   2. The structure of the SenaJG ecosystem:
      1. **One general file per version:** at each publication, it receives the four Releases of the four repositories. Its name is the version number, vX.Y.Z, in the standard naming.
      2. **One file with every version:** `general-senajg-ecosystem-releases.md`, in the root of the private repository. It starts with an index and holds every Release of every repository.
      3. In both files, the official order of the repositories:

         | Order | Name | Website | Official name on GitHub |
         |---|---|---|---|
         | 1 | senajg.com | https://senajg.com/ | `senajg.com` |
         | 2 | senajg.com.br | https://senajg.com.br/ | `avisnet-ship-it.github.io` |
         | 3 | privado | (no website) | `privado` |
         | 4 | Lab | https://lab.senajg.com.br/ | `my_test_333` |

      4. Each entry shows, in this order: the name, the website (with `https://` and the slash at the end) and the official name on GitHub, as it is.
3. The release notes in `docs/release-notes/` stay as they are.

## 5. The files of every repository

1. **The guidelines:**
   1. `IMPORTANT.md` and `IMPORTANT.txt`: in English.
   2. `IMPORTANTE.md` and `IMPORTANTE.txt`: in Brazilian Portuguese.
   3. In senajg.com, also `IMPORTANTE.it.md` and `IMPORTANTE.it.txt`: in Italian.
2. **The AI agent files,** all with the same text:
   1. `AGENTS.md`: the open format, read by Codex (from OpenAI), Cursor, Gemini CLI, the GitHub Copilot coding agent and other agents;
   2. `CLAUDE.md`: read by Claude Code;
   3. `GEMINI.md`: read by Gemini CLI;
   4. `.github/copilot-instructions.md`: read by GitHub Copilot, in this exact folder, with this exact name and case.
3. **The readme, the files for people:**
   1. `README.md`: in English.
      1. It is the canonical text for writing: every change starts in it.
      2. It starts by telling the reader to read `IMPORTANT.md`.
   2. `README.txt`: extracted from `README.md`.
   3. The translations, with the market's standard names:
      1. `README.<language>.md` and `README.<language>.txt`;
      2. the language is the BCP 47 code, without the region: `README.pt.md` and `README.pt.txt`, in Brazilian Portuguese, in the four repositories;
      3. in the two websites, one translation for each language of the countries where Amazon sells books published with KDP: Kindle eBooks, paperbacks or hardcovers (17 marketplaces, 11 languages);
      4. every readme has, below the title and at the end, the links to the same readme in the other languages.
   4. In the two websites and in the Lab, the pages:
      1. `readme.html`, and one `readme.<language>.html` for each translation;
      2. they are the canonical text for publication;
      3. they are made from the `.md`.
   5. Only the `.html` go into `sitemap.xml`, in the two websites. The Lab and the private repository have no sitemap; the private repository has no `.html`.
   6. Every file is in UTF-8, in every language.
4. **The `.md`, the `.txt` and the `.html`:**
   1. The `.md` is the richer file and is written first.
   2. The `.txt` is always extracted from the `.md`, without the formatting.
   3. The `.html` of the readme is always made from the `.md`.
   4. The program that does both is `tools/gen_leia_me.py`, in the private repository.
5. **The copies:**
   1. They are always kept up to date.
   2. Where a copy is already identical, nothing is written and nothing changes.

## 6. The header of every file

1. Everything, everywhere, starts with the header:

   ```text
   Developed-by: Sena JG <senajg@senajg.com>

   (Sena JG is a Systems Architect, Information Technology Professional, Information and Communications Technology Professional, Computer Science Graduate, Web Designer, Webmaster, DevOps Engineer, Systems Analyst, and Computer Graphics and 3D Systems Developer)
   Developer of the world's first 3D CASE tool
   (Sena JG é Arquiteto de Sistemas, Profissional de Tecnologia da Informação, Profissional de Tecnologia da Informação e Comunicação, Graduado em Ciência da Computação, Web Designer, Webmaster, Engenheiro DevOps, Analista de Sistemas e Desenvolvedor de Sistemas de Computação Gráfica e em 3D)
   Desenvolvedor da primeira ferramenta CASE 3D do mundo

   Co-developed-by: Anthropic Claude Opus 5.5 <noreply@anthropic.com>
   ```

2. The author's description comes first in English, complete. Right below it, it comes in Portuguese.
3. There is always one blank line after the `Developed-by` line.
4. There is one blank line after the line that names Claude.
   1. When the `Claude-Session` line comes right below it, the blank line comes after the `Claude-Session` line.
5. Files leave out the `Claude-Session` line, because its address changes with every session. Commit messages keep it.

## 7. How every text is written

1. Indented and stratified, with as many levels as needed.
2. Coherent, clear and fluent.
3. In very short sentences, easy to understand.
4. Complete, down to the smallest detail: all the information, with everything mentioned.
5. Nothing is lost: not a comma, a word of true information, an item, a passage or a nuance.
6. A text in blocks ("blockante"), squat, chaotic and entropic turns into informational garbage, on purpose or not:
   1. it gets lost;
   2. people, AI agents and algorithms end up ignoring it;
   3. it cannot be documented.

## 8. The visionary text

1. It is the text that describes the author as a visionary: `ABOUT.md`, in English; `SOBRE.md`, in Portuguese; `CHI-SONO.md`, in Italian.
2. Only this text speaks of the inventor and of the things the author stated before they were discovered or made public.
3. It is true, but less professional. It undermines the credibility of readers who look at the author's IT credentials: Webmaster, Developer and Designer, a trained professional who has devoted a lifetime to this work and can build web portals for future clients.
4. So it appears only in the agreed places:
   1. `ABOUT.md`, `SOBRE.md` and `CHI-SONO.md`, in the root of the private repository;
   2. the end of `docs/tech-stack.md` and of `docs/domains.md`, in the private repository;
   3. the pages "Sobre o autor", "About the author" and "Chi è l'autore", once they are published.

## 9. How AI agents treat the author's rules

1. They repeat everything the author said, losing nothing.
2. They add nothing without the author's permission.
3. They remove or change nothing: no idea and no piece of information, however small.
4. They write in short, organized sentences, with everything mentioned.
5. Any idea of an agent goes to the author as a proposal.

## 10. The name and the place of these guidelines

1. They are called "IMPORTANT: Unbreakable Guidelines" (in Portuguese, "Importante: Diretrizes inquebráveis").
2. They open `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` and, in the private repository, `VERSIONING.md`, and wherever else they belong.
3. In those files, they come first in English and then in Brazilian Portuguese.

# Importante: Diretrizes inquebráveis

> Leia isto primeiro. São as diretrizes inquebráveis do autor.

## 1. Confirmar com o autor antes de gravar e antes de enviar

1. É a regra 15 do `AGENTS.md` do privado, uma diretriz inquebrável (decisão do autor, 26/11/2026).
2. Antes do commit local ("grave"), o agente mostra ao autor exatamente o que vai ser gravado:
   1. os arquivos;
   2. o texto;
   3. a mensagem do commit, como o `git show` vai mostrar.
3. Depois, o agente espera a confirmação do autor.
4. Antes do envio ao GitHub ("commit"), o agente faz a mesma coisa.
5. Sem a confirmação, nada é gravado nem enviado, mesmo que pareça óbvio.
6. Esta diretriz está escrita em mais de um lugar de propósito, para ter destaque (decisão do autor, 27/11/2026).

## 2. Por que os repositórios guardam cópias

1. O GitHub é dono das Releases e as hospeda, fora dos repositórios do autor.
2. O GitHub não é empresa do autor. Se o GitHub apagar uma Release, ou se ela sumir, o autor a perde.
3. Os repositórios são do autor. Neles ficam as cópias fiéis.

## 3. O que vai nas Releases

1. Tudo o que já mudou.
2. Até os detalhes mínimos, como os dos botões de metal, do jeito que ficaram.

## 4. Os arquivos das Releases

1. Em cada um dos quatro repositórios:
   1. **Um arquivo por Release:**
      1. Além da Release no GitHub, cada versão ganha um arquivo físico dentro do repositório.
      2. O arquivo é o espelho da Release: idêntico ao texto publicado no GitHub.
      3. Ele é gravado antes da publicação, para já ir dentro do pacote da Release.
      4. O nome dele é o número da versão, na forma oficial do mercado.
      5. Cada arquivo tem uma Release só.
   2. **Um arquivo com a soma de todas as Releases:**
      1. Fica na raiz do repositório.
      2. Chama-se "Releases".
      3. Tem todas as Releases publicadas no repositório, até a mais antiga.
      4. A mais nova vem primeiro; depois a penúltima; depois a antepenúltima; até a primeira.
2. No privado:
   1. Os mesmos dois tipos de arquivo, só com as Releases do privado, nos mesmos lugares.
   2. A estrutura do ecossistema SenaJG:
      1. **Um arquivo geral por versão:** a cada publicação, ele recebe as quatro Releases dos quatro repositórios. O nome dele é o número da versão, vX.Y.Z, na nomenclatura padrão.
      2. **Um arquivo com todas as versões:** o `general-senajg-ecosystem-releases.md`, na raiz do privado. Ele começa com o índice e tem todas as Releases de todos os repositórios.
      3. Nos dois arquivos, a ordem oficial dos repositórios:

         | Ordem | Nome | Site | Nome oficial no GitHub |
         |---|---|---|---|
         | 1 | senajg.com | https://senajg.com/ | `senajg.com` |
         | 2 | senajg.com.br | https://senajg.com.br/ | `avisnet-ship-it.github.io` |
         | 3 | privado | (não tem site) | `privado` |
         | 4 | Lab | https://lab.senajg.com.br/ | `my_test_333` |

      4. Cada entrada traz, nesta ordem: o nome, o site (com `https://` e a barra no fim) e o nome oficial no GitHub, como é.
3. As notas das versões, em `docs/release-notes/`, continuam como são.

## 5. Os arquivos de cada repositório

1. **As diretrizes:**
   1. `IMPORTANT.md` e `IMPORTANT.txt`: em inglês.
   2. `IMPORTANTE.md` e `IMPORTANTE.txt`: em português do Brasil.
   3. No senajg.com, também `IMPORTANTE.it.md` e `IMPORTANTE.it.txt`: em italiano.
2. **Os arquivos dos agentes de IA,** todos com o mesmo texto:
   1. `AGENTS.md`: o formato aberto, lido pelo Codex (da OpenAI), pelo Cursor, pelo Gemini CLI, pelo agente do GitHub Copilot e por outros agentes;
   2. `CLAUDE.md`: lido pelo Claude Code;
   3. `GEMINI.md`: lido pelo Gemini CLI;
   4. `.github/copilot-instructions.md`: lido pelo GitHub Copilot, nesta pasta, com este nome e com estas letras, maiúsculas e minúsculas.
3. **O leia-me, os arquivos para as pessoas:**
   1. `README.md`: em inglês.
      1. É o texto canônico de redação: toda mudança começa nele.
      2. Ele começa mandando ler o `IMPORTANT.md`.
   2. `README.txt`: extraído do `README.md`.
   3. As traduções, com os nomes do padrão de mercado:
      1. `README.<língua>.md` e `README.<língua>.txt`;
      2. a língua é o código BCP 47, sem a região: `README.pt.md` e `README.pt.txt`, em português do Brasil, nos quatro repositórios;
      3. nos dois sites, uma tradução para cada língua dos países em que a Amazon vende os livros publicados pelo KDP: eBooks Kindle, livros de capa comum (paperback) ou de capa dura (17 lojas, 11 línguas);
      4. todo leia-me tem, logo abaixo do título e no fim, os links para o mesmo leia-me nas outras línguas.
   4. Nos dois sites e no laboratório, as páginas:
      1. `readme.html` e um `readme.<língua>.html` para cada tradução;
      2. são o texto canônico de publicação;
      3. são feitas a partir do `.md`.
   5. Só os `.html` entram no `sitemap.xml`, nos dois sites. O laboratório e o privado não têm sitemap; o privado não tem `.html`.
   6. Todos os arquivos ficam em UTF-8, em todas as línguas.
4. **O `.md`, o `.txt` e o `.html`:**
   1. O `.md` é o arquivo mais rico e é feito primeiro.
   2. O `.txt` é sempre extraído do `.md`, sem a formatação.
   3. O `.html` do leia-me é sempre feito a partir do `.md`.
   4. O programa que faz os dois é o `tools/gen_leia_me.py`, do privado.
5. **As cópias:**
   1. Ficam sempre atualizadas.
   2. Onde a cópia já está igual, nada é gravado e nada muda.

## 6. O cabeçalho de todos os arquivos

1. Tudo, em todos os lugares, começa com o cabeçalho:

   ```text
   Developed-by: Sena JG <senajg@senajg.com>

   (Sena JG is a Systems Architect, Information Technology Professional, Information and Communications Technology Professional, Computer Science Graduate, Web Designer, Webmaster, DevOps Engineer, Systems Analyst, and Computer Graphics and 3D Systems Developer)
   Developer of the world's first 3D CASE tool
   (Sena JG é Arquiteto de Sistemas, Profissional de Tecnologia da Informação, Profissional de Tecnologia da Informação e Comunicação, Graduado em Ciência da Computação, Web Designer, Webmaster, Engenheiro DevOps, Analista de Sistemas e Desenvolvedor de Sistemas de Computação Gráfica e em 3D)
   Desenvolvedor da primeira ferramenta CASE 3D do mundo

   Co-developed-by: Anthropic Claude Opus 5.5 <noreply@anthropic.com>
   ```

2. A descrição do autor vem primeiro em inglês, completa. Logo abaixo, vem em português.
3. Sempre há uma linha em branco depois da linha do `Developed-by`.
4. Há uma linha em branco depois da linha que cita o Claude.
   1. Quando a linha do `Claude-Session` vem logo abaixo dela, a linha em branco vem depois do `Claude-Session`.
5. Os arquivos não levam a linha do `Claude-Session`, porque o endereço dela muda a cada sessão. As mensagens dos commits levam.

## 7. Como se escreve todo texto

1. Endentado e estratificado, com quantos níveis forem precisos.
2. Coerente, claro e fluido.
3. Em frases bem curtas, fáceis de entender.
4. Completo, até o mínimo detalhe: todas as informações, com tudo mencionado.
5. Sem perder nada: nenhuma vírgula, palavra de informação verdadeira, item, trecho ou nuance.
6. O texto em bloco ("blockante"), atarracado, caótico e entrópico vira lixo informacional, querendo ou sem querer:
   1. ele se perde;
   2. pessoas, agentes de IA e algoritmos acabam por ignorá-lo;
   3. ele não é documentável.

## 8. O texto do visionário

1. É o texto que descreve o autor como visionário: o `ABOUT.md`, em inglês; o `SOBRE.md`, em português; o `CHI-SONO.md`, em italiano.
2. Só esse texto fala do inventor e das coisas que o autor enunciou antes de serem descobertas ou divulgadas.
3. Ele é real, mas menos profissional. Ele tira a credibilidade de quem vê as credenciais de TI do autor: Webmaster, Developer e Designer, profissional formado, que dedicou a vida a isso e pode construir portais para futuros clientes.
4. Por isso, ele aparece só nos lugares combinados:
   1. o `ABOUT.md`, o `SOBRE.md` e o `CHI-SONO.md`, na raiz do privado;
   2. o fim do `docs/tech-stack.md` e do `docs/domains.md`, no privado;
   3. as páginas "Sobre o autor", "About the author" e "Chi è l'autore", quando forem publicadas.

## 9. Como os agentes de IA tratam as regras do autor

1. Repetem tudo o que o autor disse, sem perder nada.
2. Não acrescentam nada sem a permissão do autor.
3. Não retiram nem alteram nada: nenhuma ideia e nenhuma informação, por menor que seja.
4. Escrevem em frases curtas e organizadas, com tudo mencionado.
5. Qualquer ideia de um agente vai ao autor como proposta.

## 10. O nome e o lugar destas diretrizes

1. Elas se chamam "Importante: Diretrizes inquebráveis" (em inglês, "IMPORTANT: Unbreakable Guidelines").
2. Elas abrem o `AGENTS.md`, o `CLAUDE.md`, o `GEMINI.md`, o `.github/copilot-instructions.md` e, no privado, o `VERSIONING.md`, e onde mais devam ficar.
3. Nesses arquivos, elas vêm primeiro em inglês e depois em português do Brasil.

# Instruções para agentes de IA: o Claude e os outros assistentes de código

## 1. Se você é uma IA chegando aqui

1. Este repositório é só a saída.
2. As páginas daqui são feitas pelos programas do repositório privado do projeto, `avisnet-ship-it/privado`.
   1. São os geradores e os aplicadores, na esteira do `tools/confere_reconstrucao.py`.
3. O privado é a memória de tudo no projeto:
   1. as regras de trabalho com o autor;
   2. a ordem de leitura;
   3. os procedimentos;
   4. a infraestrutura.
4. As regras completas ficam num lugar só: no privado.
5. Comece pelo `AGENTS.md` do privado.
   1. É preciso ter acesso a ele.
   2. Quem dá o acesso é o autor.

## 2. O que fazer e o que não fazer

1. Não mude as páginas daqui direto.
   1. A mudança vai para os programas do privado.
   2. A conferência da reconstrução tem de refazer este site exatamente (`docs/runbook.md` do privado).
2. Antes de qualquer coisa de versão, branch, tag ou Release, leia o `VERSIONING.md` do privado.
3. Este repositório é público:
   1. nada interno entra aqui;
   2. os únicos e-mails permitidos são os de contato dos domínios.

## 3. Quem faz o quê

1. O autor:
   1. cria a tag anotada, com o Git, no MobaXterm, no computador dele (desde 24/11/2026; antes, num codespace);
   2. cria a Release, na tela do GitHub.
      1. Atualização de 27/11/2026: na v4.3.1, as Releases saíram por um `.sh` preparado pelo Claude, pela API do GitHub.
2. O Claude:
   1. grava os commits;
   2. cria as branches `stable/X.Y.Z` pela ferramenta do GitHub (a API);
   3. prepara os textos e os comandos;
   4. confere tudo pela leitura.
3. O ambiente do Claude recusa enviar tags e branches pelo Git (HTTP 403).
   1. Atualização de 27/11/2026: o envio de uma branch pelo Git funcionou (a correção da `stable/4.3.1` do laboratório). O envio de tags não foi testado.

## 4. Outros documentos do privado

1. Como o projeto é montado: o `ARCHITECTURE.md`.
2. O registro de cada mudança: o `CHANGELOG.md`.

## 5. Sobre este arquivo

1. O Claude Code lê o `CLAUDE.md` automaticamente no começo de cada sessão (o padrão `CLAUDE.md`).
2. Este texto é o mesmo em quatro arquivos: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` e `.github/copilot-instructions.md`.
