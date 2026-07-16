import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { PrimaryButton } from '../shared/PrimaryButton';
import type { Product } from '../../types';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface GrazingPackage {
  id: string;
  title: string;
  emoji: string;
  imageUrl: string;
  startPrice: number;
  extraPricePer10: number;
  guestCap: number;
  description: string;
  inclusions: string[];
}

const GRAZING_PACKAGES: GrazingPackage[] = [
  {
    id: 'grazing-bread-pastries',
    title: 'Bread & Pastries',
    emoji: '🥪',
    imageUrl: '/Mamshies-Food-Assets/Grazing/BREAD.webp',
    startPrice: 5000,
    extraPricePer10: 1000,
    guestCap: 40,
    description: 'An elegant display of mini burgers, sandwiches, fresh brownies, waffles, donuts, and pancakes.',
    inclusions: ['Mini Burgers', 'Sandwiches', 'Brownies', 'Waffles', 'Donuts', 'Pancakes'],
  },
  {
    id: 'grazing-skewer-selection',
    title: 'Skewer Selection',
    emoji: '🍢',
    imageUrl: '/Mamshies-Food-Assets/Grazing/SKEWER.webp',
    startPrice: 5000,
    extraPricePer10: 1000,
    guestCap: 40,
    description: 'Street-food style setup including fishballs, kikiam, chicken balls, barbecue skewers, fried siomai, and hotdogs.',
    inclusions: ['Fishballs', 'Kikiam', 'Chicken Balls', 'Barbecue', 'Fried Siomai', 'Hotdogs', 'Shanghai Shots'],
  },
  {
    id: 'grazing-kakanin',
    title: 'Kakanin',
    emoji: '🍡',
    imageUrl: '/Mamshies-Food-Assets/Grazing/KAKANIN.webp',
    startPrice: 6000,
    extraPricePer10: 1300,
    guestCap: 40,
    description: 'Traditional sweet Filipino delicacies featuring sapin-sapin, biko, buchi, puto cheese, and onde-onde.',
    inclusions: ['Sapin-sapin', 'Biko', 'Buchi', 'Puto Cheese', 'Vietnamese Kutsinta', 'Onde-onde'],
  },
  {
    id: 'grazing-korean',
    title: 'Korean',
    emoji: '🥢',
    imageUrl: '/Mamshies-Food-Assets/Grazing/KOREAN.webp',
    startPrice: 8000,
    extraPricePer10: 1800,
    guestCap: 40,
    description: 'Modern K-food grazing containing fresh kimbap, samgyup bites, eggrolls, tteokbokki bites, and fishcakes.',
    inclusions: ['Kimbap', 'Samgyup Bites', 'Eggroll', 'Tteokbokki Bites', 'Fishcakes', 'Salad Wraps'],
  },
];

