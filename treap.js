class NodoTreap {
  constructor(clave) {
    this.clave = clave;
    this.prioridad = Math.floor(Math.random() * 100);
    this.izq = null;
    this.der = null;
    this.x = 0;
    this.y = 0;
  }
}

//Deep clone para snapshots
function cloneTree(node) {
  if (!node) return null;
  const c = new NodoTreap(node.clave);
  c.prioridad = node.prioridad;
  c.izq = cloneTree(node.izq);
  c.der = cloneTree(node.der);
  return c;
}

//Treap con animacion suavizada y resaltado
class TreapArbol {
  constructor() {
    this.raiz = null;
    this.steps = [];
    this.stepMessages = [];
    this.stepHighlights = [];
    this.layouts = [];
    this.dataMaps = [];
    this.isAnimating = false;
    this.stepIndex = 0;
    this.frameCounter = 0;
    this.stepDelay = 30;
  }

  //graba snapshot, mensaje y nodo a resaltar
  recordStep(msg, highlight = null) {
    this.steps.push(cloneTree(this.raiz));
    this.stepMessages.push(msg);
    this.stepHighlights.push(highlight);
  }

  //Rotaciones
  rotarIzquierda(nodo) {
    const hijo = nodo.der;
    nodo.der = hijo.izq;
    hijo.izq = nodo;
    return hijo;
  }
  rotarDerecha(nodo) {
    const hijo = nodo.izq;
    nodo.izq = hijo.der;
    hijo.der = nodo;
    return hijo;
  }

  //Insercion/Eliminacion normal
  insertarNodo(nodo, valor) {
    if (!nodo) return new NodoTreap(valor);
    if (valor < nodo.clave) {
      nodo.izq = this.insertarNodo(nodo.izq, valor);
      if (nodo.izq.prioridad > nodo.prioridad) nodo = this.rotarDerecha(nodo);
    } else if (valor > nodo.clave) {
      nodo.der = this.insertarNodo(nodo.der, valor);
      if (nodo.der.prioridad > nodo.prioridad) nodo = this.rotarIzquierda(nodo);
    }
    return nodo;
  }
  eliminarNodo(nodo, valor) {
    if (!nodo) return null;
    if (valor < nodo.clave) nodo.izq = this.eliminarNodo(nodo.izq, valor);
    else if (valor > nodo.clave) nodo.der = this.eliminarNodo(nodo.der, valor);
    else {
      if (!nodo.izq) return nodo.der;
      if (!nodo.der) return nodo.izq;
      if (nodo.izq.prioridad < nodo.der.prioridad) {
        nodo = this.rotarIzquierda(nodo);
        nodo.izq = this.eliminarNodo(nodo.izq, valor);
      } else {
        nodo = this.rotarDerecha(nodo);
        nodo.der = this.eliminarNodo(nodo.der, valor);
      }
    }
    return nodo;
  }
  insertar(v) { this.raiz = this.insertarNodo(this.raiz, v); }
  eliminar(v)  { this.raiz = this.eliminarNodo(this.raiz, v); }
  limpiar()    { this.raiz = null; }

  animateInsert(valor) {
    this.steps = [];
    this.stepMessages = [];
    this.stepHighlights = [];
    this.isAnimating = true;
    this.stepIndex = 0;
    this.frameCounter = 0;
    this.recordStep(`Inicio inserción de ${valor}`, null);
    this.raiz = this.insertarNodoSteps(this.raiz, valor);
    this.recordStep(`Fin de inserción de ${valor}`, null);
    this.computeLayouts();
  }
  insertarNodoSteps(nodo, valor) {
    if (!nodo) {
      this.recordStep(`Creando hoja ${valor}`, valor);
      return new NodoTreap(valor);
    }
    this.recordStep(`Comparando ${valor} con nodo ${nodo.clave}`, nodo.clave);
    if (valor < nodo.clave) {
      nodo.izq = this.insertarNodoSteps(nodo.izq, valor);
      if (nodo.izq.prioridad > nodo.prioridad) {
        nodo = this.rotarDerecha(nodo);
        this.recordStep(`Rotando derecha en ${nodo.clave}`, nodo.clave);
      }
    } else if (valor > nodo.clave) {
      nodo.der = this.insertarNodoSteps(nodo.der, valor);
      if (nodo.der.prioridad > nodo.prioridad) {
        nodo = this.rotarIzquierda(nodo);
        this.recordStep(`Rotando izquierda en ${nodo.clave}`, nodo.clave);
      }
    } else {
      this.recordStep(`Valor duplicado: ${valor}`, nodo.clave);
    }
    return nodo;
  }

