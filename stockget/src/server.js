const express = require('express');
const { KafkaClient, Consumer } = require('kafka-node');
const Pusher = require('pusher');
const cors = require('cors');

const app = express();
const port = 3002;
app.use(cors({
    origin: 'http://localhost:5173'
  }));
 
  const pusher = new Pusher({
    appId: "1686956",
    key: "423a675878fc2ee5e09f",
    secret: "e1c65e0150e3e8c7e70f",
    cluster: "mt1",
    useTLS: true
  });

const client = new KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new Consumer(client, [{ topic: 'stock-t1', partition: 0 }], { autoCommit: false });

const stockUpdates = [];

consumer.on('message', (message) => {
  const { stockSymbol, price } = JSON.parse(message.value);

  console.log(`Received stock update for ${stockSymbol}: $${price}`);
  const eventData = {
      name: stockSymbol,
      price: price
  };
  pusher.trigger("my-channel", "my-event", {
    eventData
  });

  // Store the update
  stockUpdates.push({ stockSymbol, price });
});

consumer.on('error', (err) => {
  console.error('Consumer error: ' + err);
});

app.get('/stockUpdates', (req, res) => {
  res.json(stockUpdates);
});

app.listen(port, () => {
  console.log(`Consumer service running at http://localhost:${port}`);
});
