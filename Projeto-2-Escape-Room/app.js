'use strict';
// Núcleo do Escape Room: o jogo usa apenas recursos do navegador.
const QUESTIONS = JSON.parse(document.querySelector('#question-bank').textContent);
const ROOMS = [
  {title:'A Câmara de Entrada',subtitle:'Princípio Fundamental da Contagem',symbol:'⌘',story:'Três engrenagens independentes controlam o primeiro portão. Calcule as possibilidades para despertar o mecanismo.', label:'Entrada', level:'FÁCIL'},
  {title:'O Arquivo dos Anagramas',subtitle:'Permutações',symbol:'◇',story:'Letras luminosas mudam de posição no arquivo. Descubra quantas senhas diferentes podem ser criadas.', label:'Arquivo', level:'BÁSICO'},
  {title:'A Sala dos Guardiões',subtitle:'Arranjos',symbol:'♜',story:'Cada sentinela ocupa uma função específica. A ordem dos postos altera a autorização de acesso.', label:'Guardiões', level:'INTERMEDIÁRIO'},
  {title:'O Cofre de Seleção',subtitle:'Combinações',symbol:'⬡',story:'Escolha conjuntos de elementos para alimentar o cofre. Aqui a ordem não altera o resultado.', label:'Cofre', level:'AVANÇADO'},
  {title:'O Núcleo da Fuga',subtitle:'Problemas com restrições',symbol:'✧',story:'O último núcleo exige estratégias combinatórias com regras especiais. Resolva quatro códigos para escapar.', label:'Núcleo', level:'DIFÍCIL'}
];
const REQUIRED = [1,2,2,3,4], MAX_ERRORS = 8, DURATION = 15 * 60;
const $ = id => document.getElementById(id);
let state = null, clock = null, audio = null;

