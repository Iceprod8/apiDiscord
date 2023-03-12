const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');

/*

    Mise en place de la connection a la BDD

*/
const mongoose = require('mongoose');
const uri = 'mongodb+srv://CyberSite:BCqyr28eVMnm9htN@cluster0.c6zinmu.mongodb.net/SioDiscord';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('Connected to MongoDB Atlas')).catch((err) => console.error('Error connecting to MongoDB Atlas', err));
// creation du schema de la BDD user
const userSchema = new mongoose.Schema({
  pseudo: String,
  email: String,
  password: String,
  inscription: Date,
  lastConnexion: Date,
});
const User = mongoose.model('User', userSchema);

// creation du schema de la BDD message
const messageSchema = new mongoose.Schema({
  emetteur: String,
  destinataire: String,
  date: Date,
  content: String,
});
const Message = mongoose.model('Message', messageSchema);



const io = new Server(server);
var path = require("path");
const { Socket } = require('dgram');
let PORT = 3030;

/*

  Service permetant l'envoie d'email en utilisant SMTP

*/
// Créer un transporteur SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true pour les ports 465, false pour les autres ports
  auth: {
    user: "sio2discord123@gmail.com", // adresse email de l'expéditeur
    pass: "wglxikcujsfeqxtx" // mot de passe de l'expéditeur
  }
});

/*

    Fonction pour generer le code d'authenfication

*/
// generation d'un code aleatoire pour verifier l'email
function generateRandomCode() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


/*

    Fonction pour envoyer un email

*/

// Vérifier si l'email existe
async function checkEmailExistence(email, code) {
  // Définir le destinataire de l'email
  const mailOptions = {
    from: "sio2discord123@gmail.com",
    to: email,
    subject: "Vérification de l'adresse email",
    text: `Voici votre code d'authenfication \n ${code}`
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

/*

    Routage

*/
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

// JSON des utilisateur connecter pour les envoyer plus tard permetant de savoir qui est en ligne
let listUsers = {};


/*

    Gestion des envoies et des recus entre le client et le server

*/

io.on('connection', (socket) => {
  // permet de cree la date d'aujourd'hui
  var today = new Date();

  /*

    Verification si l'email est deja presente dans la BDD et envoi d'un email contenant un code d'authenfication

  */
  socket.on('sign', (sign) => {
    // creation du code aleatoire qui permetera de verifier si le code envoyer par mail est bon
    const code = generateRandomCode();
    // permet de trouver si l'email existe ou pas
    User.find({ email: sign.email })
      .then((users) => {
        if (users.length > 0) {
          socket.emit('verifEmail', false);
          // si elle existe retourne true
        } else {
          socket.emit('verifEmail', true);
          // Utilisation de la fonction pour vérifier si l'email existe et permet d'envoyer un email contenant le code
          checkEmailExistence(sign.email, code).then(exists => {
            if (exists) {
              console.log("L'email existe.");
              socket.emit('verif', code);
            } else {
              console.log("L'email n'existe pas.");
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  })

  /*

    Verification si l'email est deja presente dans la BDD et envoi d'un email contenant un code d'authenfication

  */

  socket.on('register', (user) => {
    // recupere le password rentrer par l'utilisateur
    const plainPassword = user.password;
    // obtient un salage pour hash le code apres
    const saltRounds = 10;
    // permet de hasher le password avant de le rentrer dans la BDD
    bcrypt.hash(plainPassword, saltRounds, async function (err, hash) {
      if (err) {
        console.log(err)
      }
      // connection a la BDD en entrant les donne du nouvelle utilisateur
      try {
        const updatedUser = await User.findOneAndUpdate(
          {
            pseudo: user.pseudo,
            email: user.email,
            password: hash
          },
          {
            $setOnInsert: { inscription: today },
            $set: { lastConnexion: today }
          },
          {
            upsert: true,
            new: true
          }
        );
      } catch (error) {
        console.error(error);
      }
    })
    // Stocker l'ID et le prénom de l'utilisateur
    listUsers[socket.id] = { id: socket.id, name: user.pseudo };
    // Envoyer la liste des utilisateurs connectés à tous les clients
    io.emit('connected users', Object.values(listUsers));
  });
  /*

     Verification si l'email et le mot de passe sont bien valide et envoi le resultat au client

  */

  socket.on('login', login => {
    User.find({ email: login.email }).then((users) => {
      bcrypt.compare(login.password, users[0].password).then((result) => {
        if (result) {
          log = {
            exists: true,
            pseudo: users[0].pseudo
          }
          socket.emit('login', log)
          // Stocker l'ID et le prénom de l'utilisateur
          listUsers[socket.id] = { id: socket.id, name: users[0].pseudo };
          // Envoyer la liste des utilisateurs connectés à tous les clients
          io.emit('connected users', Object.values(listUsers));
        } else {
          log = {
            exists: false,
          }
          socket.emit('login', log)
        }
      })
        .catch((error) => {
          console.error(error);
          log = {
            exists: false,
          }
          socket.emit('login', log)
        });
    })
      .catch((err) => {
        console.error(err);
        log = {
          exists: false,
        }
        socket.emit('login', log)
      });
  })

  /*

    Service d'envoie de message

  */
  socket.on('syncMessage', pseudo => {
    Message.find({
      $or: [
        { emetteur: pseudo },
        { destinataire: pseudo }
      ]
    }).then((chat) => {
      console.log(chat)
      socket.emit('sync', chat)
    }).catch((err) => {
      console.error(err);
    });
  })
  socket.on('message', (data) => {
    console.log(`Message reçu : ${data.content}`);
    /*

     implemantation du message dans la bdd message

     */
    // creation d'un objet message
    const newMessage = new Message({
      emetteur: data.emetteur,
      destinataire: data.destinataire,
      date: data.date,
      content: data.content
    });

    // Enregistrer l'utilisateur dans la base de données
    newMessage.save().then(() => {
      console.log("message saved successfully");
    }).catch((error) => {
      console.log("Error saving user: ", error);
    });
    // Envoyer le message reçu à tous les autres clients connectés
    socket.broadcast.emit('message', data);
    // Envoyer le message au client qui l'a envoyé
    socket.emit('message', data);
  });


  // Gérer la perte de connexion du client
  socket.on('disconnect', () => {
    console.log('utilisateur deconnecte: ' + socket.id);

    // Retirer l'utilisateur déconnecté de la liste
    delete listUsers[socket.id];

    // Envoyer la liste des utilisateurs connectés à tous les clients
    io.emit('connected users', Object.values(listUsers));
  });
});
