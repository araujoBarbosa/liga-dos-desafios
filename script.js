// ====== IMPORTES DO FIREBASE (SDK MODERNO) ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  onChildAdded,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ====== CONFIGURAÇÃO REAL DO MEU FIREBASE ======
const firebaseConfig = {
  apiKey: "AIzaSyBgjvQiI9fTVqR8rflZJod9ZYa_7snlyMw",
  authDomain: "liga-dos-desafios.firebaseapp.com",
  databaseURL: "https://liga-dos-desafios-default-rtdb.firebaseio.com",
  projectId: "liga-dos-desafios",
  storageBucket: "liga-dos-desafios.firebasestorage.app",
  messagingSenderId: "656853224486",
  appId: "1:656853224486:web:15019345b8649b838daae7"
};

// ====== INICIALIZAÇÃO ======
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// ====== VARIÁVEIS GERAIS ======
let apelido = "";
let corAvatar = "";
let timeCodigo = localStorage.getItem("timeCodigo") || null;

// ====== AUXILIARES ======
function gerarCorAPartirDoNome(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 60%)`;
}
function formatarHora(data) {
  const d = new Date(data);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function keyFromNome(nome) {
  return (nome || "jogador").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 24) || "jogador";
}

// ====== DESAFIOS ======
const desafios = [
  { id: 1, titulo: "Foto engraçada com o pet", nivel: "💚 Fácil", pontos: 10, tipo: "Foto", emoji: "🐾", descricao: "Tire uma foto engraçada com o pet." },
  { id: 2, titulo: "Dancinha em família", nivel: "💚 Fácil", pontos: 10, tipo: "Vídeo", emoji: "💃", descricao: "Gravem uma dancinha simples juntos." },
  { id: 3, titulo: "Carro azul", nivel: "💚 Fácil", pontos: 10, tipo: "Foto", emoji: "🚙", descricao: "Fotografe um carro azul." },
  { id: 4, titulo: "Careta coletiva", nivel: "💚 Fácil", pontos: 10, tipo: "Foto", emoji: "🤪", descricao: "Cada pessoa faz uma careta diferente." },
  { id: 5, titulo: "Lanche do time", nivel: "💚 Fácil", pontos: 10, tipo: "Foto", emoji: "🍔", descricao: "Foto de um lanche feito/comprado juntos." },
  { id: 6, titulo: "Bandeira do time", nivel: "🟡 Médio", pontos: 30, tipo: "Foto", emoji: "🏳️", descricao: "Criem uma bandeira que represente o time." },
  { id: 7, titulo: "Paródia musical", nivel: "🟡 Médio", pontos: 30, tipo: "Vídeo", emoji: "🎶", descricao: "Gravem uma paródia curtinha." },
  { id: 8, titulo: "Cozinhando juntos", nivel: "🟡 Médio", pontos: 30, tipo: "Foto", emoji: "🍰", descricao: "Preparem uma receita juntos e mostrem." },
  { id: 9, titulo: "Cena de filme", nivel: "🟡 Médio", pontos: 30, tipo: "Vídeo", emoji: "🎬", descricao: "Recriem uma cena famosa." },
  { id: 10, titulo: "Boa ação", nivel: "🟡 Médio", pontos: 30, tipo: "Foto", emoji: "💖", descricao: "Registrem uma boa ação em grupo." },
  { id: 11, titulo: "Poema do time", nivel: "🔴 Difícil", pontos: 60, tipo: "Vídeo", emoji: "🎙️", descricao: "Façam e recitem um poema/rap." },
  { id: 12, titulo: "Comercial inventado", nivel: "🔴 Difícil", pontos: 60, tipo: "Vídeo", emoji: "📺", descricao: "Gravem um comercial divertido." },
  { id: 13, titulo: "Escultura reciclável", nivel: "🔴 Difícil", pontos: 60, tipo: "Foto", emoji: "♻️", descricao: "Criem uma escultura com recicláveis." },
  { id: 14, titulo: "Jornal do time", nivel: "🔴 Difícil", pontos: 60, tipo: "Vídeo", emoji: "🗞️", descricao: "Produzam um noticiário inventado." },
  { id: 15, titulo: "Cena de heróis", nivel: "🔴 Difícil", pontos: 60, tipo: "Vídeo", emoji: "🦸‍♂️", descricao: "Recriem uma cena de heróis." },
  { id: 16, titulo: "Pintura coletiva", nivel: "🔴 Difícil", pontos: 60, tipo: "Foto", emoji: "🎨", descricao: "Façam uma arte coletiva." },
  { id: 17, titulo: "Mini curta", nivel: "👑 Lendário", pontos: 100, tipo: "Vídeo", emoji: "🎥", descricao: "Gravem um mini curta." },
  { id: 18, titulo: "Mascote do time", nivel: "👑 Lendário", pontos: 100, tipo: "Foto", emoji: "🐾", descricao: "Criem um mascote físico." },
  { id: 19, titulo: "Quebra-cabeça 1000 peças", nivel: "👑 Lendário", pontos: 100, tipo: "Foto", emoji: "🧩", descricao: "Montem um quebra-cabeça grande." },
  { id: 20, titulo: "Desafio Secreto", nivel: "💀 Épico", pontos: 150, tipo: "Misto", emoji: "🔥", descricao: "Criem e cumpram um desafio secreto." }
];

// ====== ELEMENTOS DE UI ======
const detalheTituloCurtoEl = document.getElementById("detalheTituloCurto");
const detalheNumeroEl = document.getElementById("detalheNumero");
const detalheEmojiEl = document.getElementById("detalheEmoji");
const detalheTituloEl = document.getElementById("detalheTitulo");
const detalheNivelEl = document.getElementById("detalheNivel");
const detalhePontosEl = document.getElementById("detalhePontos");
const detalheDescricaoEl = document.getElementById("detalheDescricao");
const detalheChipsEl = document.getElementById("detalheChips");
const miniDesafioAtualEl = document.getElementById("miniDesafioAtual");
const barraProgressoEl = document.getElementById("barraProgresso");
const textoDesafiosConcluidosEl = document.getElementById("textoDesafiosConcluidos");
const textoPercentualProgressoEl = document.getElementById("textoPercentualProgresso");
const headerProgressoEl = document.getElementById("headerProgresso");
const pillPontosTotaisEl = document.getElementById("pillPontosTotais");

// ====== ESTADO DO TIME/DESAFIOS ======
let desafioAtual = 1;
let totalDesafios = desafios.length;
let membros = [];

function carregarDesafioAtual() {
  const d = desafios[Math.max(1, desafioAtual) - 1];
  if (!d) return;
  const chips = document.getElementById("chipsDesafioAtual");
  document.getElementById("emojiAtual").textContent = d.emoji || "🎯";
  document.getElementById("tituloDesafioAtual").textContent = d.titulo;
  document.getElementById("nivelDesafioAtual").textContent = `${d.nivel} • ${d.pontos} pts`;
  document.getElementById("pontosDesafioAtual").textContent = `${d.pontos} pts`;
  document.getElementById("descricaoDesafioAtual").textContent = d.descricao;
  document.getElementById("contadorDesafios").textContent = `${desafioAtual} / ${totalDesafios}`;
  if (chips) {
    chips.innerHTML = "";
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = d.tipo;
    chips.appendChild(chip);
  }
}
function renderizarStatusMembros() {
  const ul = document.getElementById("statusMembros");
  if (!ul) return;
  ul.innerHTML = "";
  membros.forEach(m => {
    const fez = (m.concluidos || 0) >= desafioAtual;
    const eliminado = (m.faltas || 0) >= 3;
    const li = document.createElement("li");
    li.textContent = `${m.nome}: ${fez ? "✔️ Fez" : eliminado ? "❌ Eliminado" : "⏳ Aguardando"}`;
    ul.appendChild(li);
  });
}

async function marcarConclusao(membroNome, registro = {}) {
  if (!timeCodigo) return alert("Entre ou crie um time para enviar.");
  const id = keyFromNome(membroNome);
  const membroRef = ref(db, `times/${timeCodigo}/membros/${id}`);
  const atual = membros.find(m => keyFromNome(m.nome) === id) || { concluidos: 0, faltas: 0, nome: membroNome };
  const novoConcluidos = (atual.concluidos || 0) + 1;
  await set(membroRef, { ...atual, nome: membroNome, concluidos: novoConcluidos, faltas: atual.faltas || 0 });
  const histRef = ref(db, `times/${timeCodigo}/historico/${desafioAtual}`);
  await push(histRef, { membro: membroNome, criadoEm: serverTimestamp(), ...registro });
  const todosConcluidos = membros.every(m => (m.concluidos || 0) >= desafioAtual || (m.faltas || 0) >= 3 || keyFromNome(m.nome) === id);
  if (todosConcluidos) {
    const prox = desafioAtual + 1;
    await set(ref(db, `times/${timeCodigo}/desafioAtual`), prox);
    await Promise.all(membros.map(m => {
      if ((m.concluidos || 0) < desafioAtual) {
        const mid = keyFromNome(m.nome);
        return set(ref(db, `times/${timeCodigo}/membros/${mid}`), { ...m, faltas: (m.faltas || 0) + 1 });
      }
      return Promise.resolve();
    }));
  }
  renderizarStatusMembros();
}

function selecionarArquivo(accept) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}
async function uploadMidia(tipo) {
  if (!timeCodigo) return alert("Entre ou crie um time para enviar.");
  const accept = tipo === "foto" ? "image/*" : "video/*";
  const file = await selecionarArquivo(accept);
  if (!file) return;
  const caminho = `desafios/${timeCodigo}/${keyFromNome(apelido)}/${Date.now()}-${file.name}`; // alinhado ao checklist
  const sref = storageRef(storage, caminho);
  await uploadBytes(sref, file);
  const url = await getDownloadURL(sref);
  await marcarConclusao(apelido, { tipo, url });
  alert(`${tipo === "foto" ? "Foto" : "Vídeo"} enviado!`);
}

// ====== MONITORAMENTO DO TIME ======
function monitorarTime(codigo) {
  timeCodigo = codigo;
  localStorage.setItem("timeCodigo", codigo);
  onValue(ref(db, `times/${codigo}/nome`), snap => {
    const nome = snap.val();
    const el = document.getElementById("tituloTimePainel");
    if (el && nome) el.textContent = `Time: ${nome}`;
  });
  onValue(ref(db, `times/${codigo}/desafioAtual`), snap => {
    desafioAtual = snap.val() || 1;
    carregarDesafioAtual();
  });
  onValue(ref(db, `times/${codigo}/membros`), snap => {
    const obj = snap.val() || {};
    membros = Object.values(obj);
    renderizarStatusMembros();
  });
  onValue(ref(db, `times/${codigo}/historico`), snap => {
    const hist = snap.val() || {};
    const concluidos = Object.keys(hist).length;
    const pontos = desafios.slice(0, concluidos).reduce((s, d) => s + d.pontos, 0);
    const pct = Math.round((concluidos / desafios.length) * 100);
    if (barraProgressoEl) barraProgressoEl.style.width = pct + "%";
    if (textoDesafiosConcluidosEl) textoDesafiosConcluidosEl.textContent = `${concluidos} / ${desafios.length} desafios`;
    if (textoPercentualProgressoEl) textoPercentualProgressoEl.textContent = `${pct}%`;
    if (headerProgressoEl) headerProgressoEl.textContent = `${pct}%`;
    if (pillPontosTotaisEl) pillPontosTotaisEl.textContent = `${pontos} pts`;
    if (miniDesafioAtualEl) miniDesafioAtualEl.textContent = `#${Math.min(concluidos + 1, desafios.length)} ${desafios[Math.min(concluidos, desafios.length - 1)].titulo}`;
  });
}
async function criarTimeFirebase(nomeTime) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) codigo += chars[Math.floor(Math.random() * chars.length)];
  await set(ref(db, `times/${codigo}`), { nome: nomeTime, desafioAtual: 1, criadoEm: serverTimestamp() });
  await set(ref(db, `times/${codigo}/membros/${keyFromNome(apelido)}`), { nome: apelido, concluidos: 0, faltas: 0, corAvatar });
  monitorarTime(codigo);
  if (typeof mostrarTela === "function") mostrarTela("dashboard");
}
async function entrarEmTimeFirebase(codigo) {
  if (!codigo) return;
  await set(ref(db, `times/${codigo}/membros/${keyFromNome(apelido)}`), { nome: apelido, concluidos: 0, faltas: 0, corAvatar });
  monitorarTime(codigo);
  if (typeof mostrarTela === "function") mostrarTela("dashboard");
}

