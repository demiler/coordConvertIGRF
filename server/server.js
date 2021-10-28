const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const utils = require('./utils.js');

const PORT = 8081
const app = express()

app.use('/', express.static(path.join(__dirname, '../dist')))
app.use('/assets', express.static(path.join(__dirname, '../assets')))

/*
{
  convertType: 'NTE', //or 'GTE' or 'NTG',
  input: {
    noradID: 324,
    date: { from: { day: 12, month: 22, year: 2021 } },
    time: { from: { hour: 22, minute: 10, second: 0 } },
  },
  filters: [
    'shad', 'l', 'b'
    'geoX', 'geoY', 'geoZ',
    'magnX', 'magnY', 'magnF',
    'dmLat'
  ]
}
*/
app.post('/convert', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

});

app.listen(PORT, () => {
  console.log('Server started');
});
