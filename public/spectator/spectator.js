"use strict";

// HyperDeck control elements on the HTML page
let program = document.getElementById("state");
let lastStudent = document.getElementById("last");
let currentStudent = document.getElementById("current");
let nextStudent = document.getElementById("next");

// Websocket used to communicate with the Python server backend
let ws = new WebSocket("ws://" + window.location.host + "/ws");

ws.onopen = () => {
  const command = {
    command: "spectator-join",
  };
  ws.send(JSON.stringify(command));
};

ws.onclose = (e) => {
  window.location.reload();
};

// Websocket message parsing
ws.onmessage = (message) => {
  const msg = JSON.parse(message);
  if (msg.service === undefined || msg.service === null) return;

  if (msg.service === "spectator") {
    const data = JSON.parse(message.data);
    if (data.action === undefined || data.action === null) return;

    switch (data.action) {
      case "update":
        program.innerHTML = data.program ? data.program : "";
        lastStudent.innerHTML = data.last ? data.last : "";
        currentStudent.innerHTML = data.current ? data.current : "";
        nextStudent.innerHTML = data.next ? data.next : "";
        break;
      default:
        break;
    }
  }
};

window.onerror = function (error) {
  setTimeout(() => {
    window.location.reload();
  }, 5000);
};
