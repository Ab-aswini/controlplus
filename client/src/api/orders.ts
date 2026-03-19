import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';

export const getOrders = async (status?: string): Promise<Order[]> => {
  let query = supabase
    .from('orders')
    .select('*, order_items(id)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((o: any) => ({
    ...o,
    item_count: o.order_items?.length || (o.product_name ? 1 : 0),
    order_items: undefined, // Don't include raw join data
  })) as Order[];
};

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as OrderItem[];
};

export const createOrder = async (order: Partial<Order>, items?: { product_id: string | null; product_name: string; quantity: number; unit_price: number }[]) => {
  // Calculate total from items if provided
  const totalAmount = items
    ? items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
    : order.total_amount;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...order,
      total_amount: totalAmount,
      product_name: items && items.length === 1 ? items[0].product_name : items ? `${items.length} items` : order.product_name,
      product_id: items && items.length === 1 ? items[0].product_id : order.product_id,
      quantity: items ? items.reduce((sum, i) => sum + i.quantity, 0) : order.quantity,
    })
    .select()
    .single();

  if (error) throw error;

  // Insert order items
  if (items && items.length > 0) {
    const orderItems = items.map(item => ({
      order_id: data.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;
  }

  return data;
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  const { data, error } = await supabase
    .from('orders')
    .update(order)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteOrder = async (id: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
