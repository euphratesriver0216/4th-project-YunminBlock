// material
import React, { useState, useRef, useEffect } from "react";
import { alpha, styled } from "@mui/material/styles";
import { Card, Typography, Grid, Button, Input } from "@mui/material";
import axios from "axios";

// import React, { useEffect } from 'react';
// utils
// import { fShortenNumber } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: "none",
  textAlign: "center",
  padding: theme.spacing(5, 0),
  color: theme.palette.primary.darker,
  backgroundColor: theme.palette.primary.lighter,
}));

const marginBottom = {
  marginBottom: "100px",
};

const IconWrapperStyle = styled("div")(({ theme }) => ({
  margin: "auto",
  display: "flex",
  borderRadius: "50%",
  alignItems: "center",
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.dark,
    0
  )} 0%, ${alpha(theme.palette.primary.dark, 0.24)} 100%)`,
}));

// ----------------------------------------------------------------------

const TOTAL = 714000;
function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
export default function AppWeeklySales() {
  const [blockData, setblockData] = useState("");
  const [addressData, setAddressData] = useState("");

  // 변수명, 변수변하게할친구
  const [chainBlocks, setChainBlocks] = useState([]);

  const addPeers = async () => {
    await axios
      .get(`http://localhost:3001/addPeers`)
      .then((req) => alert("ws://localhost:6002 와 연결합니다"));
  };

  const connectToHttp = async () => {
    // 이 안에 있는 값으로 chainBlocks바꿈
    await axios.get(`/api/blocks`).then((req) => setChainBlocks(req.data));
  };

  const sendTx = async () => {
    const data = blockData;
    const user = addressData;
    await axios.post(`/api/sendTransaction`, { amount: data, address: user });
  };

  //
  // 객체로 보내줄라고 [] 배열표기뺌.이름도 정해줌

  const blockMaker = async () => {
    await axios
      .post(`/api/mineBlock`)
      .then((req) => alert("블록이 생성되었습니다"));
  };

  // const [count, setCount] = useState(0);
  // const [delay, setDelay] = useState(1000);
  // const [isRunning, setIsRunning] = useState(false);
  // const [ok, setOk] = useState(false);

  // 얘는 자동채굴할라고 넣어둔 애
  // useEffect는 밑에 있는 애가 변화되면 실행되는거. useInterval는 특정시간마다 실행
  //
  // useInterval(
  //   () => {
  //     const data = blockData || 'ararar';
  //     setIsRunning(false);
  //     axios.post(`http://localhost:3001/mineBlock`, { data: [data] }).then((req) => {
  //       console.log(req.data);
  //       setIsRunning(true);
  //     });

  //     setCount(count + 1);
  //   },
  //   //밑에 시간마다 위에 함수가 실행된다.
  //   isRunning && ok ? delay : null
  // );
  return (
    <Grid>
      <Typography variant="h3">NODE no.1</Typography>

      <Grid>
        <Button onClick={connectToHttp}>START TO MINEBLOCK</Button>
        {/* <div>{JSON.stringify(blockData)}</div> */}
        <Button onClick={addPeers}>ADD PEERS</Button>
      </Grid>

      <Input
        placeholder="amountdata"
        type="text"
        onChange={(e) => {
          setblockData(e.target.value);
        }}
        // post될 값 value
        value={blockData}
      />
      <Input
        placeholder="addressData"
        type="text"
        onChange={(e) => {
          // 써져있는 값쓸라면 .target.value
          setAddressData(e.target.value);
        }}
        value={addressData}
      />

      <Button onClick={sendTx}>트랜잭션풀에 넣기2</Button>
      <Button onClick={blockMaker}>채굴1,3</Button>

      {/* <div>{JSON.stringify(blockData)}</div> */}
      {chainBlocks &&
        chainBlocks.map((a) => (
          <div style={marginBottom} key={a.index}>
            {/* <div>바디 : {a.body}</div> */}

            <div>txId : {a.data.map((b) => b.id)}</div>
            {/* <div>signature : {a.data.map((b) => b.txIns.map((c) => c.signature))}</div> */}
            <div>
              txOutId : {a.data.map((b) => b.txIns.map((c) => c.txOutId))}
            </div>
            <div>
              txOutIndex : {a.data.map((b) => b.txIns.map((c) => c.txOutIndex))}
            </div>
            <div>
              address : {a.data.map((b) => b.txOuts.map((c) => c.address))}
            </div>
            <div>
              amount : {a.data.map((b) => b.txOuts.map((c) => c.amount))}
            </div>
            <div>인덱스 : {a.index}</div>
            <div>넌스 : {a.nonce}</div>
            {/* <div>버전 : {a.version}</div> */}
            <div>시간 : {a.timestamp}</div>
            <div>난이도 : {a.difficulty}</div>
            {/* <div>머클 루트 : {a.merkleRoot}</div> */}
            <div>이전 해쉬 : {a.previousHash}</div>
          </div>
        ))}
    </Grid>
  );
}
