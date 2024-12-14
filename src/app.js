const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const app = express();

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

module.exports = app;


/* çalıştığında dair bir deneme :) isterseniz silebilirsiniz :) */

app.get('/', (req, res) => {
    res.send('InfluenceHub ...');
  });

