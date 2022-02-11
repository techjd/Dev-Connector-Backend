const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const connectDB = require('./config/db');
const path = require('path');
//Connect Database
connectDB();

// Init MiddleWare
app.use(express.json({ extended: false }));
io.on('connection', (socket) => {
  console.log('Waths');
  console.log(socket.id);
  app.set('socket', socket);
  // io.to(socket.id).emit(socket.id);
  // socket.emit('id', socket.id);
  // console.log(socket.id);
  // console.log('SomeOne Connected');
});
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Define Routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/chat', require('./routes/api/chat'));
app.use('/api/jobs', require('./routes/api/jobs'));
// Serve Sttaic assets in production

// if (process.env.NODE_ENV === 'production') {
//   // Set Static Folder

//   app.use(express.static('client/build'));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

const PORT = process.env.PORT || 5000;

app.get('/api/getMe', (req, res) => {
  console.log('Req');
  // res.send({ msg: "It's Connectted" });
});

httpServer.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
