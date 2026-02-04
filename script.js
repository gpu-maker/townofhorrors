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

let stalker = Math.floor(Math.random()*10);

/* ================= UI ================= */
const mapEl = document.getElementById("map");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const itemsEl = document.getElementById("items");

/* ================= AUDIO ================= */
const ctx = new AudioContext();
const gain = ctx.createGain();
const distortion = ctx.createWaveShaper();
distortion.connect(gain).connect(ctx.destination);

function distortAudio() {
  const k = 100 - state.sanity;
  const curve = new Float32Array(44100);
  for (let i=0;i<44100;i++) {
    let x = i*2/44100-1;
    curve[i]=(3+k)*x*20*Math.PI/180/(Math.PI+k*Math.abs(x));
  }
  distortion.curve = curve;
  gain.gain.value = state.sanity < 40 ? .25 : .1;
}

/* ================= MAP ================= */
function renderMap() {
  mapEl.innerHTML="";
  locations.forEach((_,i)=>{
    const t=document.createElement("div");
    t.className="tile";
    if (!state.visited[i] || (state.sanity<30 && Math.random()<.3))
      t.classList.add("fog");
    if (i===state.location) t.classList.add("player");
    mapEl.appendChild(t);
  });
}

/* ================= TEXT CORRUPTION ================= */
function corrupt(text) {
  if (state.sanity > 40) return text;
  return text.replace(/[aeiou]/gi, c =>
    Math.random()<.3 ? "█" : c
  );
}

function show(text, choices) {
  textEl.innerHTML = corrupt(text);
  choicesEl.innerHTML="";
  choices.forEach(c=>{
    const b=document.createElement("button");
    b.textContent = corrupt(c.text);
    b.onclick = c.action;
    choicesEl.appendChild(b);
  });
}

/* ================= GAME ================= */
function enter(i) {
  state.location = i;
  state.visited[i] = true;

  if (state.sanity < 25 && Math.random() < .3) stalker = i;

  update();

  if (state.sanity < 15 && Math.random() < .4) {
    endGame(Math.floor(Math.random()*60));
    return;
  }

  show(
    `<p>${locations[i]} is quieter than it should be.</p>`,
    [
      {text:"Search",action:()=>change(-5,-8)},
      {text:"Listen",action:()=>change(0,-5)},
      {text:"Move",action:moveMenu}
    ]
  );
}

function moveMenu() {
  show("Where do you go?",
    locations.map((l,i)=>({
      text:l,
      action:()=>enter(i)
    }))
  );
}

/* ================= STATE ================= */
function change(h,s) {
  state.health+=h;
  state.sanity+=s;
  if (state.health<=0) endGame(0);
  update();
}

function update() {
  document.getElementById("health").textContent=state.health;
  document.getElementById("sanity").textContent=state.sanity;
  document.body.classList.toggle("low-sanity",state.sanity<40);
  distortAudio();
  renderMap();
}

/* ================= INVENTORY CORRUPTION ================= */
setInterval(()=>{
  if (state.sanity<30 && state.inventory.length) {
    const i=Math.floor(Math.random()*state.inventory.length);
    state.inventory[i]="??? "+state.inventory[i];
  }
},6000);

/* ================= ENDINGS ================= */
const endings = Array.from({length:60},(_,i)=>`
ENDING ${i+1}
${[
"You were never the first.",
"The town remembers you.",
"You stayed too long.",
"You left something behind.",
"The radio says your name.",
"You were already missing.",
"The loop tightens.",
"The town is grateful.",
"You wake up elsewhere.",
"Ashwick keeps you."
][i%10]}
`);

function endGame(i) {
  if (!state.endings.includes(i)) {
    state.endings.push(i);
    localStorage.setItem("endings",JSON.stringify(state.endings));
  }
  state.loops++;
  localStorage.setItem("loops",state.loops);
  show(`<h2>${endings[i]}</h2><p>The signal fades.</p>`,[
    {text:"RESTART",action:()=>location.reload()}
  ]);
}

/* ================= ENDING MENU ================= */
function openEndings() {
  show(
    `<h2>ENDINGS</h2><ul>${
      state.endings.map(e=>`<li>${endings[e]}</li>`).join("")
    }</ul>`,
    [{text:"BACK",action:()=>enter(state.location)}]
  );
}

/* ================= SAVE ================= */
function saveGame() {
  localStorage.setItem("save",JSON.stringify(state));
}

function loadGame() {
  const s=JSON.parse(localStorage.getItem("save"));
  if (s) state=s;
  update();
  enter(state.location);
}

/* ================= IDLE ENDING ================= */
let idle=0;
setInterval(()=>{
  idle++;
  if (idle>120 && state.sanity<40) endGame(59);
},1000);
document.addEventListener("click",()=>idle=0);

/* ================= ARG ================= */
console.log("%cASHWICK IS STILL RUNNING","color:red");
console.log("loops:",state.loops);

/* ================= START ================= */
enter(state.location || 0);
