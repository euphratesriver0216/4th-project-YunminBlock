import React from 'react';
import axios from 'axios';

function Test2() {
  const adress = async () => {
    await axios.get(`http://localhost:3001/address`).then((req) => console.log(req.data));
  };
  return (
    <div>
      <button onClick={adress}>지갑확인합시다</button>
    </div>
  );
}
export default Test2;