function sound(type) {
  if (!$('sound').checked) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audio ||= new Audio();
    const tones = type === 'win' ? [523,659,783,1047] : type === 'correct' ? [523,784] : [184,147];
    tones.forEach((frequency, index) => {
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = type === 'wrong' ? 'triangle' : 'sine';
      osc.frequency.value = frequency;
      const when = audio.currentTime + index * .09;
      gain.gain.setValueAtTime(.0001, when);
      gain.gain.exponentialRampToValueAtTime(.05, when + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, when + .17);
      osc.connect(gain).connect(audio.destination);
      osc.start(when); osc.stop(when + .18);
    });
  } catch (_) { /* áudio é um recurso opcional */ }
}
function visibility(screen) {
  ['welcome','game','finish'].forEach(s => $(s).hidden = s !== screen);
}
function start() {
  clearInterval(clock);
  state = {phase:0,phaseHits:0,hits:0,errors:0,seconds:DURATION,asked:new Set(),question:null,locked:false,ended:false};
  document.body.dataset.phase = '1';
  $('answer').disabled = false;
  $('submit').disabled = false;
  $('next').hidden = true;
  $('feedback').hidden = true;
  visibility('game');
  drawRoom();
  choose();
  clock = setInterval(tick, 1000);
  playMusic();
  window.scrollTo({top:0,behavior:'instant'});
  $('answer').focus({preventScroll:true});
}
function tick() {
  if (!state || state.ended) return;
  state.seconds = Math.max(0, state.seconds - 1);
  drawStats();
  if (!state.seconds) end(false, 'O sistema de segurança esgotou o tempo disponível.');
}
function choose() {
  if (!state || state.ended) return;
  const available = QUESTIONS.filter(q => q.fase === state.phase + 1 && !state.asked.has(q.id));
  if (!available.length) {
    end(false, 'As questões inéditas desta fase se esgotaram antes de atingir a meta de acertos.');
    return;
  }
  const q = available[Math.floor(Math.random() * available.length)];
  state.question = q;
  state.asked.add(q.id);
  state.locked = false;
  $('question-id').textContent = `CÓDIGO ${q.id} · ${q.assunto.toUpperCase()}`;
  $('question').textContent = q.enunciado;
  $('answer').value = '';
  $('answer').disabled = false;
  $('submit').disabled = false;
  $('next').hidden = true;
  $('feedback').hidden = true;
  $('answer').focus({preventScroll:true});
  drawStats();
}
function drawRoom() {
  const room = ROOMS[state.phase];
  document.body.dataset.phase = String(state.phase+1);
  $('room-name').textContent = room.title;
  $('room-topic').textContent = room.subtitle;
  $('room-symbol').textContent = room.symbol;
  $('room-story').textContent = room.story;
  $('door-no').textContent = String(state.phase+1).padStart(2,'0');
  $('room-tag').textContent = room.level;
  $('room-list').replaceChildren(...ROOMS.map((r,i) => {
    const item = document.createElement('div');
    item.className = 'room ' + (i < state.phase ? 'done' : i === state.phase ? 'active' : '');
    item.setAttribute('aria-label', `Fase ${i+1}: ${r.title}; ${i < state.phase ? 'concluída' : i === state.phase ? 'atual' : 'bloqueada'}`);
    if (i === state.phase) item.setAttribute('aria-current','step');
    const numeral = document.createElement('b');
    numeral.textContent = i < state.phase ? '✓' : String(i+1).padStart(2,'0');
    const label = document.createElement('span'); label.textContent = r.label;
    const status = document.createElement('small'); status.textContent = i < state.phase ? 'ABERTA' : i === state.phase ? 'ATIVA' : 'FECHADA';
    label.append(status); item.append(numeral,label);
    return item;
  }));
  drawStats();
}
function drawStats() {
  $('phase').textContent = `${state.phase+1} / 5`;
  $('hits').textContent = `${state.hits} / 12`;
  $('mistakes').textContent = `${state.errors} / ${MAX_ERRORS}`;
  const seconds = Math.max(0,state.seconds);
  $('time').textContent = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  $('time-fill').style.width = `${seconds/DURATION*100}%`;
  document.querySelector('.stat-time').classList.toggle('critical',seconds<=120);
  const percent = Math.min(100,state.phaseHits/REQUIRED[state.phase]*100);
  $('phase-progress').style.width = `${percent}%`;
  document.querySelector('.progress').setAttribute('aria-valuenow',String(percent));
  $('phase-detail').textContent = `${state.phaseHits} / ${REQUIRED[state.phase]} CÓDIGOS`;
}
function feedback(kind,title,text) {
  const panel=$('feedback');
  panel.hidden=false; panel.className='message '+kind; panel.replaceChildren();
  const head=document.createElement('strong');head.textContent=title;
  const body=document.createElement('span');body.textContent=text;
  panel.append(head,body);
}
function submit() {
  if(!state || state.locked || state.ended)return;
  const raw=$('answer').value.trim();
  if(!/^\d+$/.test(raw)) {
    feedback('','Código inválido','Digite um número inteiro não negativo, sem espaços, pontos ou vírgulas.');
    return;
  }
  const val=Number(raw);
  if(!Number.isSafeInteger(val)) {
    feedback('','Número fora do limite','Use um número inteiro dentro do limite aceito pelo navegador.');
    return;
  }
  state.locked=true;
  $('submit').disabled=true;
  $('answer').disabled=true;
  const q=state.question;
  if(val===q.resposta) {
    state.hits++;state.phaseHits++;
    sound('correct');
    feedback('success','✓ CÓDIGO ACEITO','Resolução: '+q.resolucao);
  } else {
    state.errors++;
    sound('wrong');
    feedback('error',`✕ CÓDIGO INCORRETO — RESPOSTA: ${q.resposta}`,'Resolução: '+q.resolucao);
  }
  drawStats();
  $('next').hidden=false;
  if(state.errors>=MAX_ERRORS) $('next').firstChild.textContent='VER RESULTADO ';
  else if(state.phaseHits>=REQUIRED[state.phase]) $('next').firstChild.textContent=state.phase===4?'CONCLUIR FUGA ':'ABRIR PRÓXIMA CÂMARA ';
  else $('next').firstChild.textContent='PRÓXIMO DESAFIO ';
}
function advance() {
  if(!state || !state.locked || state.ended)return;
  if(state.errors>=MAX_ERRORS) {
    end(false,'O sistema bloqueou o laboratório após oito respostas incorretas.');
    return;
  }
  if(state.phaseHits>=REQUIRED[state.phase]) {
    if(state.phase===4) {
      end(true,'Você decifrou os cinco mecanismos e escapou do laboratório!');
      return;
    }
    state.phase++;state.phaseHits=0;
    drawRoom(); sound('correct');
  }
  choose();
}
function end(won,reason) {
  if(!state || state.ended)return;
  state.ended=true;
  clearInterval(clock);
  document.body.dataset.phase = won ? '1' : String(state.phase+1);
  visibility('finish');
  $('finish-symbol').textContent = won ? '✦' : '⛒';
  $('finish-title').textContent = won ? 'Você escapou.' : 'Acesso negado.';
  $('finish-text').textContent = reason;
  const elapsed = DURATION-state.seconds;
  $('finish-stats').textContent = `${state.hits} / 12 ACERTOS     ·     ${state.errors} / ${MAX_ERRORS} ERROS     ·     ${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')} DECORRIDOS`;
  sound(won?'win':'wrong');
  window.scrollTo({top:0,behavior:'instant'});
}
$('start').addEventListener('click',start);
$('restart').addEventListener('click',start);
$('submit').addEventListener('click',submit);
$('next').addEventListener('click',advance);
$('answer').addEventListener('keydown',e => {if(e.key==='Enter') {e.preventDefault(); if(!$('next').hidden)advance(); else submit();}});
$('quit').addEventListener('click',() => {
  if(!state || state.ended) {start();return;}
  if(window.confirm('Reiniciar a missão? Todo o progresso da partida será perdido.'))start();
});
$('sound').addEventListener('change', e => {
  document.querySelector('.audio-toggle').setAttribute('aria-label',e.target.checked?'Efeitos sonoros ativados':'Efeitos sonoros desativados');
});


