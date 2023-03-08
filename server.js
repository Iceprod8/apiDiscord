const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
var path = require("path");
const { Socket } = require('dgram');
let PORT = 3030;



server.listen(PORT, () => {
    console.log("Serveur démarré sur le port :"+PORT);
});


app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));

});

// css
app.get("/style", (req,res) => {
    res.sendFile(path.join(__dirname, '/public/stylesheets/style.css'));
});

app.get("/fontawesome", (req,res) => {
  res.sendFile(path.join(__dirname, '/public/stylesheets/fontawesome-free-6.3.0-web/css/fontawesome.css'));
});

app.get("/reset.min", (req,res) => {
  res.sendFile(path.join(__dirname, '/public/stylesheets/reset.min.css'));
});

// script
app.get("/script", (req,res) => {
    res.sendFile(path.join(__dirname, '/public/javascripts/script.js'));
});

app.get("/tailwindcss", (req,res) => {
  res.sendFile(path.join(__dirname, '/public/javascripts/tailwindcss.js'));
});


io.on('connection', (socket) =>{
  socket.on('set-pseudo', (pseudo) =>{
    console.log(pseudo + " vient de se connecter à "+ new Date());
    socket.nickname = pseudo
  });
});
