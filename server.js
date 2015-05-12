var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var express = require('express');
var app = express();
var datastore = './data';

function renderJSON(res, data) {
    res.status(200)
        .set('Content-Type', 'application/json')
        .json(data);
}

function filterJSONFiles(data) {
    return data.filter(function(file) {
        return (file.substr(-5) === '.json') ? 1 : 0;
    });
}

app.route('/elements')

    // List all elements.
    .get(function(req, res, next) {
        console.log('LIST ALL ELEMENTS - GET /elements');
        var output = [];

        // Get a list of all files in the datastore. Filter the 'files' for those that are '.json'. Read in the contents
        // of all JSON files and store their content into the 'output' array.
        fs.readdir(datastore, function(err, files) {
            if (err) { next(err); }
            files = filterJSONFiles(files);
            files.forEach(function(file) {
                fs.readFile(path.join(datastore, '/', file), { encoding: 'utf8' }, function(err, data) {
                    if (err) { next(err); }
                    output.push(JSON.parse(data));
                    if (output.length === files.length) { renderJSON(res, output); }                       
                });
            });
        });
    })

    // Create a piece of data.
    .post(jsonParser, function(req, res, next) {
        console.log('POST to /elements - CREATING DATA');
        var element = req.body.element || '';
        var created = req.body.created || +new Date();
        var dataToWrite = JSON.stringify({
            element: element,
            created: created
        });

        fs.readdir(datastore, function(err, files) {
            if (err) { next(err); }
            var fileNumber = files.filter(function(file) {
                return (file.substr(-5) === '.json') ? 1 : 0;
            });
            fileNumber = fileNumber.length + 1;
            fs.writeFile(datastore + '/' + fileNumber + '.json', dataToWrite, { encoding: 'utf8' }, function(err) {
                if (err) { next(err); }
                renderJSON(res, {status: 'success', operation: 'POST', _id: fileNumber});
            });    
        });
    });

app.route('/elements/:id')

    // Get specific element.
    .get(function(req, res, next) {
        console.log('GET to /elements/:id - LIST SINGLE DATA');
        var dataFile = path.join(datastore, '/', req.params.id + '.json');
        fs.readFile(dataFile, { encoding: 'utf8' }, function(err, data) {
            if (err) { next(err) }
            renderJSON(res, JSON.parse(data));
        });       
    })

    // Update and replace data.
    .put(jsonParser, function(req, res, next) {
        console.log('PUT to /elements/:id - UPDATING SINGLE DATA');
        var dataFile = path.join(datastore, '/', req.params.id + '.json');
        var dataToWrite = JSON.stringify(req.body);        
        fs.writeFile(dataFile, dataToWrite, { encoding: 'utf8' }, function(err) {
            if (err) { next(err); }
            renderJSON(res, { status: 'success', operation: 'PUT', _id: req.params.id });
        });
    })
    
    // Modify a piece of data.
    .patch(jsonParser, function(req, res, next) {
        console.log('PATCH to /elements/:id - MODIFY SINGLE DATA');
        var dataFile = path.join(datastore, '/', req.params.id + '.json');
        fs.readFile(dataFile, { encoding: 'utf8' }, function(err, data) {
            if (err) { next(err) }
            var dataToWrite = JSON.parse(data);
            for (key in req.body) {
                dataToWrite[key] = req.body[key];
            }
            dataToWrite = JSON.stringify(dataToWrite);
            fs.writeFile(dataFile, dataToWrite, { encoding: 'utf8' }, function(err) {
                if (err) { next(err); }
                renderJSON(res, { status: 'success', operation: 'PATCH', _id: req.params.id });
            });
        });
    })
    
    // Delete a piece of data.
    .delete(function(req, res, next) {
        console.log('DELETE to /elements/:id - DELETE SINGLE DATA');
        var dataFile = path.join(datastore, '/', req.params.id + '.json');
        fs.readFile(dataFile, { encoding: 'utf8' }, function(err, data) {
            if (err) { next(err); }
            // Just being safe here...
            if (req.url === '/elements/3') {
                fs.unlink(dataFile, function(err) {
                    if (err) { next(err); }
                    renderJSON(res, { status: 'success', operation: 'DELETE', _id: req.params.id });
                });
            } else {
                next(new Error('Only delete resource 3, please'));
            }            
        });
    });

app.use(function(req, res) {
    res.status(404)
        .set('Content-Type', 'text/plain')
        .end('404 - Resource not found');
});

app.use(function(err, req, res, next) {
    console.log('\n\nERROR MESSAGE:\n', err.message, '\nERROR STACK:\n', err.stack);
    res.status(500)
        .set('Content-Type', 'text/plain')
        .end('500 - Server encountered an error');
});

app.listen(3000, function() {
    console.log('Server listening on port 3000...');
})