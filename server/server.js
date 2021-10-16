const express = require('express');
const { exec } = require('child_process');
const path = require('path')

const PORT = 8081
const app = express()

app.use('/', express.static(path.join(__dirname, '../dist')))

//app.get('/raw', async (req, res) => {
  //const out = await exec('./server/geolla.py', (err, out, ser) => {
    //console.log([err, out, ser])
    //return ([err, out, ser])
  //});
  //console.log(out);
//});

app.listen(PORT, () => {
  console.log('Server started');
});
