// fonction pour le darkMode
const root = document.querySelector(':root');
document.querySelector("input[type='checkbox']#dark-toggle").addEventListener('click', function () {
  root.classList.toggle('dark-mode');
});

function inputChat() {
  document.getElementById('input').addEventListener('keypress', e => {
    if (e.key === "Enter") {
      e.preventDefault()
      mes()
    }
  })
}


// gestion des envois et des receptions entre le serveurs et le client
var socket = io();

var pseudoActuel = ''
var chatSelect = 'General';



/*

    Log IN

*/

// valeur des input demander (mail, password)
var loginEmail = document.getElementById('email-login');
var loginPassword = document.getElementById('password-login');
// button submit pour recup les donnees du login
var loginSubmit = document.getElementById('button-submit-login');
// message pour dire que les champs sont mal remplit dans les champ login
var loginErreur = document.getElementById('erreur-login')


/*

    Sign IN

*/

// valeur des input demander (pseudo, mail, password)
var signNom = document.getElementById('name-sign');
var signEmail = document.getElementById('email-sign');
var signPassword = document.getElementById('password-sign');
// button submit pour recup les donnees du sign
var signSubmit = document.getElementById('button-submit-sign');
// message pour dire que les champs sont mal remplit dans les champ signIn
var signErreur = document.getElementById('erreur-sign')


/*

    Enregistrement de html avent la supression

*/

// parent html de l'application
var parentAll = document.getElementById('parentAll')


// parent html de la page login, sign In et l'email verif
var parentLogSign = document.getElementById('loginSign')
// Stockez l'html dans une variable
var parentLogSignSauvegarde = parentLogSign.cloneNode(true);


// contient le html de la page login et signIn
var logSign = document.getElementById('container')
// Stockez l'html dans une variable
var logSignSauvegarde = logSign.cloneNode(true);


// contient l'html de toute l'application concernant le chat
var chat = document.getElementById('discord')
// Stockez l'html de l'application pour l'utiliser plus tard
var chatSauvegarde = chat.cloneNode(true);
// Supprimez l'élément de la page
chat.remove();


// contient l'html qui permet de verifier l'email
var emailVerif = document.getElementById('verif-email')
// Stockez l'html pour la verification d'email pour l'utiliser plus tard
var emailVerifSauvegarde = emailVerif.cloneNode(true);
// Supprimez l'élément de la page
emailVerif.remove();


// variable contenant le information pour l'inscription (pseudo, mail, password)
let SignObjet;


/*

    gestion d'un nouvelle utilisateur

*/

signSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  let good = signNom.value.length * signEmail.value.length * signPassword.value.length;
  if (good !== 0) {
    if (signPassword.value.length > 8) {
      SignObjet = {
        pseudo: signNom.value,
        email: signEmail.value,
        password: signPassword.value
      }
      socket.emit('sign', SignObjet);
      socket.on('verifEmail', (exist) => {
        if (exist) {
          // Supprimez l'élément de la page
          logSign.remove();

          // pour verif l'email on afficher l'element suprimer qui permet de verif l'email
          parentLogSign.appendChild(emailVerifSauvegarde);


          /*

              Email Verification

          */
          socket.on('verif', code => {
            // valeur du code de verification
            var codeEmail = document.getElementById('verif-email-text')
            //bouton pour valider l'entre
            var suivant = document.getElementById('next')
            //bouton pour retourner en arriere
            var retour = document.getElementById('retour')
            // message pour dire que le code n'est pas le bon ou que l'adresse mail n'existe pas
            var erreurVerif = document.getElementById('erreur-verif')


            // verification de l'email apres la saisie du code
            suivant.addEventListener('click', (e) => {
              e.preventDefault();
              if (codeEmail.value == code) {
                pseudoActuel = valide.pseudo
                // Supprimez l'élément de la page
                parentLogSign.remove();
                // ajout de l'application du chat
                parentAll.appendChild(chatSauvegarde);
                // envoie des donner vers la base de donne
                socket.emit('register', SignObjet);
                socket.emit('syncMessage', chatSelect)
                inputChat()
              } else {
                erreurVerif.innerText = "Incorrect code or email does not exist"
              }
            });
          })
        } else {
          signErreur.innerText = "Email already use "
        }
      })
    } else {
      signErreur.innerText = "Password too short "
    }
  } else {
    signErreur.innerText = "Fields not filled"
  }
})


