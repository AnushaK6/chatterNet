const socket = io('ws://localhost:3500')

const msgInput = document.querySelector('#msg')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('#users')
const roomList = document.querySelector('.chat-sidebar .room-list')
const chatDisplay = document.querySelector('.chat-messages ul')

window.onload=(e)=>{
    enterRoom(e)
}

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

const { username:nameInput, room:chatRoom } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
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
    const {name, text, time}=data;
    activity.textContent=""
    const li = document.createElement('li')
    li.className = 'post'
    if (name === nameInput) li.className = 'post post--right'
    if (name !== nameInput && name !== 'Admin') li.className = 'post post--left'
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name === nameInput? 'post__header--user'  : 'post__header--reply'}">
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