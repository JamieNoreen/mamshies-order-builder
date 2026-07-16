import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { CategorySidebar } from '../layout/CategorySidebar';
import { OrderSummary } from '../layout/OrderSummary';
import { ProductGrid } from '../layout/ProductGrid';
import { PartyBoxBuilder } from '../components/partybox/PartyBoxBuilder';
import { GrazingTableView } from '../components/grazing/GrazingTableView';
import { PackedMealsView } from '../components/packedmeals/PackedMealsView';
import { QuickCartPill } from '../layout/QuickCartPill';
import { MobileBottomNavigation } from '../layout/MobileBottomNavigation';
import { EmptyState } from '../components/shared/EmptyState';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useCartStore } from '../store/useCartStore';
import menuData from '../data/menu.json';
import type { Product } from '../types';
import { SearchBar } from '../components/shared/SearchBar';

// Custom Category-Specific views datasets
const CATERING_PACKAGES: Product[] = [
  {
    id: 'pkg-classic',
    title: 'Classic Celebration Buffet',
    category: 'catering-packages',
    sizes: ['15-20 pax', '30-40 pax', '50-60 pax'],
    prices: {
      '15-20 pax': '6500',
      '30-40 pax': '12000',
      '50-60 pax': '18000',
    },
    description: 'A traditional party buffet: includes 1 Pork, 1 Chicken, 1 Pasta, Chopsuey Special, Steamed Rice, and drinks.',
  },
  {
    id: 'pkg-fiesta',
    title: 'Mamshies Signature Fiesta',
    category: 'catering-packages',
    sizes: ['15-20 pax', '30-40 pax', '50-60 pax'],
    prices: {
      '15-20 pax': '8500',
      '30-40 pax': '15500',
      '50-60 pax': '24000',
    },
    description: 'A premium feast: Lechon Kawali, Beef Caldereta, Flavored Wings, Carbonara, Garden Salad, fresh fruits, and drinks.',
  },
];

// Map JSON category keys to CATEGORY ID constants
const categoryMapping: Record<string, string> = {
  'vegetables': 'VEGGIES',
  'salad': 'SALAD',
  'chicken': 'CHICKEN',
  'pork': 'PORK',
  'beef': 'BEEF',
  'seafood': 'SEAFOOD',
  'pasta': 'PASTA',
};

// Generate list of standard products dynamically from menu.json
const STANDARD_PRODUCTS: Product[] = [];
Object.entries(categoryMapping).forEach(([catId, jsonKey]) => {
  const items = menuData[jsonKey as keyof typeof menuData] || [];
  items.forEach((itemObj: any, index: number) => {
    const sizes = Object.keys(itemObj.prices);
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    sizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    STANDARD_PRODUCTS.push({
      id: `${catId}-${index}-${itemObj.item.replace(/\s+/g, '-').toLowerCase()}`,
      title: itemObj.item,
      category: catId,
      prices: itemObj.prices,
      sizes: sizes,
      description: `Delicious home-cooked style ${itemObj.item.toLowerCase()} prepared fresh with select premium ingredients.`,
    });
  });
});

// Combine all products for global search purposes
const ALL_PRODUCTS = [...STANDARD_PRODUCTS, ...CATERING_PACKAGES];

