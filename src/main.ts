import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sticker Sketchpad";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas!.getContext("2d");

ctx!.fillStyle = "green";
ctx!.fillRect(10, 10, 150, 100);
