const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour12: false,
}; // options pour spécifier le format de date souhaité


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

let utilisateurBloquer = []


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
            var retour = document.getElementById('back')
            // message pour dire que le code n'est pas le bon ou que l'adresse mail n'existe pas
            var erreurVerif = document.getElementById('erreur-verif')


            // verification de l'email apres la saisie du code
            suivant.addEventListener('click', (e) => {
              e.preventDefault();
              if (codeEmail.value == code) {
                pseudoActuel = SignObjet.pseudo
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

            retour.addEventListener('click', function () {
              location.reload();
            })
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
  userList.innerHTML = `
  <li class="general">
    <button onclick="selectionChat('General')" class="button-general">
      <svg style="height: 25px;margin: 0 10px 0px 0px;fill: var(--color-text);" id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 237.6 152.51">
        <defs>
          <style>
            .cls-1 {
              fill: var(--card);
            }

            .cls-2 {
              fill: var(--color-text);
            }
          </style>
        </defs>
        <g>
          <path class="cls-2" d="m180.58,120.02c19.57,0,34.23-2.07,56.96-9.13.06-.82.07-1.71.07-2.92-.1-20.39-12.2-32.78-33.35-39.83-6.17,3.45-17.92,6.38-25.49,6.38s-19.31-2.92-25.48-6.38c-21.14,7.04-33.35,19.44-33.35,39.83,0,1.3.05,2.29.13,3.13,21.92,6.85,39.67,8.92,60.51,8.92Z"/>
          <path class="cls-2" d="m178.77,0c-17.64,0-31.99,14.53-31.99,32.39s14.35,32.39,31.99,32.39,31.99-14.53,31.99-32.39S196.41,0,178.77,0Z"/>
        </g>
        <g>
          <path class="cls-2" d="m60.64,120.02c19.57,0,34.22-2.07,56.96-9.13.06-.82.07-1.71.07-2.92-.1-20.39-12.2-32.78-33.35-39.83-6.17,3.45-17.92,6.38-25.49,6.38s-19.31-2.92-25.48-6.38C12.21,75.19,0,87.58,0,107.97c0,1.3.05,2.29.13,3.13,21.92,6.85,39.67,8.92,60.51,8.92Z"/>
          <path class="cls-2" d="m58.83,0c-17.64,0-31.99,14.53-31.99,32.39s14.35,32.39,31.99,32.39,31.99-14.53,31.99-32.39S76.47,0,58.83,0Z"/>
        </g>
        <path class="cls-1" d="m185.88,132.18c-.11-22.77-12.95-38.68-38.17-47.33,7-7.32,11.32-17.26,11.32-28.22,0-22.41-18.05-40.64-40.23-40.64s-40.23,18.23-40.23,40.64c0,10.95,4.32,20.9,11.32,28.22-25.32,8.68-38.17,24.6-38.17,47.37,0,1.47.05,2.75.17,3.91l.52,5.45,5.22,1.63c21.13,6.6,39.37,9.29,62.97,9.29,21.27,0,36.81-2.49,59.4-9.5l5.37-1.67.4-5.61c.08-1.12.09-2.24.09-3.55Z"/>
        <g>
          <path class="cls-2" d="m120.61,144.27c19.57,0,34.23-2.07,56.96-9.12.06-.82.07-1.71.07-2.92-.1-20.39-12.2-32.79-33.35-39.83-6.17,3.45-17.92,6.37-25.49,6.37s-19.31-2.91-25.48-6.37c-21.14,7.04-33.35,19.44-33.35,39.83,0,1.29.05,2.29.13,3.12,21.92,6.86,39.67,8.93,60.51,8.93Z"/>
          <path class="cls-2" d="m118.8,24.24c-17.64,0-31.99,14.53-31.99,32.4s14.35,32.39,31.99,32.39,31.99-14.53,31.99-32.39-14.35-32.4-31.99-32.4Z"/>
        </g>
      </svg>
      <p class='userP'>General</p>
    </button>
  </li>`;

  // Ajouter chaque utilisateur connecté à la liste
  let userItems = users.map((user) => {
    if (pseudoActuel === user.name) {
      return null;
    } else if (pseudoActuel !== user.name) {
      let listItem = document.createElement('li');
      listItem.classList.add('user')
      listItem.innerHTML = `
      <div id="chatbutton-${user.name}">
        <button class="button-user" onclick="selectionChat('${user.name}')">
          <svg style="height: 25px;margin: 0 10px 0px 0px;fill: var(--color-text);" id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 571.22 685.2">
            <path d="m116.89,151.95C123.22,68.06,197.87-6.83,295.06.5c84.77,6.37,155.36,80.87,151.58,170.25-2.15,91.26-81.18,162.09-169.37,159.7-91.77-2.47-167.66-82.14-160.38-178.49Z"/>
            <path d="m571.22,574.75c-.04,53.79-36.99,97.27-89.9,107.58-4.74.92-9.44,1.91-14.17,2.87H104.59c-5.14-1.08-10.31-2.03-15.45-3.15-48.97-10.63-81.78-46.35-87.55-96.19-3.46-29.62-.76-59.17,3.38-88.55,3.62-25.64,9.2-50.8,19.43-74.69,13.58-31.73,32.01-59.56,63.62-76.45,19.51-10.39,40.41-15.37,62.27-14.93,6.89.12,14.17,3.66,20.46,7.09,10.15,5.53,19.59,12.3,29.38,18.47,29.62,18.63,61.71,28.71,96.95,26,25.68-1.99,49.45-10.59,71.47-23.93,7.8-4.74,15.85-9.24,22.93-14.97,17.92-14.45,37.78-14.61,58.85-9.95,40.45,8.88,68.48,33.21,87.79,69,16.32,30.22,25.12,62.79,28.95,96.55,2.83,24.92,4.14,50.17,4.14,75.25Z"/>
          </svg>
          <p class='userP'>${user.name}</p>
        </button>
        </div>
        <div id="${user.name}">
          <button onclick="bloque('${user.name}')">Bloquer</button>
        </div>`;
      return listItem;
    }
  });
  userItems.forEach((item) => {
    if (item !== null) {
      userList.appendChild(item);
    }
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
    const dateString = message.date;
    const dateObj = new Date(dateString);

    const heure = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const jour = dateObj.getUTCDate().toString().padStart(2, '0');
    const mois = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0'); // les mois sont indexés à partir de 0
    const annee = dateObj.getUTCFullYear().toString();

    const formattedDate = `${heure}:${minutes} ${jour}/${mois}/${annee}`;
    if (message.emetteur === pseudoActuel && message.destinataire === chatSelect) {
      let listItem = document.createElement('li');
      listItem.classList.add("envoi");
      listItem.innerHTML = `<p class='envoi-pseudo'>${message.emetteur}</p><p class="envoiP">${message.content}</p><p class='envoi-date'>${formattedDate}</p>`;
      return listItem;
    } else if (message.emetteur === chatSelect && message.destinataire === pseudoActuel && !utilisateurBloquer.includes(message.emetteur)) {
      let listItem = document.createElement('li');
      listItem.classList.add("recu")
      listItem.innerHTML = `<p class='recu-pseudo'>${message.emetteur}</p><p class="recuP">${message.content}</p><p class='recu-date'>${formattedDate}</p>`;
      return listItem;
    } else if (message.destinataire === chatSelect && chatSelect === 'General' && !utilisateurBloquer.includes(message.emetteur)) {
      let listItem = document.createElement('li');
      listItem.classList.add("recu");
      listItem.innerHTML = `<p class='recu-pseudo'>${message.emetteur}</p><p class="recuP">${message.content}</p><p class='recu-date'>${formattedDate}</p>`;
      return listItem;
    }
  });
  messages.forEach((item) => {
    if (item !== undefined) {
      messagelist.appendChild(item);
    }
  });


})

function selectionChat(pseudo) {
  chatSelect = pseudo;
  socket.emit('syncMessage', chatSelect)
  var chat = document.getElementById('chat-select')
  chat.innerHTML = `@${pseudo}`
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
  const dateString = data.date;
  const dateObj = new Date(dateString);

  const heure = dateObj.getUTCHours().toString().padStart(2, '0');
  const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
  const jour = dateObj.getUTCDate().toString().padStart(2, '0');
  const mois = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0'); // les mois sont indexés à partir de 0
  const annee = dateObj.getUTCFullYear().toString();

  const formattedDate = `${heure}:${minutes} ${jour}/${mois}/${annee}`;
  if (data.emetteur === pseudoActuel && !utilisateurBloquer.includes(data.emetteur)) {
    listItem.classList.add("envoi")
    listItem.innerHTML = `<p class='envoi-pseudo'>${data.emetteur}</p><p class="envoiP">${data.content}</p><p class='envoi-date'>${formattedDate}</p>`;
  } else if (data.destinataire === chatSelect && !utilisateurBloquer.includes(data.emetteur)) {
    listItem.classList.add("recu")
    listItem.innerHTML = `<p class='recu-pseudo'>${data.emetteur}</p><p class="recuP">${data.content}</p><p class='recu-date'>${formattedDate}</p>`;
  }
  messages.appendChild(listItem);
});


