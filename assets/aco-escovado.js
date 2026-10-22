// Botões de aço escovado: cada a.btn vira um elipsoide sólido achatado, com a largura e a altura exatas do
// botão retangular, desenhado em WebGL como uma malha 3D (borda arredondada de sabonete gasto, faces abauladas).
// Gira sozinho desde a entrada da página, em torno do eixo X, no mesmo sentido das setas Voltar/Back, e reflete
// uma paisagem fixa no mundo, nas cores da página. Com o mouse, o dedo ou o foco do teclado em cima, freia e para
// de frente; ao sair, volta a girar. Fora da tela, não gasta nada. O texto continua no HTML (leitores de tela, busca, seleção); o que se vê
// é o mesmo texto gravado no metal.
// Sem WebGL, com o alto contraste do Windows ou se o contexto 3D se perder, fica o botão original.
// Uso: <script src="/assets/aco-escovado.js" defer data-paleta='{"ceu": "#…", "meio": …}'></script> no <head>;
// a paleta (ceu, meio, horizonte, montanha, chao, chave, faixa, quente, acento) vem do gen_solucao.py (ACO).
// Fonte: tools/aco-escovado.js no privado; o tools/aplica_aco_escovado.py copia para /assets/.
(function () {
  'use strict';
  const PERIODO = 2.4;   // segundos por volta

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
uniform vec3 uEsmalte;
uniform vec3 uCeu, uMeio, uHor, uMont, uChao, uChave, uFaixa, uQuente, uAcento;
varying vec3 vPo, vNo;
const float PI = 3.14159265;
vec3 paraMundo(vec3 o, float c, float s) { return vec3(o.x, o.y * c + o.z * s, -o.y * s + o.z * c); }

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

// ambiente fixo no mundo (y para cima, z para o observador): céu, montanhas assimétricas, chão e focos de luz
vec3 ambiente(vec3 d) {
  float e = asin(clamp(d.y, -1.0, 1.0));
  float f = atan(d.x, d.z);
  vec3 c = mix(uHor, uMeio, smoothstep(0.0, 0.55, e));
  c = mix(c, uCeu, smoothstep(0.45, 1.35, e));
  c += uHor * 0.5 * exp(-abs(e) * 10.0);
  float m = 0.05 + 0.10 * pow(max(0.0, sin(f * 2.0 + 0.7)), 1.5) + 0.045 * sin(f * 5.0 + 1.3) + 0.022 * sin(f * 11.0 + 0.4) + 0.009 * sin(f * 27.0 + 2.0);
  if (e < m) c = mix(mix(uMont, uHor, 0.45), uMont, clamp((m - e) / 0.22, 0.0, 1.0));
  if (e < 0.0) c = mix(mix(uChao, uHor, 0.35) * 1.2, uChao * 0.3, smoothstep(0.0, -1.1, e));
  float sb = caixa(f, e, -0.22, 0.12, 0.55, 0.50);
  c = mix(c, uChave * (1.05 + 0.35 * smoothstep(-0.4, 0.6, e) - 0.2 * smoothstep(-0.6, 0.35, f)), sb);
  c += uFaixa * 3.2 * caixa(f, e, 1.05, 0.18, 0.06, 0.55);
  c += uQuente * 5.0 * foco(d, normalize(vec3(0.55, 0.42, -0.72)), 0.10);
  c += uAcento * 4.0 * foco(d, normalize(vec3(-0.78, 0.12, -0.6)), 0.13);
  c += vec3(1.0) * 1.4 * smoothstep(1.2, 1.32, e);
  return c;
}

vec3 luz(vec3 L, vec3 cor, vec3 N, vec3 T, vec3 B, vec3 V, vec3 F0) {
  float NL = dot(N, L); if (NL <= 0.0) return vec3(0.0);
  const float at = 0.05, ab = 0.22;
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
  return texture2D(uTxt, uv).a;
}

vec3 tinge(vec3 po, vec3 no, float c, float s) {
  vec3 V = vec3(0.0, 0.0, 1.0);
  // gravação do texto: só nas faces, dentro da elipse interna
  float lado = po.z >= 0.0 ? 1.0 : -1.0;
  float naFace = smoothstep(0.90, 0.97, abs(no.z));
  float a = 0.0; vec2 grad = vec2(0.0);
  if (naFace > 0.0) {
    const float h = 0.3;
    a = letra(po.xy, lado);
    grad = vec2(letra(po.xy + vec2(h, 0.0), lado) - letra(po.xy - vec2(h, 0.0), lado),
                letra(po.xy + vec2(0.0, h), lado) - letra(po.xy - vec2(0.0, h), lado)) / (2.0 * h);
    a *= naFace; grad *= naFace;
  }
  vec3 nb = normalize(no + vec3(grad * 0.5, 0.0));
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
  N = normalize(N + B * (g - 0.5) * 0.08);
  float NV = max(dot(N, V), 1e-3);
  vec3 F0 = vec3(0.62, 0.63, 0.65) * (0.82 + 0.36 * g);
  vec3 Fv = F0 + (1.0 - F0) * pow(1.0 - NV, 5.0);
  // reflexo do ambiente, borrado na direção perpendicular aos riscos (como no aço escovado de verdade)
  vec3 acc = vec3(0.0); float ws = 0.0;
  for (int i = -6; i <= 6; i++) {
    float t = float(i) / 6.0; float w = exp(-t * t * 2.5);
    acc += ambiente(reflect(-V, normalize(N + B * t * 0.14))) * w; ws += w;
  }
  vec3 aco = Fv * acc / ws;
  aco += luz(normalize(vec3(-0.45, 0.65, 0.60)), uChave * 2.4, N, T, B, V, F0);
  aco += luz(normalize(vec3(0.75, 0.45, -0.45)), uFaixa * 3.0, N, T, B, V, F0);
  aco += luz(normalize(vec3(0.55, -0.35, 0.75)), uQuente * 1.8, N, T, B, V, F0);
  aco += luz(normalize(vec3(-0.70, -0.25, 0.55)), uAcento * 1.8, N, T, B, V, F0);
  aco *= 1.0 - 0.2 * smoothstep(0.02, 0.5, a) * (1.0 - smoothstep(0.5, 0.9, a));
  // esmalte escuro no fundo das letras, com brilho próprio
  float NVb = max(dot(N, V), 0.0);
  vec3 esm = uEsmalte * (0.55 + 0.45 * N.y) + (0.04 + 0.96 * pow(1.0 - NVb, 5.0)) * ambiente(reflect(-V, N)) * 0.5;
  return mix(aco, esm, smoothstep(0.45, 0.8, a));
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

  const lin = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.pow(v / 255, 2.2)); };
  const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
  const luminancia = ([r, g, b]) => [r, g, b].reduce((acc, v, i) => acc + [0.2126, 0.7152, 0.0722][i] * Math.pow(v / 255, 2.2), 0);
  const pot = n => Math.pow(2, Math.ceil(Math.log2(Math.max(2, n))));

  // cor do esmalte: a mais escura entre o fundo e o texto do botão original, escurecida até ler bem no aço claro
  function esmalte(cs) {
    const fundo = rgb(cs.backgroundColor), texto = rgb(cs.color);
    let c = (fundo.length > 3 && fundo[3] < 0.5) || !fundo.length ? texto : (luminancia(fundo) < luminancia(texto) ? fundo : texto);
    c = c.slice(0, 3);
    while (luminancia(c) > 0.035) c = c.map(v => v * 0.9);
    return c.map(v => Math.pow(v / 255, 2.2));
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
    const tex = gl.createTexture();
    const e = { btn, cv, gl, U, tex, ang: 0, vel: 0, parar: false, alvo: null, recuo: null, rodando: false, visivel: true };

    e.mede = function () {
      const r = btn.getBoundingClientRect(), cs = getComputedStyle(btn);
      const w = r.width, h = r.height, dpr = Math.min(2, window.devicePixelRatio || 1);
      const R = Math.round(h * 0.17 * 10) / 10, D = Math.round(h * 0.045 * 10) / 10;   // espessura total ≈ 0,43 da altura no centro
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
      const tw = Math.min(4096, pot(w * dpr * 2)), th = Math.min(1024, pot(h * dpr * 2));
      gl.bindTexture(gl.TEXTURE_2D, tex);
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
    const decide = e => { e.parar = e.mouse || e.foco || parado.matches; liga(e); };
    const olho = 'IntersectionObserver' in window ? new IntersectionObserver(vs => vs.forEach(v => {
      const e = lista.find(x => x.btn === v.target); if (e) { e.visivel = v.isIntersecting; liga(e); }
    })) : null;
    document.querySelectorAll(seletor || 'a.btn').forEach(btn => {
      const css = getComputedStyle(btn);
      const e = prepara(btn, paleta, { backgroundColor: css.backgroundColor, color: css.color });
      if (!e) return;
      e.cv.className = 'aco-cv'; e.cv.setAttribute('aria-hidden', 'true');
      btn.classList.add('aco-btn'); btn.appendChild(e.cv);
      e.cv.addEventListener('webglcontextlost', () => { e.rodando = false; e.cv.remove(); btn.classList.remove('aco-btn'); });
      e.mede();
      new ResizeObserver(() => e.mede()).observe(btn);
      btn.addEventListener('pointerenter', () => { e.mouse = true; decide(e); });
      btn.addEventListener('pointerleave', () => { e.mouse = false; decide(e); });
      btn.addEventListener('focus', () => { e.foco = btn.matches(':focus-visible'); decide(e); });
      btn.addEventListener('blur', () => { e.foco = false; decide(e); });
      lista.push(e);
      if (olho) olho.observe(btn);
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
