'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/lib/ThemeContext';
import useCartStore from '@/lib/store/useCartStore';
import SidebarCart from '@/components/SidebarCart';
import { supabase } from '@/lib/supabaseClient';
import { FaBars, FaTimes, FaUser, FaShoppingBag } from 'react-icons/fa';

type DropdownName = 'collections' | 'profile' | null;
type HoverKey = 'all' | 'vtuber' | 'merch';

const COLLECTION_LINKS: { key: HoverKey; label: string; href: string }[] = [
  { key: 'all', label: 'All Collections', href: '/products' },
  { key: 'vtuber', label: 'Vtuber Collabs', href: '/products/collabs' },
  { key: 'merch', label: 'Daekan Merch', href: '/products/merch' },
];

const PRODUCT_LINE_BY_KEY = { vtuber: 'VTUBER COLLAB', merch: 'DAEKAN MERCH' } as const;

type CollectionCard = { id: string | number; name: string; image: string; isGenre: boolean; targetTab: string };

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<DropdownName>(null);
  const [activeHover, setActiveHover] = useState<HoverKey>('all');
  const [collectionCards, setCollectionCards] = useState<CollectionCard[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [randomImages, setRandomImages] = useState<{ vtuber: string | null; merch: string | null }>({ vtuber: null, merch: null });
  const [randomLoading, setRandomLoading] = useState<HoverKey | null>(null);
  const requestId = useRef(0);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const getUserRole = async (user: any) => {
    if (!user) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (data) setRole(data.role);
    else setRole(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) getUserRole(session.user);
      else setRole(null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) getUserRole(session.user);
      else setRole(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Tutup dropdown saat klik di luar navbar atau tekan Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setMobileCollectionsOpen(false);
    setOpenDropdown(null);
  };

  const toggleMobileCollections = () => {
    if (!mobileCollectionsOpen) {
      setActiveHover('all');
      loadCollectionCards();
    }
    setMobileCollectionsOpen((v) => !v);
  };

  // Thumbnail "All Collections" (logika sama seperti "More Daekan Goods" di homepage)
  const loadCollectionCards = async () => {
    setCollectionsLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('id, category_id, category, product_line, image_url'),
      supabase.from('categories').select('id, name').order('created_at', { ascending: false }),
    ]);
    const products: any[] = prodRes.data || [];
    const categories: any[] = catRes.data || [];
    const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const tabOf = (p: any) => ((p.product_line || '').toUpperCase().includes('COLLAB') ? 'collab' : 'merch');

    const genreCards = categories
      .map((cat) => {
        const prods = products.filter((p) => p.category_id === cat.id && p.image_url);
        if (!prods.length) return null;
        const p = pickRandom(prods);
        return { id: cat.id, name: cat.name, image: p.image_url, isGenre: true, targetTab: tabOf(p) };
      })
      .filter(Boolean) as CollectionCard[];

    const types = [...new Set(products.map((p) => (p.category || '').toUpperCase()).filter(Boolean))];
    const typeCards = types
      .map((type) => {
        const prods = products.filter((p) => (p.category || '').toUpperCase() === type && p.image_url);
        if (!prods.length) return null;
        const p = pickRandom(prods);
        return { id: type, name: type, image: p.image_url, isGenre: false, targetTab: tabOf(p) };
      })
      .filter(Boolean) as CollectionCard[];

    setCollectionCards([...genreCards, ...typeCards]);
    setCollectionsLoading(false);
  };

  // Ambil 1 produk acak berdasarkan product_line, dipanggil setiap kali di-hover
  const loadRandomProductImage = async (key: 'vtuber' | 'merch') => {
    const id = ++requestId.current;
    setRandomLoading(key);
    const { data } = await supabase
      .from('products')
      .select('image_url')
      .eq('product_line', PRODUCT_LINE_BY_KEY[key])
      .not('image_url', 'is', null);
    if (id !== requestId.current) return; // abaikan respons usang
    const images = (data || []).map((d: any) => d.image_url).filter(Boolean);
    const image = images.length ? images[Math.floor(Math.random() * images.length)] : null;
    setRandomImages((prev) => ({ ...prev, [key]: image }));
    setRandomLoading(null);
  };

  const handleCollectionHover = (key: HoverKey) => {
    setActiveHover(key);
    if (key !== 'all') loadRandomProductImage(key);
  };

  const toggleDropdown = (name: Exclude<DropdownName, null>) => {
    if (name === 'collections' && openDropdown !== 'collections') {
      setActiveHover('all');
      loadCollectionCards();
    }
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = async () => {
    setOpenDropdown(null);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const totalItems = hasHydrated ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <>
      <nav ref={navRef} className="sticky top-0 left-0 w-full z-[100] transition-all duration-300 font-sans bg-white dark:bg-black border-b border-black dark:border-white text-black dark:text-white py-3.5 md:py-4">
        <div className="w-full px-6 md:px-12 flex justify-between items-center relative">
          
          {/* KIRI: Logo Daekan */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="z-10 relative shrink-0 flex items-center"
          >
            <img
              src={
                theme === 'dark'
                  ? 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_White_Copy33.33x2.png'
                  : 'https://corhxzcsgvcckigxleeo.supabase.co/storage/v1/object/public/asset/Daekan_New_Logo_Black33.33x_copy2.png'
              }
              alt="Daekan Inc."
              className="h-[38px] md:h-[46px] w-auto object-contain scale-[1.35] origin-left transition-transform hover:scale-[1.4]"
            />
          </Link>

          {/* TENGAH: Menu Navigasi Desktop */}
          <div className="hidden md:flex gap-10 font-bold text-[13px] md:text-sm tracking-[0.2em] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/" onClick={() => setOpenDropdown(null)} className="uppercase hover:opacity-60 transition-opacity duration-200">
              HOME
            </Link>
            <button
              type="button"
              onClick={() => toggleDropdown('collections')}
              aria-expanded={openDropdown === 'collections'}
              aria-haspopup="true"
              className="uppercase tracking-[0.2em] hover:opacity-60 transition-opacity duration-200 cursor-pointer"
            >
              COLLECTIONS
            </button>
            <Link href="/reviews" onClick={() => setOpenDropdown(null)} className="uppercase hover:opacity-60 transition-opacity duration-200">
              REVIEWS
            </Link>
            <Link href="/about" onClick={() => setOpenDropdown(null)} className="uppercase hover:opacity-60 transition-opacity duration-200">
              ABOUT US
            </Link>
          </div>

          {/* KANAN: Icon Group (Theme, Cart, Profile, Mobile Menu) */}
          <div className="flex items-center gap-3.5 md:gap-4 z-10 relative shrink-0">
            
            {/* 1. Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-current hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 text-xs md:text-sm font-black cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '☀' : '◐'}
            </button>

            {/* 2. Cart Icon */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:opacity-60 transition-all focus:outline-none cursor-pointer"
              aria-label="Open Cart"
            >
              <FaShoppingBag size={18} />
              <span className="absolute -top-0.5 -right-0.5 text-[10px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border bg-black text-white dark:bg-white dark:text-black border-white dark:border-black">
                {totalItems}
              </span>
            </button>

            {/* 3. Profile Icon */}
            {session ? (
              <div className="hidden md:block relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('profile')}
                  aria-expanded={openDropdown === 'profile'}
                  aria-haspopup="true"
                  className="flex p-1 hover:opacity-60 transition-all cursor-pointer"
                  aria-label="Profile Menu"
                >
                  <FaUser size={17} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex p-1 hover:opacity-60 transition-all"
                aria-label="Login"
              >
                <FaUser size={17} />
              </Link>
            )}

            {/* 4. Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 hover:opacity-60 transition-all focus:outline-none cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <FaTimes size={21} /> : <FaBars size={21} />}
            </button>
            
          </div>
        </div>

        {/* Collections Mega Menu (klik, turun dari atas) */}
        {(
          <div
            aria-hidden={openDropdown !== 'collections'}
            className={`hidden md:block absolute top-full left-0 w-full z-[100] bg-white dark:bg-black border-b border-black dark:border-white shadow-xl transition-[opacity,transform,visibility] duration-300 ease-out will-change-[opacity,transform] motion-reduce:transition-none ${openDropdown === 'collections' ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-3 invisible pointer-events-none'}`}
          >
            <div className="max-w-6xl mx-auto px-12 py-8 grid grid-cols-[1fr_2fr] gap-12">
              {/* Kiri: link kategori */}
              <ul className="flex flex-col justify-center gap-1">
                {COLLECTION_LINKS.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onMouseEnter={() => handleCollectionHover(item.key)}
                      onFocus={() => handleCollectionHover(item.key)}
                      onClick={() => setOpenDropdown(null)}
                      className={`block py-3 text-sm md:text-base font-bold uppercase tracking-[0.15em] border-b border-zinc-200 dark:border-zinc-800 transition-opacity duration-200 ${
                        activeHover === item.key ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Kanan: preview dinamis */}
              <div className="relative h-72 overflow-hidden bg-transparent">
                {/* All Collections: grid thumbnail */}
                <div
                  className={`absolute inset-0 grid grid-cols-3 grid-rows-2 gap-3 transition-opacity duration-300 ${
                    activeHover === 'all' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {collectionCards.length === 0 ? (
                    <p className="col-span-3 row-span-2 flex items-center justify-center text-xs font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      {collectionsLoading ? 'LOADING...' : 'NO COLLECTIONS FOUND.'}
                    </p>
                  ) : (
                    collectionCards.slice(0, 6).map((card) => (
                      <Link
                        key={card.id}
                        href={`/products?${card.isGenre ? 'genre' : 'type'}=${encodeURIComponent(String(card.id))}`}
                        onClick={() => setOpenDropdown(null)}
                        className="group relative overflow-hidden bg-transparent"
                      >
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110 [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.35))] dark:[filter:drop-shadow(0_0_4px_rgba(125,211,252,0.9))_drop-shadow(0_0_14px_rgba(125,211,252,0.65))_drop-shadow(0_0_32px_rgba(167,139,250,0.55))]"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pt-6 pb-1.5">
                          <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">{card.name}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                {/* Vtuber Collabs / Daekan Merch: 1 foto produk acak */}
                {(['vtuber', 'merch'] as const).map((key) => (
                  <div
                    key={key}
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      activeHover === key ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {randomImages[key] ? (
                      <Link
                        href={key === 'vtuber' ? '/products/collabs' : '/products/merch'}
                        onClick={() => setOpenDropdown(null)}
                        className="block w-full h-full"
                      >
                        <img
                          key={randomImages[key]}
                          src={randomImages[key] as string}
                          alt={key === 'vtuber' ? 'Vtuber Collabs' : 'Daekan Merch'}
                          className="w-full h-full object-contain p-5 animate-in fade-in duration-500 [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.35))] dark:[filter:drop-shadow(0_0_4px_rgba(125,211,252,0.9))_drop-shadow(0_0_14px_rgba(125,211,252,0.65))_drop-shadow(0_0_32px_rgba(167,139,250,0.55))]"
                        />
                      </Link>
                    ) : (
                      <p className="w-full h-full flex items-center justify-center text-xs font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        {randomLoading === key ? 'LOADING...' : 'NO PRODUCT FOUND.'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Dropdown (klik, turun dari atas) */}
        {session && (
          <div
            aria-hidden={openDropdown !== 'profile'}
            className={`hidden md:block absolute top-full right-6 md:right-12 w-56 z-[100] bg-white dark:bg-black border border-black dark:border-white shadow-xl transition-[opacity,transform,visibility] duration-300 ease-out will-change-[opacity,transform] motion-reduce:transition-none ${openDropdown === 'profile' ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-3 invisible pointer-events-none'}`}
          >
            <Link
              href="/profile"
              onClick={() => setOpenDropdown(null)}
              className="block px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              Profile
            </Link>
            {role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setOpenDropdown(null)}
                className="block px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] border-b border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[61px] bottom-0 bg-white dark:bg-black border-t border-black dark:border-white z-50 flex flex-col justify-between p-8 overflow-y-auto">
            <nav className="flex flex-col space-y-5">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
              >
                HOME
              </Link>
              {/* Collections accordion (tap, bukan hover) */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <button
                  type="button"
                  onClick={toggleMobileCollections}
                  aria-expanded={mobileCollectionsOpen}
                  className="w-full text-left text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white hover:opacity-60 transition-opacity cursor-pointer"
                >
                  COLLECTIONS
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                    mobileCollectionsOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                  }`}
                  aria-hidden={!mobileCollectionsOpen}
                >
                  <div className="overflow-hidden">
                    <div className="flex gap-2 mb-4">
                      {COLLECTION_LINKS.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleCollectionHover(item.key)}
                          className={`flex-1 py-2 px-1 text-[11px] font-bold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${
                            activeHover === item.key
                              ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                              : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative h-56 overflow-hidden">
                      <div
                        className={`absolute inset-0 grid grid-cols-3 grid-rows-2 gap-2 transition-opacity duration-300 ${
                          activeHover === 'all' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        {collectionCards.length === 0 ? (
                          <p className="col-span-3 row-span-2 flex items-center justify-center text-xs font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                            {collectionsLoading ? 'LOADING...' : 'NO COLLECTIONS FOUND.'}
                          </p>
                        ) : (
                          collectionCards.slice(0, 6).map((card) => (
                            <Link
                              key={card.id}
                              href={`/products?${card.isGenre ? 'genre' : 'type'}=${encodeURIComponent(String(card.id))}`}
                              onClick={closeAllMenus}
                              className="relative overflow-hidden"
                            >
                              <img src={card.image} alt={card.name} loading="lazy" className="w-full h-full object-contain p-2 [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.35))] dark:[filter:drop-shadow(0_0_4px_rgba(125,211,252,0.9))_drop-shadow(0_0_14px_rgba(125,211,252,0.65))_drop-shadow(0_0_32px_rgba(167,139,250,0.55))]" />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pt-4 pb-1">
                                <p className="text-white text-[9px] font-black uppercase tracking-wider truncate">{card.name}</p>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>

                      {(['vtuber', 'merch'] as const).map((key) => (
                        <div
                          key={key}
                          className={`absolute inset-0 transition-opacity duration-300 ${
                            activeHover === key ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          {randomImages[key] ? (
                            <Link
                              href={key === 'vtuber' ? '/products/collabs' : '/products/merch'}
                              onClick={closeAllMenus}
                              className="block w-full h-full"
                            >
                              <img
                                src={randomImages[key] as string}
                                alt={key === 'vtuber' ? 'Vtuber Collabs' : 'Daekan Merch'}
                                className="w-full h-full object-contain p-3 [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.35))] dark:[filter:drop-shadow(0_0_4px_rgba(125,211,252,0.9))_drop-shadow(0_0_14px_rgba(125,211,252,0.65))_drop-shadow(0_0_32px_rgba(167,139,250,0.55))]"
                              />
                            </Link>
                          ) : (
                            <p className="w-full h-full flex items-center justify-center text-xs font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                              {randomLoading === key ? 'LOADING...' : 'NO PRODUCT FOUND.'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <Link
                      href={COLLECTION_LINKS.find((i) => i.key === activeHover)!.href}
                      onClick={closeAllMenus}
                      className="mt-4 block text-center text-xs font-black uppercase tracking-[0.25em] py-3 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      Browse {COLLECTION_LINKS.find((i) => i.key === activeHover)!.label} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                href="/reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
              >
                REVIEWS
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
              >
                ABOUT US
              </Link>
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeAllMenus}
                    className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-60 transition-opacity"
                  >
                    PROFILE
                  </Link>
                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={closeAllMenus}
                      className="text-lg font-black uppercase tracking-[0.25em] text-red-600 dark:text-red-500 border-b border-zinc-200 dark:border-zinc-800 pb-4 hover:opacity-70 transition-opacity"
                    >
                      ADMIN DASHBOARD
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white pb-4 hover:opacity-60 transition-opacity cursor-pointer"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeAllMenus}
                  className="text-lg font-black uppercase tracking-[0.25em] text-black dark:text-white pb-4 hover:opacity-60 transition-opacity"
                >
                  LOGIN / REGISTER
                </Link>
              )}
            </nav>

            <div className="pt-6 border-t border-black dark:border-white text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              DAEKAN INC. — OFFICIAL STORE
            </div>
          </div>
        )}
      </nav>

      <SidebarCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
