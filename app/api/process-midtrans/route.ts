import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { createClient } from '@supabase/supabase-js';
import { getErrorMessage } from '@/lib/errors';

// Worker QStash: memproses notifikasi Midtrans yang di-publish oleh /api/midtrans-webhook
// secara terurut per 3 transaksi (flowControl parallelism = 3).
// Request diverifikasi lewat signature QStash (QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY).

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Service Role Key bila ada (bypass RLS), fallback ke anon key
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MidtransPayload {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  custom_field1?: string;
  transaction_status?: string;
  fraud_status?: string;
}

interface StockItem {
  id: string;
  label?: string;
  size?: string;
  quantity?: number;
}

function isValidMidtransSignature(data: MidtransPayload): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || !data.signature_key) return false;
  const expected = createHash('sha512')
    .update(`${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(data.signature_key);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Kurangi stock_reserved dengan compare-and-set agar aman ketika 3 worker QStash
 * berjalan paralel untuk produk/ukuran yang sama.
 */
async function releaseReservedStock(rawItems: unknown) {
  const items: StockItem[] =
    typeof rawItems === 'string' ? JSON.parse(rawItems) : (rawItems as StockItem[]);
  if (!Array.isArray(items)) return;

  for (const item of items) {
    if (item.label !== 'LIMITED GEAR') continue;
    const itemSize = item.size || '-';
    const qty = item.quantity || 1;

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: stockData, error: selErr } = await supabase
        .from('product_stocks')
        .select('stock_reserved')
        .eq('product_id', item.id)
        .eq('size', itemSize)
        .maybeSingle();
      if (selErr) throw selErr;
      if (!stockData) break;

      const newReserved = Math.max(0, stockData.stock_reserved - qty);
      const { data: updated, error: updErr } = await supabase
        .from('product_stocks')
        .update({ stock_reserved: newReserved })
        .eq('product_id', item.id)
        .eq('size', itemSize)
        .eq('stock_reserved', stockData.stock_reserved)
        .select('product_id');
      if (updErr) throw updErr;
      if (updated && updated.length > 0) break;
    }
  }
}

async function handler(req: NextRequest) {
  try {
    const data: MidtransPayload = await req.json();
    const baseUrl = process.env.APP_URL ?? req.nextUrl.origin;

    // 0. Pastikan payload benar-benar berasal dari Midtrans
    if (!isValidMidtransSignature(data)) {
      console.error('Signature Midtrans tidak valid, diabaikan:', data.order_id);
      return NextResponse.json({ status: 'Invalid signature, ignored' });
    }

    // 1. Ekstrak ID transaksi (custom_field1 dulu)
    let dbOrderId = data.custom_field1;
    if (!dbOrderId && data.order_id) {
      dbOrderId = data.order_id.replace('DAEKAN-', '').substring(0, 36);
    }
    if (!dbOrderId) return NextResponse.json({ status: 'Ignored, no order id' });

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    let newStatus: 'verified' | 'canceled' | '' = '';

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || transactionStatus === 'settlement') {
        newStatus = 'verified';
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      newStatus = 'canceled';
    }

    if (!newStatus) return NextResponse.json({ status: 'Ignored' });

    // 2. Ambil data transaksi
    const { data: trxData, error: trxError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', dbOrderId)
      .maybeSingle();

    if (trxError) throw trxError;
    if (!trxData) {
      console.error('Order tidak ditemukan di DB:', dbOrderId);
      // 200 agar QStash tidak retry untuk order yang memang tidak ada
      return NextResponse.json({ message: 'Order tidak ditemukan, tapi diterima.' });
    }

    // 3. Ambil email user
    let userEmail: string | undefined;
    if (trxData.user_id) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', trxData.user_id)
          .maybeSingle();
        userEmail = profileData?.email;
      } catch (err) {
        console.error('Gagal get email:', err);
      }
    }

    const sendEmail = async (path: string, status: string, label: string) => {
      if (!userEmail) return;
      try {
        const secretKey = process.env.SECRET_KEY || process.env.INTERNAL_SECRET_KEY;
        await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(secretKey ? { Authorization: `Bearer ${secretKey}` } : {}),
          },
          body: JSON.stringify({ email: userEmail, transaction: trxData, status }),
        });
        console.log(`${label} terkirim ke:`, userEmail);
      } catch (emailErr) {
        console.error(`Gagal kirim ${label}:`, emailErr);
      }
    };

    // ===== LUNAS =====
    if (newStatus === 'verified') {
      if (trxData.status === 'verified') {
        return NextResponse.json({ status: 'Already processed' });
      }

      const { data: updated, error: updError } = await supabase
        .from('transactions')
        .update({ status: 'verified', paid_at: new Date().toISOString() })
        .eq('id', dbOrderId)
        .neq('status', 'verified')
        .select('id');
      if (updError) throw updError;
      if (!updated || updated.length === 0) {
        return NextResponse.json({ status: 'Already processed' });
      }

      await sendEmail('/api/send-invoice', 'paid', 'Invoice lunas');
      return NextResponse.json({ status: 'OK', new_status: 'verified' });
    }

    // ===== BATAL / EXPIRED =====
    if (newStatus === 'canceled') {
      if (trxData.status !== 'pending' && trxData.status !== 'invoiced') {
        return NextResponse.json({ status: 'Already processed' });
      }

      // A. Update status dulu dengan guard atomik agar retry/duplikat tidak merilis stok dua kali
      const { data: updated, error: updError } = await supabase
        .from('transactions')
        .update({ status: 'canceled' })
        .eq('id', dbOrderId)
        .in('status', ['pending', 'invoiced'])
        .select('id');
      if (updError) throw updError;
      if (!updated || updated.length === 0) {
        return NextResponse.json({ status: 'Already processed' });
      }

      // B. Restore stok dengan compare-and-set
      await releaseReservedStock(trxData.items);

      // C. Email batal
      await sendEmail('/api/send-status-update', 'canceled', 'Email batal');
      return NextResponse.json({ status: 'OK', new_status: 'canceled' });
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: unknown) {
    console.error('Process Midtrans Error:', getErrorMessage(error));
    // 5xx agar QStash melakukan retry
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);

