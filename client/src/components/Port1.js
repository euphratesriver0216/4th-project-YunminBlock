import axios from "axios";
import React, { useState, useEffect } from "react";
// import { Button } from "antd";

const Port1 = () => {
  //블록 넣기
  const [블록데이터, set블록데이터] = useState("");
  const [chainBlocks, setChainBlocks] = useState([]);

  const bcMaker = async () => {
    const data = 블록데이터;
    if (data.length === 0) {
      return alert("데이터넣어라");
    }
    await axios
      .get(`http://localhost:3001/mineBlock`, { data: [data] })
      .then((req) => alert(req.data));
  };

  //   const connect = async () => {
  //     await axios
  //       .get(`http://localhost:3001/blocks`)
  //       .then((req) => setChainBlocks(req.data));
  //   };
  return (
    <div>
      {/* <Input
        placeholder="블록내용입력해"
        type="text"
        onChange={(e) => {
          set블록데이터(e.target.value);
        }}
        value={블록데이터}
      ></Input> */}
      <button onClick={bcMaker}>버튼임</button>
    </div>
  );
};

export default Port1;
