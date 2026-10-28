import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { qstashClient } from '@/lib/qstash';
import { getErrorMessage } from '@/lib/errors';

function isValidMidtransSignature(payload: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || !payload?.signature_key) return false;
  const expected = createHash('sha512')
    .update(`${payload.order_id ?? ''}${payload.status_code ?? ''}${payload.gross_amount ?? ''}${serverKey}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(payload.signature_key);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Webhook Midtrans: meneruskan notifikasi ke antrean QStash dengan Flow Control (parallelism: 3)
 * agar pemrosesan ke database berjalan terurut per maksimal 3 transaksi sekaligus.
 * Pemrosesan sebenarnya (update DB, restore stok, kirim email) ada di /api/process-midtrans.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Pelindung Test Notification dari Midtrans Dashboard (sebelum masuk QStash)
    if (typeof payload?.order_id === 'string' && payload.order_id.includes('payment_notif_test')) {
      return NextResponse.json({ message: 'Test webhook berhasil!' });
    }

    // Verifikasi signature_key Midtrans di baris paling atas sebelum memproses/publish ke QStash
    if (!isValidMidtransSignature(payload)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const destination = `${process.env.APP_URL ?? req.nextUrl.origin}/api/process-midtrans`;

    // Deduplication ID agar notifikasi duplikat dari Midtrans untuk status yang sama tidak memenuhi antrean
    const deduplicationId =
      payload?.order_id && payload?.transaction_status
        ? `${payload.order_id}-${payload.transaction_status}-${payload.status_code ?? ''}`
        : undefined;

    await qstashClient.publishJSON({
      url: destination,
      body: payload,
      deduplicationId,
      flowControl: {
        key: 'midtrans-transaction-queue',
        parallelism: 3,
      },
    });

    return NextResponse.json({ status: 'OK' });
  } catch (error: unknown) {
    console.error('Webhook gagal publish ke QStash:', getErrorMessage(error));
    // Balas 5xx agar Midtrans melakukan retry notifikasi
    return NextResponse.json({ error: 'Gagal meneruskan notifikasi' }, { status: 500 });
  }
}

