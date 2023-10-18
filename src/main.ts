//some code taken from Adam Smith https://shoddy-paint.glitch.me/paint1.html

import "./style.css";

const zero = 0;

const startOfLine = 0;

const emptyCommands = 0;

const firstPoint = 0;

const app: HTMLDivElement = document.querySelector("#app")!;

const thinLine = 4;

const thickLine = 8;

const mouseButtonNumber = 1;

const yDisplacementThin = 4;

const yDisplacementThick = 16;

const xPosition = 8;

let yPosition = yDisplacementThin;

let cursorCommand: CursorCommand | null = null;

let currentIcon = ".";

let displayCursor = true;

let stamping = false;

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

let currentLineThickness: number = thinLine;

canvas.addEventListener("mouseup", (e) => {
  currentLineCommand = null;
  displayCursor = true;
  update("drawing-changed");
  console.log(e);
});

canvas.addEventListener("mousemove", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, currentIcon);
  update("cursor-changed");
  if (e.buttons == mouseButtonNumber) {
    currentLineCommand!.points.push({ x: e.offsetX, y: e.offsetY });
    update("drawing-changed");
  }
});

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new LineCommand(
    e.offsetX,
    e.offsetY,
    currentLineThickness,
    stamping,
    currentIcon
  );
  displayCursor = false;
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

const thinButton = document.getElementById("thin");
thinButton!.addEventListener("click", () => {
  currentIcon = ".";
  yPosition = yDisplacementThin;
  currentLineThickness = thinLine;
  stamping = false;
});

const thickButton = document.getElementById("thick");
thickButton!.addEventListener("click", () => {
  currentIcon = "*";
  yPosition = yDisplacementThick;
  currentLineThickness = thickLine;
  stamping = false;
});

const smileButton = document.getElementById("smile");
smileButton!.addEventListener("click", () => {
  currentIcon = "🙂";
  yPosition = yDisplacementThick;
  stamping = true;
});

const surprisedButton = document.getElementById("surprised");
surprisedButton!.addEventListener("click", () => {
  currentIcon = "😮";
  yPosition = yDisplacementThick;
  stamping = true;
});

const cryButton = document.getElementById("cry");
cryButton!.addEventListener("click", () => {
  currentIcon = "🥲";
  yPosition = yDisplacementThick;
  stamping = true;
});

function update(eventName: string) {
  canvas.dispatchEvent(new Event(eventName));
}

class LineCommand {
  points: { x: number; y: number }[];
  thickness: number;
  stamp: boolean;
  icon: string;
  constructor(
    x: number,
    y: number,
    thicky: number,
    stamp: boolean,
    icon: string
  ) {
    this.points = [{ x, y }];
    this.thickness = thicky;
    this.stamp = stamp;
    this.icon = icon;
  }
  execute() {
    if (this.stamp) {
      ctx!.fillText(
        this.icon,
        this.points[firstPoint].x - xPosition,
        this.points[firstPoint].y + yPosition
      );
    } else {
      ctx!.strokeStyle = "black";
      ctx!.lineWidth = this.thickness;
      ctx!.beginPath();
      const { x, y } = this.points[zero];
      ctx!.moveTo(x, y);
      for (const { x, y } of this.points) {
        ctx!.lineTo(x, y);
      }
      ctx!.stroke();
    }
  }
}

canvas.addEventListener("mouseout", (e) => {
  displayCursor = false;
  cursorCommand = null;
  update("cursor-changed");
  console.log(e);
});

canvas.addEventListener("mouseenter", (e) => {
  displayCursor = true;
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, currentIcon);
  update("cursor-changed");
});

class CursorCommand {
  x: number;
  y: number;
  icon: string;
  constructor(x: number, y: number, icon: string) {
    this.x = x;
    this.y = y;
    this.icon = icon;
  }
  execute() {
    ctx!.font = "32px monospace";
    if (displayCursor) {
      ctx!.fillText(this.icon, this.x - xPosition, this.y + yPosition);
    }
  }
}

function redraw() {
  ctx!.clearRect(zero, zero, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute());

  if (cursorCommand) {
    cursorCommand.execute();
  }
}

canvas.addEventListener("cursor-changed", redraw);

canvas.style.cursor = "none";
