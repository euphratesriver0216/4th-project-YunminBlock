// import React, { useState, useEffect } from 'react';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography, Grid } from '@mui/material';
// import { useEffect, useState } from 'react';

// --------------------------스타일--------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(5, 0),
  color: theme.palette.info.darker,
  backgroundColor: theme.palette.info.lighter
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
  color: theme.palette.info.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0)} 0%, ${alpha(
    theme.palette.info.dark,
    0.24
  )} 100%)`
}));

// -----------------------------기능-----------------------------------------

// ----------------------------------------------------------------------

const TOTAL = 1352831;

export default function AppNewUsers() {
  return (
    <RootStyle>
      <Typography variant="h3">NODE no.2</Typography>
      <Grid>d</Grid>
    </RootStyle>
  );
}
