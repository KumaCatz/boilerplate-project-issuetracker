'use strict';

const mongoose = require('mongoose');
require('dotenv').config();

const issueSchema = new mongoose.Schema({
  issue_title: String,
  issue_text: String,
  created_on: Date,
  updated_on: Date,
  created_by: String,
  assigned_to: String,
  open: {type: Boolean, default: true},
  status_text: String
})

const Issue = mongoose.model('Issue', issueSchema)

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI);

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;

      const foundIssues = await Issue.find(req.query)

      res.send(foundIssues)
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text} = req.body

      if(!issue_title || !issue_text || !created_by) {
        return res.send('Missing required fields!')
      }

      const issue = new Issue({
        issue_title,
        issue_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || ""
      })

      await issue.save()
      res.send('Added to database!')
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      const {_id, issue_title, issue_text, created_by, assigned_to, status_text, open} = req.body

      if(!_id) {
        return res.send('Please provide an ID...')
      }

      function isAllFieldsButIdEmpty(obj) {
        for (let key in obj) {
          if (key !== '_id' && obj.hasOwnProperty(key)) {
            if (obj[key].length !== 0) {
              return false
            }
          }
        }
        return true
      }

      if (isAllFieldsButIdEmpty(req.body)) {
        return res.send('Please, provide a field to update...')
      }

      const updatedIssue = {
        ...(issue_title && {issue_title}),
        ...(issue_text && {issue_text}),
        ...(created_by && {created_by}),
        ...(assigned_to && {assigned_to}),
        ...(status_text && {status_text}),
        ...(open && {open}),
        updated_on: new Date().toISOString()
      }

      try {
        await Issue.findByIdAndUpdate(_id, updatedIssue)
        return res.send('Updated in database!')
      } catch(err) {
        return res.send('No match found in database :(')
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      const {_id} = req.body

      if (!_id) {
        return res.send('Please provide an ID')
      }
      
      try {
        await Issue.findByIdAndDelete(_id)
        return res.send('Removed from database!')
      } catch(err) {
        // console.log(err)
        return res.send('No match found in database :(')
      }
    });
    
    app.delete('/api/deleteAll', async (req, res) => {
      const deletedCount = await Issue.deleteMany({})
      res.send(`deleted all documents from database + ${JSON.stringify(deletedCount)}`)
    })

};
