const Petrus = require("../petrus")
var express = require('express');
var app = express();
app.get('/', function(req, res){
  Petrus.search(req.query.val)
  .then(results => {
    res.send(results);
  })
  .catch(err => {
    console.error(err)
  })
});

app.listen(4000);


