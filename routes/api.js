'use strict';

const mongoose = require('mongoose');
require('dotenv').config();

const issueSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date, default: new Date().toISOString() },
  updated_on: { type: Date, default: new Date().toISOString() },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: '' },
});
const IssueModel = mongoose.model('Issue', issueSchema);

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const ProjectModel = mongoose.model('Project', projectSchema);

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI);

  app
    .route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;

      try {
        const existingProject = await ProjectModel.find({ name: project });

        const foundIssues = await IssueModel.find({
          ...req.query,
          projectId: existingProject[0]._id,
        });

        res.json(foundIssues);
      } catch (err) {}
    })

    .post(async function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        let existingProject = await ProjectModel.findOne({ name: project });
        if (!existingProject) {
          existingProject = await new ProjectModel({ name: project }).save();
        }

        const issue = new IssueModel({
          projectId: existingProject._id,
          issue_title,
          issue_text,
          created_on: new Date().toISOString(),
          updated_on: new Date().toISOString(),
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
        });

        await issue.save();
        return res.json(issue);
      } catch (err) {
        return res.json({ error: 'could not post :(' });
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const isAllFieldsButIdEmpty = (obj) => {
        for (let key in obj) {
          if (key !== '_id' && obj.hasOwnProperty(key)) {
            if (obj[key].length !== 0) {
              return false;
            }
          }
        }
        return true;
      };

      try {
        const existingIssue = await IssueModel.findById(_id);
        if (isAllFieldsButIdEmpty(req.body)) {
          return res.json({ error: 'no update field(s) sent', _id });
        } else if (!existingIssue) {
          return res.json({ error: 'could not update', _id });
        }

        const dataToUpdate = {
          ...(issue_title && { issue_title }),
          ...(issue_text && { issue_text }),
          ...(created_by && { created_by }),
          ...(assigned_to && { assigned_to }),
          ...(status_text && { status_text }),
          ...(open && { open }),
          updated_on: new Date().toISOString(),
        };

        await IssueModel.findByIdAndUpdate(_id, dataToUpdate);
        return res.json({ result: 'successfully updated', _id });
      } catch (err) {
        return res.json({ error: 'could not update', _id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      try {
        const existingIssue = await IssueModel.findById(_id);
        if (!_id) {
          return res.json({ error: 'missing _id' });
        } else if (!existingIssue) {
          return res.json({ error: 'could not delete', _id });
        }

        await IssueModel.findByIdAndDelete(_id);
        return res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        return res.json({ error: 'could not delete', _id });
      }
    });

  app.delete('/api/deleteAll', async (req, res) => {
    const deletedCount = await IssueModel.deleteMany({});
    res.json(`deleted all documents from database + ${deletedCount}`);
  });
};
