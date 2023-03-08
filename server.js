const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);
var path = require("path");
const { Socket } = require('dgram');
let PORT = 3030;



server.listen(PORT, () => {
  console.log("Serveur démarré sur le port :" + PORT);
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));

});

// css
app.get("/style", (req, res) => {
  res.sendFile(path.join(__dirname, '/public/stylesheets/style.css'));
});

app.get("/fontawesome", (req, res) => {
  res.sendFile(path.join(__dirname, '/public/stylesheets/fontawesome-free-6.3.0-web/css/fontawesome.css'));
});

app.get("/reset.min", (req, res) => {
  res.sendFile(path.join(__dirname, '/public/stylesheets/reset.min.css'));
});

// script
app.get("/script", (req, res) => {
  res.sendFile(path.join(__dirname, '/public/javascripts/script.js'));
});

app.get("/tailwindcss", (req, res) => {
  res.sendFile(path.join(__dirname, '/public/javascripts/tailwindcss.js'));
});



let users = {};

io.on('connection', (socket) => {

  console.log('User connected: ' + socket.id);

  // Demander le prénom de l'utilisateur
  socket.emit('request name');

  socket.on('name', (name) => {
    // Stocker l'ID et le prénom de l'utilisateur
    users[socket.id] = { id: socket.id, name: name };

    // Envoyer la liste des utilisateurs connectés à tous les clients
    io.emit('connected users', Object.values(users));
  });

  socket.on('message', (data) => {
    console.log(`Message reçu : ${data}`);

    const message = {
      type: 'recu',
      content: data.content
    };

    // Envoyer le message reçu à tous les autres clients connectés
    socket.broadcast.emit('message', message);

    // Envoyer le message au client qui l'a envoyé
    const response = {
      type: 'envoi',
      content: data.content
    };
    socket.emit('message', response);
  });

  // Gérer la perte de connexion du client
  socket.on('disconnect', () => {
    console.log('utilisateur deconnecte: ' + socket.id);

    // Retirer l'utilisateur déconnecté de la liste
    delete users[socket.id];

    // Envoyer la liste des utilisateurs connectés à tous les clients
    io.emit('connected users', Object.values(users));

  });
});
