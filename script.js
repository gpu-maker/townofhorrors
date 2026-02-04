body {
  margin: 0;
  font-family: monospace;
  background: #000;
  color: #d0d0d0;
  overflow: hidden;
}

header {
  background: #080808;
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

#vhs {
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.03),
      rgba(255,255,255,0.03) 1px,
      transparent 2px,
      transparent 3px
    );
  pointer-events: none;
  animation: vhsMove 6s infinite linear;
}

@keyframes vhsMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(-4px); }
}

#overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.low-sanity #overlay {
  background:
    radial-gradient(circle at random, rgba(255,0,0,.1), transparent 40%),
    repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.05) 1px,
      transparent 1px,
      transparent 2px
    );
  animation: flicker .12s infinite;
}

@keyframes flicker {
  0% { opacity: .2 }
  100% { opacity: .5 }
}

main {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  height: calc(100vh - 90px);
}

#map {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 6px;
}

.tile {
  background: #111;
  height: 60px;
  position: relative;
}

.tile.fog::after {
  content: "";
  inset: 0;
  position: absolute;
  background: #000;
}

.tile.player {
  outline: 1px solid #aa0000;
}

#choices button {
  background: #111;
  color: #ccc;
  border: 1px solid #333;
  padding: 6px;
  margin: 5px 0;
  transition: transform .2s;
}

.low-sanity #choices button:hover {
  transform: translateX(3px);
}
