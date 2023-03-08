
// fonction pour le darkMode
function darkModeListener() {
  document.querySelector("html").classList.toggle("dark");
}

document.querySelector("input[type='checkbox']#dark-toggle").addEventListener("click", darkModeListener);

var socket = io()
var pseudo = "";
while (pseudo.length <= 0) {
  pseudo = prompt("Pseudo ?")
}
socket.emit('set-pseudo', pseudo);


var messages = document.getElementById('messages')
var form = document.getElementById('form')
var input = document.getElementById('input')
