import "./style.css";

const zero = 0;
const one = 1;

const app: HTMLDivElement = document.querySelector("#app")!;

const lines: { x: number; y: number }[][] = [];
const redoLines: { x: number; y: number }[][] = [];
let currentLine: { x: number; y: number }[];

const cursor = { active: false, x: zero, y: zero };

const gameName = "Sticker Sketchpad";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

//some code taken from Adam Smith https://shoddy-paint.glitch.me/paint1.html

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
  redoLines.splice(zero, redoLines.length);
  currentLine.push({ x: cursor.x, y: cursor.y });

  changeDrawing();
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.push({ x: cursor.x, y: cursor.y });

    changeDrawing();
  }
});

canvas.addEventListener("mouseup", (e) => {
  cursor.active = false;
  console.log(e);
  changeDrawing();
});

canvas.addEventListener("drawing-changed", redraw);

function redraw() {
  ctx!.clearRect(zero, zero, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > one) {
      ctx!.beginPath();
      const { x, y } = line[zero];
      ctx!.moveTo(x, y);
      for (const { x, y } of line) {
        ctx!.lineTo(x, y);
      }
      ctx!.stroke();
    }
  }
}

function changeDrawing() {
  canvas.dispatchEvent(new Event("drawing-changed"));
}

const clearButton = document.getElementById("clear");

clearButton!.addEventListener("click", () => {
  lines.splice(zero, lines.length);
  changeDrawing();
});

const undoButton = document.getElementById("undo");

undoButton!.addEventListener("click", () => {
  if (lines.length > zero) {
    redoLines.push(lines.pop()!);
    changeDrawing();
  }
});

const redoButton = document.getElementById("redo");

redoButton!.addEventListener("click", () => {
  if (redoLines.length > zero) {
    lines.push(redoLines.pop()!);
    changeDrawing();
  }
});
