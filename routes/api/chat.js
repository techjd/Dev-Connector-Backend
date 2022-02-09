const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Conversations = require('../../models/Conversations');
const OnlineUsers = require('../../models/OnlineUsers');
const Messages = require('../../models/Messages');
const User = require('../../models/User');
const mongoose = require('mongoose');
const e = require('express');

router.get('/connect', (req, res) => {
  //   console.log(io);
  const socket = req.app.get('socket');
  console.log(socket.id);
  // io.on()
  req.io.sockets.emit('new-message', { msg: 'New Connection Request' });
  return res.send({ msg: `You Sent RMessage}` });

  //   io.on('connection', (socket) => {
  //     console.log('New Connection');
  //     socket.broadcast.emit('Connected');

  //     socket.on('connect', () => {
  //       socket.broadcast.emit('Connected');
  //     });
  //   });

  //   req.io.on('connection', (socket) => {
  //     console.log('User Connected with' + socket.id);
  //   });
});

// @route  GET api/chat/getAllConversations
// @desc   Get All Conversations of a Specific User
// @access Private
router.get('/getAllConversations', auth, async (req, res) => {
  try {
    const conversations = await Conversations.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'recipients',
          foreignField: '_id',
          as: 'recipientObj',
        },
      },
    ])
      .match({
        recipients: {
          $all: [{ $elemMatch: { $eq: mongoose.Types.ObjectId(req.user.id) } }],
        },
      })
      .project({
        'recipientObj.password': 0,
        'recipientObj.__v': 0,
        'recipientObj.date': 0,
      });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/chat/sendMessage
// @desc   Send Message to a Specific Person
// @access Private
router.post('/sendMessage', auth, async (req, res) => {
  try {
    Conversations.findOneAndUpdate(
      {
        recipients: {
          $all: [
            { $elemMatch: { $eq: mongoose.Types.ObjectId(req.user.id) } },
            { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.to) } },
          ],
        },
      },
      {
        recipients: [req.user.id, req.body.to],
        lastMessage: req.body.message,
        date: Date.now(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
      (err, conversation) => {
        // console.log(conversation);

        const message = new Messages({
          conversation: conversation._id,
          from: req.user.id,
          to: req.body.to,
          body: req.body.message,
        });

        // req.io.sockets.emit('messages', req.body.body);

        message.save((err, msg) => {
          if (err) {
            console.error(err);
            res.status(500).send('Server Error');
          } else {
            OnlineUsers.findOne(
              { user: mongoose.Types.ObjectId(req.body.to) },
              (err, onlineUser) => {
                if (err) {
                  console.error(err);
                  res.status(500).send('Server Error');
                } else {
                  if (onlineUser != null) {
                    req.io.to(onlineUser.socketId).emit('new-message', msg);
                    // console.log(onlineUser);
                  }
                }
              }
            );

            // console.log(msg);
          }
        });
      }
    );
    // console.log(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/chat/getAllMessages
// @desc   Get All Messages Between Two Person
// @access Private
router.get('/getAllMessages', auth, async (req, res) => {
  try {
    const messages = await Messages.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'to',
          foreignField: '_id',
          as: 'toObj',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'from',
          foreignField: '_id',
          as: 'fromObj',
        },
      },
    ])
      .match({
        $or: [
          {
            $and: [
              { to: mongoose.Types.ObjectId(req.body.to) },
              { from: mongoose.Types.ObjectId(req.user.id) },
            ],
          },
          {
            $and: [
              { to: mongoose.Types.ObjectId(req.user.id) },
              { from: mongoose.Types.ObjectId(req.body.to) },
            ],
          },
        ],
      })
      .project({
        'toObj.password': 0,
        'toObj.__v': 0,
        'fromObj.password': 0,
        'fromObj.__v': 0,
      });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/chat/makeMeOnline
// @desc   Add Current Logged In User To Online Lisr
// @access Private

router.post('/makeMeOnline', auth, async (req, res) => {
  try {
    // console.log(req.body.socketId);
    const isOnlineUserAlready = await OnlineUsers.findOne({
      user: req.user.id,
    });

    if (isOnlineUserAlready) {
      res.json({ msg: 'User Already In Online List' });
    } else {
      const newOnlineUser = new OnlineUsers({
        user: req.user.id,
        socketId: req.body.socketId,
      });

      await newOnlineUser.save();

      res.json({ msg: 'User Added To Online List' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/chat/removeMeOnline
// @desc   Delete User From Online List
// @access Private

router.delete('/removeMeOnline', auth, async (req, res) => {
  try {
    const OnlineUser = await OnlineUsers.findOne({ user: req.user.id });
    if (OnlineUser) {
      await OnlineUser.remove();
      res.json({ msg: 'User Removed From Online List' });
    } else {
      res.json({ msg: 'No Online User With This ID' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/chat/getOnlineUser
// @desc   Get Online User of PlatForm
// @access Private

router.get('/getOnlineUser', auth, async (req, res) => {
  try {
    // const onlineUser = await OnlineUsers.find({});
    const onlineUser = await OnlineUsers.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userObj',
        },
      },
    ]);

    res.json(onlineUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
