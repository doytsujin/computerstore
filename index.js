// this is the server side
const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');

const app = express(); //express application is created
const PORT = process.env.PORT || 3000; //80 is the default port.

//give app access to public files - all of them
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
//form-urlencoded


app.post('/contact', (req, res) =>{
  console.log(req.body);

  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
})
//if the client is connection through get http through the root--> do this fkunction
app.get('/', (req, res) => {
  //__dirname = this current path. (in which the )
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
})

//listen(port, callback)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})