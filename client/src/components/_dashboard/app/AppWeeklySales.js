// material
import React, { useState ,useRef,useEffect} from 'react';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography, Grid, Button ,Input} from '@mui/material';
import axios from 'axios';

// import React, { useEffect } from 'react';
// utils
// import { fShortenNumber } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(5, 0),
  color: theme.palette.primary.darker,
  backgroundColor: theme.palette.primary.lighter
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0)} 0%, ${alpha(
    theme.palette.primary.dark,
    0.24
  )} 100%)`
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
  const [blockData, setblockData] = useState('');
  const [chainBlocks, setChainBlocks] = useState([]);

  const connectToHttp = async () => {
    await axios
    .get(`http://localhost:3001/Blocks`)
    .then((req) => setChainBlocks(req.data));
  };
  const blockMaker = async () => {
    const data = blockData;
    if (data.length === 0) {
      return alert(`데이터를 넣으세요`);
    }
    await axios
      .post(`http://localhost:3001/mineBlock`, { data: [data] })
      .then((req) => alert(req.data));
  };

  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [ok, setOk] = useState(false);

  useInterval(
    () => {
      const data = blockData || "ararar";
      setIsRunning(false);
      axios
        .post(`http://localhost:3001/mineBlock`, { data: [data] })
        .then((req) => {
          console.log(req.data);
          setIsRunning(true);
        });

      setCount(count + 1);
    },
    isRunning && ok ? delay : null
  );
  return (
    <RootStyle>
      <Typography variant="h3">NODE no.1</Typography>
      <Grid> YUN </Grid>
      <Button onClick={connectToHttp}>START TO MINEBLOCK</Button>
      <div>
        <Grid>아니 오늘</Grid>
      </div>
      <div>{JSON.stringify(chainBlocks)}</div>
      <Input
        placeholder="bodydata"
        type="text"
        onChange={(e) => {
          setblockData(e.target.value);
        }}
        value={blockData}
      />
      <Button onClick={blockMaker}>채굴</Button>
      <div>{JSON.stringify(blockData)}</div>
    </RootStyle>
  );
}