/* Trilha padrão do jogo; o jogador também pode selecionar outro arquivo local. */
const DEFAULT_TRACK = 'trilha.mp3.mpeg';
const backgroundTrack = new Audio(DEFAULT_TRACK);
backgroundTrack.loop = true;
backgroundTrack.volume = 0.24;
backgroundTrack.preload = 'metadata';
let trackUrl = null;
const musicButton = $('music-play');
const musicStatus = $('music-status');
musicStatus.textContent = 'Trilha do jogo';
musicButton.disabled = false;
function syncMusicButton() {
  musicButton.textContent = backgroundTrack.paused ? '▶' : '❚❚';
  musicButton.setAttribute('aria-label',backgroundTrack.paused?'Reproduzir música':'Pausar música');
}
async function playMusic() {
  try { await backgroundTrack.play(); }
  catch (_) { musicStatus.title = 'Clique em reproduzir para ouvir a trilha'; }
  syncMusicButton();
}
$('music-file').addEventListener('change', async e => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('audio/') && !/\.(mp3|ogg|wav|m4a)$/i.test(file.name)) {
    musicStatus.textContent='Selecione um arquivo de áudio válido.';
    return;
  }
  backgroundTrack.pause();
  backgroundTrack.removeAttribute('src');
  backgroundTrack.load();
  if (trackUrl) URL.revokeObjectURL(trackUrl);
  trackUrl = URL.createObjectURL(file);
  backgroundTrack.src = trackUrl;
  musicStatus.textContent = file.name.length > 28 ? file.name.slice(0,25)+'…' : file.name;
  musicStatus.title = file.name;
  musicButton.disabled=false;
  await playMusic();
});
musicButton.addEventListener('click', async () => {
  if (!backgroundTrack.paused) backgroundTrack.pause();
  else await playMusic();
});
$('music-volume').addEventListener('input',e => { backgroundTrack.volume=Number(e.target.value)/100; });
backgroundTrack.addEventListener('ended',syncMusicButton);
backgroundTrack.addEventListener('error',() => {
  musicStatus.textContent='Formato de áudio não suportado.';
  backgroundTrack.pause();
  syncMusicButton();
});
