import { supabase } from '../lib/supabase';
import { CartItem } from '../types';

interface PlaceOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  notes?: string;
  items: CartItem[];
}

export const placeOrder = async (payload: PlaceOrderPayload) => {
  const totalAmount = payload.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // 1. Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone || null,
      customer_email: payload.customer_email || null,
      customer_address: payload.customer_address || null,
      notes: payload.notes || null,
      total_amount: totalAmount,
      status: 'pending',
      // Legacy single-product fields — set from first item for backward compat
      product_name: payload.items.length === 1 ? payload.items[0].name : `${payload.items.length} items`,
      product_id: payload.items.length === 1 ? payload.items[0].product_id : null,
      quantity: payload.items.reduce((sum, i) => sum + i.qty, 0),
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert order items
  const orderItems = payload.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.name,
    quantity: item.qty,
    unit_price: item.price,
    total: item.price * item.qty,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
};
