import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { sentenceCase } from 'change-case';
import { useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Grid,
  Card,
  Box,
  Table,
  Input,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
} from '@mui/material';
// components
import Page from '../components/Page';
//
import USERLIST from '../_mocks_/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function User2() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [Wallet, setWallet] = useState('');
  const [balance, setBalance] = useState('');
  const [money, setMoney] = useState();
  const [receiveAdress, setReceiveAdress] = useState('');

  /* 잔고확인하기 */
  const getBalance = () => {
    axios.get(`http://localhost:3002/balance`).then((res) => {
      setBalance(res.data.balance);
      console.log(res.data.balance);
    });
  };
  /* 송금하기 */
  const sendTransaction = () => {
    alert('송금하시겠습니까?');

    axios
      .post(`http://localhost:3002/sendTransaction`, { amount: money, address: receiveAdress })
      .then((res) => {
        console.log(res.body);
      });
  };

  const address = () => {
    axios.get(`http://localhost:3002/address`).then((res) => {
      setWallet(res.data.address);
      console.log(res);
    });
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     const newSelecteds = USERLIST.map((n) => n.name);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (
    <Page title="User | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={6} />

        <Grid>
          <Button onClick={address}> 내 지갑가져오기</Button>
          <Grid item md={4}>
            NODE 2 : <div>{Wallet}</div>
          </Grid>
          {/* 
                잔고 조회 : button 

                받는사람 지갑주소 : input
                송금 금액 : input
                송금 버튼 : button
                          */}
          <Grid>
            <Button onClick={getBalance}>나의 잔고 조회</Button>
            <div>나의 잔고 : {balance}</div>
          </Grid>
          받는 주소 :{' '}
          <Input
            onChange={(e) => {
              setReceiveAdress(e.target.value);
            }}
            value={receiveAdress}
            sx={{ width: '100%' }}
            placeholder="받으실 분의 주소"
            type="text"
          />
          <br />
          송금 하기 :{' '}
          <Input
            onChange={(e) => {
              setMoney(e.target.value);
            }}
            value={money}
            sx={{ width: '100%' }}
            placeholder="송금할 금액입력"
            type="number"
          />
          <Button onClick={sendTransaction}>송금하기</Button>
        </Grid>
      </Container>
    </Page>
  );
}
