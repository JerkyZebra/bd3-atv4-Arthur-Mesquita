const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const mongoose = require('mongoose');

const ejs = require('ejs');
const path  = require('path');
const { Socket } = require('dgram');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'public'));

app.engine('html', ejs.renderFile);

app.use('/', (req, res) => {
    res.render('index.html');
});


function connectDB() {
    
    let dbURL = 'mongodb+srv://Abobado:88HKBkVNoZptpfEn@cluster0.c8096.mongodb.net/';

    mongoose.connect(dbURL)

    mongoose.connection.on('error', console.error.bind(console, 'connection error: '));

    mongoose.connection.once('open', function() {
        console.log('REDE SOCIAL CONECTADA COM SUCESSO');
    });
}

connectDB();

let Message = mongoose.model('Message', {usuario:String, data_hora:String, message:String});


let messages = [];

Message.find({})
    .then(docs => {
        messages = docs
    }).catch(error => {
        console.log(error);
    });

io.on('connection', socket => {
    console.log('NOVO USUÁRIO ENTROU NA REDE: ' + socket.id);

socket.emit('previousMessage', messages);

socket.on('sendMessage', data => {

    let message = new Message(data);

   message.save()
    .then(() => {
        messages.push(message);
        socket.broadcast.emit('receivedMessage', data);
    })
    .catch(error => {
        console.log(error)
    });


    console.log('Quantidade de mensagens: ' + messages.length)    
});

console.log('Quantidade de mensagens: ' + messages.length)

});

server.listen(3000, () => {
    console.log('REDE SOCIAL RODANDO EM http://localhost:3000');
});
