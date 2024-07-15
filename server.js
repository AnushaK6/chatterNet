const { Server } = require("socket.io");
const express = require('express');
const path=require('path');

const PORT=process.env.PORT || 3500;
const ADMIN="Admin";

const app=express();

const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

app.use(express.static(path.join(__dirname, 'frontend')))

const expressServer=app.listen(PORT, ()=>{
    console.log('Listening on port 3500')
});

const io=new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
});

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)
    
    socket.emit('message', buildMsg(ADMIN, 'Welcome to the chat room!', '...'));

    socket.on('enterRoom', ({name, room})=>{
        const prevRoom = getUser(socket.id)?.room

        if(prevRoom){
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMsg(ADMIN,`${name} has left the room`, '...'))
        }

        const user = activateUser(socket.id, name, room)

        if (prevRoom) {
            io.to(prevRoom).emit('userList', {
                users: getUsersInRoom(prevRoom)
            })
        }

        socket.join(user.room)

        socket.emit('message', buildMsg(ADMIN, `You have joined the ${user.room} chat room`, '...'))

        socket.emit('userId', socket.id)

        socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`, '...'))

        io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
        })

        io.emit('roomList', {
            rooms: getAllActiveRooms()
        })
    });

    socket.on('message', ({name, text})=>{
        const room=getUser(socket.id)?.room
        if(room){
            io.to(room).emit('message', buildMsg(name, text, socket.id))
        }
    })

    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        userLeavesApp(socket.id)

        if(user){
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} left the chat`, '...'))

            io.to(user.room).emit('userList', {
                users:getUsersInRoom(user.room)
            })

            io.emit('roomList', {
                rooms:getAllActiveRooms()
            })
        }

        console.log(`User ${socket.id} disconnected`);
    })

    socket.on('activity', (name) => {
        const room = getUser(socket.id)?.room
        if (room) {
            socket.broadcast.to(room).emit('activity', name)
        }
    })
})

function buildMsg(name, text, id) {
    return {
        name,
        text,
        id,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric'
        }).format(new Date())
    }
}

function activateUser(id, name, room){
    const user={id, name, room};
    UsersState.setUsers([
        ...UsersState.users.filter(user=>user.id!==id), user
    ])
    return user
}

function userLeavesApp(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    )
}

function getUser(id) {
    return UsersState.users.find(user => user.id === id)
}

function getUsersInRoom(room) {
    return UsersState.users.filter(user => user.room === room)
}

function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}