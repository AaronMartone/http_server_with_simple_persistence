var chai = require('chai');
var chaiHTTP = require('chai-http');
chai.use(chaiHTTP);

var expect = chai.expect;

describe('Single Resource REST API', function() {
    var app = 'http://localhost:3000';
    var testFile;

    it('should list all elements on GET /elements', function(done) {
        chai.request(app)
            .get('/elements')
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;                
                done();
            })
    });

    it('should list specified element on GET /elements/<id>', function(done) {
        chai.request(app)
            .get('/elements/1')
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                done();
            });
    })

    it('should create element on POST /elements', function(done) {
        chai.request(app)
            .post('/elements')
            .send({ element: 'Fire', created: +new Date() })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.status).to.eql('success');
                expect(res.body.operation).to.eql('POST');
                testFile = res.body._id;
                done();
            })
    });

    it('should allow modificationo on PATCH /elements/<id>', function(done) {
        chai.request(app)
            .patch('/elements/' + testFile)
            .send({ element: 'Metal' })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.be.json;
                expect(res.body.status).to.eql('success');
                expect(res.body.operation).to.eql('PATCH');
                done();
            });
    });

    it('should allow updates on PUT /elements/<id>', function(done) {
        chai.request(app)
            .put('/elements/' + testFile)
            .send({ element: 'Dust', created: +new Date() })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.be.json;
                expect(res.body.status).to.eql('success');
                expect(res.body.operation).to.eql('PUT');
                done();
            })
    });

    it('should allow deletes on DELETE /elements/<id>', function(done) {
        chai.request(app)
            .delete('/elements/3')
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.be.json;
                expect(res.body.status).to.eql('success');
                expect(res.body.operation).to.eql('DELETE');
                done();
            });
    });

});