export const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState('party-box');
  const [searchValue, setSearchValue] = useState('');
  const [mobileTab, setMobileTab] = useState<'menu' | 'summary'>('menu');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const addItem = useCartStore((state) => state.addItem);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const cartCount = useCartStore((state) => state.getTotalItems());

  // Filter products matching search and selected category
  const filteredProducts = ALL_PRODUCTS.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchValue.toLowerCase());
    
    // Scopes search strictly to the currently selected menu category
    return matchesSearch && product.category === selectedCategoryId;
  });

  const handleOpenCartMobile = () => {
    setMobileTab('summary');
  };

  const handleBackToMenu = () => {
    setMobileTab('menu');
  };

  // Center Content renderer representing category-specific views
  const renderCenterContent = () => {
    if (isMobile && mobileTab === 'summary') {
      return (
        <div className="flex flex-col h-[calc(100vh-112px)] pb-2">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-2 mb-4 font-manrope font-bold text-sm text-primary select-none px-2 active:scale-95"
          >
            ← Back to Menu
          </button>
          <OrderSummary
            className="border-none bg-white rounded-2xl h-full shadow-sm"
            onCheckout={() => navigate('/checkout')}
          />
        </div>
      );
    }

    const showSearchBar = !['party-box', 'catering-packages', 'packed-meals', 'grazing-table'].includes(selectedCategoryId);

    return (
      <div className="space-y-10 pb-20 md:pb-8">
        {/* Search Bar - page content search */}
        {showSearchBar && (
          <div className="w-full max-w-md">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search catering dishes..."
            />
          </div>
        )}

        {/* Category Views Handler */}
        {searchValue.trim() !== '' ? (
          // Global Search Results View
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-fraunces font-bold text-xl md:text-2xl text-text-charcoal">
                  Search Results
                </h3>
                <p className="font-manrope font-normal text-xs text-secondary/50 mt-0.5">
                  Matching "{searchValue}"
                </p>
              </div>
              <span className="font-manrope font-bold text-xs text-secondary/50">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'dish' : 'dishes'} found
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} onAddProduct={addItem} />
            ) : (
              <EmptyState
                title="No dishes found"
                description={`We couldn't find any dishes matching "${searchValue}". Try editing your query or choosing a category.`}
                iconName="Inbox"
              />
            )}
          </section>
        ) : (
          // Category Specific Ordering Experience Views
          <>
            {selectedCategoryId === 'party-box' && (
              <section className="space-y-6">
                <PartyBoxBuilder dishes={STANDARD_PRODUCTS} />
              </section>
            )}

            {selectedCategoryId === 'catering-packages' && (
              <section className="space-y-6">
                <div>
                  <h3 className="font-fraunces font-bold text-xl md:text-2xl text-text-charcoal">
                    Catering Packages
                  </h3>
                  <p className="font-manrope font-normal text-xs text-secondary/50 mt-0.5">
                    Pre-set buffet options perfect for larger events and gatherings
                  </p>
                </div>
                <ProductGrid products={CATERING_PACKAGES} onAddProduct={addItem} />
              </section>
            )}

            {selectedCategoryId === 'packed-meals' && (
              <section className="space-y-6">
                <PackedMealsView dishes={STANDARD_PRODUCTS} />
              </section>
            )}

            {selectedCategoryId === 'grazing-table' && (
              <section className="space-y-6">
                <GrazingTableView />
              </section>
            )}

            {/* Standard Category Grid View */}
            {!['party-box', 'catering-packages', 'packed-meals', 'grazing-table'].includes(selectedCategoryId) && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-fraunces font-bold text-xl md:text-2xl text-text-charcoal capitalize">
                      {selectedCategoryId.replace('-', ' ')}
                    </h3>
                    <p className="font-manrope font-normal text-xs text-secondary/50 mt-0.5">
                      Showing delicious dishes from our standard kitchen recipe
                    </p>
                  </div>
                  <span className="font-manrope font-bold text-xs text-secondary/50">
                    {filteredProducts.length} Items Available
                  </span>
                </div>

                {filteredProducts.length > 0 ? (
                  <ProductGrid products={filteredProducts} onAddProduct={addItem} />
                ) : (
                  <EmptyState
                    title="No dishes found"
                    description="We couldn't find any dishes under this category at the moment."
                    iconName="Inbox"
                  />
                )}
              </section>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <AppLayout
      sidebar={
        !(isMobile && mobileTab === 'summary') ? (
          <CategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              setSearchValue(''); // reset search on category toggle
              if (isMobile) setMobileTab('menu');
            }}
          />
        ) : undefined
      }
      content={renderCenterContent()}
      summary={
        <OrderSummary
          onCheckout={() => navigate('/checkout')}
        />
      }
      mobileBottomNav={
        <MobileBottomNavigation
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          cartCount={cartCount}
        />
      }
    >
      {/* Floating Quick Cart Pill - Active on mobile when menu tab is showing */}
      {isMobile && mobileTab === 'menu' && (
        <QuickCartPill
          itemCount={cartCount}
          totalPrice={subtotal}
          onClick={handleOpenCartMobile}
        />
      )}
    </AppLayout>
  );
};