export const GrazingTableView: React.FC = () => {
  const addItem = useCartStore((state) => state.addItem);

  // Active package states
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(40);
  const [quantity, setQuantity] = useState<number>(1);

  // Calculations helper
  const getPrices = (pkg: GrazingPackage, guests: number) => {
    const basePrice = pkg.startPrice;
    const extraGuests = guests - 40;
    const extraCharge = (extraGuests / 10) * pkg.extraPricePer10;
    const unitPrice = basePrice + extraCharge;
    return {
      basePrice,
      extraGuests,
      extraCharge,
      unitPrice,
      totalPrice: unitPrice * quantity,
    };
  };

  const handleAddToOrder = (pkg: GrazingPackage) => {
    const { unitPrice } = getPrices(pkg, guestCount);

    const grazingProduct: Product = {
      id: `grazing-${pkg.id}-${Date.now()}`,
      title: `${pkg.emoji} ${pkg.title} Grazing Table`,
      category: 'grazing-table',
      prices: {
        'S': unitPrice.toString(),
      },
      sizes: ['S'],
    };

    addItem(
      grazingProduct,
      'S',
      quantity,
      unitPrice,
      `${guestCount} Guests`,
      [
        `Guest Count: ${guestCount} Pax`,
        `Food Station: ${pkg.title} Setup`,
        `Includes: ${pkg.inclusions.slice(0, 4).join(', ')}`,
        'Free Bottomless Juice & Surprise Food Included',
      ]
    );

    // Reset selection
    setSelectedPkgId('');
    setGuestCount(40);
    setQuantity(1);
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-left select-none">
        <h3 className="font-fraunces font-bold text-xl md:text-2xl text-text-charcoal leading-none">
          Grazing Table Setup
        </h3>
        <p className="font-manrope text-[11px] text-secondary/55 leading-none mt-1.5">
          Select a package below to customize guest size and add it to your order.
        </p>
      </div>

      {/* Package Selection Cards Grid (Apple-Style Configuration Cards) */}
      <div
        className="grid gap-5 items-stretch"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
      >
        {GRAZING_PACKAGES.map((pkg) => {
          const isSelected = selectedPkgId === pkg.id;
          const { basePrice, extraGuests, extraCharge, totalPrice } = getPrices(pkg, guestCount);

          return (
            <div
              key={pkg.id}
              onClick={() => {
                if (!isSelected) {
                  setSelectedPkgId(pkg.id);
                  setGuestCount(40);
                  setQuantity(1);
                }
              }}
              className={cn(
                'bg-background/80 p-5 rounded-2xl border transition-all duration-300 flex flex-col shadow-xs cursor-pointer select-none',
                isSelected
                  ? 'border-primary ring-2 ring-primary/10 bg-primary/[0.01] cursor-default'
                  : 'border-secondary/10 hover:border-primary/20 hover:shadow-sm active:scale-[0.99]'
              )}
            >
              {/* Contained Food Image with Card Padding */}
              <div className="w-full h-[180px] rounded-xl overflow-hidden border border-secondary/5 relative select-none flex-shrink-0 mb-3.5">
                <img
                  src={pkg.imageUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-food.webp';
                  }}
                />
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 bg-primary text-background p-0.5 rounded-full shrink-0 shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Title & Starts at Pricing info */}
              <div className="flex-shrink-0 mb-1">
                <h4 className="font-fraunces font-bold text-base text-text-charcoal leading-tight">
                  {pkg.title}
                </h4>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[10px] text-secondary/40 font-semibold uppercase">Starts at</span>
                  <span className="text-lg font-black text-primary font-manrope">
                    ₱{pkg.startPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Collapse details if not selected */}
              {!isSelected && (
                <div className="mt-auto pt-4 flex-shrink-0">
                  <button
                    type="button"
                    className="w-full h-10 rounded-xl font-manrope font-bold text-xs bg-background hover:bg-surface border border-secondary/15 text-text-charcoal transition-all"
                    style={{ minHeight: '40px' }}
                  >
                    Select Package
                  </button>
                </div>
              )}

              {/* Inline Guest Configuration Panel - Shows ONLY when Selected */}
              {isSelected && (
                <div className="mt-5 pt-5 border-t border-secondary/10 flex flex-col gap-5 overflow-hidden animate-fade-in flex-1">
                  {/* Slider guest count display */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary/40 uppercase">
                    <span>Capacity</span>
                    <span className="text-primary font-extrabold text-[12px]">{guestCount} Guests</span>
                  </div>

                  {/* Pax Slider */}
                  <div className="space-y-3.5 my-1">
                    <input
                      type="range"
                      min="40"
                      max="150"
                      step="10"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-secondary/30 font-manrope px-0.5">
                      <span>40</span>
                      <span>60</span>
                      <span>80</span>
                      <span>100</span>
                      <span>120</span>
                      <span>140</span>
                      <span>150</span>
                    </div>
                  </div>

                  {/* Pricing Details Breakdown */}
                  <div className="bg-[#FAF7F2]/65 border border-secondary/10 rounded-xl p-4 flex flex-col gap-3.5 text-xs font-manrope text-secondary/55">
                    <div className="flex justify-between items-center font-bold">
                      <span>Base ({pkg.guestCap} Pax)</span>
                      <span className="text-text-charcoal">₱{basePrice.toLocaleString()}</span>
                    </div>
                    {extraGuests > 0 && (
                      <div className="flex justify-between items-center font-bold">
                        <span>Extra (+{extraGuests} Pax)</span>
                        <span className="text-text-charcoal font-bold">+₱{extraCharge.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="h-px bg-secondary/10 my-0.5" />
                    <div className="flex justify-between items-center text-sm font-bold text-text-charcoal">
                      <span>Total Price</span>
                      <span className="text-xl font-extrabold text-primary font-manrope">₱{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Add to Order CTA (No Quantity Stepper) */}
                  <div className="flex flex-col gap-2.5 mt-auto pt-2">
                    <PrimaryButton
                      variant="primary"
                      onClick={() => handleAddToOrder(pkg)}
                      className="w-full h-11 text-xs font-bold active:scale-[0.98] transition-all shadow-sm rounded-xl"
                      style={{ minHeight: '44px' }}
                    >
                      Add
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