// gestion des bloquage

function bloque(utilisateur) {
  const conf = confirm('Est tu sur de bloquer cette personne ?', '')
  if (conf) {
    const barrer = document.getElementById(`chatbutton-${utilisateur}`)
    barrer.innerHTML =
      `<button class="button-user" onclick="selectionChat('${utilisateur}')">
      <svg style="height: 25px;margin: 0 10px 0px 0px;fill: var(--color-text);" id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 571.22 685.2">
        <path d="m116.89,151.95C123.22,68.06,197.87-6.83,295.06.5c84.77,6.37,155.36,80.87,151.58,170.25-2.15,91.26-81.18,162.09-169.37,159.7-91.77-2.47-167.66-82.14-160.38-178.49Z"/>
        <path d="m571.22,574.75c-.04,53.79-36.99,97.27-89.9,107.58-4.74.92-9.44,1.91-14.17,2.87H104.59c-5.14-1.08-10.31-2.03-15.45-3.15-48.97-10.63-81.78-46.35-87.55-96.19-3.46-29.62-.76-59.17,3.38-88.55,3.62-25.64,9.2-50.8,19.43-74.69,13.58-31.73,32.01-59.56,63.62-76.45,19.51-10.39,40.41-15.37,62.27-14.93,6.89.12,14.17,3.66,20.46,7.09,10.15,5.53,19.59,12.3,29.38,18.47,29.62,18.63,61.71,28.71,96.95,26,25.68-1.99,49.45-10.59,71.47-23.93,7.8-4.74,15.85-9.24,22.93-14.97,17.92-14.45,37.78-14.61,58.85-9.95,40.45,8.88,68.48,33.21,87.79,69,16.32,30.22,25.12,62.79,28.95,96.55,2.83,24.92,4.14,50.17,4.14,75.25Z"/>
      </svg>
      <p class='userP'>
        <strike>${utilisateur}</strike>
      </p>
    </button>`
    const user = document.getElementById(`${utilisateur}`)
    user.innerHTML = `<button onclick="debloque('${utilisateur}')">Débloquer</button>`
    console.log(utilisateur + ' bloquer')
    utilisateurBloquer.push(utilisateur)
  } else {
    console.log("erreur")
  }
}

