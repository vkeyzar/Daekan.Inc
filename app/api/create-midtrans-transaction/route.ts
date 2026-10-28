import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { getErrorMessage } from '@/lib/errors';

export async function POST(req: NextRequest) {
  const { order_id, customer_details } = await req.json();

  if (!order_id) {
    return NextResponse.json({ error: 'order_id wajib diisi' }, { status: 400 });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi' }, { status: 500 });
  }

  try {
    // Query total harga asli langsung dari database Supabase berdasarkan order_id
    const cookieStore = await cookies();
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll: () => cookieStore.getAll(),
              setAll: () => {},
            },
          }
        );

    const { data: trx, error: trxError } = await supabase
      .from('transactions')
      .select('id, user_id, status, total_price, items, province, full_name, whatsapp')
      .eq('id', order_id)
      .single();

    if (trxError || !trx) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan di database' }, { status: 404 });
    }

    if (trx.status !== 'pending' && trx.status !== 'invoiced') {
      return NextResponse.json({ error: 'Transaksi sudah diproses atau dibatalkan' }, { status: 400 });
    }

    const realGrossAmount = Math.round(Number(trx.total_price));
    if (!Number.isFinite(realGrossAmount) || realGrossAmount <= 0) {
      return NextResponse.json({ error: 'Nominal transaksi tidak valid' }, { status: 400 });
    }

    // Rekonstruksi item_details dari database agar konsisten dengan gross_amount asli
    const rawItems = typeof trx.items === 'string' ? JSON.parse(trx.items) : trx.items;
    const itemDetails: { id: string; price: number; quantity: number; name: string }[] = Array.isArray(rawItems)
      ? rawItems.map((item: { id: string | number; price: number; quantity: number; name?: string }) => ({
          id: String(item.id),
          price: Math.round(Number(item.price)),
          quantity: Number(item.quantity),
          name: String(item.name || 'Item').substring(0, 50),
        }))
      : [];

    const itemsSum = itemDetails.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingDiff = realGrossAmount - itemsSum;
    if (itemDetails.length > 0 && shippingDiff > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        price: shippingDiff,
        quantity: 1,
        name: `Ongkir (${trx.province || 'REGULER'})`,
      });
    }

    const authString = Buffer.from(`${serverKey}:`).toString('base64');

    const MIDTRANS_API_URL = serverKey.includes('SB-')
      ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
      : 'https://app.midtrans.com/snap/v1/transactions';

    // Bikin ID unik yang pendek biar ga kena limit 50 karakter Midtrans
    const shortUniqueOrderId = `DAEKAN-${Date.now()}`;

    const payload = {
      transaction_details: {
        order_id: shortUniqueOrderId, // Ini yang masuk ke sistem Midtrans
        gross_amount: realGrossAmount,
      },
      // ✅ FIX: ID asli database kita simpan di laci rahasia custom_field1
      custom_field1: trx.id,
      customer_details: {
        first_name: trx.full_name || customer_details?.first_name,
        phone: trx.whatsapp || customer_details?.phone,
        email: customer_details?.email,
      },
      ...(itemDetails.length > 0 ? { item_details: itemDetails } : {}),
    };

    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages ? data.error_messages[0] : 'Gagal membuat transaksi Midtrans');
    }

    return NextResponse.json({ token: data.token, redirect_url: data.redirect_url });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
