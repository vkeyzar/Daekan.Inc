'use client';

// 1. Definisikan struktur data produk (sesuaikan dengan tabel database lo nanti)
export interface ProductData {
  id: string | number;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
}

// 2. Definisikan tipe untuk props yang diterima komponen ini
interface SquareProductCardProps {
  product: ProductData;
  onOpenModal: (product: ProductData) => void;
}

export default function SquareProductCard({ product, onOpenModal }: SquareProductCardProps) {
  
  // 3. Tambahkan tipe 'number' pada parameter price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      className="group relative cursor-pointer flex flex-col gap-3"
      onClick={() => onOpenModal(product)}
    >
      {/* Container Gambar (Kotak Presisi) */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-sm border border-transparent dark:border-gray-800 transition-colors">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs font-medium">
            NO IMAGE
          </div>
        )}
        
        {/* Overlay Hover Effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors duration-300" />
      </div>

      {/* Info Produk */}
      <div className="flex flex-col space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-wide text-black dark:text-white truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}