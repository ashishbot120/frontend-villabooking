import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Villa } from '../../types';

// Define the type for a single cart item
interface CartItem {
    _id: string;
    villa: Villa; // Assuming Villa type is available or define it here
    checkIn: string;
    checkOut: string;
    guests: number;
    price: number;
}

// --- FIX 1: Define the type for the data needed to ADD an item ---
interface AddToCartData {
    villa: string; // On creation, we usually just pass the villa ID
    checkIn: string;
    checkOut: string;
    guests: number;
    price: number;
}
// -----------------------------------------------------------------

interface CartState {
    items: CartItem[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CartState = {
    items: [],
    status: 'idle',
};

// --- ASYNC THUNKS ---
export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
    const response = await axios.get('http://localhost:5000/api/cart', { withCredentials: true });
    return response.data;
});

// --- FIX 2: Use the AddToCartData interface instead of 'any' ---
export const addToCart = createAsyncThunk('cart/addToCart', async (itemData: AddToCartData) => {
    const response = await axios.post('http://localhost:5000/api/cart', itemData, { withCredentials: true });
    toast.success('Added to Cart!');
    return response.data;
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (itemId: string) => {
    const response = await axios.delete(`http://localhost:5000/api/cart/${itemId}`, { withCredentials: true });
    toast.success('Removed from Cart');
    return response.data;
});

export const checkout = createAsyncThunk('cart/checkout', async () => {
    const response = await axios.post('http://localhost:5000/api/cart/checkout', {}, { withCredentials: true });
    toast.success('Booking Successful!');
    return response.data;
});


const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.items = action.payload;
            })
            .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.items = action.payload;
            })
            .addCase(checkout.fulfilled, (state) => {
                state.items = []; // Clear cart on successful checkout
            });
    },
});

export default cartSlice.reducer;