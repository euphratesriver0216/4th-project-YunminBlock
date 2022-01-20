import PropTypes from 'prop-types';
// material
import { Grid, Box } from '@mui/material';
import ShopProductCard from './ProductCard';

// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired
};

export default function ProductList({ products, ...other }) {
  return (
    <Grid container spacing={3} {...other}>
      <Box>dd</Box>
    </Grid>
  );
}