// ====== CHAT GLOBAL ======
const chatMensagensEl = document.getElementById("chatMensagens");
const chatInputEl = document.getElementById("chatInput");
const chatEnviarEl = document.getElementById("chatEnviar");
function criarLinhaMensagem(msg, euMesmo) {
  const linha = document.createElement("div");
  linha.className = "chat-linha " + (euMesmo ? "eu" : "eles");
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "msg-avatar";
  avatarDiv.textContent = msg.autorNome?.[0]?.toUpperCase() || "?";
  avatarDiv.style.background = msg.corAvatar || "#e5e7eb";
  const bolhaDiv = document.createElement("div");
  bolhaDiv.className = "msg-bolha";
  if (msg.tipo === "audio" && msg.url) {
    const audioEl = document.createElement("audio");
    audioEl.controls = true;
    audioEl.src = msg.url;
    audioEl.style.maxWidth = "100%";
    bolhaDiv.appendChild(audioEl);
  } else {
    bolhaDiv.textContent = msg.texto || "";
  }
  const metaDiv = document.createElement("div");
  metaDiv.className = "msg-meta";
  const hora = msg.criadoEm ? formatarHora(msg.criadoEm) : "";
  metaDiv.textContent = `${msg.autorNome} • ${hora}`;
  bolhaDiv.appendChild(metaDiv);
  if (euMesmo) { linha.appendChild(bolhaDiv); linha.appendChild(avatarDiv); }
  else { linha.appendChild(avatarDiv); linha.appendChild(bolhaDiv); }
  return linha;
}
function configurarChatFirebase() {
  if (!db) return;
  const chatRef = ref(db, "chatGlobal");
  onChildAdded(chatRef, snap => {
    const dados = snap.val();
    if (!dados) return;
    const isAudio = dados.tipo === "audio" && dados.url;
    const isTexto = (dados.tipo === "texto" && dados.texto) || (!!dados.texto && !dados.tipo);
    if (!isAudio && !isTexto) return;
    const msg = {
      tipo: isAudio ? "audio" : "texto",
      texto: isAudio ? "" : (dados.texto || ""),
      url: isAudio ? dados.url : undefined,
      autorNome: dados.autorNome || "Jogador",
      corAvatar: dados.corAvatar || gerarCorAPartirDoNome(dados.autorNome || "Jogador"),
      criadoEm: dados.criadoEm || Date.now()
    };
    const euMesmo = msg.autorNome === apelido;
    const linha = criarLinhaMensagem(msg, euMesmo);
    chatMensagensEl?.appendChild(linha);
    if (chatMensagensEl) chatMensagensEl.scrollTop = chatMensagensEl.scrollHeight;
  });
}
function enviarMensagem() {
  const texto = chatInputEl?.value?.trim();
  if (!texto) return;
  chatInputEl.value = "";
  push(ref(db, "chatGlobal"), { tipo: "texto", texto, autorNome: apelido || "Jogador", corAvatar, criadoEm: serverTimestamp() });
}
chatEnviarEl?.addEventListener("click", enviarMensagem);
chatInputEl?.addEventListener("keypress", (e) => { if (e.key === "Enter") enviarMensagem(); });

