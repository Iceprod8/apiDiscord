const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require('mongodb');
const nodemailer = require("nodemailer");

// connexion a la BDD pour les utilisateurs
const uri = "mongodb+srv://AppSecurityPartner:EEpwNzf1LM6R95S0 @cluster0.bguu1an.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const io = new Server(server);
var path = require("path");
const { Socket } = require('dgram');
let PORT = 3030;


// Créer un transporteur SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 25,
    secure: false, // true pour les ports 465, false pour les autres ports
    auth: {
        user: "sio2discord123@gmail.com", // adresse email de l'expéditeur
        pass: "sioDiscord123456789" // mot de passe de l'expéditeur
    }
});


// Vérifier si l'email existe
async function checkEmailExistence(email) {
  // Définir le destinataire de l'email
  const mailOptions = {
      from: "sio2discord123@gmail.com",
      to: email,
      subject: "Vérification de l'adresse email",
      text: "Veuillez ignorer ce message s'il vous plaît."
  };

  try {
    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé : %s", info.messageId);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}


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

  socket.on('sign', (sign) => {
    // Utilisation de la fonction pour vérifier si l'email existe
    checkEmailExistence(sign.email).then(exists => {
      if (exists) {
        console.log("L'email existe.");
      } else {
        console.log("L'email n'existe pas.");
      }
    });
  })

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
