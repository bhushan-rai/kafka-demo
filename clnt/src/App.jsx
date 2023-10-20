import { useEffect, useState } from "react";
import axios from 'axios';
import Pusher from 'pusher-js';

function App() {
  const [stockName, setstockName] = useState("");
  const [stockPrice, setstockPrice] = useState("");
  const [stock, setStock] = useState([]);



  useEffect(() => {
    async function fetchStocks() {
      try {
        const response = await axios.get('http://localhost:3002/stockUpdates'); 
        setStock(response.data); 
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    }

    fetchStocks();

    const pusher = new Pusher('423a675878fc2ee5e09f', {
      cluster: 'mt1',
      encrypted: true,
    });

    const channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function (data) {
      if(data.stockSymbol && data.price){
        const isNewSymbol = stock.every(item => item.stockSymbol !== data.stockSymbol);
        if (isNewSymbol) {
          setStock([...stock, { stockSymbol: data.stockSymbol, price: data.price }]);
        }
      }
    });

    return () => {
      pusher.disconnect();
    };
  }, [stock]);
  
  

  async function submit() {
    try {
      await axios.post('http://localhost:3001/updateStockPrice', { 
        "stockSymbol": stockName,
        "price": stockPrice
      });
      console.log("Data sent successfully");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  
    setstockName(""); 
    setstockPrice(""); 
  }

  return (
    <>
      <div>
        <input 
          type="text" 
          placeholder="Enter Stock Name"
          value={stockName}
          onChange={(e)=> setstockName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Enter price"
          value={stockPrice}
          onChange={(e)=>setstockPrice(e.target.value)}
        />
        <button onClick={submit}>Submit</button> 
      </div>

      <div>
      {stock.map((item, index) => (
        <p key={index}>{item.stockSymbol + " " + item.price}</p>
      ))}
      </div>
    </>
  );
}

export default App;