  animateDelete(valor) {
    this.steps = [];
    this.stepMessages = [];
    this.stepHighlights = [];
    this.isAnimating = true;
    this.stepIndex = 0;
    this.frameCounter = 0;
    this.recordStep(`Inicio eliminación de ${valor}`, null);
    this.raiz = this.eliminarNodoSteps(this.raiz, valor);
    this.recordStep(`Fin de eliminación de ${valor}`, null);
    this.computeLayouts();
  }
  eliminarNodoSteps(nodo, valor) {
    if (!nodo) {
      this.recordStep(`No encontrado ${valor}`, null);
      return null;
    }
    this.recordStep(`Comparando ${valor} con nodo ${nodo.clave}`, nodo.clave);
    if (valor < nodo.clave) nodo.izq = this.eliminarNodoSteps(nodo.izq, valor);
    else if (valor > nodo.clave) nodo.der = this.eliminarNodoSteps(nodo.der, valor);
    else {
      this.recordStep(`Nodo ${valor} encontrado`, nodo.clave);
      if (!nodo.izq) { this.recordStep(`Reemplazando por derecha`, valor); return nodo.der; }
      if (!nodo.der) { this.recordStep(`Reemplazando por izquierda`, valor); return nodo.izq; }
      if (nodo.izq.prioridad < nodo.der.prioridad) {
        nodo = this.rotarIzquierda(nodo);
        this.recordStep(`Rotando izquierda en ${nodo.clave}`, nodo.clave);
        nodo.izq = this.eliminarNodoSteps(nodo.izq, valor);
      } else {
        nodo = this.rotarDerecha(nodo);
        this.recordStep(`Rotando derecha en ${nodo.clave}`, nodo.clave);
        nodo.der = this.eliminarNodoSteps(nodo.der, valor);
      }
    }
    return nodo;
  }

  computeLayouts() {
    this.layouts = [];
    this.dataMaps = [];
    for (let root of this.steps) {
      this.assignPositions(root);
      const posMap = {}, dataMap = {};
      (function dfs(n) {
        if (!n) return;
        posMap[n.clave] = { x: n.x, y: n.y };
        dataMap[n.clave] = { clave: n.clave, prioridad: n.prioridad };
        dfs(n.izq); dfs(n.der);
      })(root);
      this.layouts.push(posMap);
      this.dataMaps.push(dataMap);
    }
  }

  assignPositions(root) {
    const total = this.countNodes(root);
    const depth = this.maxDepth(root);
    if (total === 0) return;
    let idx = 0;
    const mx = 30, my = 40;
    const aw = width - 2*mx, ah = height - 2*my;
    (function dfs(n, lvl) {
      if (!n) return;
      dfs(n.izq, lvl+1);
      n.x = mx + aw*(idx+1)/(total+1);
      n.y = my + ah*(lvl)/(depth-1||1);
      idx++;
      dfs(n.der, lvl+1);
    })(root, 0);
  }
  countNodes(n) { return n ? 1 + this.countNodes(n.izq) + this.countNodes(n.der) : 0; }
  maxDepth(n)  { return n ? 1 + Math.max(this.maxDepth(n.izq), this.maxDepth(n.der)) : 0; }

