// material
import { Box, Grid, Container, Typography, Button } from '@mui/material';
// components
import Page from '../components/Page';
import {
  // AppTasks,
  AppNewUsers,
  // AppBugReports,
  // AppItemOrders,
  // AppNewsUpdate,
  AppWeeklySales
  // AppOrderTimeline,
  // AppCurrentVisits,
  // AppWebsiteVisits,
  // AppTrafficBySite,
  // AppCurrentSubject,
  // AppConversionRates
} from '../components/_dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  return (
    <Page title="Dashboard | Minimal-UI">
      <Container
      // maxWidth="xl"
      >
        <Box sx={{ pb: 2 }}>
          <Typography variant="h4">Hi, This is YUNMIN Block! </Typography>
          <Button>START TO BLOCK MINING</Button>
          {/* 노드가 실행되고 실행된 내용을 db에저장 채굴 -> */}
        </Box>
        {/* node 1 */}
        <Grid container spacing={2}>
          <Grid item md={6}>
            <AppWeeklySales />
          </Grid>
          {/* node 2 */}
          <Grid item md={6}>
            <AppNewUsers />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
