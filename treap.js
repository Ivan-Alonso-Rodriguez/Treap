// Control para mostrar status de recorrido unos segundos
let statusTimerActive = false;
const statusDisplayTime = 100000; // milisegundos que muestra el resultado final


// Nodo similar a C++ class Node
class Node {
  constructor(c, p) {
    this.clave = c;
    this.prioridad = p;
    this.izq = null;
    this.der = null;
    this.x = 0;
    this.y = 0;
  }
}

// Clona arbol para snapshots
function cloneTree(node) {
  if (!node) return null;
  const copy = new Node(node.clave, node.prioridad);
  copy.izq = cloneTree(node.izq);
  copy.der = cloneTree(node.der);
  return copy;
}

// Treap con animaciones y recorridos
class Treap {
  constructor() {
    this.root = null;
    this.steps = [];
    this.msgs = [];
    this.highlights = [];
    this.layouts = [];
    this.dataMaps = [];
    this.isAnimating = false;
    this.stepIndex = 0;
    this.frameCounter = 0;
    this.stepDelay = 30;
  }

  // Rotaciones
  rotarIzquierda(nodo) {
    const temp = nodo.der;
    nodo.der = temp.izq;
    temp.izq = nodo;
    return temp;
  }

  rotarDerecha(nodo) {
    const temp = nodo.izq;
    nodo.izq = temp.der;
    temp.der = nodo;
    return temp;
  }

  // Insercion recursiva
  insert(nodo, clave, prioridad) {
    if (!nodo) return new Node(clave, prioridad);
    if (clave < nodo.clave) {
      nodo.izq = this.insert(nodo.izq, clave, prioridad);
      if (nodo.izq.prioridad > nodo.prioridad) nodo = this.rotarDerecha(nodo);
    } else if (clave > nodo.clave) {
      nodo.der = this.insert(nodo.der, clave, prioridad);
      if (nodo.der.prioridad > nodo.prioridad) nodo = this.rotarIzquierda(nodo);
    }
    return nodo;
  }

  insertar(clave) {
    const pr = Math.floor(Math.random() * 100);
    this.root = this.insert(this.root, clave, pr);
  }

  // Eliminacion recursiva
  erase(nodo, clave) {
    if (!nodo) return null;
    if (clave < nodo.clave) {
      nodo.izq = this.erase(nodo.izq, clave);
    } else if (clave > nodo.clave) {
      nodo.der = this.erase(nodo.der, clave);
    } else {
      if (!nodo.izq) return nodo.der;
      if (!nodo.der) return nodo.izq;
      if (nodo.izq.prioridad > nodo.der.prioridad) {
        nodo = this.rotarDerecha(nodo);
        nodo.der = this.erase(nodo.der, clave);
      } else {
        nodo = this.rotarIzquierda(nodo);
        nodo.izq = this.erase(nodo.izq, clave);
      }
    }
    return nodo;
  }

  eliminar(clave) {
    this.root = this.erase(this.root, clave);
  }

  // Busqueda recursiva
  search(nodo, clave) {
    if (!nodo) return false;
    if (clave < nodo.clave) return this.search(nodo.izq, clave);
    if (clave > nodo.clave) return this.search(nodo.der, clave);
    return true;
  }

  buscar(clave) {
    return this.search(this.root, clave);
  }

  limpiar() {
    this.root = null;
  }

  // Animacion base
  recordStep(msg, highlight = null) {
    this.steps.push(cloneTree(this.root));
    this.msgs.push(msg);
    this.highlights.push(highlight);
  }

  resetAnim() {
    this.steps = [];
    this.msgs = [];
    this.highlights = [];
    this.stepIndex = 0;
    this.frameCounter = 0;
  }

  startAnim() {
    this.computeAll();
    this.isAnimating = true;
  }

  // Animar insertar
  animateInsert() {
    const c = parseInt(document.getElementById('valorInput').value);
    if (isNaN(c)) return;
    this.resetAnim();
    this.recordStep(`Inicio insert(${c})`);
    this.root = this.insertSteps(this.root, c, Math.floor(Math.random() * 100));
    this.recordStep(`Fin insert(${c})`);
    this.startAnim();
  }

