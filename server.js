const { createServer } = require('http');
const express = require('express');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const app = express();
const server = createServer(app);
const io = socketio(server, {
  cors: { origin: '*' },
});
const path = require('path');
//Connect Database

connectDB();

// Init MiddleWare
app.use(express.json({ extended: false }));
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Define Routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

// Serve Sttaic assets in production

if (process.env.NODE_ENV === 'production') {
  // Set Static Folder

  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.get('/api/getMe', (req, res) => {
  console.log('Req');
  res.send({ msg: "It's Connectted" });
});

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