// ===== ÁUDIO NO CHAT =====
let mediaRecorder;
let chunks = [];

async function iniciarGravacao() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    mediaRecorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: "audio/webm" });
        chunks = [];

        const arquivo = storageRef(storage, "audios/" + Date.now() + ".webm");
        await uploadBytes(arquivo, blob);
        const url = await getDownloadURL(arquivo);

        const chatRef = ref(db, "chatGlobal");
        await push(chatRef, {
          tipo: "audio",
          url,
          autorNome: apelido || "Jogador",
          corAvatar,
          criadoEm: serverTimestamp()
        });
      } catch (err) {
        console.error(err);
        alert("Falha ao enviar áudio.");
      }
    };

    mediaRecorder.start();
  } catch (err) {
    console.error(err);
    alert("Permita acesso ao microfone para gravar áudio.");
  }
}

document.getElementById("btnAudio")?.addEventListener("mousedown", iniciarGravacao);
document.getElementById("btnAudio")?.addEventListener("touchstart", iniciarGravacao);

document.getElementById("btnAudio")?.addEventListener("mouseup", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop();
});
document.getElementById("btnAudio")?.addEventListener("touchend", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop();
});

// ====== BIND BOTÕES (TIME/UPLOAD) ======
document.getElementById("btnContinuarDashboard")?.addEventListener("click", () => {
  const nomeTime = document.getElementById("nomeTime")?.value?.trim();
  if (!nomeTime) return alert("Informe o nome do time");
  criarTimeFirebase(nomeTime);
});
document.querySelector('#screen-time .card .btn.btn-secundario.btn-block')?.addEventListener("click", () => {
  const cod = document.getElementById("codigoTime")?.value?.trim()?.toUpperCase();
  if (!cod) return alert("Informe o código do time");
  entrarEmTimeFirebase(cod);
});
document.getElementById("btnEnviarFoto")?.addEventListener("click", () => uploadMidia("foto"));
document.getElementById("btnEnviarVideo")?.addEventListener("click", () => uploadMidia("video"));