  //Animación interpolada con resaltado
  drawInterpolated() {
    const A = this.layouts[this.stepIndex];
    const Bidx = Math.min(this.stepIndex+1, this.layouts.length-1);
    const B = this.layouts[Bidx];
    const D = this.dataMaps[Bidx];
    const H = this.stepHighlights[this.stepIndex];
    const t = (this.stepIndex < this.layouts.length-1) ? this.frameCounter/this.stepDelay : 1;

    //aristas
    const drawEdges = (n) => {
      if (!n) return;
      const pA = A[n.clave] || B[n.clave];
      const pB = B[n.clave];
      const x = lerp(pA.x,pB.x,t), y = lerp(pA.y,pB.y,t);
      if (n.izq) {
        const c = n.izq.clave;
        const pA2 = A[c]||B[c], pB2 = B[c];
        const x2 = lerp(pA2.x,pB2.x,t), y2 = lerp(pA2.y,pB2.y,t);
        stroke(150); strokeWeight(2); line(x,y,x2,y2);
        drawEdges(n.izq);
      }
      if (n.der) {
        const c = n.der.clave;
        const pA2 = A[c]||B[c], pB2 = B[c];
        const x2 = lerp(pA2.x,pB2.x,t), y2 = lerp(pA2.y,pB2.y,t);
        stroke(150); strokeWeight(2); line(x,y,x2,y2);
        drawEdges(n.der);
      }
    };
    drawEdges(this.steps[Bidx]);

    //nodos
    for (let clave in D) {
      const d = D[clave];
      const pA = A[clave] || B[clave]; const pB = B[clave];
      const x = lerp(pA.x,pB.x,t), y = lerp(pA.y,pB.y,t);
      if (parseInt(clave) === H) fill(255,180,180);
      else fill(255);
      stroke(50); strokeWeight(2);
      ellipse(x,y,60,60);
      noStroke(); fill(0);
      textSize(14); textAlign(CENTER,BOTTOM); text(d.clave,x,y-2);
      fill(100); textSize(12); textAlign(CENTER,TOP); text(d.prioridad,x,y+2);
    }

    document.getElementById('status').innerText = this.stepMessages[this.stepIndex] || '';
  }

  // Dibujo estático
  drawStatic() {
    this.assignPositions(this.raiz);
    this._drawNodeStatic(this.raiz);
  }
  _drawNodeStatic(nodo) {
    if (!nodo) return;
    stroke(150); strokeWeight(2);
    if (nodo.izq) line(nodo.x,nodo.y,nodo.izq.x,nodo.izq.y);
    if (nodo.der) line(nodo.x,nodo.y,nodo.der.x,nodo.der.y);
    if (false) fill(255,180,180); else fill(255);
    stroke(50); strokeWeight(2); ellipse(nodo.x,nodo.y,60,60);
    noStroke(); fill(0); textSize(14); textAlign(CENTER,BOTTOM); text(nodo.clave,nodo.x,nodo.y-2);
    fill(100); textSize(12); textAlign(CENTER,TOP); text(nodo.prioridad,nodo.x,nodo.y+2);
    this._drawNodeStatic(nodo.izq);
    this._drawNodeStatic(nodo.der);
  }
}

//Sketch p5.js
let treap;
function setup() {
  createCanvas(1200,800);
  treap = new TreapArbol();
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
      if (treap.stepIndex >= treap.steps.length) {
        treap.isAnimating = false;
        document.getElementById('status').innerText = 'Listo';
      }
    }
  } else {
    document.getElementById('status').innerText = 'Listo';
    treap.drawStatic();
  }
}

//Wrappers botones
function insertarNodo() {
  const v = parseInt(document.getElementById("valorInput").value);
  if (!isNaN(v)) treap.insertar(v);
  document.getElementById("valorInput").value = "";
}
function insertarNodoRandom() {
  treap.insertar(Math.floor(Math.random()*100));
}
function eliminarNodo() {
  const v = parseInt(document.getElementById("valorInput").value);
  if (!isNaN(v)) treap.eliminar(v);
  document.getElementById("valorInput").value = "";
}
function limpiar() {
  treap.limpiar();
  document.getElementById('status').innerText = 'Listo';
}
function animateInsert() {
  const v = parseInt(document.getElementById("valorInput").value);
  if (!isNaN(v)) treap.animateInsert(v);
  document.getElementById("valorInput").value = "";
}
function animateDelete() {
  const v = parseInt(document.getElementById("valorInput").value);
  if (!isNaN(v)) treap.animateDelete(v);
  document.getElementById("valorInput").value = "";
}
