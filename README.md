# Sena JG — site do autor (senajg.com.br)

Páginas do site do autor Sena JG, publicadas em <https://senajg.com.br/>.

## Versão

Versão atual: **v4.3.0** (SenaJG-rev.79), de 21/11/2026. Cada versão tem uma página de Release neste repositório, com o resumo do que mudou: <https://github.com/avisnet-ship-it/avisnet-ship-it.github.io/releases>. O processo de versão (tags, branches e Releases) está no `VERSIONING.md` do repositório privado do projeto, `avisnet-ship-it/privado`; o `CLAUDE.md` daqui lembra o Claude de lê-lo antes de agir.

Desde a v4.0.0, as páginas em inglês estão no domínio internacional, <https://senajg.com/>, e os endereços delas aqui levam na hora para lá.

## Onde está cada página

| Endereço | Onde fica |
|---|---|
| `/` | página do autor, obras humanistas |
| `/cotidiano/` | livros de finanças e cotidiano |
| `/<pasta>/` — os 6 livros (lista abaixo) | **pastas deste repositório** |
| `/en/`, `/en/everyday/` e as 6 pastas dos livros em inglês (lista abaixo) | páginas de redirecionamento: levam na hora às páginas em inglês no senajg.com (fora do `sitemap.xml`); as imagens delas continuam aqui |
| `/cristo-cosmico-rebuild/`, `/universos-paralelos/`, `/universos.paralelos/`, `/a-solucao-para-tudo/`, `/neurociencia/`, `/dinheiro/`, `/sucesso.kindle/`, `/solution-neuroscience-book/` e `/succeed-on-kindle/` — os endereços antigos dos livros | páginas de redirecionamento: levam na hora à página atual de cada livro (fora do `sitemap.xml`) |

## Os 6 livros (pasta = endereço)

1. O Cristo Cósmico — `o-cristo-cosmico/`
2. O Celeiro dessa Vida — `o-celeiro-dessa-vida/`
3. A Solução de Tudo na Vida — `a-solucao-de-tudo-na-vida/`
4. Como A Realidade Funciona? — `como-a-realidade-funciona/`
5. Dinheiro Vol. 1 - Agora Sim! — `dinheiro-vol-1/`
6. Faça Sucesso no Kindle — `faca-sucesso-no-kindle/`

## As páginas em inglês, no senajg.com desde a rev.55

| Endereço aqui | Leva a |
|---|---|
| `/en/` | <https://senajg.com/> |
| `/en/everyday/` | <https://senajg.com/everyday/> |
| `/the-cosmic-christ/` | <https://senajg.com/the-cosmic-christ/> |
| `/the-barn-of-this-life/` | <https://senajg.com/the-barn-of-this-life/> |
| `/neuroscience.solution/` | <https://senajg.com/the-solution-to-everything-in-life/> |
| `/parallel.universes/` | <https://senajg.com/how-does-the-reality-work/> |
| `/money/` | <https://senajg.com/money-vol-1/> |
| `/succeed.on.kindle/` | <https://senajg.com/succeed-on-kindle/> |

## Arquivos
- `CNAME` — domínio próprio (`senajg.com.br`)
- `.nojekyll` — publica os arquivos como estão (necessário para pastas com ponto no nome)
- `.gitattributes` — regras do Git para os arquivos (fim de linha e imagens como binário)
- `robots.txt` — o único que os buscadores leem no domínio; aponta o sitemap
- `sitemap.xml` — mapa com as páginas em português (as em inglês estão no sitemap do senajg.com)
- `google484cfeadc0c124ef.html` — verificação do Google Search Console
- `404.html` — página de erro com botão para a página inicial
- `favicon.ico` — ícone da aba do navegador (mandala azul, 16, 32 e 48 px)
- `apple-touch-icon.png` — ícone de 180×180 para quem salva o site na tela inicial do iPhone ou iPad
- `assets/` — capas dos cartões e ícones das páginas principais; `aco-escovado.js` (os botões de metal que giram), `seta-voltar.js` (a seta do botão Voltar que gira), as fotos do espelho da cidade dos botões do Kindle (`mirror-city.webp` e `mirror-eagle.webp`) e o fundo da Realidade: `fundo-bolhas.js` (as imagens de universos-bolha se revezando, `universo-bolha-1.webp` a `universo-bolha-4.webp`) e `cubos-metal.webp` (os cubos de metal)
- `sitemap-antigos.xml` — sitemap temporário dos 17 endereços antigos (rev.60), enviado só no Search Console; sai até 10/12/2026
- `AGENTS.md` e `CLAUDE.md` — instruções para agentes de IA, que levam ao repositório privado
