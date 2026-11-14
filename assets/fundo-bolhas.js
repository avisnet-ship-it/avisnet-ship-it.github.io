// O fundo das duas Realidades (Como A Realidade Funciona? e How does The Reality work?), decidido pelo autor na prévia
// rev66d do laboratório (14/11/2026; rev.66): sobre o fundo original, três imagens de universos-bolha (geradas pelo autor;
// quatro desde a rev.68, prévia rev68h)
// se revezam a 75% (o fundo original fica com 25%; fusão comum), uma troca a cada 3 s, dissolvendo em 1 s; por cima delas, a
// matriz de cubos de metal azul (35 px, a 140 px nos três eixos, 3 camadas, cada cubo girado ao acaso), desenhada uma vez
// e publicada como imagem (parada: não usa a placa de vídeo de quem visita).
// As imagens vêm dos atributos do próprio <script> (data-bolha1 a data-bolha4 e data-cubos), para o
// tools/gen_site_en.py as copiar também para o senajg.com, como faz com todo arquivo que a página cita.
// Tudo começa depois que a página carregou (para não atrasar a abertura); com "reduzir movimento", fica a primeira imagem,
// parada. As camadas ficam na altura -1, como o degradê da página em português (body::before), e depois dele na ordem da
// página: o degradê, as bolhas, os cubos. A caixa das bolhas inteira fica a 75% e as imagens dentro dela a 100%: na troca,
// a nova dissolve por cima da anterior dentro da caixa, e a anterior só sai quando a dissolução termina; assim a cobertura
// é sempre 75% (com as duas imagens a 75% cada uma, ela subia na troca e caía de uma vez: o fundo original piscava).
(function () {
  const eu = document.currentScript, d = eu.dataset;
  const BOLHAS = [d.bolha1, d.bolha2, d.bolha3, d.bolha4].filter(Boolean), CUBOS = d.cubos, TROCA = 3000, DISSOLVE = 1000, FORCA = 0.75;
  const st = document.createElement('style');
  st.textContent = `
    #fundo-bolhas { position: fixed; inset: 0; z-index: -1; pointer-events: none; opacity: ${FORCA}; }
    #fundo-bolhas > div { position: absolute; inset: 0; background: center / cover no-repeat; opacity: 0; }
    #fundo-bolhas > div.entra { transition: opacity ${DISSOLVE / 1000}s ease; }
    #fundo-bolhas > div.ativa { opacity: 1; }
    #fundo-cubos { position: fixed; inset: 0; z-index: -1; pointer-events: none; background: center / 3000px 1700px no-repeat; opacity: 0; transition: opacity 1.2s ease; }
    #fundo-cubos.ativa { opacity: 1; }
    @media (prefers-reduced-motion: reduce) { #fundo-bolhas > div.entra, #fundo-cubos { transition: none; } }
    @media (forced-colors: active) { #fundo-bolhas, #fundo-cubos { display: none; } }`;
  document.head.appendChild(st);
  const carrega = src => new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(src); i.onerror = erro; i.src = src; });
  function inicia() {
    const caixa = document.createElement('div'); caixa.id = 'fundo-bolhas'; caixa.setAttribute('aria-hidden', 'true');
    const cubos = document.createElement('div'); cubos.id = 'fundo-cubos'; cubos.setAttribute('aria-hidden', 'true');
    document.body.prepend(cubos); document.body.prepend(caixa);
    const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let n = 0, atual = null;
    const mostra = src => {
      const nova = document.createElement('div'); nova.className = 'entra'; nova.style.backgroundImage = `url("${src}")`;
      caixa.appendChild(nova); void nova.offsetWidth; nova.classList.add('ativa');   // a nova por cima, dissolvendo
      const velha = atual; atual = nova;
      if (!velha) return;
      if (parado) { velha.remove(); return; }
      let feito = false; const tira = () => { if (!feito) { feito = true; velha.remove(); } };
      nova.addEventListener('transitionend', tira, { once: true }); setTimeout(tira, DISSOLVE + 500);   // a reserva, se o evento não vier
    };
    if (!BOLHAS.length) return;
    carrega(BOLHAS[0]).then(mostra).then(() => CUBOS && carrega(CUBOS)).then(src => { if (src) { cubos.style.backgroundImage = `url("${src}")`; cubos.classList.add('ativa'); } }).catch(() => {});
    if (!parado && BOLHAS.length > 1) setInterval(() => { n = (n + 1) % BOLHAS.length; carrega(BOLHAS[n]).then(mostra).catch(() => {}); }, TROCA);
  }
  const depois = () => ('requestIdleCallback' in window ? requestIdleCallback(inicia, { timeout: 1500 }) : setTimeout(inicia, 200));
  if (document.readyState === 'complete') depois(); else addEventListener('load', depois);
})();
