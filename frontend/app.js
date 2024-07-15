const socket = io('https://chatternet-vhmq.onrender.com')
// const socket = io('ws://localhost:3500')

const msgInput = document.querySelector('#msg')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('#users')
const roomList = document.querySelector('.chat-sidebar .room-list')
const chatDisplay = document.querySelector('.chat-messages ul')


let { username:nameInput, room:chatRoom } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
let userId=""
window.onload=(e)=>{
    enterRoom(e)
}
console.log(userId)
function sendMessage(e) {
    e.preventDefault()
    if (nameInput && chatRoom && msgInput.value) {
        socket.emit('message', {
            name:nameInput,
            text:msgInput.value
        })
        msgInput.value = ""
    }
    msgInput.focus()
}

function enterRoom(e) {
    e.preventDefault
    if (nameInput && chatRoom) {
        socket.emit('enterRoom', {
            name:nameInput,
            room:chatRoom
        })
    }
}

chatDisplay.parentElement.onscroll=()=>{
    if(chatDisplay.parentElement.scrollHeight-chatDisplay.parentElement.scrollTop>650){
        document.querySelector('.chat-messages button').style.display="block"
        document.querySelector('.chat-messages button').onclick=()=>{chatDisplay.parentElement.scrollTop = chatDisplay.parentElement.scrollHeight;}
    }
    else{
        document.querySelector('.chat-messages button').style.display="none"
    }
}

if(chatRoom==="New"){
    const {newroom}=Qs.parse(location.search, {
        ignoreQueryPrefix: true,
      });
    chatRoom=newroom
}
document.getElementById("room-name").innerHTML=chatRoom

document.querySelector('#chat-form')
    .addEventListener('submit', sendMessage)

msgInput.addEventListener('keypress', ()=>{
    socket.emit('activity', nameInput)
})

document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = 'index.html';
    } else {
    }
});

// Listen for messages 
socket.on("message", (data) => {
    const {name, text, id, time}=data;
    activity.textContent=""
    const li = document.createElement('li')
    li.className = 'post'
    if (name === nameInput && userId===id) li.className = 'post post--right'
    else if (name !== 'Admin') li.className = 'post post--left'
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name === nameInput && userId===id? 'post__header--user'  : 'post__header--reply'}">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`
    } else {
        li.className='post admin__text'
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    chatDisplay.appendChild(li)
    chatDisplay.parentElement.scrollTop = chatDisplay.parentElement.scrollHeight;
})

let activityTimer
socket.on("activity", (name) => {
    activity.textContent=`${name} is typing...`;
    clearTimeout(activityTimer)
    activityTimer=setTimeout(()=>{
        activity.textContent=""
    }, 2000)
})

socket.on('userId', (id)=>{
    console.log(id)
    userId=id
})

socket.on('userList', ({ users }) => {
    showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms)
})

function showUsers(users) {
    usersList.textContent = ''
    if (users) {
        users.forEach((user, i) => {
            const li = document.createElement('li')
            li.innerHTML=user.name
            usersList.appendChild(li)
        })
    }
}

function showRooms(rooms) {
    roomList.textContent = ''
    if (rooms) {
        roomList.innerHTML = '<em>Active Rooms:</em>'
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ","
            }
        })
    }
}