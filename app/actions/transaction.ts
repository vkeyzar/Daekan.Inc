'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { getErrorMessage } from '@/lib/errors';

const SHIPPING_RATES: Record<string, number> = {
  JAWA_TENGAH: 15000,
  JAWA_TIMUR: 17000,
  JABODETABEK: 20000,
  JAWA_BARAT: 20000,
  LUAR_JAWA: 30000,
};

export interface CheckoutCartItem {
  id: string | number;
  size?: string;
  quantity: number;
  // Field lain dari cart (price, name, dll.) diabaikan: harga & nama diambil ulang dari DB.
  [key: string]: unknown;
}

export interface CheckoutFormInput {
  full_name: string;
  whatsapp: string;
  address: string;
  province: string;
}

export type CreateTransactionResult =
  | {
      ok: true;
      transactionId: string;
      totalPrice: number;
      shippingCost: number;
      userEmail: string;
      itemDetails: { id: string; price: number; quantity: number; name: string }[];
    }
  | { ok: false; code: 'UNAUTHENTICATED' | 'INVALID_INPUT' | 'OUT_OF_STOCK' | 'ERROR'; message: string };

interface Reserved {
  id: string | number;
  size: string;
  qty: number;
}

/** Client dengan hak penuh (service role) bila tersedia; fallback ke client milik user. */
function getDataClient(userClient: ReturnType<typeof createServerClient>) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return userClient;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Kurangi stock_reserved dengan compare-and-set agar aman dari race condition. */
async function releaseStock(db: ReturnType<typeof getDataClient>, items: Reserved[]) {
  for (const it of items) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: row } = await db
        .from('product_stocks')
        .select('stock_reserved')
        .eq('product_id', it.id)
        .eq('size', it.size)
        .maybeSingle();
      if (!row) break;

      const { data: updated } = await db
        .from('product_stocks')
        .update({ stock_reserved: Math.max(0, row.stock_reserved - it.qty) })
        .eq('product_id', it.id)
        .eq('size', it.size)
        .eq('stock_reserved', row.stock_reserved) // hanya berhasil jika belum diubah pihak lain
        .select('product_id');
      if (updated && updated.length > 0) break;
    }
  }
}

export async function createTransaction(
  cartItems: CheckoutCartItem[],
  form: CheckoutFormInput
): Promise<CreateTransactionResult> {
  // 1. Autentikasi dari cookie sesi (bukan dari data yang dikirim client)
  const cookieStore = await cookies();
  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Action bisa menulis cookie, abaikan jika konteks read-only
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();
  if (authError || !user) {
    return { ok: false, code: 'UNAUTHENTICATED', message: 'Sesi otentikasi tidak valid. Silakan login kembali.' };
  }

  // 2. Validasi input
  const fullName = form?.full_name?.trim();
  const whatsapp = form?.whatsapp?.trim();
  const address = form?.address?.trim();
  const province = form?.province;
  if (!fullName || !whatsapp || !address || whatsapp.length < 9 || !(province in SHIPPING_RATES)) {
    return { ok: false, code: 'INVALID_INPUT', message: 'Data pengiriman tidak lengkap atau tidak valid.' };
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { ok: false, code: 'INVALID_INPUT', message: 'Keranjang belanja kosong.' };
  }
  if (cartItems.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) {
    return { ok: false, code: 'INVALID_INPUT', message: 'Jumlah item tidak valid.' };
  }

  const db = getDataClient(userClient);
  const reserved: Reserved[] = [];

  try {
    // 3. Ambil harga/nama/label asli dari DB (jangan percaya harga dari client)
    const ids = [...new Set(cartItems.map((i) => i.id))];
    const { data: products, error: prodError } = await db.from('products').select('*').in('id', ids);
    if (prodError) throw prodError;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productMap = new Map<string, any>((products ?? []).map((p: any) => [String(p.id), p]));

    const items = cartItems.map((ci) => {
      const p = productMap.get(String(ci.id));
      if (!p) throw new Error('Produk tidak ditemukan. Silakan perbarui keranjang Anda.');
      if (p.is_open === false) {
        throw new Error(`Produk "${p.name}" sedang ditutup / Sold Out.`);
      }
      if (p.label === 'PRE-ORDER' && p.sale_end_date && new Date(p.sale_end_date).getTime() <= Date.now()) {
        throw new Error(`Masa Pre-Order untuk produk "${p.name}" telah berakhir.`);
      }
      return {
        ...ci,
        id: p.id,
        name: p.name ?? ci.name,
        price: Number(p.price),
        label: p.label ?? ci.label,
        size: ci.size || '-',
      };
    });

    // 4. Kunci stok secara atomik lewat RPC reserve_stock
    for (const item of items) {
      if (item.label !== 'LIMITED GEAR') continue;

      const { data: ok, error: rpcError } = await db.rpc('reserve_stock', {
        p_product_id: item.id,
        p_size: item.size,
        p_qty: item.quantity,
      });
      if (rpcError) throw new Error(`Kesalahan sinkronisasi stok: ${rpcError.message}`);

      if (!ok) {
        await releaseStock(db, reserved);
        return {
          ok: false,
          code: 'OUT_OF_STOCK',
          message: `Mohon maaf, stok untuk produk "${item.name}" (Ukuran: ${item.size}) baru saja habis dipesan oleh pelanggan lain. Silakan sesuaikan keranjang belanja Anda.`,
        };
      }
      reserved.push({ id: item.id, size: item.size, qty: item.quantity });
    }

    // 5. Hitung total di server & simpan transaksi (status 'pending' = belum bayar)
    const basePrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = SHIPPING_RATES[province];
    const totalPrice = basePrice + shippingCost;

    const productSummary = items.map((i) => `${i.name} [Size: ${i.size}] (Qty: ${i.quantity})`).join(' | ');
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const sizeSummary = items.map((i) => i.size).join(', ');

    const { data: trx, error: insertError } = await db
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          full_name: fullName,
          whatsapp,
          address,
          province,
          city: '-',
          items,
          product_name: productSummary,
          quantity: totalQty,
          size: sizeSummary,
          shipping_method: `REGULER (${province})`,
          delivery_method: 'SHIPMENT',
          total_price: totalPrice,
          status: 'pending',
        },
      ])
      .select('id')
      .single();
    if (insertError) throw insertError;

    const itemDetails = items.map((i) => ({
      id: String(i.id),
      price: i.price,
      quantity: i.quantity,
      name: String(i.name).substring(0, 50),
    }));
    itemDetails.push({ id: 'SHIPPING', price: shippingCost, quantity: 1, name: `Ongkir (${province})` });

    return {
      ok: true,
      transactionId: trx.id,
      totalPrice,
      shippingCost,
      userEmail: user.email ?? '',
      itemDetails,
    };
  } catch (error: unknown) {
    // Insert/langkah lain gagal: lepaskan stok yang sudah terlanjur dikunci
    await releaseStock(db, reserved);
    return { ok: false, code: 'ERROR', message: getErrorMessage(error) };
  }
}
