//some code taken from Adam Smith https://shoddy-paint.glitch.me/paint1.html

import "./style.css";

//const variables

const emptyCommands = 0;

const firstPoint = 0;

const startOfLine = 0;

const zero = 0;

const inverseCanvasScale = 0.25;

const mouseButtonNumber = 1;

const canvasScale = 4;

const thinLine = 4;

const yDisplacementThin = 4;

const thickLine = 8;

const xPosition = 8;

const hex = 16;

const yDisplacementThick = 16;

const baseFontSize = 32;

const commands: LineCommand[] = [];

const redoCommands: LineCommand[] = [];

//global variables

let currentLineCommand: LineCommand | null = null;

let currentLineThickness: number = thinLine;

let yPosition = yDisplacementThin;

let cursorCommand: CursorCommand | null = null;

let currentIcon = ".";

let displayCursor = true;

let stamping = false;

let currentColor = "000000";

//page configuration

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sticker Sketchpad";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
canvas.style.cursor = "none";

//-------------------------------------------
//            event listeners
//-------------------------------------------

//mouse events

canvas.addEventListener("mouseup", () => {
  currentLineCommand = null;
  displayCursor = true;
  update("drawing-changed");
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
    baseFontSize,
    currentColor
  );
  displayCursor = false;
  commands.push(currentLineCommand);
  redoCommands.splice(startOfLine, redoCommands.length);
  update("drawing-changed");
});

canvas.addEventListener("mouseout", () => {
  displayCursor = false;
  cursorCommand = null;
  update("cursor-changed");
});

canvas.addEventListener("mouseenter", (e) => {
  displayCursor = true;
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, currentIcon);
  update("cursor-changed");
});

//custom events

canvas.addEventListener("drawing-changed", redraw);

canvas.addEventListener("cursor-changed", redraw);

//-------------------------------------------
//                buttons
//-------------------------------------------

const clearButton = document.getElementById("clear");
clearButton!.addEventListener("click", () => {
  commands.splice(startOfLine, commands.length);
  redoCommands.splice(startOfLine, redoCommands.length);
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

//Stamp buttons and custom button

const smileButton = document.getElementById("smile");
const cryButton = document.getElementById("cry");
const surprisedButton = document.getElementById("surprised");
const stampList: { buttonName: HTMLElement; icon: string }[] = [
  { buttonName: smileButton!, icon: "🙂" },
  { buttonName: cryButton!, icon: "🥲" },
  { buttonName: surprisedButton!, icon: "😮" },
];
function addButtons(stampList: { buttonName: HTMLElement; icon: string }[]) {
  stampList.forEach((element) => {
    element.buttonName.addEventListener("click", () => {
      currentIcon = element.icon;
      yPosition = yDisplacementThick;
      stamping = true;
      stampList.pop();
    });
  });
}
addButtons(stampList);

const customButton = document.getElementById("custom");
customButton!.addEventListener("click", () => {
  let lastIcon = "🧽";
  let text = prompt("Custom sticker text", `${lastIcon}`);
  if (text == null || text == "") {
    text = lastIcon;
  }
  lastIcon = text;
  currentIcon = text!;
  yPosition = yDisplacementThick;
  stamping = true;
  const customStamp = document.createElement("button") as HTMLElement;
  const buttons: HTMLDivElement = document.querySelector("#buttons")!;
  customStamp.innerHTML = text;
  buttons.append(customStamp);
  stampList.push({ buttonName: customStamp, icon: text });
  addButtons(stampList);
});

//export button

const exportButton = document.getElementById("export");
exportButton!.addEventListener("click", () => {
  const canvasToExport = document.createElement("canvas");
  canvasToExport.width = 1024;
  canvasToExport.height = 1024;
  const exportContext = canvasToExport.getContext("2d");
  commands.forEach((cmd) => cmd.scale(canvasScale));
  commands.forEach((cmd) => cmd.execute(exportContext));
  commands.forEach((cmd) => cmd.scale(inverseCanvasScale));

  const anchor = document.createElement("a");
  anchor.href = canvasToExport.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

//color slider configuration and functionality

const slider = document.getElementById("slider") as HTMLInputElement;
slider.style.accentColor = currentColor;

slider.addEventListener("input", () => {
  const color = Math.round(Number(slider.value)).toString(hex);
  if (color == "0") {
    currentColor = "000000";
  } else {
    currentColor = color;
  }
  slider.style.accentColor = `#${currentColor}`;
});

//-------------------------------------------
//                classes
//-------------------------------------------

class LineCommand {
  points: { x: number; y: number }[];
  thickness: number;
  stamp: boolean;
  icon: string;
  fontSize: number;
  color: string;
  constructor(
    x: number,
    y: number,
    thicky: number,
    stamp: boolean,
    icon: string,
    fontSize: number,
    color: string
  ) {
    this.points = [{ x, y }];
    this.thickness = thicky;
    this.stamp = stamp;
    this.icon = icon;
    this.fontSize = fontSize;
    this.color = color;
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
      ctx!.strokeStyle = `#${this.color}`;
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

//-------------------------------------------
//             gloabal functions
//-------------------------------------------

function redraw() {
  ctx!.clearRect(zero, zero, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute(ctx));

  if (cursorCommand) {
    cursorCommand.execute();
  }
}

function update(eventName: string) {
  canvas.dispatchEvent(new Event(eventName));
}
