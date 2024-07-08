const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    const payload = {
      issue_title: 'Fix error in posting data',
      issue_text: 'When we post data it has an error.',
      created_by: 'Joe',
      assigned_to: 'Joe',
      status_text: 'In QA',
    };
    chai
      .request(server)
      .post('/api/issues/{project}')
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);
        Object.keys(payload).forEach((key) => {
          assert.equal(res.request._data[key], payload[key]);
        });
        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    const payload = {
      issue_title: 'Fix error in posting data',
      issue_text: 'When we post data it has an error.',
      created_by: 'Joe',
    };
    chai
      .request(server)
      .post('/api/issues/{project}')
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);
        Object.keys(payload).forEach((key) => {
          assert.equal(res.request._data[key], payload[key]);
        });
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    const payload = {
      issue_title: 'Fix error in posting data',
    };
    chai
      .request(server)
      .post('/api/issues/{project}')
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.text, 'Missing required fields!');
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/{project}')
      .end((err, res) => {
        if (err) return done(err);
        assert(Array.isArray(res.body));
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/{project}?created_by=Joe')
      .end((err, res) => {
        if (err) return done(err);
        res.body.forEach((obj) => {
          assert.equal(obj.created_by, 'Joe');
        });
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/{project}?created_by=Joe&open=true')
      .end((err, res) => {
        if (err) return done(err);
        res.body.forEach((obj) => {
          assert.isOk(obj.created_by === 'Joe' && obj.open === true);
        });
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/{project}')
      .end((err, res) => {
        if (err) return done(err);
        const _id = res.body[0]._id;

        const payload = {
          _id,
          created_by: 'Ted',
        };
        chai
          .request(server)
          .put('/api/issues/{project}')
          .send(payload)
          .end((err, res) => {
            if (err) return done(err);
            Object.keys(payload).forEach((key) => {
              assert.equal(res.request._data[key], payload[key]);
            });
            done();
          });
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/{project}')
      .end((err, res) => {
        if (err) return done(err);
        const _id = res.body[0]._id;

        const payload = {
          _id,
          created_by: 'Ted',
          open: 'false',
        };
        chai
          .request(server)
          .put('/api/issues/{project}')
          .send(payload)
          .end((err, res) => {
            if (err) return done(err);
            Object.keys(payload).forEach((key) => {
              assert.equal(res.request._data[key], payload[key]);
            });
            done();
          });
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    const payload = {
      created_by: 'Ted',
      open: 'false',
    };

    chai
      .request(server)
      .put('/api/issues/{project}')
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.text, 'Please provide an ID...');
        done();
      });
  });

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
      chai
      .request(server)
      .get('/api/issues/{project}')
      .end((err, res) => {
        if (err) return done(err);
        const _id = res.body[0]._id;

        const payload = {_id};
        chai
          .request(server)
          .put('/api/issues/{project}')
          .send(payload)
          .end((err, res) => {
            if (err) return done(err);
            assert.equal(res.text, 'Please, provide a field to update...');
            done();
          });
      });
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
      const payload = {
        _id: 'ugabuga',
        created_by: 'Ted',
        open: 'false',
      }

      chai
        .request(server)
        .put('/api/issues/{project}')
        .send(payload)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.text, 'No match found in database :(');
          done();
        });
    });

    test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
      chai
      .request(server)
      .get('/api/issues/{project}')
      .end((err, res) => {
        if (err) return done(err);
        const _id = res.body[0]._id;
        const payload = {_id}

        chai
          .request(server)
          .delete('/api/issues/{project}')
          .send(payload)
          .end((err, res) => {
            if (err) return done(err);
            assert.equal(res.text, 'Removed from database!');
            done();
          });
      })
    });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
      const payload = {_id: 'ugabuga'}

      chai
        .request(server)
        .delete('/api/issues/{project}')
        .send(payload)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.text, 'No match found in database :(');
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .delete('/api/issues/{project}')
        .send({})
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.text, 'Please provide an ID');
          done();
        });
    });
});
