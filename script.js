/* ================= STATE ================= */
let state = JSON.parse(localStorage.getItem("save")) || {
  location: 0,
  health: 100,
  sanity: 100,
  inventory: [],
  visited: Array(10).fill(false),
  endings: JSON.parse(localStorage.getItem("endings")) || [],
  loops: Number(localStorage.getItem("loops")) || 0
};

/* ================= LOCATIONS ================= */
const locations = [
  "Home","Main Street","Clinic","Church","Woods",
  "Lake","School","Radio Tower","Tunnel","Nowhere"
];

/* ================= UI ================= */
const mapEl = document.getElementById("map");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const itemsEl = document.getElementById("items");

/* ================= AUDIO ================= */
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const master = ctx.createGain();
master.gain.value = 0.6;
master.connect(ctx.destination);

const ambience = new Audio("audio/ambience.mp3");
ambience.loop = true;
ambience.volume = 0.4;
ctx.createMediaElementSource(ambience).connect(master);

const whispers = new Audio("audio/whispers.mp3");
whispers.loop = true;
whispers.volume = 0.15;
const whisperSrc = ctx.createMediaElementSource(whispers);
const pan = ctx.createStereoPanner();
whisperSrc.connect(pan).connect(master);

const radio = new Audio("audio/radio.mp3");
radio.loop = true;
radio.volume = 0;
ctx.createMediaElementSource(radio).connect(master);

const bass = ctx.createOscillator();
const bassGain = ctx.createGain();
bass.frequency.value = 28;
bassGain.gain.value = 0.02;
bass.connect(bassGain).connect(master);
bass.start();

/* ================= AUDIO LOGIC ================= */
function updateAudio() {
  ctx.resume();
  pan.pan.value = Math.sin(Date.now()/900);
  radio.volume = state.sanity < 30 ? 0.15 : 0;
  bassGain.gain.value = state.sanity < 40 ? 0.04 : 0.02;
  master.gain.value = 0.55 + state.loops * 0.03;
}

/* silence events */
setInterval(()=>{
  if(state.sanity<25 && Math.random()<0.2){
    master.gain.value=0;
    setTimeout(updateAudio,2000);
  }
},8000);

/* ================= MAP ================= */
function renderMap(){
  mapEl.innerHTML="";
  locations.forEach((_,i)=>{
    const t=document.createElement("div");
    t.className="tile";
    if(!state.visited[i] || (state.sanity<30 && Math.random()<.3))
      t.classList.add("fog");
    if(i===state.location) t.classList.add("player");
    mapEl.appendChild(t);
  });
}

/* ================= TEXT ================= */
function corrupt(t){
  if(state.sanity>40) return t;
  return t.replace(/[aeiou]/gi,c=>Math.random()<.3?"█":c);
}

function show(text,choices){
  textEl.innerHTML=corrupt(text);
  choicesEl.innerHTML="";
  choices.forEach(c=>{
    const b=document.createElement("button");
    b.textContent=corrupt(c.text);
    b.onclick=c.action;
    choicesEl.appendChild(b);
  });
}

/* ================= NPC ================= */
const npcLines=[
  "I remember you.",
  "You were here before.",
  "You left already.",
  "Stop asking.",
  "It isn't safe to stay."
];

function npc(){
  let line=npcLines[Math.floor(Math.random()*npcLines.length)];
  if(state.loops>2) line+=" Again.";
  show(`<p>${line}</p>`,[
    {text:"Leave",action:()=>enter(state.location)}
  ]);
}

/* ================= GAME ================= */
function enter(i){
  state.location=i;
  state.visited[i]=true;
  update();
  updateAudio();

  if(state.sanity<15 && Math.random()<0.4){
    endGame(Math.floor(Math.random()*60));
    return;
  }

  show(
    `<p>${locations[i]} feels wrong. The air hums.</p>`,
    [
      {text:"Search",action:()=>change(-5,-8)},
      {text:"Listen",action:()=>change(0,-5)},
      {text:"Talk",action:npc},
      {text:"Move",action:moveMenu}
    ]
  );
}

function moveMenu(){
  show("Where do you go?",
    locations.map((l,i)=>({
      text:l,
      action:()=>enter(i)
    }))
  );
}

/* ================= STATE ================= */
function change(h,s){
  state.health+=h;
  state.sanity+=s;
  if(state.health<=0) endGame(0);
  update();
  updateAudio();
}

function update(){
  document.getElementById("health").textContent=state.health;
  document.getElementById("sanity").textContent=state.sanity;
  document.body.classList.toggle("low-sanity",state.sanity<40);
  renderMap();
}

/* ================= INVENTORY ================= */
function updateInventory(){
  itemsEl.innerHTML="";
  state.inventory.forEach(i=>{
    const li=document.createElement("li");
    li.textContent=i;
    itemsEl.appendChild(li);
  });
}

setInterval(()=>{
  if(state.sanity<30 && state.inventory.length){
    const i=Math.floor(Math.random()*state.inventory.length);
    state.inventory[i]="??? "+state.inventory[i];
    updateInventory();
  }
},6000);

/* ================= ENDINGS ================= */
const endings=Array.from({length:60},(_,i)=>`
ENDING ${i+1}
${[
"You were never alone.",
"The town remembers.",
"The signal continues.",
"You stayed too long.",
"The silence noticed you.",
"You became part of it.",
"The radio keeps talking.",
"You were already here.",
"The loop tightens.",
"Ashwick listens."
][i%10]}
`);

function endGame(i){
  if(!state.endings.includes(i)){
    state.endings.push(i);
    localStorage.setItem("endings",JSON.stringify(state.endings));
  }
  state.loops++;
  localStorage.setItem("loops",state.loops);
  ambience.pause(); whispers.pause(); radio.pause();
  show(`<h2>${endings[i]}</h2><p>The sound fades.</p>`,[
    {text:"RESTART",action:()=>location.reload()}
  ]);
}

/* ================= MENUS ================= */
function openEndings(){
  show(`<h2>ENDINGS</h2><ul>${
    state.endings.map(e=>`<li>${endings[e]}</li>`).join("")
  }</ul>`,[
    {text:"BACK",action:()=>enter(state.location)}
  ]);
}

/* ================= SAVE ================= */
function saveGame(){
  localStorage.setItem("save",JSON.stringify(state));
}
function loadGame(){
  const s=JSON.parse(localStorage.getItem("save"));
  if(s) state=s;
  update();
  enter(state.location);
}

/* ================= IDLE ENDING ================= */
let idle=0;
setInterval(()=>{
  idle++;
  if(idle>120 && state.sanity<40) endGame(59);
},1000);
document.addEventListener("click",()=>idle=0);

/* ================= START ================= */
document.addEventListener("click",()=>{
  ambience.play();
  whispers.play();
  radio.play();
},{once:true});

console.log("%cASHWICK IS LISTENING","color:red");
enter(state.location||0);