/*

    gestion d'une connexion d'un utilisateur deja existant

*/

loginSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  var good = loginEmail.value.length * loginPassword.value.length
  if (good !== 0) {
    const LoginObjet = {
      email: loginEmail.value,
      password: loginPassword.value
    }
    socket.emit('login', LoginObjet)
    socket.on('login', valide => {
      if (valide.exists) {
        pseudoActuel = valide.pseudo
        // Supprimez l'élément de la page
        parentLogSign.remove();
        // ajout de l'application du chat
        parentAll.appendChild(chatSauvegarde);
        socket.emit('syncMessage', chatSelect)
        inputChat()
      } else {
        loginErreur.innerHTML = "Incorrect email or password"
      }
    })
  } else {
    loginErreur.innerHTML = "Fields not filled"
  }
})


/*

    gestion des utilisateurs en ligne

*/


socket.on('connected users', (users) => {
  // list des utilisateur connecter
  let userList = document.getElementById('utilisateur-list');
  // Effacer la liste précédente des utilisateurs connectés
  userList.innerHTML = '';

  // Ajouter chaque utilisateur connecté à la liste
  let userItems = users.map((user) => {
    if (pseudoActuel === user.name) {
      let listItem = document.createElement('li');
      listItem.innerHTML = 'You';
      return listItem;
    } else if (pseudoActuel !== user.name) {
      let listItem = document.createElement('li');
      listItem.innerHTML = `<button onclick="selectionChat('${user.name}')" class="button-user">${user.name}</button>`;
      return listItem;
    }
  });
  userItems.forEach((item) => {
    userList.appendChild(item);
  });
});



/*

    gestion des envoi et des recu de message

*/


/*

    Syncronisation des messages

*/
socket.on('sync', (Allmessages) => {
  var messagelist = document.getElementById('messages');
  messagelist.innerHTML = '';
  console.log(Allmessages)
  let messages = Allmessages.map((message) => {
    if (message.emetteur === pseudoActuel) {
      if(message.destinataire === chatSelect){
        let listItem = document.createElement('li');
        listItem.classList.add("envoi");
        listItem.innerHTML = `${message.content}`;
        return listItem;
      }
    } else if (message.destinataire === chatSelect) {
      let listItem = document.createElement('li');
      listItem.classList.add("recu")
      listItem.innerHTML = `${message.content}`;
      return listItem;
    } else if (message.emetteur === chatSelect){
      if(message.destinataire === pseudoActuel){
        let listItem = document.createElement('li');
        listItem.classList.add("recu")
        listItem.innerHTML = `${message.content}`;
        return listItem;
      }
    }
  });
  messages.forEach((item) => {
    if(item !== undefined){
      messagelist.appendChild(item);
    }
  });


})

function selectionChat(pseudo) {
  chatSelect = pseudo;
  socket.emit('syncMessage', chatSelect)
}

/*

    Chat Discord

*/

function mes() {
  var input = document.getElementById('input')
  let message = input.value;
  let messageObject = {
    emetteur: pseudoActuel,
    destinataire: chatSelect,
    date: new Date(),
    content: message
  };
  socket.emit('message', messageObject);
  input.value = '';
}


socket.on('message', (data) => {
  var messages = document.getElementById('messages')
  let listItem = document.createElement('li');
  if (data.emetteur === pseudoActuel) {
    listItem.classList.add("envoi")
    listItem.innerHTML = data.content;
  } else if (data.destinataire === chatSelect) {
    listItem.classList.add("recu")
    listItem.innerHTML = data.content;
  }
  messages.appendChild(listItem);
});

// gestion de la deconnection
socket.on('disconnect', () => {
  console.log('Déconnecté du serveur : ' + socket.id);
});