  insertSteps(nodo, clave, prioridad) {
    if (!nodo) {
      this.recordStep(`New Node(${clave},${prioridad})`, clave);
      return new Node(clave, prioridad);
    }
    this.recordStep(`Compare ${clave} vs ${nodo.clave}`, nodo.clave);
    if (clave < nodo.clave) {
      nodo.izq = this.insertSteps(nodo.izq, clave, prioridad);
      if (nodo.izq.prioridad > nodo.prioridad) {
        nodo = this.rotarDerecha(nodo);
        this.recordStep(`RRot(${nodo.clave})`, nodo.clave);
      }
    } else if (clave > nodo.clave) {
      nodo.der = this.insertSteps(nodo.der, clave, prioridad);
      if (nodo.der.prioridad > nodo.prioridad) {
        nodo = this.rotarIzquierda(nodo);
        this.recordStep(`LRot(${nodo.clave})`, nodo.clave);
      }
    }
    return nodo;
  }

  // Animar eliminar
  animateDelete() {
    const c = parseInt(document.getElementById('valorInput').value);
    if (isNaN(c)) return;
    this.resetAnim();
    this.recordStep(`Inicio erase(${c})`);
    this.root = this.eraseSteps(this.root, c);
    this.recordStep(`Fin erase(${c})`);
    this.startAnim();
  }

  eraseSteps(nodo, clave) {
    if (!nodo) {
      this.recordStep(`Not found ${clave}`);
      return null;
    }
    this.recordStep(`Compare ${clave} vs ${nodo.clave}`, nodo.clave);
    if (clave < nodo.clave) {
      nodo.izq = this.eraseSteps(nodo.izq, clave);
    } else if (clave > nodo.clave) {
      nodo.der = this.eraseSteps(nodo.der, clave);
    } else {
      this.recordStep(`Found ${clave}`, nodo.clave);
      if (!nodo.izq) {
        this.recordStep(`Replace by der`);
        return nodo.der;
      }
      if (!nodo.der) {
        this.recordStep(`Replace by izq`);
        return nodo.izq;
      }
      if (nodo.izq.prioridad > nodo.der.prioridad) {
        nodo = this.rotarDerecha(nodo);
        this.recordStep(`RRot(${nodo.clave})`, nodo.clave);
        nodo.der = this.eraseSteps(nodo.der, clave);
      } else {
        nodo = this.rotarIzquierda(nodo);
        this.recordStep(`LRot(${nodo.clave})`, nodo.clave);
        nodo.izq = this.eraseSteps(nodo.izq, clave);
      }
    }
    return nodo;
  }

  // Animar buscar
  animateSearch() {
    const c = parseInt(document.getElementById('valorInput').value);
    if (isNaN(c)) return;
    this.resetAnim();
    this.recordStep(`Inicio buscar(${c})`);
    this.searchSteps(this.root, c);
    this.recordStep(`Fin buscar(${c})`);
    this.startAnim();
  }

  searchSteps(nodo, clave) {
    if (!nodo) {
      this.recordStep(`Not found ${clave}`);
      return;
    }
    this.recordStep(`Visit ${nodo.clave}`, nodo.clave);
    if (clave < nodo.clave) this.searchSteps(nodo.izq, clave);
    else if (clave > nodo.clave) this.searchSteps(nodo.der, clave);
    else this.recordStep(`Found ${clave}`, nodo.clave);
  }

  // Animar inorder
  animateInorder() {
    this.resetAnim();
    this.recordStep('Inicio inorder');
    this._inorderSteps(this.root);
    this.recordStep('Fin inorder');
    const resIn = this.inorderTraversal();
    this.recordStep(`Resultado inorder: ${resIn.join(', ')}`);
    this.startAnim();
    statusTimerActive = true;
    setTimeout(() => { statusTimerActive = false; }, statusDisplayTime);
  }

  _inorderSteps(node) {
    if (!node) return;
    this._inorderSteps(node.izq);
    this.recordStep(`Visit inorder ${node.clave}`, node.clave);
    this._inorderSteps(node.der);
  }

