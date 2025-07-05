// --- NodoTreap ---
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

// --- Deep clone para snapshots ---
function cloneTree(node) {
  if (!node) return null;
  const c = new NodoTreap(node.clave);
  c.prioridad = node.prioridad;
  c.izq = cloneTree(node.izq);
  c.der = cloneTree(node.der);
  return c;
}

// --- Treap con animación y mensajes ---
class TreapArbol {
  constructor() {
    this.raiz = null;
    this.steps = [];         // snapshots del árbol
    this.stepMessages = [];  // mensajes descriptivos
    this.isAnimating = false;
    this.stepIndex = 0;
    this.frameCounter = 0;
    this.stepDelay = 30;     // frames entre pasos
  }

  // graba snapshot + mensaje
  recordStep(msg) {
    this.steps.push(cloneTree(this.raiz));
    this.stepMessages.push(msg);
  }

  // --- Rotaciones ---
  rotarIzquierda(nodo) {
    return (() => {
      this.recordStep(`Rotando izquierda en nodo ${nodo.clave}`);
      const hijo = nodo.der;
      nodo.der = hijo.izq;
      hijo.izq = nodo;
      return hijo;
    })();
  }

  rotarDerecha(nodo) {
    return (() => {
      this.recordStep(`Rotando derecha en nodo ${nodo.clave}`);
      const hijo = nodo.izq;
      nodo.izq = hijo.der;
      hijo.der = nodo;
      return hijo;
    })();
  }

  // --- Inserción normal ---
  insertarNodo(nodo, valor) {
    if (!nodo) return new NodoTreap(valor);
    if (valor < nodo.clave) {
      nodo.izq = this.insertarNodo(nodo.izq, valor);
      if (nodo.izq.prioridad > nodo.prioridad)
        nodo = this.rotarDerecha(nodo);
    } else if (valor > nodo.clave) {
      nodo.der = this.insertarNodo(nodo.der, valor);
      if (nodo.der.prioridad > nodo.prioridad)
        nodo = this.rotarIzquierda(nodo);
    }
    return nodo;
  }

