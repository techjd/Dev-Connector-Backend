const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const auth = require('../../middleware/auth');
const Job = require('../../models/Job');
const User = require('../../models/User');
const mongoose = require('mongoose');

// @route  POST api/jobs
// @desc   Create a Job
// @access Private
router.post('/', auth, async (req, res) => {
  try {
    const newJob = new Job({
      user: req.user.id,
      lookingFor: req.body.lookingFor,
      shortDescription: req.body.shortDescription,
      requiredSkills: req.body.requiredSkills,
      budget: req.body.budget,
    });

    const job = await newJob.save();

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/jobs
// @desc   Get All Jobs
// @access Private

router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userObj',
        },
      },
    ]).project({
      'userObj.password': 0,
      'userObj.__v': 0,
      'userObj.date': 0,
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/jobs/:id
// @desc   Get Single Jobs
// @access Private

router.get('/:id', auth, async (req, res) => {
  try {
    const jobs = await Job.findById(req.params.id);

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/jobs/:id
// @desc   Get Single Jobs
// @access Private
router.put('/:id', auth, async (req, res) => {
  try {
    const update = {
      lookingFor: req.body.lookingFor,
      shortDescription: req.body.shortDescription,
      requiredSkills: req.body.requiredSkills,
      budget: req.body.budget,
    };
    Job.findOneAndUpdate(
      { user: mongoose.Types.ObjectId(req.user.id) },
      update,
      { new: true },
      (err, job) => {
        if (err) {
          console.error(err);
        } else {
          res.json({
            msg: 'Job Updated SuccessFully',
          });
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
