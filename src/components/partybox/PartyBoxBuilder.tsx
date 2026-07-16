import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { QuantitySelector } from '../shared/QuantitySelector';
import { PrimaryButton } from '../shared/PrimaryButton';
import { parsePriceAndLabel } from '../../utils/priceParser';
import { getFoodImage } from '../../utils/imageResolver';
import type { Product } from '../../types';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PartyBoxBuilderProps {
  dishes: Product[];
  className?: string;
}

const CATEGORY_OPTIONS = [
  { id: 'chicken', name: 'Chicken', emoji: '🍗' },
  { id: 'beef', name: 'Beef', emoji: '🥩' },
  { id: 'pork', name: 'Pork', emoji: '🐷' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'seafood', name: 'Seafood', emoji: '🦐' },
  { id: 'salad', name: 'Salad', emoji: '🥗' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥦' },
];

export const PartyBoxBuilder: React.FC<PartyBoxBuilderProps> = ({ dishes, className }) => {
  const addItem = useCartStore((state) => state.addItem);

  // Slots tracking: category selection and dish ID
  const [slots, setSlots] = useState([
    { category: '', dishId: '' },
    { category: '', dishId: '' },
    { category: '', dishId: '' },
    { category: '', dishId: '' },
  ]);
  const [isEditing, setIsEditing] = useState<boolean[]>([false, false, false, false]);
  const [quantity, setQuantity] = useState(1);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  // Standard menu items filter
  const standardDishes = dishes.filter(
    (d) => !['party-box', 'catering-packages', 'packed-meals', 'grazing-table'].includes(d.category)
  );

  const handleSelectCategory = (idx: number, category: string) => {
    const updated = [...slots];
    updated[idx] = { category, dishId: '' }; // changing category clears selected dish
    setSlots(updated);
    setOpenDropdownIdx(null);
  };

  const handleSelectDish = (idx: number, dishId: string) => {
    const updated = [...slots];
    updated[idx].dishId = dishId;
    setSlots(updated);
    
    // Auto-close edit mode when a dish is selected
    const updatedEditing = [...isEditing];
    updatedEditing[idx] = false;
    setIsEditing(updatedEditing);
  };

  const handleStartEdit = (idx: number) => {
    const updated = [...isEditing];
    updated[idx] = true;
    setIsEditing(updated);
  };

  const handleSaveEdit = (idx: number) => {
    const updated = [...isEditing];
    updated[idx] = false;
    setIsEditing(updated);
  };

  // Calculations using Small tray S prices
  const selectedParsedDishes = slots.map((slot) => {
    const found = standardDishes.find((d) => d.id === slot.dishId);
    return found ? parsePriceAndLabel(found.prices['S'] || '') : null;
  });

  const unitPrice = selectedParsedDishes.reduce((sum, parsed) => sum + (parsed?.price || 0), 0);
  const totalPrice = unitPrice * quantity;

  // Validation: Every slot must have a selected dish
  const isAllSelected = slots.every((s) => s.dishId !== '');
  const isValid = isAllSelected;

  const handleAddToOrder = () => {
    if (!isValid) return;

    const partyBoxProduct: Product = {
      id: `party-box-${Date.now()}`,
      title: 'Party Box',
      category: 'party-box',
      prices: {
        'S': unitPrice.toString(),
      },
      sizes: ['S'],
    };

    const selectedNames = slots.map(
      (slot) => standardDishes.find((d) => d.id === slot.dishId)?.title || ''
    );

    addItem(
      partyBoxProduct,
      'S',
      quantity,
      unitPrice,
      'Custom Combo',
      selectedNames
    );

    // Trigger Added micro-interaction
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);

    // Reset Form
    setSlots([
      { category: '', dishId: '' },
      { category: '', dishId: '' },
      { category: '', dishId: '' },
      { category: '', dishId: '' },
    ]);
    setIsEditing([false, false, false, false]);
    setQuantity(1);
    setOpenDropdownIdx(null);
  };

  const completedCount = slots.filter((s) => s.dishId !== '').length;

  return (
    <div className={cn('space-y-8 max-w-[1160px] mx-auto w-full select-none', className)}>
      {/* Title & Introduction Header */}
      <div className="flex flex-col gap-1 select-none text-left">
        <h3 className="font-fraunces font-bold text-2xl text-text-charcoal leading-none">
          Party Box Builder
        </h3>
        <p className="font-manrope font-normal text-xs text-secondary/65 leading-none mt-1.5">
          Customize your 4-dish celebration platter.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white/75 p-5 rounded-2xl border border-secondary/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 select-none">
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-fraunces font-bold text-[16px] text-text-charcoal leading-none">Progress</span>
          <span className="font-manrope text-[11px] text-secondary/50 font-bold mt-1">
            Completed: <span className="font-bold text-primary">{completedCount}</span> / 4 dishes
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {slots.map((slot, idx) => {
            const isCompleted = slot.dishId !== '';
            return (
              <div key={idx} className="flex items-center gap-1.5 select-none">
                {isCompleted ? (
                  <span className="text-primary font-bold text-[14px]">✓</span>
                ) : (
                  <span className="text-secondary/35 text-[14px]">○</span>
                )}
                <span className={cn(
                  "font-manrope text-[11px] font-bold",
                  isCompleted ? "text-text-charcoal" : "text-secondary/45"
                )}>
                  Dish {idx + 1}
                </span>
                {idx < 3 && <span className="hidden sm:inline text-secondary/15 ml-3 font-light">|</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slots Layout Grid - 2 columns on Desktop/Tablet, 1 Column on Mobile */}
      <div 
        className="grid gap-6 justify-items-stretch w-full items-start"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
      >
        {slots.map((slot, idx) => {
          const filteredOptions = standardDishes.filter((d) => d.category === slot.category);
          const activeDish = standardDishes.find((d) => d.id === slot.dishId);
          const isCompleted = slot.dishId !== '' && !isEditing[idx];
          const imageUrl = getFoodImage(slot.category, activeDish?.title || '');

          return (
            <div
              key={idx}
              className={cn(
                "p-5 rounded-2xl flex flex-col relative transition-all duration-300 border w-full max-w-[560px] mx-auto overflow-visible",
                isCompleted 
                  ? "bg-[#FAF7F2] border-primary/20 shadow-md h-[400px] justify-between" 
                  : "bg-background/80 border-secondary/15 shadow-xs hover:border-primary/15 hover:shadow-sm h-auto pb-6 justify-start gap-4",
                openDropdownIdx === idx ? "z-40" : "z-10"
              )}
            >
              {/* Colored top-left corner accent */}
              <div className="absolute top-0 left-0 w-12 h-1 bg-primary rounded-tl-2xl rounded-br-xs" />

              {/* Completed Visual Preview Card State */}
              {isCompleted ? (
                <div className="flex flex-col h-full gap-3 relative justify-between w-full">
                  {/* Floating Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(idx)}
                    className="absolute top-2.5 right-2.5 bg-white/90 hover:bg-white backdrop-blur-xs border border-secondary/10 px-2.5 py-1.5 rounded-lg text-[10px] font-manrope font-extrabold text-primary hover:text-primary/80 transition-all active:scale-95 z-20 cursor-pointer shadow-xs"
                  >
                    Edit
                  </button>

                  {/* Large Dish Image (rounded corners, cover fit) */}
                  <div className="w-full h-[240px] rounded-xl overflow-hidden border border-secondary/5 relative select-none flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={activeDish?.title}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-food.webp';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-secondary/85 text-white px-2.5 py-1 rounded-full text-[9px] font-extrabold font-manrope uppercase tracking-wider">
                      Slot {idx + 1}
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="flex-1 flex flex-col justify-center px-1 text-left">
                    <h5 className="font-fraunces font-bold text-base text-text-charcoal leading-tight uppercase line-clamp-1">
                      {activeDish?.title}
                    </h5>
                    
                    <div className="flex items-center justify-between mt-2 select-none">
                      <span className="font-manrope font-bold text-[10px] text-secondary/40 uppercase tracking-wider">
                        {CATEGORY_OPTIONS.find((c) => c.id === slot.category)?.name || slot.category}
                      </span>
                      <span className="text-base font-extrabold text-primary font-manrope">
                        ₱{selectedParsedDishes[idx]?.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Editable / Selection State */
                <div className="flex flex-col gap-4 w-full justify-start">
                  {/* Header Title */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-fraunces font-bold text-base text-text-charcoal leading-none select-none text-left">
                      Dish Slot {idx + 1}
                    </h4>
                  </div>

                  {/* Choose Category */}
                  <div className="flex flex-col gap-2 text-left">
                    <label className="font-manrope font-bold text-[10px] text-secondary/40 uppercase tracking-wider block select-none">
                      Choose Category
                    </label>
                    <div className="grid grid-cols-4 gap-2 w-full">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(idx, cat.id)}
                          className={cn(
                            'h-11 rounded-xl text-[10px] font-bold font-manrope flex flex-col items-center justify-center border transition-all duration-150 active:scale-95 cursor-pointer leading-none px-2 py-1.5 pb-2.5',
                            slot.category === cat.id
                              ? 'bg-primary border-primary text-white shadow-xs'
                              : 'bg-white border-secondary/15 text-text-charcoal hover:border-primary/25 hover:bg-surface/10'
                          )}
                        >
                          <span className="text-base mb-1">{cat.emoji}</span>
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Choose Dish dropdown area */}
                  <div className="flex flex-col gap-1.5 relative text-left">
                    <label className="font-manrope font-bold text-[10px] text-secondary/40 uppercase tracking-wider block select-none">
                      Choose Dish
                    </label>
                    
                    {slot.category === '' ? (
                      <button
                        disabled
                        type="button"
                        className="w-full h-10 px-3.5 rounded-xl border border-secondary/10 bg-background/40 text-left text-xs font-manrope font-semibold text-secondary/35 flex items-center justify-between select-none cursor-not-allowed"
                      >
                        <span>Select a category first</span>
                        <ChevronDown className="w-3.5 h-3.5 text-secondary/25" />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                          className={cn(
                            'w-full h-10 px-3.5 rounded-xl border border-secondary/15 bg-white text-left text-xs font-manrope font-bold text-text-charcoal flex items-center justify-between active:scale-[0.99] hover:border-primary/30 cursor-pointer',
                            openDropdownIdx === idx && 'border-primary ring-1 ring-primary/35'
                          )}
                        >
                          <span className="truncate pr-3">
                            {activeDish ? activeDish.title : 'Select a dish...'}
                          </span>
                          <ChevronDown className={cn("w-3.5 h-3.5 text-secondary/45 transition-transform duration-200", openDropdownIdx === idx && "transform rotate-180 text-primary")} />
                        </button>

                        <div className={cn(
                          "absolute left-0 right-0 z-50 top-full mt-1 bg-white border border-secondary/15 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-secondary/5 py-1 transition-all duration-200 ease-out origin-top",
                          openDropdownIdx === idx ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                        )}>
                          {filteredOptions.map((dish) => {
                            const parsed = parsePriceAndLabel(dish.prices['S'] || '');
                            return (
                              <button
                                key={dish.id}
                                type="button"
                                onClick={() => {
                                  handleSelectDish(idx, dish.id);
                                  setOpenDropdownIdx(null);
                                }}
                                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-surface/50 active:bg-surface font-manrope transition-colors cursor-pointer"
                              >
                                <span className="text-xs font-bold text-text-charcoal truncate pr-2">
                                  {dish.title}
                                </span>
                                <span className="text-xs font-extrabold text-primary shrink-0 select-none">
                                  ₱{parsed.price.toLocaleString()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Save button visible only during manual editing of a completed card */}
                  {isEditing[idx] && slot.dishId !== '' && (
                    <div className="h-9 mt-1 w-full">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        className="w-full h-9 rounded-lg bg-secondary hover:bg-secondary/95 text-white font-manrope font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom controls panel positioned directly below the grid */}
      <div className="pt-8 border-t border-secondary/10 flex flex-col gap-6 mt-10 max-w-[560px] mx-auto w-full">
        {/* Total Price & Quantity Stepper */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-secondary/40 font-bold uppercase tracking-wider font-manrope">Total Price</span>
            <span className="text-[24px] font-extrabold text-primary font-manrope mt-0.5 leading-none">
              ₱{totalPrice.toLocaleString()}
            </span>
          </div>
          
          <div className="w-32 flex-shrink-0">
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              onChange={setQuantity}
              className="scale-100"
            />
          </div>
        </div>

        {/* Add Party Box button with generous spacing */}
        <div className="flex justify-center w-full mt-2">
          <PrimaryButton
            variant="primary"
            disabled={!isValid}
            onClick={handleAddToOrder}
            className="w-full h-12 md:h-13 text-[15px] font-bold active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5 rounded-xl shadow-sm hover:shadow"
            style={{ minHeight: '48px', maxWidth: '320px' }}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Added!</span>
              </>
            ) : (
              <span>Add Party Box</span>
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