  // --- Eliminación normal ---
  eliminarNodo(nodo, valor) {
    if (!nodo) return null;
    if (valor < nodo.clave) {
      nodo.izq = this.eliminarNodo(nodo.izq, valor);
    } else if (valor > nodo.clave) {
      nodo.der = this.eliminarNodo(nodo.der, valor);
    } else {
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

  // wrappers básicos
  insertar(v) { this.raiz = this.insertarNodo(this.raiz, v); }
  eliminar(v)  { this.raiz = this.eliminarNodo(this.raiz, v); }
  limpiar()    { this.raiz = null; }

  // --- Inserción con animación ---
  animateInsert(valor) {
    this.steps = [];
    this.stepMessages = [];
    this.isAnimating = true;
    this.stepIndex = 0;
    this.frameCounter = 0;
    this.recordStep(`Inicio inserción de ${valor}`);
    this.raiz = this.insertarNodoSteps(this.raiz, valor);
    this.recordStep(`Fin de inserción de ${valor}`);
  }
  insertarNodoSteps(nodo, valor) {
    if (!nodo) {
      this.recordStep(`Creando hoja ${valor}`);
      return new NodoTreap(valor);
    }
    this.recordStep(`Comparando ${valor} con nodo ${nodo.clave}`);
    if (valor < nodo.clave) {
      nodo.izq = this.insertarNodoSteps(nodo.izq, valor);
      if (nodo.izq.prioridad > nodo.prioridad)
        nodo = this.rotarDerecha(nodo);
    } else if (valor > nodo.clave) {
      nodo.der = this.insertarNodoSteps(nodo.der, valor);
      if (nodo.der.prioridad > nodo.prioridad)
        nodo = this.rotarIzquierda(nodo);
    } else {
      this.recordStep(`Valor duplicado: ${valor}`);
    }
    return nodo;
  }

  // --- Eliminación con animación ---
  animateDelete(valor) {
    this.steps = [];
    this.stepMessages = [];
    this.isAnimating = true;
    this.stepIndex = 0;
    this.frameCounter = 0;
    this.recordStep(`Inicio eliminación de ${valor}`);
    this.raiz = this.eliminarNodoSteps(this.raiz, valor);
    this.recordStep(`Fin eliminación de ${valor}`);
  }
  eliminarNodoSteps(nodo, valor) {
    if (!nodo) {
      this.recordStep(`No encontrado ${valor}`);
      return null;
    }
    this.recordStep(`Comparando ${valor} con nodo ${nodo.clave}`);
    if (valor < nodo.clave) {
      nodo.izq = this.eliminarNodoSteps(nodo.izq, valor);
    } else if (valor > nodo.clave) {
      nodo.der = this.eliminarNodoSteps(nodo.der, valor);
    } else {
      this.recordStep(`Nodo ${valor} encontrado`);
      if (!nodo.izq) {
        this.recordStep(`Reemplazando ${valor} por derecha`);
        return nodo.der;
      }
      if (!nodo.der) {
        this.recordStep(`Reemplazando ${valor} por izquierda`);
        return nodo.izq;
      }
      // dos hijos: rotar
      if (nodo.izq.prioridad < nodo.der.prioridad) {
        nodo = this.rotarIzquierda(nodo);
        nodo.izq = this.eliminarNodoSteps(nodo.izq, valor);
      } else {
        nodo = this.rotarDerecha(nodo);
        nodo.der = this.eliminarNodoSteps(nodo.der, valor);
      }
    }
    return nodo;
  }

  // --- Layout in-order ---
  countNodes(n) {
    if (!n) return 0;
    return 1 + this.countNodes(n.izq) + this.countNodes(n.der);
  }
  maxDepth(n) {
    if (!n) return 0;
    return 1 + Math.max(this.maxDepth(n.izq), this.maxDepth(n.der));
  }
  asignarPosiciones(root) {
    const total = this.countNodes(root);
    const depth = this.maxDepth(root);
    if (total === 0) return;
    let idx = 0;
    const mx = 30, my = 40;
    const aw = width  - 2*mx;
    const ah = height - 2*my;
    const dfs = (n, nivel) => {
      if (!n) return;
      dfs(n.izq, nivel+1);
      n.x = mx + aw*(idx+1)/(total+1);
      n.y = my + ah*(nivel)/(depth-1||1);
      idx++;
      dfs(n.der, nivel+1);
    };
    dfs(root, 0);
  }

  // --- Dibujo genérico ---
  _drawRec(n) {
    if (!n) return;
    stroke(150); strokeWeight(2);
    if (n.izq) line(n.x,n.y,n.izq.x,n.izq.y);
    if (n.der) line(n.x,n.y,n.der.x,n.der.y);
    fill(255); stroke(50); strokeWeight(2);
    ellipse(n.x,n.y,60,60);
    noStroke(); fill(0);
    textSize(14); textAlign(CENTER, BOTTOM);
    text(n.clave,n.x,n.y-2);
    fill(100);
    textSize(12); textAlign(CENTER, TOP);
    text(n.prioridad,n.x,n.y+2);
    this._drawRec(n.izq);
    this._drawRec(n.der);
  }
  dibujar() {
    this.asignarPosiciones(this.raiz);
    this._drawRec(this.raiz);
  }
  dibujarDesde(root) {
    this.asignarPosiciones(root);
    this._drawRec(root);
  }
}

// --- Sketch p5.js ---
let treap;
function setup() {
  createCanvas(1200,800);
  treap = new TreapArbol();
  textFont('Verdana');
}
function draw() {
  background(245);
  if (treap.isAnimating) {
    // muestra snapshot
    treap.dibujarDesde(treap.steps[treap.stepIndex]);
    // actualiza mensaje
    document.getElementById('status').innerText =
      treap.stepMessages[treap.stepIndex];
    // avanza
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
    treap.dibujar();
  }
}

// --- Wrappers botones ---
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
