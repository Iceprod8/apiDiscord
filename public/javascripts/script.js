// fonction pour le darkMode
function darkModeListener() {
  document.querySelector("html").classList.toggle("dark");
}

document.querySelector("input[type='checkbox']#dark-toggle").addEventListener("click", darkModeListener);



// gestion des envois et des receptions
var socket = io();


// parent de la page login et sign In
var parentLogSign = document.getElementById('loginSign')

// trouver l'element a supprimer
var chat = document.getElementById('discord')
// Stockez le chat supprimé dans une variable
const chatSauvegarde = chat.cloneNode(true);
// Supprimez l'élément de la page
chat.remove();


// trouver l'element a supprimer
var emailVerif = document.getElementById('verif-email')
// Stockez le chat supprimé dans une variable
const emailVerifSauvegarde = emailVerif.cloneNode(true);
// Supprimez l'élément de la page
emailVerif.remove();

var loginEmail = document.getElementById('email-login');
var loginPassword = document.getElementById('password-login');
var loginSubmit = document.getElementById('button-submit-login');

var signNom = document.getElementById('name-sign');
var signEmail = document.getElementById('email-sign');
var signPassword = document.getElementById('password-sign');
var signSubmit = document.getElementById('button-submit-sign');

var signErreur = document.getElementById('erreur-sign')

var logSign = document.getElementById('container')

loginSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  console.log(loginEmail.value)
  const LoginObjet = {
    email: loginEmail.value,
    password: loginPassword.value
  }
})


signSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  var good = signNom.value.length * signEmail.value.length * signPassword.value.length;
  if (good !== 0) {
    if (signPassword.value.length > 8) {
      const SignObjet = {
        pseudo: signNom.value,
        email: signEmail.value,
        password: signPassword.value
      }
      // Stockez l'élément supprimé dans une variable
      const logSignSauvegarde = logSign.cloneNode(true);
      // Supprimez l'élément de la page
      logSign.remove();

      // pour verif l'email on afficher l'element suprimer qui permet de verif l'email
      parentLogSign.appendChild(emailVerifSauvegarde);

      socket.emit('sign', SignObjet);
    }else{
      signErreur.innerText = "Password too short "
    }
  }else{
    signErreur.innerText = "Fields not filled"
  }
})

// gestion des utilisateurs en ligne
const userList = document.getElementById('utilisateur-list');

socket.on('connected users', (users) => {
  // Effacer la liste précédente des utilisateurs connectés
  userList.innerHTML = '';

  // Ajouter chaque utilisateur connecté à la liste
  const userItems = users.map((user) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = user.name;
    return listItem;
  });
  userItems.forEach((item) => {
    userList.appendChild(item);
  });
});


// gestion des envoi et des recu de message
var messages = document.getElementById('messages')
var input = document.getElementById('input')
var button = document.getElementById('button')


button.addEventListener('click', (event) => {
  event.preventDefault();
  const message = input.value;

  const messageObject = {
    type: 'envoi',
    content: message
  };

  socket.emit('message', messageObject);
});

socket.on('message', (data) => {
  const listItem = document.createElement('li');
  if (data.type === 'recu') {
    listItem.classList.add("recu")
    listItem.innerHTML = data.content;
  } else if (data.type === 'envoi') {
    listItem.classList.add("envoi")
    listItem.innerHTML = data.content;
  }

  messages.appendChild(listItem);
});

// gestion de la deconnection
socket.on('disconnect', () => {
  console.log('Déconnecté du serveur : ' + socket.id);
});
