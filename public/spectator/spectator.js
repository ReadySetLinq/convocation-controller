"use strict";

// HyperDeck control elements on the HTML page
let program = document.getElementById("state");
let lastStudent = document.getElementById("last");
let currentStudent = document.getElementById("current");
let nextStudent = document.getElementById("next");
let nextData = {};

// Websocket used to communicate with the Python server backend
let ws = new WebSocket("ws://" + window.location.host + "/ws");

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
        const lastData = Object.assign({}, nextData);
        nextData = data;
        if (
          lastData.program &&
          nextData.program &&
          lastData.program != nextData.program
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
        }, 500);
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