function debloque(utilisateur) {
  const conf = confirm('Est tu sur de débloquer cette personne ?', '')
  if (conf) {
    const barrer = document.getElementById(`chatbutton-${utilisateur}`)
    barrer.innerHTML =
      `<button class="button-user" onclick="selectionChat('${utilisateur}')">
      <svg style="height: 25px;margin: 0 10px 0px 0px;fill: var(--color-text);" id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 571.22 685.2">
        <path d="m116.89,151.95C123.22,68.06,197.87-6.83,295.06.5c84.77,6.37,155.36,80.87,151.58,170.25-2.15,91.26-81.18,162.09-169.37,159.7-91.77-2.47-167.66-82.14-160.38-178.49Z"/>
        <path d="m571.22,574.75c-.04,53.79-36.99,97.27-89.9,107.58-4.74.92-9.44,1.91-14.17,2.87H104.59c-5.14-1.08-10.31-2.03-15.45-3.15-48.97-10.63-81.78-46.35-87.55-96.19-3.46-29.62-.76-59.17,3.38-88.55,3.62-25.64,9.2-50.8,19.43-74.69,13.58-31.73,32.01-59.56,63.62-76.45,19.51-10.39,40.41-15.37,62.27-14.93,6.89.12,14.17,3.66,20.46,7.09,10.15,5.53,19.59,12.3,29.38,18.47,29.62,18.63,61.71,28.71,96.95,26,25.68-1.99,49.45-10.59,71.47-23.93,7.8-4.74,15.85-9.24,22.93-14.97,17.92-14.45,37.78-14.61,58.85-9.95,40.45,8.88,68.48,33.21,87.79,69,16.32,30.22,25.12,62.79,28.95,96.55,2.83,24.92,4.14,50.17,4.14,75.25Z"/>
      </svg>
      <p class='userP'>${utilisateur}</p>
    </button>`
    const user = document.getElementById(`${utilisateur}`)
    user.innerHTML = `<button onclick="bloque('${utilisateur}')">bloquer</button>`
    console.log(utilisateur + ' debloquer')
    utilisateurBloquer.shift(utilisateur)
  } else {
    console.log("erreur")
  }
}









// gestion de la deconnection
socket.on('disconnect', () => {
  console.log('Déconnecté du serveur : ' + socket.id);
});
