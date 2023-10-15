import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sticker Sketchpad";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// const ctx = canvas!.getContext("2d");
