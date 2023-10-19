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

const baseFontSize = 32;

let yPosition = yDisplacementThin;

let cursorCommand: CursorCommand | null = null;

let currentIcon = ".";

let displayCursor = true;

let stamping = false;

const canvasScale = 4;

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
    currentIcon,
    baseFontSize
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

const customButton = document.getElementById("custom");
customButton!.addEventListener("click", () => {
  let lastIcon = "🧽";
  let text = prompt("Custom sticker text", `${lastIcon}`);
  if (text == null || text == "") {
    text = lastIcon;
  }
  lastIcon = text;
  customButton!.innerHTML = `Custom: ${text}`;
  currentIcon = text!;
  yPosition = yDisplacementThick;
  stamping = true;
});

const exportButton = document.getElementById("export");
exportButton!.addEventListener("click", () => {
  const canvasToExport = document.createElement("canvas");
  canvasToExport.width = 1024;
  canvasToExport.height = 1024;
  const exportContext = canvasToExport.getContext("2d");
  commands.forEach((cmd) => cmd.scale(canvasScale));
  commands.forEach((cmd) => cmd.execute(exportContext));

  const anchor = document.createElement("a");
  anchor.href = canvasToExport.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

function update(eventName: string) {
  canvas.dispatchEvent(new Event(eventName));
}

class LineCommand {
  points: { x: number; y: number }[];
  thickness: number;
  stamp: boolean;
  icon: string;
  fontSize: number;
  constructor(
    x: number,
    y: number,
    thicky: number,
    stamp: boolean,
    icon: string,
    fontSize: number
  ) {
    this.points = [{ x, y }];
    this.thickness = thicky;
    this.stamp = stamp;
    this.icon = icon;
    this.fontSize = fontSize;
  }
  execute(ctx: CanvasRenderingContext2D | null) {
    if (this.stamp) {
      ctx!.font = `${this.fontSize}px monospace`;
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

  scale(scalar: number) {
    this.points.forEach((element) => {
      element.x *= scalar;
      element.y *= scalar;
    });
    this.fontSize *= scalar;
    this.thickness *= scalar;
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
  commands.forEach((cmd) => cmd.execute(ctx));

  if (cursorCommand) {
    cursorCommand.execute();
  }
}

canvas.addEventListener("cursor-changed", redraw);

canvas.style.cursor = "none";