  // Animar preorder
  animatePreorder() {
    this.resetAnim();
    this.recordStep('Inicio preorder');
    this._preorderSteps(this.root);
    this.recordStep('Fin preorder');
    const resPre = this.preorderTraversal();
    this.recordStep(`Resultado preorder: ${resPre.join(', ')}`);
    this.startAnim();
    statusTimerActive = true;
    setTimeout(() => { statusTimerActive = false; }, statusDisplayTime);
  }

  _preorderSteps(node) {
    if (!node) return;
    this.recordStep(`Visit preorder ${node.clave}`, node.clave);
    this._preorderSteps(node.izq);
    this._preorderSteps(node.der);
  }

  // Animar postorder
  animatePostorder() {
    this.resetAnim();
    this.recordStep('Inicio postorder');
    this._postorderSteps(this.root);
    this.recordStep('Fin postorder');
    const resPost = this.postorderTraversal();
    this.recordStep(`Resultado postorder: ${resPost.join(', ')}`);
    this.startAnim();
    statusTimerActive = true;
    setTimeout(() => { statusTimerActive = false; }, statusDisplayTime);
  }

  _postorderSteps(node) {
    if (!node) return;
    this._postorderSteps(node.izq);
    this._postorderSteps(node.der);
    this.recordStep(`Visit postorder ${node.clave}`, node.clave);
  }

  // Recorridos directos para calcular Resultado
  inorderTraversal(node = this.root, out = []) {
    if (!node) return out;
    this.inorderTraversal(node.izq, out);
    out.push(node.clave);
    this.inorderTraversal(node.der, out);
    return out;
  }

  preorderTraversal(node = this.root, out = []) {
    if (!node) return out;
    out.push(node.clave);
    this.preorderTraversal(node.izq, out);
    this.preorderTraversal(node.der, out);
    return out;
  }

  postorderTraversal(node = this.root, out = []) {
    if (!node) return out;
    this.postorderTraversal(node.izq, out);
    this.postorderTraversal(node.der, out);
    out.push(node.clave);
    return out;
  }

  // Layout y dibujo
  computeAll() {
    this.layouts = [];
    this.dataMaps = [];
    for (const root of this.steps) {
      this.assignPos(root);
      const posMap = {};
      const dataMap = {};
      (function dfs(n) {
        if (!n) return;
        posMap[n.clave] = { x: n.x, y: n.y };
        dataMap[n.clave] = { clave: n.clave, prioridad: n.prioridad };
        dfs(n.izq);
        dfs(n.der);
      })(root);
      this.layouts.push(posMap);
      this.dataMaps.push(dataMap);
    }
  }

  assignPos(root) {
    function count(n) { return n ? 1 + count(n.izq) + count(n.der) : 0; }
    function depth(n) { return n ? 1 + Math.max(depth(n.izq), depth(n.der)) : 0; }
    const total = count(root);
    const maxD = depth(root);
    let idx = 0;
    const mx = 30;
    const my = 40;
    const aw = width - 2 * mx;
    const ah = height - 2 * my;
    (function dfs(n, lvl) {
      if (!n) return;
      dfs(n.izq, lvl + 1);
      idx++;
      n.x = mx + aw * idx / (total + 1);
      n.y = my + ah * lvl / (maxD - 1 || 1);
      dfs(n.der, lvl + 1);
    })(root, 0);
  }

  drawInterpolated() {
    const A = this.layouts[this.stepIndex];
    const next = Math.min(this.stepIndex + 1, this.layouts.length - 1);
    const B = this.layouts[next];
    const D = this.dataMaps[next];
    const H = this.highlights[this.stepIndex];
    const msg = this.msgs[this.stepIndex] || '';
    const t = this.stepIndex < this.layouts.length - 1 ? this.frameCounter / this.stepDelay : 1;

    function drawEdges(n) {
      if (!n) return;
      const pA = A[n.clave] || B[n.clave];
      const pB = B[n.clave];
      const x = lerp(pA.x, pB.x, t);
      const y = lerp(pA.y, pB.y, t);
      if (n.izq) drawEdgePair(n, n.izq, A, B, t, drawEdges);
      if (n.der) drawEdgePair(n, n.der, A, B, t, drawEdges);
    }

    drawEdges(this.steps[next]);

    drawNodes(D, A, B, H, msg, t);

    document.getElementById('status').innerText = msg;
  }

