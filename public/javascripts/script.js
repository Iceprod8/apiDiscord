
// fonction pour le darkMode
function darkModeListener() {
  document.querySelector("html").classList.toggle("dark");
}

document.querySelector("input[type='checkbox']#dark-toggle").addEventListener("click", darkModeListener);

// gestion des envois et des receptions
var socket = io();

// gestion du pseudo
const nomDialog = document.getElementById('nomDiscord');
const nomInput = document.getElementById('nom-input');
const nomSubmit = document.getElementById('nom-submit');

socket.on('request name', () => {
  // Afficher la boîte de dialogue pour demander le prénom
  nomDialog.style.display = 'block';

  // Envoyer le prénom de l'utilisateur lorsque le bouton est cliqué
  nomSubmit.onclick = () => {
    const nom = nomInput.value;
    if (nom) {
      socket.emit('name', nom);
      nomDialog.style.display = 'none';
    }
  };
});

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
