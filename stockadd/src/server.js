const express = require('express');
const { KafkaClient, Producer } = require('kafka-node');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
const client = new KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(client);

app.use(bodyParser.json());

producer.on('ready', () => {
  console.log('Producer is ready');
});

producer.on('error', (err) => {
  console.error('Producer error: ' + err);
});

app.post('/updateStockPrice', (req, res) => {
  const { stockSymbol, price } = req.body;

  const payloads = [
    {
      topic: 'stock-t1',
      messages: JSON.stringify({ stockSymbol, price }),
    },
  ];

  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending message:', err);
      res.status(500).send('Error updating stock price');
    } else {
      console.log('Message sent:', data);
      res.send('Stock price updated successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Producer service running at http://localhost:${port}`);
});
