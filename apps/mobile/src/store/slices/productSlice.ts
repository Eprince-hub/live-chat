import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product } from '@live-chat/types';
import endpoints from '../../config/api';
import api from '../../lib/api';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchAll',
  async (sellerId?: string) => {
    const url = sellerId
      ? `${endpoints.products.list}?sellerId=${sellerId}`
      : endpoints.products.list;
    const response = await api.get(url);
    return response.data.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (productId: string) => {
    const response = await api.get(endpoints.products.getById(productId));
    return response.data.data;
  }
);

export const createProduct = createAsyncThunk(
  'product/create',
  async (data: {
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    category: string;
    inventory: number;
  }) => {
    const response = await api.post(endpoints.products.create, data);
    return response.data.data;
  }
);

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({
    productId,
    data,
  }: {
    productId: string;
    data: Partial<Product>;
  }) => {
    const response = await api.patch(
      endpoints.products.update(productId),
      data
    );
    return response.data.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (productId: string) => {
    await api.delete(endpoints.products.delete(productId));
    return productId;
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.selectedProduct = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create product';
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        state.products = state.products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        );
        if (state.selectedProduct?.id === updatedProduct.id) {
          state.selectedProduct = updatedProduct;
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const deletedProductId = action.payload;
        state.products = state.products.filter(
          (product) => product.id !== deletedProductId
        );
        if (state.selectedProduct?.id === deletedProductId) {
          state.selectedProduct = null;
        }
      });
  },
});

export const { clearProductError, setSelectedProduct } = productSlice.actions;
export default productSlice.reducer; 