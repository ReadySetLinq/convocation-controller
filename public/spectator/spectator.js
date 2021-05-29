"use strict";

// HyperDeck control elements on the HTML page
let program = document.getElementById("program");
let lastStudent = document.getElementById("last");
let currentStudent = document.getElementById("current");
let nextStudent = document.getElementById("next");
let nextData = {};
let updateDelay = 300;

// Websocket used to communicate with the Python server backend
let ws = new WebSocket("ws://192.168.86.96:8181");

// Generate a "random" uuid
const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

ws.onopen = () => {
  const message = {
    service: "spectator",
    data: {
      action: "join",
      uuid: `spectatorJoin-${uuidv4()}`,
    },
  };
  ws.send(JSON.stringify(message));
};

ws.onclose = () => {
  window.location.reload();
};

// Websocket message parsing
ws.onmessage = (wsMessage) => {
  console.log(wsMessage.data);
  const msg = JSON.parse(wsMessage.data);
  if (msg.service === undefined || msg.service === null) return;

  if (msg.service === "spectator") {
    if (msg.data === undefined || msg.data === null) return;
    const data = msg.data;
    const lastData = { ...nextData };
    nextData = { ...data };
    console.log("lastData", lastData);
    console.log("nextData", nextData);

    if (
      Object.entries(lastData).toString() ===
      Object.entries(nextData).toString()
    )
      return;

    if (
      lastData.program &&
      nextData.program &&
      lastData.program !== nextData.program
    )
      program.innerHTML = "";

    lastStudent.innerHTML = "";
    currentStudent.innerHTML = "";
    nextStudent.innerHTML = "";
    setTimeout(() => {
      program.innerHTML = nextData.program ? nextData.program : "";
      lastStudent.innerHTML = nextData.last ? nextData.last : "";
      currentStudent.innerHTML = nextData.current ? nextData.current : "";
      nextStudent.innerHTML = nextData.next ? nextData.next : "";
    }, updateDelay);
  }
};

window.onload = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("delay")) updateDelay = urlParams.get("delay");
};

window.onerror = (error) => {
  console.error(error);
  setTimeout(() => {
    window.location.reload();
  }, 5000);
};