  drawStatic() {
    this.assignPos(this.root);
    this._drawNode(this.root);
  }

  _drawNode(n) {
    if (!n) return;
    stroke(150);
    strokeWeight(2);
    if (n.izq) line(n.x, n.y, n.izq.x, n.izq.y);
    if (n.der) line(n.x, n.y, n.der.x, n.der.y);
    fill('#fff');
    stroke(50);
    strokeWeight(2);
    ellipse(n.x, n.y, 60, 60);
    noStroke();
    fill(0);
    textAlign(CENTER, BOTTOM);
    textSize(14);
    text(n.clave, n.x, n.y - 2);
    fill(100);
    textAlign(CENTER, TOP);
    textSize(12);
    text(n.prioridad, n.x, n.y + 2);
    this._drawNode(n.izq);
    this._drawNode(n.der);
  }
}

// UI Wrappers
function inorderUI()   { treap.animateInorder(); }
function preorderUI()  { treap.animatePreorder(); }
function postorderUI() { treap.animatePostorder(); }
function insertarUI() { const v = parseInt(document.getElementById('valorInput').value); if (!isNaN(v)) treap.insertar(v); document.getElementById('valorInput').value = ''; }
function insertarNodoRandom() { treap.insertar(Math.floor(Math.random() * 100)); }
function eliminarUI() { const v = parseInt(document.getElementById('valorInput').value); if (!isNaN(v)) treap.eliminar(v); document.getElementById('valorInput').value = ''; }
function limpiar() { treap.limpiar(); document.getElementById('status').innerText = 'Listo'; }
function animateInsert() { treap.animateInsert(); }
function animateDelete() { treap.animateDelete(); }
function animateSearch() { treap.animateSearch(); }

// Sketch p5.js
let treap;
function setup() {
  createCanvas(1200, 800);
  treap = new Treap();
  textFont('Verdana');
}

function draw() {
  background(245);
  if (treap.isAnimating) {
    treap.drawInterpolated();
    treap.frameCounter++;
    if (treap.frameCounter >= treap.stepDelay) {
      treap.frameCounter = 0;
      treap.stepIndex++;
      if (treap.stepIndex >= treap.steps.length) treap.isAnimating = false;
    }
  } else {
    if (!statusTimerActive) document.getElementById('status').innerText = 'Listo';
    treap.drawStatic();
  }
}

// Funciones auxiliares de dibujo
function drawEdgePair(parent, child, A, B, t, recurse) {
  const c = child.clave;
  const pA = A[parent.clave] || B[parent.clave];
  const pB = B[parent.clave];
  const x = lerp(pA.x, pB.x, t);
  const y = lerp(pA.y, pB.y, t);
  const pA2 = A[c] || B[c];
  const pB2 = B[c];
  const x2 = lerp(pA2.x, pB2.x, t);
  const y2 = lerp(pA2.y, pB2.y, t);
  stroke(150);
  strokeWeight(2);
  line(x, y, x2, y2);
  recurse(child);
}

function drawNodes(D, A, B, H, msg, t) {
  for (const k in D) {
    const data = D[k];
    const pA = A[k] || B[k];
    const pB = B[k];
    const x = lerp(pA.x, pB.x, t);
    const y = lerp(pA.y, pB.y, t);
    let color = '#fff';
    if (parseInt(k) === H) color = msg.startsWith('Visit') ? '#fc8' : 'lightgreen';
    fill(color);
    stroke(50);
    strokeWeight(2);
    ellipse(x, y, 60, 60);
    noStroke();
    fill(0);
    textAlign(CENTER, BOTTOM);
    textSize(14);
    text(data.clave, x, y - 2);
    fill(100);
    textAlign(CENTER, TOP);
    textSize(12);
    text(data.prioridad, x, y + 2);
  }
}
