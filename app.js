var express = require('express');

var app = new express();

app.use('/', express.static('./client'));
app.use(express.bodyParser());

app.post('/run', function(req, res) {
    console.log(req.body);
    res.json({
        'success': true
    });
});

app.listen(3000);