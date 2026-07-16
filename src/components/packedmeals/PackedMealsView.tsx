import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { QuantitySelector } from '../shared/QuantitySelector';
import { PrimaryButton } from '../shared/PrimaryButton';
import type { Product } from '../../types';
import { Plus, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PackedMealPackage {
  id: string;
  title: string;
  basePrice: number;
  description: string;
  imageUrl: string;
  combos: {
    id: string;
    name: string;
    details: string;
    price?: number;
  }[];
}

const PACKED_MEAL_PACKAGES: PackedMealPackage[] = [
  {
    id: 'meal-most-popular',
    title: 'Most Popular',
    basePrice: 130,
    description: 'Rice + Meat + Vegetable standard lunch combo',
    imageUrl: '/Mamshies-Food-Assets/Packed/STANDARD.webp',
    combos: [
      { id: 'combo-a', name: 'Combo A', details: 'Rice + Chopsuey + Cordon Bleu' },
      { id: 'combo-b', name: 'Combo B', details: 'Rice + 7 Kinds + Fried Chicken' },
      { id: 'combo-c', name: 'Combo C', details: 'Rice + Mixed Vegetables + Pork/Chicken Teriyaki' },
      { id: 'combo-d', name: 'Combo D', details: 'Rice + Potato Salad + Sweet & Sour Pork' },
    ],
  },
  {
    id: 'meal-fiesta-combo',
    title: 'Fiesta Combo',
    basePrice: 160,
    description: 'Rice + Two Meats + Vegetable + Puto special feast',
    imageUrl: '/Mamshies-Food-Assets/Packed/FIESTA.webp',
    combos: [
      { id: 'combo-e', name: 'Combo E', details: 'Rice + Chopsuey + Chicken Pastel + Lumpiang Shanghai' },
      { id: 'combo-f', name: 'Combo F', details: 'Rice + 7 Kinds + Pork Hamonado + Fried Fish Fillet' },
      { id: 'combo-g', name: 'Combo G', details: 'Rice + Mixed Vegetables + Beef Caldereta + Cordon Bleu' },
      { id: 'combo-h', name: 'Combo H', details: 'Rice + Cucumber Egg Salad + Pork Sisig + Pork Tonkatsu' },
    ],
  },
  {
    id: 'meal-pasta-licious',
    title: 'Pasta-licious',
    basePrice: 150,
    description: 'Pasta + Meat + Vegetable light platter combo',
    imageUrl: '/Mamshies-Food-Assets/Packed/PASTALICIOUS.webp',
    combos: [
      { id: 'combo-p1', name: 'Combo P1', details: 'Bihon + Garden Salad + Fried Chicken' },
      { id: 'combo-p2', name: 'Combo P2', details: 'Canton + Mixed Vegetables + Fried Fish Fillet' },
      { id: 'combo-p3', name: 'Combo P3', details: 'Spaghetti with Meatballs + Cucumber Egg Salad + Cordon Bleu Slices' },
      { id: 'combo-p4', name: 'Combo P4', details: 'Carbonara + Potato Salad + Lumpiang Shanghai' },
    ],
  },
  {
    id: 'meal-silog-meals',
    title: 'Silog Meals',
    basePrice: 110,
    description: 'Classic garlic rice, fried egg, and native breakfast specials',
    imageUrl: '/Mamshies-Food-Assets/Packed/SILOG.webp',
    combos: [
      { id: 'silog-tosilog', name: 'Tosilog (Budget)', details: 'Sweet Cured Pork + Sinangag + Itlog', price: 110 },
      { id: 'silog-hotsilog', name: 'Hotsilog (Budget)', details: 'Hotdog + Sinangag + Itlog', price: 110 },
      { id: 'silog-spamsilog', name: 'Spamsilog (Budget)', details: 'Spam slices + Sinangag + Itlog', price: 110 },
      { id: 'silog-chicksilog', name: 'Chicksilog (Standard)', details: 'Fried Chicken + Sinangag + Itlog', price: 125 },
      { id: 'silog-bangsilog', name: 'Bangsilog (Standard)', details: 'Fried Bangus + Sinangag + Itlog', price: 125 },
      { id: 'silog-longsilog', name: 'Longsilog (Standard)', details: 'Sweet Longganisa + Sinangag + Itlog', price: 125 },
      { id: 'silog-tapsilog', name: 'Tapsilog (Premium)', details: 'Beef Tapa + Sinangag + Itlog', price: 140 },
      { id: 'silog-sisigsilog', name: 'Sisigsilog (Premium)', details: 'Pork Sisig + Sinangag + Itlog', price: 140 },
      { id: 'silog-lechonsilog', name: 'Lechonsilog (Premium)', details: 'Lechon Kawali + Sinangag + Itlog', price: 140 },
    ],
  },
];

const CATEGORY_OPTIONS = [
  { id: 'chicken', name: 'Chicken', emoji: '🍗' },
  { id: 'beef', name: 'Beef', emoji: '🥩' },
  { id: 'pork', name: 'Pork', emoji: '🐷' },
  { id: 'seafood', name: 'Seafood', emoji: '🦐' },
  { id: 'salad', name: 'Salad', emoji: '🥗' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥦' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
];

const BENTO_TYPES = [
  { id: 3, name: '3-Compartment Bento', desc: 'Best for lighter meals' },
  { id: 4, name: '4-Compartment Bento', desc: 'Most Popular' },
  { id: 5, name: '5-Compartment Bento', desc: 'Complete Meal' },
];

interface PackedMealsViewProps {
  dishes?: Product[];
}

export const PackedMealsView: React.FC<PackedMealsViewProps> = ({ dishes = [] }) => {
  const addItem = useCartStore((state) => state.addItem);

  // States for standard packages
  const [selections, setSelections] = useState<Record<string, { comboId: string; quantity: number }>>({
    'meal-most-popular': { comboId: 'combo-a', quantity: 1 },
    'meal-fiesta-combo': { comboId: 'combo-e', quantity: 1 },
    'meal-pasta-licious': { comboId: 'combo-p1', quantity: 1 },
    'meal-silog-meals': { comboId: 'silog-tosilog', quantity: 1 },
  });

  const handleComboChange = (pkgId: string, comboId: string) => {
    setSelections((prev) => ({ ...prev, [pkgId]: { ...prev[pkgId], comboId } }));
  };

  const handleQtyChange = (pkgId: string, delta: number) => {
    setSelections((prev) => {
      const curr = prev[pkgId];
      const newQty = Math.max(1, curr.quantity + delta);
      return { ...prev, [pkgId]: { ...curr, quantity: newQty } };
    });
  };

  const handleAddStandardToOrder = (pkg: PackedMealPackage) => {
    const selection = selections[pkg.id];
    const combo = pkg.combos.find((c) => c.id === selection.comboId) || pkg.combos[0];
    const price = combo.price || pkg.basePrice;

    const mealProduct: Product = {
      id: `packed-meal-${pkg.id}-${combo.id}-${Date.now()}`,
      title: `Packed Meal: ${pkg.title} (${combo.name})`,
      category: 'packed-meals',
      prices: { 'S': price.toString() },
      sizes: ['S'],
    };

    addItem(
      mealProduct,
      'S',
      selection.quantity,
      price,
      'Single Box',
      [`Package Combo: ${combo.name}`, `Dish Details: ${combo.details}`, 'Includes Spoon & Fork Set']
    );

    setSelections((prev) => ({ ...prev, [pkg.id]: { ...prev[pkg.id], quantity: 1 } }));
  };

  // States for Meal Builder
  const [isBuilderExpanded, setIsBuilderExpanded] = useState(false);
  const [bentoType, setBentoType] = useState<number | null>(null);
  const [base, setBase] = useState<'rice' | 'pasta' | null>(null);
  const [pastaDishId, setPastaDishId] = useState<string>('');
  const [slots, setSlots] = useState<{ category: string; dishId: string }[]>([]);
  
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [isPastaDropdownOpen, setIsPastaDropdownOpen] = useState(false);
  const [customQuantity, setCustomQuantity] = useState(1);

  // Auto-scroll when the meal builder expands
  useEffect(() => {
    if (isBuilderExpanded) {
      const timer = setTimeout(() => {
        const element = document.getElementById('meal-builder-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isBuilderExpanded]);

  // Filter out other packages
  const standardDishes = dishes.filter(
    (d) => !['party-box', 'catering-packages', 'packed-meals', 'grazing-table'].includes(d.category)
  );

  const pastaDishes = standardDishes.filter((d) => d.category === 'pasta');

  const handleSelectBentoType = (typeId: number) => {
    setBentoType(typeId);
    // Initialize slots to match the Bento type minus 1 for the base (e.g., 3-compartment => 2 custom dishes)
    const slotCount = Math.max(typeId - 1, 0);
    const newSlots = Array.from({ length: slotCount }).map(() => ({ category: '', dishId: '' }));
    setSlots(newSlots);
    setOpenDropdownIdx(null);
  };

  const handleSelectSlotCategory = (idx: number, category: string) => {
    const updated = [...slots];
    updated[idx] = { category, dishId: '' };
    setSlots(updated);
    setOpenDropdownIdx(null);
  };

  const handleSelectSlotDish = (idx: number, dishId: string) => {
    const updated = [...slots];
    updated[idx].dishId = dishId;
    setSlots(updated);
    setOpenDropdownIdx(null);
  };

  // Validation
  const isBaseValid = base === 'rice' || (base === 'pasta' && pastaDishId !== '');
  const isSlotsValid = slots.length > 0 && slots.every((s) => s.dishId !== '');
  const isValidCustom = bentoType !== null && isBaseValid && isSlotsValid;

  let customUnitPrice = 0;
  if (base) {
    let rawTotal = 0;
    
    // Add dish costs
    slots.forEach(slot => {
      const dish = standardDishes.find(d => d.id === slot.dishId);
      if (dish && dish.prices['S']) {
        const smallPrice = parseFloat(dish.prices['S'].replace(/,/g, ''));
        rawTotal += smallPrice / 15;
      }
    });

    if (base === 'rice') {
      rawTotal += 30; // Rice (fixed price)
    } else if (base === 'pasta' && pastaDishId) {
      const pastaDish = pastaDishes.find(d => d.id === pastaDishId);
      if (pastaDish && pastaDish.prices['S']) {
        const smallPrice = parseFloat(pastaDish.prices['S'].replace(/,/g, ''));
        rawTotal += smallPrice / 15;
      }
    }

    rawTotal += 20; // Container

    // Fix potential floating point issues before ceiling
    const fixedTotal = Math.round(rawTotal * 100) / 100;

    // Round UP to the nearest 10
    customUnitPrice = Math.ceil(fixedTotal / 10) * 10;
  }
  
  const totalPrice = customUnitPrice * customQuantity;

  const handleAddCustomToOrder = () => {
    if (!isValidCustom) return;

    const customProduct: Product = {
      id: `custom-bento-${Date.now()}`,
      title: `Custom ${bentoType}-Compartment Bento`,
      category: 'packed-meals',
      prices: { 'S': customUnitPrice.toString() },
      sizes: ['S'],
    };

    const selectedNames = slots.map(
      (slot, i) => {
        const dish = standardDishes.find((d) => d.id === slot.dishId);
        return `Dish ${i + 1}: ${dish?.title || ''}`;
      }
    );

    if (base === 'rice') {
      selectedNames.unshift('Base: Steamed Rice');
    } else {
      const pastaTitle = pastaDishes.find((d) => d.id === pastaDishId)?.title || 'Pasta';
      selectedNames.unshift(`Base: ${pastaTitle}`);
    }

    addItem(
      customProduct,
      'S',
      customQuantity,
      customUnitPrice,
      'Custom Box',
      selectedNames
    );

    // Reset Builder
    setBentoType(null);
    setBase(null);
    setPastaDishId('');
    setSlots([]);
    setCustomQuantity(1);
    setIsBuilderExpanded(false);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Section Header */}
      <div className="text-left select-none">
        <h3 className="font-fraunces font-bold text-2xl md:text-3xl text-text-charcoal leading-none">
          Packed Meals Packages
        </h3>
        <p className="font-manrope text-xs text-secondary/55 leading-relaxed mt-1.5">
          Select from our premium combo packages. Customize combinations and quantities below.
        </p>
      </div>

      {/* Grid: 4 Premium Cards + 1 Build Your Own Card */}
      <div
        className="grid gap-6 items-stretch"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
      >
        {PACKED_MEAL_PACKAGES.map((pkg) => {
          const selection = selections[pkg.id];
          const activeCombo = pkg.combos.find((c) => c.id === selection.comboId) || pkg.combos[0];
          const price = activeCombo.price || pkg.basePrice;

          return (
            <div
              key={pkg.id}
              className="bg-background/80 p-6 rounded-2xl border border-secondary/10 flex flex-col gap-4.5 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-150"
            >
              {/* Enclosed Food Image with Card Padding */}
              <div className="w-full h-[180px] rounded-xl overflow-hidden border border-secondary/5 relative select-none flex-shrink-0">
                <img
                  src={pkg.imageUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-food.webp';
                  }}
                />
              </div>
              
              {/* Header: Title & Pricing Badge */}
              <div className="flex items-start justify-between pb-3 border-b border-secondary/5">
                <div>
                  <h4 className="font-fraunces font-bold text-lg text-text-charcoal leading-tight">
                    {pkg.title}
                  </h4>
                  <p className="font-manrope text-[10px] text-secondary/45 font-semibold uppercase tracking-wider mt-1">
                    {pkg.description}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold font-manrope shrink-0">
                  ₱{price.toLocaleString()}
                </div>
              </div>

              {/* Combo Selector */}
              <div className="flex flex-col gap-2 relative">
                <label className="font-manrope font-semibold text-xs text-secondary/40 select-none">
                  Choose Combo Selection
                </label>
                <select
                  value={selection.comboId}
                  onChange={(e) => handleComboChange(pkg.id, e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-secondary/15 bg-background text-xs font-manrope font-bold text-text-charcoal focus:outline-none focus:border-primary transition-all cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  {pkg.combos.map((combo) => (
                    <option key={combo.id} value={combo.id}>
                      {combo.name} — {combo.details} {combo.price ? `(₱${combo.price})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Footer stacked controls */}
              <div className="flex flex-col gap-3 pt-3 border-t border-secondary/5 mt-auto">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-semibold text-secondary/50 font-manrope">Quantity</span>
                  <QuantitySelector
                    quantity={selection.quantity}
                    onIncrease={() => handleQtyChange(pkg.id, 1)}
                    onDecrease={() => handleQtyChange(pkg.id, -1)}
                    onChange={(val) => setSelections(prev => ({ ...prev, [pkg.id]: { ...prev[pkg.id], quantity: val } }))}
                    className="scale-95"
                  />
                </div>

                <PrimaryButton
                  variant="primary"
                  onClick={() => handleAddStandardToOrder(pkg)}
                  className="w-full h-11 flex items-center justify-center gap-2 text-xs font-bold active:scale-[0.98]"
                  style={{ minHeight: '44px' }}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap truncate">Add to Order — ₱{(price * selection.quantity).toLocaleString()}</span>
                </PrimaryButton>
              </div>
            </div>
          );
        })}

        {/* ✨ 5th Card: Build Your Own Meal */}
        <div
          onClick={() => setIsBuilderExpanded(true)}
          className={cn(
            "bg-background/80 p-6 rounded-2xl border flex flex-col gap-4.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
            isBuilderExpanded
              ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 scale-[1.01]"
              : "border-secondary/15 hover:border-primary/30 hover:bg-surface/50 active:scale-[0.98]"
          )}
        >
          {/* Enclosed Image with Card Padding */}
          <div className="w-full h-[180px] rounded-xl overflow-hidden border border-secondary/5 relative select-none flex-shrink-0">
            <img
              src="/Mamshies-Food-Assets/Packed/BUILD.webp"
              alt="Build Your Own Meal"
              className="w-full h-full object-cover select-none pointer-events-none"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-food.webp';
              }}
            />
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center text-center gap-2 select-none">
            <div className="bg-primary/10 text-primary p-2.5 rounded-full mb-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-fraunces font-bold text-lg text-text-charcoal leading-tight">
              Build Your Own Meal
            </h4>
            <p className="font-manrope text-xs text-secondary/50 leading-relaxed max-w-[200px]">
              Custom bento packs built your way. Click to start building.
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Meal Builder Section */}
      {isBuilderExpanded && (
        <div id="meal-builder-section" className="mt-8 border-t border-secondary/10 pt-8 scroll-mt-12 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-fraunces font-bold text-2xl text-text-charcoal">Build Your Own Meal</h3>
          </div>

          <div className="space-y-10">
            {/* Step 1: Choose Bento Type */}
            <div className="space-y-4">
              <h4 className="font-manrope font-semibold text-lg text-text-charcoal">Step 1: Choose Bento Type</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BENTO_TYPES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBentoType(b.id)}
                    className={cn(
                      'p-5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]',
                      bentoType === b.id
                        ? 'bg-primary border-primary text-background shadow-md'
                        : 'bg-background border-secondary/15 text-text-charcoal hover:border-primary/30 hover:bg-surface/50'
                    )}
                  >
                    <span className="text-3xl mb-1">🍱</span>
                    <span className={cn('font-fraunces font-bold text-lg leading-none', bentoType === b.id ? 'text-background' : 'text-text-charcoal')}>
                      {b.name}
                    </span>
                    <span className={cn('font-manrope text-xs font-semibold mt-1', bentoType === b.id ? 'text-background/80' : 'text-secondary/50')}>
                      {b.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Base */}
            {bentoType && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h4 className="font-manrope font-semibold text-lg text-text-charcoal">Step 2: Choose Base</h4>
                <div className="flex gap-4">
                  <button
                    onClick={() => setBase('rice')}
                    className={cn(
                      'flex-1 h-16 rounded-xl border flex items-center justify-center gap-2 text-lg font-bold font-fraunces transition-all duration-150 active:scale-[0.98]',
                      base === 'rice'
                        ? 'bg-primary border-primary text-background shadow-md'
                        : 'bg-background border-secondary/15 text-text-charcoal hover:border-primary/30'
                    )}
                  >
                    <span>🍚</span> Rice
                  </button>
                  <button
                    onClick={() => setBase('pasta')}
                    className={cn(
                      'flex-1 h-16 rounded-xl border flex items-center justify-center gap-2 text-lg font-bold font-fraunces transition-all duration-150 active:scale-[0.98]',
                      base === 'pasta'
                        ? 'bg-primary border-primary text-background shadow-md'
                        : 'bg-background border-secondary/15 text-text-charcoal hover:border-primary/30'
                    )}
                  >
                    <span>🍝</span> Pasta
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Choose Pasta (if pasta) */}
            {bentoType && base === 'pasta' && (
              <div className="bg-background/80 p-6 rounded-2xl border border-secondary/10 flex flex-col gap-5 shadow-sm animate-in fade-in duration-300">
                <h4 className="font-manrope font-semibold text-[18px] text-text-charcoal leading-none select-none">
                  Step 3: Choose Pasta
                </h4>
                <div className="flex flex-col gap-2 relative">
                  <button
                    type="button"
                    onClick={() => setIsPastaDropdownOpen(!isPastaDropdownOpen)}
                    className={cn(
                      'w-full h-11 px-3.5 rounded-xl border border-secondary/15 bg-background text-left text-[15px] font-manrope font-semibold text-text-charcoal transition-all flex items-center justify-between select-none active:scale-[0.99]',
                      isPastaDropdownOpen && 'border-primary ring-1 ring-primary'
                    )}
                    style={{ minHeight: '44px' }}
                  >
                    <span className="truncate pr-3">
                      {pastaDishId ? pastaDishes.find(d => d.id === pastaDishId)?.title : 'Choose Pasta...'}
                    </span>
                    <span className="text-[10px] text-secondary/40 shrink-0">▼</span>
                  </button>

                  {isPastaDropdownOpen && (
                    <div className="absolute left-0 right-0 z-40 mt-12 bg-background border border-secondary/15 rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y divide-secondary/5 py-1">
                      {pastaDishes.map((dish) => (
                        <button
                          key={dish.id}
                          type="button"
                          onClick={() => {
                            setPastaDishId(dish.id);
                            setIsPastaDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface/50 active:bg-surface font-manrope transition-colors"
                        >
                          <span className="text-[15px] font-semibold text-text-charcoal truncate pr-3">
                            {dish.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4+: Dish Slots exactly like PartyBoxBuilder */}
            {bentoType && base && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h4 className="font-manrope font-semibold text-lg text-text-charcoal">Choose Dishes</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {slots.map((slot, idx) => {
                    const filteredOptions = standardDishes.filter((d) => d.category === slot.category);
                    const activeDish = standardDishes.find((d) => d.id === slot.dishId);

                    return (
                      <div
                        key={idx}
                        className="bg-background/80 p-6 rounded-2xl border border-secondary/10 flex flex-col gap-5 shadow-sm hover:border-primary/15 hover:shadow-md transition-all duration-150 relative"
                      >
                        <h4 className="font-manrope font-semibold text-[18px] text-text-charcoal leading-none select-none">
                          Dish Slot {idx + 1}
                        </h4>

                        <div className="flex flex-col gap-2">
                          <label className="font-manrope font-semibold text-[12px] text-secondary/40 select-none">
                            Choose Category
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleSelectSlotCategory(idx, cat.id)}
                                className={cn(
                                  'h-9 px-3 rounded-full text-xs font-bold font-manrope flex items-center gap-1.5 border transition-all duration-150 active:scale-95 select-none',
                                  slot.category === cat.id
                                    ? 'bg-primary border-primary text-background shadow-sm'
                                    : 'bg-background border-secondary/15 text-text-charcoal hover:border-primary/25 hover:bg-surface/10'
                                )}
                              >
                                <span>{cat.emoji}</span>
                                <span>{cat.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 relative">
                          <label className="font-manrope font-semibold text-[12px] text-secondary/40 select-none">
                            Choose Dish
                          </label>
                          <button
                            type="button"
                            disabled={!slot.category}
                            onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                            className={cn(
                              'w-full h-11 px-3.5 rounded-xl border border-secondary/15 bg-background text-left text-[15px] font-manrope font-semibold text-text-charcoal transition-all flex items-center justify-between select-none active:scale-[0.99]',
                              !slot.category && 'opacity-50 cursor-not-allowed',
                              openDropdownIdx === idx && 'border-primary ring-1 ring-primary'
                            )}
                            style={{ minHeight: '44px' }}
                          >
                            <span className="truncate pr-3">
                              {activeDish ? activeDish.title : 'Choose Dish...'}
                            </span>
                            <span className="text-[10px] text-secondary/40 shrink-0">▼</span>
                          </button>

                          {openDropdownIdx === idx && (
                            <div className="absolute left-0 right-0 z-40 mt-12 bg-background border border-secondary/15 rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y divide-secondary/5 py-1">
                              {filteredOptions.map((dish) => (
                                <button
                                  key={dish.id}
                                  type="button"
                                  onClick={() => handleSelectSlotDish(idx, dish.id)}
                                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface/50 active:bg-surface font-manrope transition-colors"
                                >
                                  <span className="text-[15px] font-semibold text-text-charcoal truncate pr-3">
                                    {dish.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Custom Meal Summary & Add to Cart */}
            {bentoType && base && (
              <div className="bg-background/80 p-6 rounded-2xl border border-secondary/10 shadow-sm select-none sticky bottom-4 z-20">
                <div className="border-t border-secondary/10 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex flex-col">
                    <span className="text-[12px] text-secondary/40 font-semibold uppercase">Final Meal Price</span>
                    <span className="text-[20px] font-black text-primary font-manrope mt-1">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <QuantitySelector
                      quantity={customQuantity}
                      onIncrease={() => setCustomQuantity((q) => q + 1)}
                      onDecrease={() => setCustomQuantity((q) => Math.max(1, q - 1))}
                      onChange={setCustomQuantity}
                      className="scale-95"
                    />
                    
                    <PrimaryButton
                      variant="primary"
                      disabled={!isValidCustom}
                      onClick={handleAddCustomToOrder}
                      className="h-12 px-6 sm:px-8 text-sm font-bold active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                      style={{ minHeight: '44px' }}
                    >
                      Add to Order
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
