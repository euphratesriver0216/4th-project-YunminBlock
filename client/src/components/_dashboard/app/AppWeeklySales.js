// material
import React, { useState } from 'react';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography, Grid, Button } from '@mui/material';
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

export default function AppWeeklySales() {
  const [blockData, setblockData] = useState('');

  const connectToHttp = async () => {
    await axios.get(`http://localhost:3001/Blocks`).then((req) => console.log(req.data));
  };
  const blockMaker = async () => {
    const data = blockData;
    if (data.length === 0) {
      return alert(`데이터를 넣어야 함`);
    }
    await axios
      .post(`http://localhost:3001/mineBlock`, { data: [data] })
      .then((req) => alert(req.data));
  };

  return (
    <RootStyle>
      <Typography variant="h3">NODE no.1</Typography>
      <Grid> YUN </Grid>
      <Button onClick={connectToHttp}>START TO MINEBLOCK</Button>
      <div>
        <Grid>아니 오늘</Grid>
      </div>
    </RootStyle>
  );
}
