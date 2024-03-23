import React, { useState, useEffect } from 'react';
const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;
import './App.css'

function App() {
  const [data, setData] = useState(null);
  const [banList, setBanList] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const randomPage = Math.floor(Math.random() * 100) + 1; // Assuming there are 100 pages of data
    const response = await fetch(`https://www.rijksmuseum.nl/api/en/collection?key=${ACCESS_KEY}&format=json&p=${randomPage}&ps=1`);
    const jsonData = await response.json();

    if (jsonData && jsonData.artObjects && jsonData.artObjects.length > 0) {
      const artObject = jsonData.artObjects[0];
      const detailsResponse = await fetch(`https://www.rijksmuseum.nl/api/en/collection/${artObject.objectNumber}?key=${ACCESS_KEY}&format=json`);
      const detailsData = await detailsResponse.json();

      if (detailsData && detailsData.artObject) {
        const objectTypes = detailsData.artObject.objectTypes.join(', ');

        const isBanned = banList.some(bannedAttribute => [artObject.title, artObject.principalOrFirstMaker, objectTypes].includes(bannedAttribute));

        if (!isBanned) {
          setData({
            name: artObject.title,
            image: artObject.webImage.url,
            description: artObject.principalOrFirstMaker,
            objectTypes: objectTypes,
          });
          setHistory([...history, {
            name: artObject.title,
            image: artObject.webImage.url
          }]);
        }
      }
    }
  };

  const handleBan = (attributeValue) => {
    setBanList([...banList, attributeValue]);
  };

  const handleUnban = (attributeValue) => {
    setBanList(banList.filter(item => item !== attributeValue));
  };

  return (
    <div className="container">
      <div className="history-list">
        <h3>History</h3>
        <ul>
          {history.map((item, index) => (
            <li key={index}>
              <img src={item.image} alt={item.name} />
              <p>{item.name}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="data-container">
        <h1>Rijksmuseum Art</h1>
        <p>Discover art from the Rijksmuseum.
          Click on painting attributes to ban them from future discoveries!</p>
        {data && (
          <div>
            <div className="image-description-container">
              <h2>{data.name}</h2>
              <img src={data.image} alt={data.name} />
            </div>
            <div className="attributes-container">
              <button className="attribute-button" onClick={() => handleBan(data.description)}>{data.description}</button>
              <button className="attribute-button" onClick={() => handleBan(data.objectTypes)}>{data.objectTypes}</button>
            </div>
          </div>
        )}
        <button onClick={fetchData}>Discover!</button>
      </div>
      <div className="ban-list">
        <h3>Ban List</h3>
        <ul>
          {banList.map((item, index) => (
            <li key={index}>
              <button className="attribute-button" onClick={() => handleUnban(item)}>{item}</button> {/* Clicking the button will remove the item from the ban list */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