// ====== LOGIN PROFISSIONAL ======
let avatarSelecionado = "👨‍👩‍👧";
document.querySelectorAll(".avatar-item").forEach(av => {
  av.addEventListener("click", () => {
    document.querySelectorAll(".avatar-item").forEach(a => a.classList.remove("selected"));
    av.classList.add("selected");
    avatarSelecionado = av.textContent.trim();
  });
});
document.getElementById("btnEntrarLogin")?.addEventListener("click", () => {
  const nome = document.getElementById("inputNome")?.value?.trim();
  const senha = document.getElementById("inputSenha")?.value?.trim();
  if (!nome) return alert("Digite seu nome para entrar!");
  if (!senha) return alert("Digite a senha para entrar!");
  if (senha !== "familiabarbosa") return alert("Senha incorreta! Tente novamente.");
  apelido = nome;
  corAvatar = gerarCorAPartirDoNome(nome);
  localStorage.setItem("liga_nome", nome);
  localStorage.setItem("liga_avatar", avatarSelecionado);
  const login = document.getElementById("screen-login");
  if (login) login.style.display = "none";
  if (typeof mostrarTela === "function") mostrarTela("time");
});

// ====== START ======
configurarChatFirebase();
if (timeCodigo) monitorarTime(timeCodigo);
