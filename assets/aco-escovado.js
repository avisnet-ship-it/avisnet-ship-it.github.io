// Botões de metal: cada a.btn vira um elipsoide sólido achatado, com a largura e a altura exatas do botão
// retangular, desenhado em WebGL como uma malha 3D (borda arredondada de sabonete gasto, faces abauladas). O metal
// vem da paleta de cada página: aço escovado (entrada e Cristo Cósmico, em português e em inglês), ouro liso
// (Cotidiano, Everyday, Dinheiro e Money), cobre (Celeiro e Barn), prata (Solução e The Solution), o céu psicodélico
// do fim de Matrix (Universos e Parallel) e o espelho plano que reflete a cidade à beira-mar com a águia (Faça Sucesso,
// Succeed On Kindle e os botões deles no Cotidiano e no Everyday).
// Gira sozinho desde a entrada da página, em torno do eixo X, no mesmo sentido das setas Voltar/Back, e reflete
// uma paisagem fixa no mundo. Com o mouse, o dedo ou o foco do teclado em cima, freia e para de frente; ao sair,
// volta a girar. No celular e no tablet, depois que a pessoa rola a página, o botão que chega ao meio da tela também
// para. Fora da tela, não gasta nada. O texto continua no HTML (leitores de tela, busca, seleção); o que se vê
// é o mesmo texto gravado no metal.
// Sem WebGL, com o alto contraste do Windows ou se o contexto 3D se perder, fica o botão original.
// Uso: <script src="/assets/aco-escovado.js" defer data-paleta='{"ceu": "#…", "meio": …}'></script> no <head>;
// a paleta (ceu, meio, horizonte, montanha, chao, chave, faixa, quente, acento) vem do gen_solucao.py (ACO).
// Fonte: tools/aco-escovado.js no privado; o tools/aplica_aco_escovado.py copia para /assets/.
(function () {
  'use strict';
  const PERIODO = 2.4;   // segundos por volta

  // No celular e no tablet (com o dedo), o botão que chega ao meio da tela faz o papel do mouse em cima: entre os que estão
  // na faixa do meio (até um quinto da altura da tela acima ou abaixo dele), o mais perto para; fora da faixa, todos giram.
  // Vale depois que a pessoa rola a página, então os botões entram girando, como no computador. Os botões de metal e a seta
  // do Voltar entram na mesma lista, para haver um só "mais perto do meio" na página; botões lado a lado param juntos.
  // O dedo: vale o que o aparelho diz (sem mouse) e, além disso, o primeiro toque na tela; aparelhos Samsung dizem ter mouse
  // mesmo sem ter (o Samsung Internet), e o toque corrige; um mouse de verdade em movimento desliga a regra.
  // O mesmo código está no tools/seta-voltar.js: o primeiro dos dois que rodar cria a lista.
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

  // vértice: gira a peça em torno de X (o topo se afasta quando o ângulo cresce, como no rotateX do CSS)
  const VS = `
attribute vec3 aPos, aNrm;
uniform vec2 uMeia;
uniform float uAng, uZ;
varying vec3 vPo, vNo;
void main() {
  float c = cos(uAng), s = sin(uAng);
  vec3 w = vec3(aPos.x, aPos.y * c + aPos.z * s, -aPos.y * s + aPos.z * c);
  vPo = aPos; vNo = aNrm;
  gl_Position = vec4(w.xy / uMeia, -w.z / uZ, 1.0);
}`;
  const FS = `
precision highp float;
uniform float uPx;            // 1 px do dispositivo em css px
uniform vec2 uAB;             // metade da largura e da altura do botão (css px)
uniform float uAng;
uniform sampler2D uTxt;
uniform vec3 uEsmalte, uMetal;   // cor do fundo das letras gravadas; cor do metal (reflexo de frente, F0)
uniform float uLiso;             // 0 = escovado (riscos finos); 1 = liso, como uma barra de ouro fundida
uniform float uOnda;             // ondulação suave da superfície lisa (não é 100% plana), em radianos de normal
uniform float uPsi;              // 0 = paisagem; 1 = céu psicodélico (nuvens e cores que se desfazem)
uniform float uCidade;           // 1 = cidade ultramoderna à beira-mar: arranha-céus, céu e mar azuis
uniform sampler2D uAguiaT;          // a águia refletida no céu do espelho da cidade (unidade de textura 1)
uniform vec4 uAguia;             // centro (azimute, elevação) e tamanho (largura, altura) da águia no céu, em radianos; largura 0 = sem águia
uniform sampler2D uFotoT;          // a foto da cidade à beira-mar (unidade de textura 2)
uniform vec4 uFoto;              // janela da foto no céu: meia largura em azimute, elevação embaixo e no alto (radianos), x = 0: sem
                                 // foto; w = 1: a águia também é foto
uniform vec2 uOlho;              // olho a distância finita (distância, deslocamento para baixo), em px; 0 = projeção paralela
uniform float uBrilho;           // ganho do reflexo do ambiente e das luzes (reluzente)
uniform float uRelevo;           // força do baixo-relevo das letras
uniform vec3 uCeu, uMeio, uHor, uMont, uChao, uChave, uFaixa, uQuente, uAcento;
varying vec3 vPo, vNo;
const float PI = 3.14159265;
vec3 paraMundo(vec3 o, float c, float s) { return vec3(o.x, o.y * c + o.z * s, -o.y * s + o.z * c); }
// as fotos já vêm prontas para a tela: desfaz a curva de cor do final (refeita no fim) e o ganho do espelho, para a cidade e
// a águia saírem do espelho como na foto
vec3 desfaz(vec3 y) {
  y = clamp(y, 0.0, 0.97);
  vec3 a = 2.43 * y - 2.51, b = 0.59 * y - 0.03, c = 0.14 * y;
  return (-b - sqrt(b * b - 4.0 * a * c)) / (2.0 * a) / (uBrilho * 0.92);
}

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float ruido(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

// caixa de luz (softbox) em coordenadas de azimute e elevação, com borda macia
float caixa(float f, float e, float fc, float ec, float hf, float he) {
  float df = abs(mod(f - fc + PI, 2.0 * PI) - PI);
  vec2 q = vec2(df - hf, abs(e - ec) - he);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return 1.0 - smoothstep(-0.03, 0.05, d);
}
float foco(vec3 d, vec3 c, float raio) { return smoothstep(cos(raio * 1.6), cos(raio), dot(d, c)); }

// uma fileira de arranha-céus ao longo do horizonte: x = cobertura nesta direção (borda suave), y = altura relativa dentro da
// torre, z = posição na largura da torre, w = sorteio da torre; k = torres por volta; hs = altura; livre = onde pode haver torre
vec4 torre(float f, float e, float k, float seed, float hs, float livre) {
  float x = f * k, col = floor(x), cf = fract(x);
  float h1 = hash(vec3(col, seed, 1.3)), h2 = hash(vec3(col, seed + 5.1, 5.5)), h3 = hash(vec3(col, seed + 2.3, 8.9));
  float alt = hs * (0.05 + 0.26 * h1 * h1 + 0.07 * step(0.82, h2)) * (0.5 + ruido(vec3(f * 2.0, seed, 1.0))) * livre;
  float lg = 0.5 + 0.45 * h2, xa = 0.5 - lg * 0.5, rl = (cf - xa) / lg;
  float topo = alt - (h3 > 0.62 ? 0.05 * hs * clamp(rl, 0.0, 1.0) : 0.0);
  float ax = smoothstep(xa, xa + 0.03, cf) * (1.0 - smoothstep(xa + lg - 0.03, xa + lg, cf));
  float ay = smoothstep(0.0, 0.003, e) * (1.0 - smoothstep(topo - 0.003, topo, e));
  return vec4(ax * ay, clamp(e / max(alt, 1e-3), 0.0, 1.0), rl, h3);
}
// o vidro de uma torre: escuro embaixo, refletindo o céu no alto; lado esquerdo iluminado; faixas de andares e de montantes
vec3 vidro(vec4 t, float e, vec3 baixo, vec3 alto, float luz) {
  vec3 g = mix(baixo, alto, 0.08 + 0.72 * t.y * t.y + 0.12 * t.w);
  g *= 0.70 + 0.55 * luz * pow(clamp(1.0 - t.z, 0.0, 1.0), 1.4);
  g *= 0.95 + 0.05 * smoothstep(0.3, 0.7, fract(e * 110.0)) + 0.05 * smoothstep(0.35, 0.65, fract(t.z * (5.0 + 6.0 * t.w)));
  return g;
}

// ambiente fixo no mundo (y para cima, z para o observador): céu, montanhas assimétricas, chão e focos de luz
vec3 ambiente(vec3 d) {
  float e = asin(clamp(d.y, -1.0, 1.0));
  float f = atan(d.x, d.z);
  vec3 c;
  if (uPsi > 0.0) e += 0.22;   // céu de Matrix: o horizonte desce, a face reflete mais céu que gramado
  if (uCidade > 0.0) {
    // a foto da cidade à beira-mar, quando chega: cobre a janela dela no céu, com a borda fundida na cidade desenhada; no
    // miolo da janela, a cidade desenhada nem é calculada (o botão fica mais leve)
    float borda = 0.0; vec3 cf = vec3(0.0);
    if (uFoto.x > 0.0) {
      vec2 uf = vec2(f / (2.0 * uFoto.x) + 0.5, (uFoto.z - e) / (uFoto.z - uFoto.y));
      if (uf.x > 0.0 && uf.x < 1.0 && uf.y > 0.0 && uf.y < 1.0) {
        borda = smoothstep(0.0, 0.08, uf.x) * smoothstep(0.0, 0.08, 1.0 - uf.x) * smoothstep(0.0, 0.10, uf.y) * smoothstep(0.0, 0.06, 1.0 - uf.y);
        cf = desfaz(pow(texture2D(uFotoT, uf).rgb, vec3(2.2)));
      }
    }
    if (borda < 1.0) {
      // céu azul profundo no alto, claro e enevoado perto do horizonte, com faixas finas de cirros
      c = mix(uHor, uMeio, smoothstep(0.0, 0.42, e));
      c = mix(c, uCeu, smoothstep(0.30, 1.30, e));
      float cir = ruido(vec3(f * 2.6, e * 8.0, 1.7)) * 0.6 + ruido(vec3(f * 6.0, e * 20.0, 4.1)) * 0.4;
      c = mix(c, vec3(1.0), smoothstep(0.52, 0.88, cir) * smoothstep(0.06, 0.55, e) * 0.5);
      c += uHor * 0.45 * exp(-abs(e) * 8.0);
      // duas fileiras de arranha-céus: a de trás, baixa e enevoada; a da frente, alta, de vidro escuro
      vec4 t2 = torre(f + 0.37, e, 44.0, 17.0, 0.55, 1.0);
      vec3 g2 = vidro(t2, e, mix(uMont, uHor, 0.55), mix(uMeio, uHor, 0.6), 0.5);
      c = mix(c, g2, t2.x * 0.92);
      vec4 t1 = torre(f, e, 17.0, 3.0, 1.0, 1.0);
      vec3 g1 = vidro(t1, e, uMont, mix(uMeio, uHor, 0.3), 1.0);
      g1 = mix(g1, uHor, 0.10 * (1.0 - t1.y));   // névoa leve no pé das torres
      c = mix(c, g1, t1.x);
      // o mar: azul profundo, com o reflexo das torres, ondulação e brilho do sol em riscos
      if (e < 0.0) {
        float ee = -e, onda = 0.006 * ruido(vec3(f * 40.0, ee * 60.0, 2.0)) + 0.003 * ruido(vec3(f * 110.0, ee * 140.0, 5.0));
        vec3 mar = mix(uChao * 1.5, uChao * 0.4, smoothstep(0.0, 0.8, ee)) + uHor * 0.35 * exp(-ee * 14.0);
        vec4 r1 = torre(f, ee * 0.96 + onda, 17.0, 3.0, 1.0, 1.0), r2 = torre(f + 0.37, ee + onda, 44.0, 17.0, 0.55, 1.0);
        mar = mix(mar, vidro(r2, ee, mix(uMont, uHor, 0.55), mix(uMeio, uHor, 0.6), 0.5) * 0.7, r2.x * 0.35 * exp(-ee * 5.0));
        mar = mix(mar, vidro(r1, ee, uMont, mix(uMeio, uHor, 0.3), 1.0) * 0.7, r1.x * 0.5 * exp(-ee * 4.0));
        mar += uQuente * 1.3 * pow(ruido(vec3(f * 30.0, ee * 230.0, 2.0)), 7.0) * exp(-ee * 8.0);
        c = mar;
      }
      c = mix(c, cf, borda);
    } else c = cf;
    // a grande águia, em voo alto, à frente da cidade e do mar: o desenho e, quando chega, a foto
    vec2 ua = vec2((f - uAguia.x) / uAguia.z + 0.5, 0.5 - (e - uAguia.y) / uAguia.w);
    if (uAguia.z > 0.0 && ua.x > 0.0 && ua.x < 1.0 && ua.y > 0.0 && ua.y < 1.0) {
      vec4 g = texture2D(uAguiaT, ua, 0.4);   // desvio de nível: a águia fica suave, sem borda de desenho
      vec3 ga = uFoto.w > 0.0 ? desfaz(pow(g.rgb, vec3(2.2))) : mix(pow(g.rgb, vec3(2.2)), uMeio, 0.05) * 1.1;
      c = mix(c, ga, smoothstep(0.0, 0.9, g.a));
    }
  } else if (uPsi > 0.0) {
    // céu psicodélico do nascer do sol do fim de Matrix Revolutions: sol quase branco no horizonte, faixas de nuvens
    // alongadas na horizontal, em laranja e amarelo perto do sol e em verde, ciano, azul e violeta no alto; pouco rosa
    float n1 = ruido(d * vec3(0.9, 3.4, 0.9) + 3.1), n2 = ruido(d * vec3(2.2, 7.5, 2.2) + 11.7), n3 = ruido(d * vec3(4.5, 14.0, 4.5) + 5.3);
    float ee = abs(e) + uPsi * (0.55 * (n1 - 0.5) + 0.3 * (n2 - 0.5) + 0.1 * (n3 - 0.5));
    c = mix(uHor, uQuente, smoothstep(0.0, 0.10, ee));
    c = mix(c, uAcento, smoothstep(0.08, 0.24, ee));
    c = mix(c, uFaixa, smoothstep(0.20, 0.36, ee) * (0.4 + 0.6 * n3));
    c = mix(c, uMeio, smoothstep(0.30, 0.55, ee));
    c = mix(c, uCeu, smoothstep(0.50, 1.0, ee));
    c *= (0.6 + 0.8 * n2) * 0.8;
    c += uHor * 0.25 * exp(-abs(e) * 9.0) * (0.6 + 0.8 * n3);
    // o sol quase branco no centro do horizonte, com disco e raios
    vec2 ds = vec2(f, e - 0.03); float rs = length(ds);
    c += uChave * (1.7 * exp(-rs * rs * 700.0) + 0.45 * exp(-rs * 14.0) * (0.65 + 0.35 * sin(atan(ds.y, ds.x) * 18.0 + n1 * 3.0)));
    if (e > -0.02) {
      // arranha-céus de vidro nas laterais (o centro fica livre para o sol), claros à luz do sol, e a linha de árvores
      float kk = f * 9.0, cl = floor(kk), cx = fract(kk);
      float a1 = hash(vec3(cl, 4.1, 2.7)), a2 = hash(vec3(cl, 7.7, 1.9)), a3 = hash(vec3(cl, 3.3, 6.1));
      float lado = smoothstep(0.38, 0.85, abs(f));
      float alt = (0.07 + 0.30 * a1 * a1 + 0.06 * step(0.8, a2)) * lado;
      float lg = 0.45 + 0.5 * a2, xa = 0.5 - lg * 0.5, rl = (cx - xa) / lg;
      float dt = smoothstep(xa, xa + 0.03, cx) * (1.0 - smoothstep(xa + lg - 0.03, xa + lg, cx)) * smoothstep(0.0, 0.006, e) * (1.0 - smoothstep(alt - 0.006, alt, e));
      vec3 vidro = mix(uMont, mix(uHor, vec3(1.0), 0.4), 0.18 + 0.35 * (1.0 - abs(f)) + 0.2 * a3) * (0.75 + 0.45 * smoothstep(0.35, 1.0, rl));
      vidro *= 0.88 + 0.22 * smoothstep(0.45, 0.65, fract(rl * (4.0 + 5.0 * a3) + e * 30.0));   // janelas
      c = mix(c, vidro, dt);
      float copa = 0.035 + 0.035 * ruido(vec3(f * 26.0, 1.3, 0.7)) + 0.02 * ruido(vec3(f * 70.0, 2.1, 0.4));
      c = mix(c, uChao * (0.35 + 0.25 * ruido(vec3(f * 50.0, e * 80.0, 3.0))), (1.0 - smoothstep(copa - 0.006, copa, e)) * smoothstep(-0.02, 0.0, e) * 0.95);
    }
    // abaixo do horizonte, o gramado verde do parque, iluminado pelo sol
    if (e < 0.0) c = mix(c, uChao * (0.5 + 0.7 * exp(e * 4.0) * (0.6 + 0.8 * exp(-f * f * 6.0))) * (0.85 + 0.3 * n3), smoothstep(-0.02, -0.14, e) * 0.95);
  } else {
    c = mix(uHor, uMeio, smoothstep(0.0, 0.55, e));
    c = mix(c, uCeu, smoothstep(0.45, 1.35, e));
    c += uHor * 0.5 * exp(-abs(e) * 10.0);
    float m = 0.05 + 0.10 * pow(max(0.0, sin(f * 2.0 + 0.7)), 1.5) + 0.045 * sin(f * 5.0 + 1.3) + 0.022 * sin(f * 11.0 + 0.4) + 0.009 * sin(f * 27.0 + 2.0);
    if (e < m) c = mix(mix(uMont, uHor, 0.45), uMont, clamp((m - e) / 0.22, 0.0, 1.0));
    if (e < 0.0) c = mix(mix(uChao, uHor, 0.35) * 1.2, uChao * 0.3, smoothstep(0.0, -1.1, e));
  }
  // no acabamento liso, o chão escurece abaixo do horizonte (espelho de verdade) e o refletor principal é menor: a borda
  // dele e a linha do horizonte aparecem dentro da face e ondulam com a superfície
  if (uPsi <= 0.0 && uCidade <= 0.0) c *= mix(1.0, mix(0.32, 1.0, smoothstep(-0.10, 0.07, e)), uLiso);
  vec2 tam = mix(vec2(0.55, 0.50), vec2(0.26, 0.17), uLiso);
  // refletores de estúdio (caixa de luz, focos): não existem no espelho da cidade nem no céu de Matrix, que só refletem o que é deles
  float est = (1.0 - uCidade) * (1.0 - 0.95 * uPsi);   // no céu de Matrix, o espelho reflete só o céu
  float sb = caixa(f, e, mix(-0.22, -0.08, uLiso), mix(0.12, 0.17, uLiso), tam.x, tam.y) * est;
  c = mix(c, uChave * (1.05 + 0.35 * smoothstep(-0.4, 0.6, e) - 0.2 * smoothstep(-0.6, 0.35, f)), sb);
  c += est * uFaixa * 3.2 * caixa(f, e, 1.05, 0.18, 0.06, 0.55);
  c += est * uQuente * 5.0 * foco(d, normalize(vec3(0.55, 0.42, -0.72)), 0.10);
  c += est * uAcento * 4.0 * foco(d, normalize(vec3(-0.78, 0.12, -0.6)), 0.13);
  c += est * vec3(1.0) * 1.4 * smoothstep(1.2, 1.32, e);
  return c;
}

vec3 luz(vec3 L, vec3 cor, vec3 N, vec3 T, vec3 B, vec3 V, vec3 F0) {
  float NL = dot(N, L); if (NL <= 0.0) return vec3(0.0);
  float at = mix(0.05, 0.10, uLiso), ab = mix(0.22, 0.10, uLiso);   // escovado: brilho esticado; liso: ponto de luz nítido
  vec3 H = normalize(L + V);
  float TH = dot(T, H), BH = dot(B, H), NH = dot(N, H);
  float den = TH * TH / (at * at) + BH * BH / (ab * ab) + NH * NH;
  float D = 1.0 / (PI * at * ab * den * den);
  float NV = max(dot(N, V), 1e-3);
  float Vis = 0.5 / (NL * sqrt(NV * NV * 0.96 + 0.04) + NV * sqrt(NL * NL * 0.96 + 0.04));
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - max(dot(V, H), 0.0), 5.0);
  return D * Vis * F * NL * cor;
}

float letra(vec2 xy, float lado) {
  vec2 uv = vec2(xy.x / (2.0 * uAB.x) + 0.5, 0.5 - lado * xy.y / (2.0 * uAB.y));
  return texture2D(uTxt, uv, -1.4).a;   // desvio de nível: os traços finos das letras não borram
}
float letraBorrada(vec2 xy, float lado) {   // a mesma máscara, borrada: serve de halo em volta das letras
  vec2 uv = vec2(xy.x / (2.0 * uAB.x) + 0.5, 0.5 - lado * xy.y / (2.0 * uAB.y));
  return texture2D(uTxt, uv, 1.3).a;
}

vec3 tinge(vec3 po, vec3 no, float c, float s) {
  // espelho plano de verdade: com o olho a distância finita, cada ponto da face reflete uma direção diferente e a cidade
  // aparece inteira na superfície (em projeção paralela, uma face plana refletiria um ponto só)
  vec3 V = uOlho.x > 0.0 ? normalize(vec3(0.0, -uOlho.y, uOlho.x) - paraMundo(po, c, s)) : vec3(0.0, 0.0, 1.0);
  // gravação do texto: só nas faces, dentro da elipse interna
  float lado = po.z >= 0.0 ? 1.0 : -1.0;
  float naFace = smoothstep(0.90, 0.97, abs(no.z));
  float a = 0.0, aB = 0.0; vec2 grad = vec2(0.0);
  if (naFace > 0.0) {
    if (uCidade + uPsi > 0.0) aB = letraBorrada(po.xy, lado) * naFace;
    float h = mix(0.3, 0.85, step(0.6, uRelevo));   // relevo forte: chanfro mais largo
    a = letra(po.xy, lado);
    grad = vec2(letra(po.xy + vec2(h, 0.0), lado) - letra(po.xy - vec2(h, 0.0), lado),
                letra(po.xy + vec2(0.0, h), lado) - letra(po.xy - vec2(0.0, h), lado)) / (2.0 * h);
    a *= naFace; grad *= naFace;
  }
  vec3 nb = normalize(no + vec3(grad * uRelevo, 0.0));   // paredes das letras viradas para o fundo: baixo-relevo
  vec3 N = paraMundo(nb, c, s);
  vec3 X = vec3(1.0, 0.0, 0.0);
  vec3 T = X - N * dot(N, X); float tl = length(T);
  T = tl > 1e-3 ? T / tl : vec3(0.0, 1.0, 0.0);
  vec3 B = normalize(cross(N, T));
  // riscos do escovado, presos ao objeto: finos em y e z, longos em x; somem quando a face fica de lado
  float kf = 0.55 / uPx;
  vec3 gc = vec3(po.x * 0.025, po.y * kf, po.z * kf);
  float g = ruido(gc) * 0.45 + ruido(gc * vec3(0.7, 2.13, 2.13) + 7.1) * 0.25 + ruido(vec3(po.x * 0.004, po.y * 0.18, po.z * 0.18) + 3.3) * 0.3;
  g = mix(0.5, g, smoothstep(0.1, 0.5, abs(N.z)));
  g = mix(g, 0.5, uLiso);
  N = normalize(N + B * (g - 0.5) * 0.08);
  // superfície lisa mas não plana: ondulação suave presa ao objeto, em duas escalas, como a face de uma barra fundida
  float fl = smoothstep(0.1, 0.5, abs(N.z)) * uLiso * uOnda;
  if (fl > 0.0) {
    vec3 q = vec3(po.xy * vec2(0.016, 0.040), 1.3 + po.z * 0.03);
    float o1 = ruido(q) - 0.5, o2 = ruido(q + vec3(17.0, 9.0, 3.0)) - 0.5;
    float o3 = ruido(q * 2.7 + 5.0) - 0.5, o4 = ruido(q * 2.7 + 23.0) - 0.5;
    N = normalize(N + (T * (o1 + 0.45 * o3) + B * (o2 + 0.45 * o4)) * fl * 1.6);
  }
  float NV = max(dot(N, V), 1e-3);
  vec3 F0 = uMetal * mix(0.82 + 0.36 * g, 1.0, uLiso);
  vec3 Fv = F0 + (1.0 - F0) * pow(1.0 - NV, 5.0);
  // reflexo do ambiente, borrado na direção perpendicular aos riscos (como no aço escovado de verdade); no liso, quase nítido
  vec3 acc = vec3(0.0); float ws = 0.0; float bl = mix(0.14, 0.045, uLiso);
  // espelho da cidade: a face é 100% lisa, reflexo nítido, sem borrar; só o aro curvo é suavizado (senão o reflexo pisca)
  if (uCidade > 0.0) bl = 0.13 * (1.0 - smoothstep(0.88, 0.998, abs(no.z)));
  if (uCidade > 0.0 && bl <= 0.0) { acc = ambiente(reflect(-V, N)); ws = 1.0; }
  else for (int i = -6; i <= 6; i++) {
    float t = float(i) / 6.0; float w = exp(-t * t * 2.5);
    acc += ambiente(reflect(-V, normalize(N + B * t * bl + T * t * bl * 0.5 * uLiso))) * w; ws += w;
  }
  vec3 aco = Fv * acc / ws * uBrilho;
  aco += uBrilho * (1.0 - uCidade) * (1.0 - 0.9 * uPsi) * luz(normalize(vec3(-0.45, 0.65, 0.60)), uChave * 2.4, N, T, B, V, F0);
  aco += uBrilho * (1.0 - uCidade) * (1.0 - 0.9 * uPsi) * luz(normalize(vec3(0.75, 0.45, -0.45)), uFaixa * 3.0, N, T, B, V, F0);
  aco += uBrilho * (1.0 - uCidade) * (1.0 - 0.9 * uPsi) * luz(normalize(vec3(0.55, -0.35, 0.75)), uQuente * 1.8, N, T, B, V, F0);
  aco += uBrilho * (1.0 - uCidade) * (1.0 - 0.9 * uPsi) * luz(normalize(vec3(-0.70, -0.25, 0.55)), uAcento * 1.8, N, T, B, V, F0);
  float forte = clamp((uRelevo - 0.5) / 0.8, 0.0, 1.0);
  aco *= 1.0 - mix(0.2, 0.45, forte) * smoothstep(0.02, 0.5, a) * (1.0 - smoothstep(0.5, 0.9, a));   // sombra junto à parede da letra
  // fundo da letra gravada: esmalte escuro com brilho próprio; no baixo-relevo forte, é o próprio metal escurecido (sombra no fundo do corte)
  float NVb = max(dot(N, V), 0.0);
  vec3 esm = uEsmalte * (0.55 + 0.45 * N.y) + (0.04 + 0.96 * pow(1.0 - NVb, 5.0)) * ambiente(reflect(-V, N)) * 0.5;
  vec3 piso = (uEsmalte * 0.6 + uMetal * 0.03) * (0.55 + 0.45 * N.y) + aco * mix(0.17, 0.05, uPsi);   // céu psicodélico: fundo da letra mais escuro
  // espelho da cidade: a gravação é sempre azul-marinho escura, com um halo claro em volta, para ler bem sobre as torres
  // escuras, a águia e o céu claro
  if (uCidade + uPsi > 0.0) {   // espelho da cidade e céu de Matrix: letra escura com halo claro, legível sobre qualquer reflexo
    piso = vec3(0.010, 0.026, 0.085) + aco * 0.05;
    aco = mix(aco, vec3(0.95, 0.98, 1.0), clamp((aB - a) * 2.2, 0.0, 1.0) * 0.9);
  }
  return mix(aco, mix(esm, piso, forte), smoothstep(0.45, 0.8, a));
}

void main() {
  vec3 col = tinge(vPo, normalize(vNo), cos(uAng), sin(uAng));
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

  // malha do sabonete, em css px: tubo de raio r em volta da elipse interna (a borda) e duas faces abauladas
  function malha(a, b, r, D) {
    const ai = a - r, bi = b - r, NF = 256, NR = 24, NA = 24;
    const pos = [], nrm = [], idx = [];
    const grade = (lin, col, f) => {
      const base = pos.length / 3;
      for (let i = 0; i <= lin; i++) for (let j = 0; j <= col; j++) { const [p, n] = f(i / lin, j / col); pos.push(...p); nrm.push(...n); }
      for (let i = 0; i < lin; i++) for (let j = 0; j < col; j++) { const k = base + i * (col + 1) + j; idx.push(k, k + 1, k + col + 1, k + 1, k + col + 2, k + col + 1); }
    };
    grade(NR, NF, (u, v) => {
      const f = v * 2 * Math.PI, ps = (u - 0.5) * Math.PI;
      let nx = Math.cos(f) / ai, ny = Math.sin(f) / bi; const l = Math.hypot(nx, ny); nx /= l; ny /= l;
      const cp = Math.cos(ps), sp = Math.sin(ps);
      return [[ai * Math.cos(f) + nx * r * cp, bi * Math.sin(f) + ny * r * cp, r * sp], [nx * cp, ny * cp, sp]];
    });
    for (const lado of [1, -1]) grade(NA, NF, (u, v) => {
      const f = v * 2 * Math.PI, x = u * ai * Math.cos(f), y = u * bi * Math.sin(f), q = 1 - u * u;
      const nx = 4 * D * q * x / (ai * ai), ny = 4 * D * q * y / (bi * bi), l = Math.hypot(nx, ny, 1);
      return [[x, y, lado * (r + D * q * q)], [nx / l, ny / l, lado / l]];
    });
    let raio = 0;
    for (let i = 0; i < pos.length; i += 3) raio = Math.max(raio, Math.hypot(pos[i + 1], pos[i + 2]));
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), idx: new Uint16Array(idx), raio };
  }

// Grande águia (águia-de-cabeça-branca) planando, vista de baixo, desenhada em vetor num canvas 2D transparente: asas
// abertas com as sete penas primárias separadas e viradas para cima, secundárias, tectrizes em escamas, corpo marrom-
// escuro, cabeça e cauda brancas, bico amarelo em gancho. Aparece refletida no espelho da cidade (paleta "aguia").
let _aguia = null;
  function desenhaAguia(W, H) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d'); const k = W / 1320;   // unidades de projeto: envergadura ≈ 1200
    x.translate(W / 2, H * 0.43); x.scale(k, k); x.rotate(-0.07);   // leve rolamento, como numa térmica
    let semente = 7; const rnd = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
    const cor = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
    const MARROM = [38, 24, 14], MARROM2 = [86, 60, 36], PALHA = [196, 160, 104];
  
    // pena: do ponto (bx,by), na direção ang, com comprimento c e largura l; ponta arredondada, haste e borda clara
    function pena(bx, by, ang, c, l, escura, bordaClara) {
      x.save(); x.translate(bx, by); x.rotate(ang);
      const g = x.createLinearGradient(0, 0, c, 0);
      g.addColorStop(0, cor(MARROM, MARROM2, 0.15 * escura)); g.addColorStop(0.7, cor(MARROM, MARROM2, 0.45 * escura)); g.addColorStop(1, cor(MARROM2, PALHA, 0.35));
      x.fillStyle = g;
      x.beginPath(); x.moveTo(0, -l * 0.35);
      x.bezierCurveTo(c * 0.35, -l * 0.62, c * 0.82, -l * 0.5, c, -l * 0.16);
      x.quadraticCurveTo(c * 1.04, 0, c, l * 0.18);
      x.bezierCurveTo(c * 0.82, l * 0.5, c * 0.35, l * 0.62, 0, l * 0.35); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(8,4,2,0.55)'; x.lineWidth = 1.2; x.stroke();
      x.strokeStyle = bordaClara ? 'rgba(225,200,150,0.32)' : 'rgba(215,190,140,0.18)'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(c * 0.06, 0); x.lineTo(c * 0.97, 0); x.stroke();
      x.restore();
    }
    const lerp = (a, b, t) => a + (b - a) * t;
  
    // uma asa; lado = 1 (direita) ou -1 (esquerda); pequenas diferenças entre as duas, como numa ave de verdade
    function asa(lado, giro, esc) {
      x.save(); x.scale(lado, 1); x.rotate(giro);
      const ombro = [46, -34], cotovelo = [190, -78], punho = [352, -96], ponta = [470, -150];
      // penas secundárias: ao longo do antebraço, viradas para trás, levemente escalonadas
      for (let i = 0; i < 11; i++) {
        const t = i / 10, bx = lerp(punho[0] - 8, ombro[0] + 30, t), by = lerp(punho[1] + 14, ombro[1] + 54, t);
        pena(bx, by, Math.PI / 2 - 0.22 * (1 - t) + 0.08 * (rnd() - 0.5), 165 - 24 * t + 8 * rnd(), 44, 1, false);
      }
      // penas primárias: sete, abertas em leque na mão, viradas para cima e para fora
      for (let i = 0; i < 7; i++) {
        const t = i / 6, bx = lerp(punho[0] + 10, 404, t), by = lerp(punho[1] + 16, -52, t);
        const ang = lerp(-0.62, 0.52, t) + 0.05 * (rnd() - 0.5);
        pena(bx, by, ang - 0.16, 255 - 38 * t + 10 * rnd(), 34 - 4 * t, 1, true);
      }
      // tectrizes (cobertura da asa): escamas pequenas em fileiras do bordo de ataque até a base das penas
      const fileiras = 7;
      for (let f = 0; f < fileiras; f++) {
        const v = f / (fileiras - 1);
        for (let i = 0; i < 26; i++) {
          const t = i / 25;
          const ax = lerp(ombro[0], punho[0] + 30, t), ay = lerp(ombro[1], punho[1], t) + (cotovelo[1] - lerp(ombro[1], punho[1], 0.4)) * 0 ;
          const bx = ax + (rnd() - 0.5) * 6, by = ay + 6 + v * (62 - 16 * t) + (rnd() - 0.5) * 4;
          pena(bx, by, Math.PI / 2 - 0.2 + (rnd() - 0.5) * 0.2, 52 + 14 * rnd(), 28 + 6 * rnd(), 0.4 + 0.6 * v, false);
        }
      }
      // mão: tectrizes pequenas na base das primárias
      for (let i = 0; i < 18; i++) {
        const t = i / 17, bx = lerp(punho[0], 410, t) + (rnd() - 0.5) * 5, by = lerp(punho[1] + 6, -44, t) + (rnd() - 0.5) * 5;
        pena(bx, by, lerp(-0.5, 0.3, t), 62 + 12 * rnd(), 24, 0.7, false);
      }
      x.restore();
    }
  
    asa(-1, -0.035, 1); asa(1, 0.02, 1);
  
    // cauda branca em leque: doze penas, da base abaixo do corpo
    for (let i = 0; i < 12; i++) {
      const t = i / 11, ang = Math.PI / 2 + lerp(-0.44, 0.44, t) + 0.02 * (rnd() - 0.5);
      x.save(); x.translate(lerp(-20, 20, t), 92);
      x.rotate(ang);
      const c = 206 - 26 * Math.abs(t - 0.5) * 2 + 4 * rnd(), l = 64;
      const g = x.createLinearGradient(0, 0, c, 0); g.addColorStop(0, '#d9d6cc'); g.addColorStop(0.6, '#f7f5ee'); g.addColorStop(1, '#ffffff');
      x.fillStyle = g; x.beginPath(); x.moveTo(0, -l * 0.4); x.bezierCurveTo(c * 0.4, -l * 0.55, c * 0.85, -l * 0.5, c, -l * 0.2); x.quadraticCurveTo(c * 1.03, 0, c, l * 0.2);
      x.bezierCurveTo(c * 0.85, l * 0.5, c * 0.4, l * 0.55, 0, l * 0.4); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(120,112,98,0.55)'; x.lineWidth = 1.3; x.stroke();
      x.strokeStyle = 'rgba(160,150,130,0.4)'; x.beginPath(); x.moveTo(c * 0.05, 0); x.lineTo(c * 0.95, 0); x.stroke();
      x.restore();
    }
  
    // corpo: marrom-escuro, mais claro no peito, com sombra sob as asas
    let g = x.createLinearGradient(0, -90, 0, 130); g.addColorStop(0, '#3a2616'); g.addColorStop(0.5, '#2a1a0e'); g.addColorStop(1, '#1d1209');
    x.fillStyle = g; x.beginPath(); x.moveTo(0, -100); x.bezierCurveTo(46, -88, 56, 20, 30, 104); x.quadraticCurveTo(0, 124, -30, 104); x.bezierCurveTo(-56, 20, -46, -88, 0, -100); x.fill();
    x.globalAlpha = 0.55;
    for (let i = 0; i < 44; i++) {   // plumagem do peito, em penas curtas e suaves
      const py = -70 + 170 * rnd(), px = (rnd() - 0.5) * 66 * Math.sin(Math.PI * (py + 100) / 230);
      pena(px, py, Math.PI / 2 + (rnd() - 0.5) * 0.5, 30 + 12 * rnd(), 16, 0.3 + 0.7 * rnd(), false);
    }
    x.globalAlpha = 1;
  
    // pescoço e cabeça brancos; bico amarelo em gancho; olho
    x.fillStyle = '#efece3'; x.beginPath(); x.moveTo(-34, -84); x.bezierCurveTo(-40, -96, -34, -112, -26, -126); x.bezierCurveTo(-18, -160, -2, -170, 10, -168); x.bezierCurveTo(32, -164, 40, -134, 34, -112); x.bezierCurveTo(40, -96, 38, -88, 32, -80); x.quadraticCurveTo(0, -62, -34, -84); x.closePath(); x.fill();
    g = x.createRadialGradient(-6, -140, 4, 0, -136, 46); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(160,150,135,0.0)'); x.fillStyle = g; x.fill();
    for (let i = 0; i < 40; i++) { const a = rnd() * 6.28, r = rnd() * 28; x.strokeStyle = 'rgba(130,120,105,0.25)'; x.lineWidth = 1; x.beginPath(); x.moveTo(-1 + Math.cos(a) * r, -136 + Math.sin(a) * r * 1.2); x.lineTo(-1 + Math.cos(a) * r * 1.1, -136 + Math.sin(a) * r * 1.35 + 5); x.stroke(); }
    x.fillStyle = '#e8b31c'; x.beginPath(); x.moveTo(-16, -152); x.bezierCurveTo(-30, -158, -42, -150, -40, -136); x.bezierCurveTo(-37, -130, -30, -132, -27, -140); x.bezierCurveTo(-25, -146, -20, -148, -16, -146); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(70,40,5,0.7)'; x.lineWidth = 1.4; x.stroke();
    x.fillStyle = '#f2e7c8'; x.beginPath(); x.arc(-4, -146, 6.4, 0, 6.28); x.fill();
    x.fillStyle = '#c8921a'; x.beginPath(); x.arc(-4, -146, 4.6, 0, 6.28); x.fill();
    x.fillStyle = '#0a0604'; x.beginPath(); x.arc(-4, -146, 2.6, 0, 6.28); x.fill();
    x.strokeStyle = 'rgba(90,70,40,0.7)'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-13, -153); x.quadraticCurveTo(-5, -158, 6, -154); x.stroke();   // arcada
    return cv;
  }

  const lin = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.pow(v / 255, 2.2)); };
  const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
  const luminancia = ([r, g, b]) => [r, g, b].reduce((acc, v, i) => acc + [0.2126, 0.7152, 0.0722][i] * Math.pow(v / 255, 2.2), 0);
  const pot = n => Math.pow(2, Math.ceil(Math.log2(Math.max(2, n))));
  // textura de uma imagem na unidade dada, com mipmaps (os lados da imagem são potências de 2); a que estava na unidade (o
  // desenho, quando a foto chega) é apagada
  function textura(gl, unidade, im) {
    gl.activeTexture(gl.TEXTURE0 + unidade);
    const velha = gl.getParameter(gl.TEXTURE_BINDING_2D); if (velha) gl.deleteTexture(velha);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
  }
  // cada foto é baixada uma vez só, para todos os botões da página
  const _fotos = {};
  const carrega = url => _fotos[url] || (_fotos[url] = new Promise((ok, falha) => { const im = new Image(); im.onload = () => ok(im); im.onerror = falha; im.src = url; }));

  // cor do esmalte: a mais escura entre o texto, o fundo e as cores do degradê do botão original, escurecida até
  // ler bem no metal claro
  function esmalte(cs) {
    const visivel = c => c.length >= 3 && !(c.length > 3 && c[3] < 0.5), cores = [rgb(cs.color), rgb(cs.backgroundColor)];
    for (const m of (cs.backgroundImage || '').matchAll(/rgba?\([^)]*\)/g)) cores.push(rgb(m[0]));   // as cores do degradê
    let c = cores.filter(visivel).map(x => x.slice(0, 3)).reduce((a, b) => luminancia(b) < luminancia(a) ? b : a);
    while (luminancia(c) > 0.035) c = c.map(v => v * 0.9);
    return c.map(v => Math.pow(v / 255, 2.2));
  }

  // Nos botões de compra (dentro de .compra) o rótulo é uma linha só e o tamanho da letra se ajusta à face do metal:
  // ocupa 92% da corda máxima que cabe na elipse interna na altura do texto, sem passar de 44% da altura do botão. Assim
  // o texto curto ("Paperback", "Livro Impresso") fica maior e o longo ("Livro no Kindle (e-book)") preenche a face.
  // O tamanho do CSS fica de reserva, sem WebGL.
  function ajusta(btn) {
    const rot = [...btn.children].find(c => c.tagName === 'SPAN');
    if (!rot || !btn.closest('.compra')) return;
    rot.style.fontSize = ''; rot.style.whiteSpace = 'nowrap';
    const b = btn.getBoundingClientRect(), R = Math.round(b.height * 0.17 * 10) / 10, ai = b.width / 2 - R, bi = b.height / 2 - R;
    const f0 = parseFloat(getComputedStyle(rot).fontSize), rg = document.createRange(); rg.selectNodeContents(rot);
    const medida = rg.getBoundingClientRect(); if (!medida.width) return;
    // a altura da letra muda a corda disponível; o teto (44% da altura do botão, no máximo 30 px) entra em cada rodada,
    // senão um texto curto propõe uma letra enorme, a rodada seguinte reage demais e a conta não converge
    const teto = Math.min(0.44 * b.height, 30);
    let fs = Math.min(f0, teto);
    for (let i = 0; i < 6; i++) {
      const hh = medida.height / 2 * fs / f0, y = Math.min(0.6 * hh, bi * 0.95);
      const limite = 2 * (ai * Math.sqrt(1 - (y / bi) * (y / bi)) - 2);
      fs = Math.min(f0 * 0.92 * limite / medida.width, teto);
    }
    fs = Math.max(f0 * 0.6, fs);
    rot.style.fontSize = fs.toFixed(2) + 'px';
  }

  function rotuloTextura(btn, r, tw, th) {
    const cv = document.createElement('canvas'); cv.width = tw; cv.height = th;
    const ctx = cv.getContext('2d'); ctx.scale(tw / r.width, th / r.height); ctx.fillStyle = '#fff';
    const andar = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT); let n;
    while ((n = andar.nextNode())) {
      const st = getComputedStyle(n.parentElement);
      ctx.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = st.letterSpacing === 'normal' ? '0px' : st.letterSpacing;
      const re = /\S+/g; let m;
      while ((m = re.exec(n.data))) {
        const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        const rc = rg.getClientRects()[0]; if (!rc) continue;
        const mt = ctx.measureText(m[0]);
        const asc = mt.fontBoundingBoxAscent, desc = mt.fontBoundingBoxDescent;
        ctx.fillText(m[0], rc.left - r.left, rc.top - r.top + (rc.height - asc - desc) / 2 + asc);
      }
    }
    return cv;
  }

  function prepara(btn, paleta, css) {
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true, depth: true });
    if (!gl) return null;
    const prog = gl.createProgram();
    for (const [tipo, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
      const sh = gl.createShader(tipo); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(sh)); return null; }
      gl.attachShader(prog, sh);
    }
    gl.linkProgram(prog); gl.useProgram(prog);
    const bPos = gl.createBuffer(), bNrm = gl.createBuffer(), bIdx = gl.createBuffer();
    for (const [nome, buf] of [['aPos', bPos], ['aNrm', bNrm]]) {
      const loc = gl.getAttribLocation(prog, nome); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    }
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    const U = nome => gl.getUniformLocation(prog, nome);
    for (const k of ['ceu', 'meio', 'horizonte', 'montanha', 'chao', 'chave', 'faixa', 'quente', 'acento'])
      gl.uniform3fv(U({ ceu: 'uCeu', meio: 'uMeio', horizonte: 'uHor', montanha: 'uMont', chao: 'uChao', chave: 'uChave', faixa: 'uFaixa', quente: 'uQuente', acento: 'uAcento' }[k]), lin(paleta[k]));
    gl.uniform3fv(U('uEsmalte'), esmalte(css));
    gl.uniform3fv(U('uMetal'), paleta.metal ? lin(paleta.metal) : [0.62, 0.63, 0.65]);
    gl.uniform1f(U('uLiso'), paleta.liso || 0); gl.uniform1f(U('uOnda'), paleta.onda || 0); gl.uniform1f(U('uPsi'), paleta.psi || 0); gl.uniform1f(U('uCidade'), paleta.cidade || 0);
    gl.uniform1f(U('uBrilho'), paleta.brilho || 1); gl.uniform1f(U('uRelevo'), paleta.relevo || 0.5);
    const tex = gl.createTexture();
    gl.uniform1i(U('uAguiaT'), 1); gl.uniform1i(U('uFotoT'), 2); gl.uniform4fv(U('uFoto'), [0, 0, 0, 0]);
    if (paleta.aguia) {   // [azimute, elevação, largura, altura] da águia no céu refletido
      if (!_aguia) _aguia = desenhaAguia(1024, 512);
      textura(gl, 1, _aguia);
      gl.uniform4fv(U('uAguia'), paleta.aguia);
    } else gl.uniform4fv(U('uAguia'), [0, 0, 0, 1]);
    const e = { btn, cv, gl, U, tex, ang: 0, vel: 0, parar: false, alvo: null, recuo: null, rodando: false, visivel: true,
                abaulado: paleta.abaulado === undefined ? 0.045 : paleta.abaulado, olho: paleta.olho || 0, inclina: paleta.inclina || 0 };
    // espelho da cidade com fotos: a cidade (paleta.foto, na janela paleta.janela do céu) e a águia (paleta.fotoAguia) entram
    // quando chegam; até lá, e se uma delas não carregar, fica o desenho
    const foto = e.foto = [0, 0, 0, 0];   // o uFoto; fica no botão para o verificador conferir que as fotos entraram
    if (paleta.foto) carrega(paleta.foto).then(im => { textura(gl, 2, im); foto.splice(0, 3, ...paleta.janela); gl.uniform4fv(U('uFoto'), foto); if (e.n) e.desenha(); }, () => {});
    if (paleta.fotoAguia) carrega(paleta.fotoAguia).then(im => { textura(gl, 1, im); foto[3] = 1; gl.uniform4fv(U('uFoto'), foto); if (e.n) e.desenha(); }, () => {});

    e.mede = function () {
      ajusta(btn);
      const r = btn.getBoundingClientRect(), cs = getComputedStyle(btn);
      const w = r.width, h = r.height, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h) return;   // botão escondido (os do fim da página só aparecem no celular): mede quando aparecer
      const R = Math.round(h * 0.17 * 10) / 10, D = Math.round(h * e.abaulado * 10) / 10;   // espessura total ≈ 0,43 da altura no centro
      const m = malha(w / 2, h / 2, R, D);
      gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bNrm); gl.bufferData(gl.ARRAY_BUFFER, m.nrm, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
      e.n = m.idx.length;
      const mx = 1, my = Math.ceil(m.raio - h / 2) + 4;
      const cw = w + 2 * mx, ch = h + 2 * my;
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      Object.assign(cv.style, { width: cw + 'px', height: ch + 'px', left: -(mx + parseFloat(cs.borderLeftWidth)) + 'px', top: -(my + parseFloat(cs.borderTopWidth)) + 'px' });
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U('uMeia'), cw / 2, ch / 2);
      gl.uniform1f(U('uZ'), m.raio + 1);
      gl.uniform1f(U('uPx'), 1 / dpr);
      gl.uniform2f(U('uAB'), w / 2, h / 2);
      const dist = e.olho * Math.max(w, 340);   // botão pequeno: o mesmo campo de visão do grande (a cena é cortada, não apertada)
      gl.uniform2f(U('uOlho'), dist, Math.tan(e.inclina) * dist);   // olho a distância finita: espelho plano
      const tw = Math.min(4096, pot(w * dpr * 2)), th = Math.min(1024, pot(h * dpr * 2));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, rotuloTextura(btn, r, tw, th));
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      e.desenha();
    };
    e.desenha = function () {
      gl.uniform1f(U('uAng'), e.ang);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, e.n, gl.UNSIGNED_SHORT, 0);
    };
    return e;
  }

  // Física do giro. Sem nada em cima, acelera até a velocidade de cruzeiro e gira sem parar. Com o mouse, o dedo
  // ou o foco do teclado em cima (e.parar), freia suave e para de frente: na face da frente ou na de trás, que
  // também traz o texto gravado (múltiplo de 180°). A frenagem é recalculada a cada quadro, então nunca há
  // tranco; se o botão mal começou a girar (menos de 20° depois de uma face), só volta macio para ela.
  const MEIA = Math.PI, VOLTA = 2 * Math.PI, W = VOLTA / PERIODO, FREIO = W / 0.5, FREIO_MAX = W / 0.3;
  function avanca(e, dt) {
    if (!e.parar) {
      e.alvo = null; e.recuo = null;
      e.vel += (W - e.vel) * (1 - Math.exp(-dt / 0.25));
      e.ang = (e.ang + e.vel * dt) % VOLTA;
      return true;
    }
    if (e.alvo == null && e.recuo == null) {
      const dentro = e.ang - Math.floor(e.ang / MEIA) * MEIA;
      if (dentro < 1e-6 && e.vel < 1e-3) { e.ang -= dentro; e.vel = 0; return false; }
      if (dentro < 20 * Math.PI / 180 && e.vel < 0.6 * W) e.recuo = { a0: e.ang, base: e.ang - dentro, t: 0 };
      else {
        e.alvo = Math.ceil(e.ang / MEIA - 1e-9) * MEIA;
        while (e.alvo - e.ang < e.vel * e.vel / (2 * FREIO_MAX)) e.alvo += MEIA;
      }
    }
    if (e.recuo) {
      const r = e.recuo; r.t += dt;
      const u = Math.min(1, r.t / 0.35), k = u * u * (3 - 2 * u);
      e.ang = r.a0 + (r.base - r.a0) * k; e.vel = 0;
      if (u >= 1) { e.ang = r.base % VOLTA; e.recuo = null; return false; }
      return true;
    }
    const resta = e.alvo - e.ang;
    if (resta > e.vel * e.vel / (2 * FREIO) + 1e-6) e.vel += (Math.max(e.vel, 0.5 * W) - e.vel) * (1 - Math.exp(-dt / 0.3));
    else e.vel = Math.max(0, e.vel - e.vel * e.vel / (2 * Math.max(resta, 1e-6)) * dt);
    e.ang += e.vel * dt;
    if (e.ang >= e.alvo - 2e-4 || (e.vel < 0.01 && e.alvo - e.ang < 0.01)) { e.ang = e.alvo % VOLTA; e.vel = 0; e.alvo = null; return false; }
    return true;
  }

  function passo(e, ts) {
    const dt = Math.min(0.05, (ts - (e.t0 || ts)) / 1000); e.t0 = ts;
    const segue = avanca(e, dt);
    e.desenha();
    if (segue && e.visivel) requestAnimationFrame(t => passo(e, t)); else { e.rodando = false; e.t0 = 0; }
  }
  function liga(e) { if (!e.rodando && e.visivel) { e.rodando = true; requestAnimationFrame(t => passo(e, t)); } }

  window.acoEscovado = function (paleta, seletor) {
    const st = document.createElement('style');
    st.textContent = `
      a.aco-btn, a.aco-btn:hover { position: relative; background: none !important; border-color: transparent !important; box-shadow: none !important; transform: none !important; color: transparent !important; text-shadow: none !important; }
      a.aco-btn * { color: transparent !important; }
      a.aco-btn:focus-visible { border-radius: 50%; }
      .aco-cv { position: absolute; pointer-events: none; filter: drop-shadow(0 5px 6px rgba(0, 0, 0, 0.55)); }
      @media (forced-colors: active) { .aco-cv { display: none; } }`;
    document.head.appendChild(st);
    const parado = matchMedia('(prefers-reduced-motion: reduce)');
    const lista = [];
    const decide = e => { e.parar = e.mouse || e.foco || e.centro || parado.matches; liga(e); };
    const olho = 'IntersectionObserver' in window ? new IntersectionObserver(vs => vs.forEach(v => {
      const e = lista.find(x => x.btn === v.target); if (e) { e.visivel = v.isIntersecting; liga(e); }
    })) : null;
    document.querySelectorAll(seletor || 'a.btn').forEach(btn => {
      const css = getComputedStyle(btn);
      // paleta por botão: "por": {"btn-kindle": {...}} troca campos da paleta nos botões com essa classe (o Cotidiano
      // tem ouro e cidade na mesma página)
      const pal = Object.assign({}, paleta, ...Object.entries(paleta.por || {}).filter(([cl]) => btn.classList.contains(cl)).map(([, v]) => v));
      const e = prepara(btn, pal, { backgroundColor: css.backgroundColor, backgroundImage: css.backgroundImage, color: css.color });
      if (!e) return;
      e.cv.className = 'aco-cv'; e.cv.setAttribute('aria-hidden', 'true');
      btn.classList.add('aco-btn'); btn.appendChild(e.cv);
      e.cv.addEventListener('webglcontextlost', () => {
        e.rodando = false; e.cv.remove(); btn.classList.remove('aco-btn');
        const rot = [...btn.children].find(c => c.tagName === 'SPAN'); if (rot) { rot.style.fontSize = ''; rot.style.whiteSpace = ''; }
      });
      e.mede();
      new ResizeObserver(() => e.mede()).observe(btn);
      btn.addEventListener('pointerenter', () => { e.mouse = true; decide(e); });
      btn.addEventListener('pointerleave', () => { e.mouse = false; decide(e); });
      // navegador antigo, sem :focus-visible (Safari antes de 2022): qualquer foco para o botão
      btn.addEventListener('focus', () => { try { e.foco = btn.matches(':focus-visible'); } catch (_) { e.foco = true; } decide(e); });
      btn.addEventListener('blur', () => { e.foco = false; decide(e); });
      lista.push(e);
      if (olho) olho.observe(btn);
      centro.junta(btn, sim => { if (e.centro !== sim) { e.centro = sim; decide(e); } });
      decide(e);
    });
    // se uma fonte chegar depois, o texto gravado é refeito com ela
    if (document.fonts) document.fonts.addEventListener('loadingdone', () => lista.forEach(e => e.mede()));
    parado.addEventListener('change', () => lista.forEach(decide));
    window.acoEscovado.botoes = lista;
    window.acoEscovado.avanca = avanca;
    return lista.length;
  };

  // inicia sozinho com a paleta que a página traz no próprio <script>
  const eu = document.currentScript;
  if (eu && eu.dataset.paleta) {
    const vai = () => window.acoEscovado(JSON.parse(eu.dataset.paleta));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vai); else vai();
  }
})();
