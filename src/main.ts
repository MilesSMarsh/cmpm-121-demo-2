//some code taken from Adam Smith https://shoddy-paint.glitch.me/paint1.html

import "./style.css";

const zero = 0;

const startOfLine = 0;

const emptyCommands = 0;

const app: HTMLDivElement = document.querySelector("#app")!;

// const cursor = { active: false, x: zero, y: zero };

const gameName = "Sticker Sketchpad";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];

let currentLineCommand: LineCommand | null = null;

canvas.addEventListener("mouseup", (e) => {
  currentLineCommand = null;
  update("drawing-changed");
  console.log(e);
});

canvas.addEventListener("mousemove", (e) => {
  const mouseButtonNumber = 1;
  if (e.buttons == mouseButtonNumber) {
    currentLineCommand!.points.push({ x: e.offsetX, y: e.offsetY });
    update("drawing-changed");
  }
});

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new LineCommand(e.offsetX, e.offsetY);
  commands.push(currentLineCommand);
  redoCommands.splice(startOfLine, redoCommands.length);
  update("drawing-changed");
});

canvas.addEventListener("drawing-changed", redraw);

const clearButton = document.getElementById("clear");

clearButton!.addEventListener("click", () => {
  commands.splice(startOfLine, commands.length);
  update("drawing-changed");
});

const undoButton = document.getElementById("undo");

undoButton!.addEventListener("click", () => {
  if (commands.length > emptyCommands) {
    redoCommands.push(commands.pop()!);
    update("drawing-changed");
  }
});

const redoButton = document.getElementById("redo");

redoButton!.addEventListener("click", () => {
  if (redoCommands.length > emptyCommands) {
    commands.push(redoCommands.pop()!);
    update("drawing-changed");
  }
});

function redraw() {
  ctx!.clearRect(zero, zero, canvas.width, canvas.height);

  commands.forEach((cmd) => cmd.execute());
}

function update(eventName: string) {
  canvas.dispatchEvent(new Event(eventName));
}

class LineCommand {
  points: { x: number; y: number }[];
  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }
  execute() {
    ctx!.strokeStyle = "black";
    //ctx!.strokeWidth = 4;
    ctx!.beginPath();
    const { x, y } = this.points[zero];
    ctx!.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx!.lineTo(x, y);
    }
    ctx!.stroke();
  }
  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}
