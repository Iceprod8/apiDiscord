const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
var path = require("path");
let PORT = 3030;



server.listen(PORT, () => {
    console.log("Serveur démarré sur le port :"+PORT);
});


app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));

});

app.get("/style", (req,res) => {
    res.sendFile(path.join(__dirname, '/public/stylesheets/style.css'));
});

app.get("/script", (req,res) => {
    res.sendFile(path.join(__dirname, '/public/javascripts/script.js'));
});
