import React from 'react';
import axios from 'axios';
// import { Button } from '@mui/material';
function Test() {
  const mineBlock = async () => {
    await axios.get(`http://localhost:3001/Blocks`).then((req) => console.log(req.data));
  };
  return (
    <div>
      <button onClick={mineBlock}>제발좀</button>
    </div>
  );
}
export default Test;
