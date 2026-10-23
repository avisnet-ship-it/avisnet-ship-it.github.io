// Seta de metal do botão "Voltar" / "Back": gira sozinha em 3D, em torno do eixo horizontal que passa pelo centro dela
// (rotateX, em projeção paralela, sem perspectiva: o centro da seta não sai do lugar em nenhum ângulo). Com o mouse, o
// dedo ou o foco do teclado em cima do botão, freia suave e para de frente; ao sair, volta a girar. No celular e no
// tablet, depois que a pessoa rola a página, ela também para quando chega ao meio da tela. Fora da tela,
// não gasta nada. Quem pede menos movimento no sistema (prefers-reduced-motion) não vê o giro.
// Fonte: tools/seta-voltar.js no privado; o tools/aplica_seta_gira.py copia para /assets/.
(function () {
  'use strict';
  const PERIODO = 1.8;   // segundos por volta
  const VOLTA = 2 * Math.PI, W = VOLTA / PERIODO, FREIO = W / 0.5, FREIO_MAX = W / 0.3;

  // No celular e no tablet (com o dedo), o botão que chega ao meio da tela faz o papel do mouse em cima: entre os que estão
  // na faixa do meio (até um quinto da altura da tela acima ou abaixo dele), o mais perto para; fora da faixa, todos giram.
  // Vale depois que a pessoa rola a página, então os botões entram girando, como no computador. Os botões de metal e a seta
  // do Voltar entram na mesma lista, para haver um só "mais perto do meio" na página; botões lado a lado param juntos.
  // O dedo: vale o que o aparelho diz (sem mouse) e, além disso, o primeiro toque na tela; aparelhos Samsung dizem ter mouse
  // mesmo sem ter (o Samsung Internet), e o toque corrige; um mouse de verdade em movimento desliga a regra.
  // O mesmo código está no tools/aco-escovado.js: o primeiro dos dois que rodar cria a lista.
  const centro = window.centroDaTela || (window.centroDaTela = (function () {
    const semMouse = matchMedia('(hover: none)'), itens = [];
    let dedo = semMouse.matches, rolou = false, pedido = 0;
    function confere() {
      pedido = 0;
      const meio = innerHeight / 2, faixa = innerHeight / 5;
      const ds = itens.map(it => {
        const r = it.el.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - meio);
        return r.width > 0 && d <= faixa ? d : Infinity;
      });
      const menor = Math.min(...ds);
      itens.forEach((it, i) => it.marca(rolou && dedo && ds[i] - menor < 8));
    }
    const agenda = () => { if (!pedido) pedido = requestAnimationFrame(confere); };
    addEventListener('scroll', () => { rolou = true; agenda(); }, { passive: true });
    addEventListener('resize', agenda);
    addEventListener('touchstart', () => { if (!dedo) { dedo = true; agenda(); } }, { passive: true });
    addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && dedo && !semMouse.matches) { dedo = false; agenda(); } }, { passive: true });
    semMouse.addEventListener('change', () => { dedo = semMouse.matches; agenda(); });
    return { junta(el, marca) { itens.push({ el, marca }); agenda(); } };
  })());

  // Acelera até a velocidade de cruzeiro e gira sem parar; com algo em cima (e.parar), freia e para de frente (múltiplo de
  // 360°). A frenagem é recalculada a cada quadro, então nunca há tranco; se a seta mal começou a girar (menos de 20°),
  // só volta macia para a frente.
  function avanca(e, dt) {
    if (!e.parar) {
      e.alvo = null; e.recuo = null;
      e.vel += (W - e.vel) * (1 - Math.exp(-dt / 0.25));
      e.ang = (e.ang + e.vel * dt) % VOLTA;
      return true;
    }
    if (e.alvo == null && e.recuo == null) {
      if (e.ang < 1e-6 && e.vel < 1e-3) { e.ang = 0; e.vel = 0; return false; }
      if (e.ang < 20 * Math.PI / 180 && e.vel < 0.6 * W) e.recuo = { a0: e.ang, t: 0 };
      else {
        e.alvo = Math.ceil(e.ang / VOLTA - 1e-9) * VOLTA;
        while (e.alvo - e.ang < e.vel * e.vel / (2 * FREIO_MAX)) e.alvo += VOLTA;
      }
    }
    if (e.recuo) {
      const r = e.recuo; r.t += dt;
      const u = Math.min(1, r.t / 0.35), k = u * u * (3 - 2 * u);
      e.ang = r.a0 * (1 - k); e.vel = 0;
      if (u >= 1) { e.ang = 0; e.recuo = null; return false; }
      return true;
    }
    const resta = e.alvo - e.ang;
    if (resta > e.vel * e.vel / (2 * FREIO) + 1e-6) e.vel += (Math.max(e.vel, 0.5 * W) - e.vel) * (1 - Math.exp(-dt / 0.3));
    else e.vel = Math.max(0, e.vel - e.vel * e.vel / (2 * Math.max(resta, 1e-6)) * dt);
    e.ang += e.vel * dt;
    if (e.ang >= e.alvo - 2e-4 || (e.vel < 0.01 && e.alvo - e.ang < 0.01)) { e.ang = 0; e.vel = 0; e.alvo = null; return false; }
    return true;
  }

  function desenha(e) {
    e.svg.style.transform = e.ang === 0 ? '' : `rotateX(${e.ang}rad)`;
    e.svg.classList.toggle('gira', e.ang !== 0);   // sem a sombra enquanto gira, para o giro ficar simétrico
  }
  function passo(e, ts) {
    const dt = Math.min(0.05, (ts - (e.t0 || ts)) / 1000); e.t0 = ts;
    const segue = avanca(e, dt);
    desenha(e);
    if (segue && e.visivel) requestAnimationFrame(t => passo(e, t)); else { e.rodando = false; e.t0 = 0; }
  }
  function liga(e) { if (!e.rodando && e.visivel) { e.rodando = true; requestAnimationFrame(t => passo(e, t)); } }

  function inicia() {
    const calmo = matchMedia('(prefers-reduced-motion: reduce)');
    const lista = [];
    const decide = e => { e.parar = !!(e.mouse || e.foco || e.centro || calmo.matches); liga(e); };
    const olho = 'IntersectionObserver' in window ? new IntersectionObserver(vs => vs.forEach(v => {
      const e = lista.find(x => x.a === v.target); if (e) { e.visivel = v.isIntersecting; liga(e); }
    })) : null;
    document.querySelectorAll('.rodape .chip, .voltar .chip').forEach(a => {
      const svg = a.querySelector('svg.seta'); if (!svg) return;
      const e = { a, svg, ang: 0, vel: 0, parar: false, alvo: null, recuo: null, rodando: false, visivel: !olho };
      a.addEventListener('pointerenter', () => { e.mouse = true; decide(e); });
      a.addEventListener('pointerleave', () => { e.mouse = false; decide(e); });
      // navegador antigo, sem :focus-visible (Safari antes de 2022): qualquer foco para a seta
      a.addEventListener('focus', () => { try { e.foco = a.matches(':focus-visible'); } catch (_) { e.foco = true; } decide(e); });
      a.addEventListener('blur', () => { e.foco = false; decide(e); });
      lista.push(e);
      if (olho) olho.observe(a);
      centro.junta(a, sim => { if (e.centro !== sim) { e.centro = sim; decide(e); } });
      decide(e);
    });
    calmo.addEventListener('change', () => lista.forEach(decide));
    window.setaVoltar = { botoes: lista, avanca };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();
