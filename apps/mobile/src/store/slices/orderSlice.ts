import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Order } from '@live-chat/types';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'order/fetchAll',
  async ({ type }: { type: 'buyer' | 'seller' }) => {
    const response = await axios.get(`http://localhost:3000/api/orders?type=${type}`);
    return response.data.data;
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchById',
  async (orderId: string) => {
    const response = await axios.get(`http://localhost:3000/api/orders/${orderId}`);
    return response.data.data;
  }
);

export const createOrder = createAsyncThunk(
  'order/create',
  async (data: {
    sellerId: string;
    products: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    const response = await axios.post('http://localhost:3000/api/orders', data);
    return response.data.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({
    orderId,
    status,
  }: {
    orderId: string;
    status: 'paid' | 'shipped' | 'delivered' | 'cancelled';
  }) => {
    const response = await axios.patch(
      `http://localhost:3000/api/orders/${orderId}/status`,
      { status }
    );
    return response.data.data;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch order';
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.selectedOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        state.orders = state.orders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        );
        if (state.selectedOrder?.id === updatedOrder.id) {
          state.selectedOrder = updatedOrder;
        }
      });
  },
});

export const { clearOrderError, setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer; 