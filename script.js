/* =====================
   DEV / ARG CONSOLE
===================== */
console.log("HOLLOW CREEK INTERNAL BUILD");
console.log("Some endings require remembering past deaths.");
console.log("The town is persistent.");

/* =====================
   SAVE + META MEMORY
===================== */
const META_KEY = "HC_META";
const SAVE_KEY = "HC_SAVE";

let meta = JSON.parse(localStorage.getItem(META_KEY)) || {
  deaths: 0,
  ghostMessages: []
};

let save = JSON.parse(localStorage.getItem(SAVE_KEY)) || {
  hp: 100,
  sanity: 100,
  loc: "Outskirts",
  inventory: [],
  visited: {},
  endings: [],
  npcFlags: {}
};

function saveAll(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

/* =====================
   AUDIO CONTROL
===================== */
const amb = document.getElementById("amb");
const staticA = document.getElementById("static");
amb.volume = 0.4;
staticA.volume = 0;

/* =====================
   MAP DATA (10 NODES)
===================== */
const mapData = {
  Outskirts:{x:0,y:0,text:"The trees thin. The town waits."},
  Square:{x:1,y:0,text:"A square designed for people who never arrived."},
  School:{x:2,y:0,text:"Attendance is still taken."},
  Hospital:{x:0,y:1,text:"Machines hum without patients."},
  Church:{x:1,y:1,text:"The pews are warm when you sit."},
  Police:{x:2,y:1,text:"Missing posters include you."},
  River:{x:0,y:2,text:"The current pulls sideways."},
  Woods:{x:1,y:2,text:"Footsteps follow your pace."},
  Radio:{x:2,y:2,text:"It knows your name."},
  House:{x:1,y:3,text:"You never lived here. It disagrees."}
};

/* =====================
   NPC SYSTEM (MEMORY)
===================== */
const npcs = {
  Teacher(save){
    return save.npcFlags.teacherMet
      ? "You already failed this class."
      : "You're late. Again.";
  },
  Nurse(save){
    return meta.deaths > 0
      ? "We’ve treated you before."
      : "You don’t appear in our system.";
  }
};

/* =====================
   ENDINGS (100 – UNIQUE LORE)
===================== */
const endings = Array.from({length:100},(_,i)=>(
`END ${String(i+1).padStart(3,"0")} — ${
[
"You stayed. The town locked its doors.",
"You left. Hollow Creek followed.",
"The radio used your voice.",
"Your name replaced the town sign.",
"You became part of the map.",
"The church buried the truth.",
"The hospital archived you.",
"You were elected posthumously.",
"The woods learned your shape.",
"The house finally slept."
][i%10]
}`
));

/* =====================
   UI ELEMENTS
===================== */
const text = document.getElementById("text");
const choices = document.getElementById("choices");
const inv = document.getElementById("inventory");
const mapCtx = document.getElementById("map").getContext("2d");

function render(){
  document.getElementById("hp").textContent = save.hp;
  document.getElementById("sanity").textContent = save.sanity;
  document.getElementById("location").textContent = save.loc;

  document.body.classList.toggle("low-sanity", save.sanity < 40);
  staticA.volume = save.sanity < 40 ? 0.35 : 0;

  text.textContent = mapData[save.loc].text;
  choices.innerHTML = "";

  ["Move","Search","Talk","Listen"].forEach(a=>{
    let b = document.createElement("button");
    b.textContent = a;
    b.onclick = ()=>act(a);
    choices.appendChild(b);
  });

  inv.innerHTML = save.inventory.map(i=>`<li>${i}</li>`).join("");
  drawMap();
  saveAll();
}

/* =====================
   MAP DRAW (FOG OF WAR)
===================== */
function drawMap(){
  mapCtx.clearRect(0,0,240,240);
  Object.entries(mapData).forEach(([k,v])=>{
    if(save.visited[k]){
      mapCtx.fillStyle = "#666";
      mapCtx.fillRect(v.x*60,v.y*60,40,40);
    }
  });
}

/* =====================
   GAME ACTIONS
===================== */
function act(a){
  save.visited[save.loc] = true;
  save.sanity -= Math.random()*4;

  if(save.sanity <= 0 || save.hp <= 0){
    triggerEnding();
    return;
  }

  if(a === "Move"){
    save.loc = Object.keys(mapData)[Math.floor(Math.random()*10)];
  }

  if(a === "Search" && Math.random() < 0.3){
    save.inventory.push("KEY");
  }

  if(a === "Talk"){
    save.npcFlags.teacherMet = true;
    text.textContent = npcs.Teacher(save);
  }

  if(a === "Listen"){
    document.getElementById("whisper").play();
  }

  render();
}

/* =====================
   ENDING HANDLER
===================== */
function triggerEnding(){
  meta.deaths++;
  const id = (meta.deaths * 7) % 100;

  if(!save.endings.includes(id)){
    save.endings.push(id);
    document.getElementById("endings").innerHTML += `<li>${endings[id]}</li>`;
  }

  save.hp = 100;
  save.sanity = 100;
  save.loc = "Outskirts";
  save.inventory = [];
  save.visited = {};
}

/* =====================
   START GAME
===================== */
amb.play();
render();
