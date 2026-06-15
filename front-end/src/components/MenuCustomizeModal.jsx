import React, { useState } from 'react';
import * as Lucide from 'lucide-react';

export default function MenuCustomizeModal({ item, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedExtras, setSelectedExtras] = useState([]);

  const extrasOptions = [
    { name: 'Extra Cheese', price: 1.50 },
    { name: 'Bacon', price: 1.50 },
    { name: 'Avocado', price: 1.50 },
    { name: 'Gluten-Free Option', price: 1.50 }
  ];

  const handleExtraToggle = (name) => {
    setSelectedExtras((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const handleAddToCart = () => {
    onAdd(quantity, {
      extras: selectedExtras,
      specialInstructions
    });
  };

  const extraCost = selectedExtras.length * 1.50;
  const itemTotal = (item.price + extraCost) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border-none rounded-4xl shadow-soft overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Photo */}
        <div className="relative h-48 sm:h-56 bg-slate-100 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-md"
          >
            <Lucide.X size={16} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200 uppercase tracking-wider">
              {item.category}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow-md">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Description */}
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Nutritional Info */}
          {item.nutritionalInfo && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Lucide.Info size={12} className="text-brand-500" />
                <span>Nutritional Facts & Allergens</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-500 font-medium">Calories</p>
                  <p className="font-bold text-slate-900 text-sm">{item.nutritionalInfo.calories || 0}</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-500 font-medium">Protein</p>
                  <p className="font-bold text-slate-900 text-sm">{item.nutritionalInfo.protein || '0g'}</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-500 font-medium">Carbs</p>
                  <p className="font-bold text-slate-900 text-sm">{item.nutritionalInfo.carbs || '0g'}</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-500 font-medium">Fat</p>
                  <p className="font-bold text-slate-900 text-sm">{item.nutritionalInfo.fat || '0g'}</p>
                </div>
              </div>
              
              {item.nutritionalInfo.allergens && item.nutritionalInfo.allergens.length > 0 && (
                <div className="flex items-center space-x-2 text-[10px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                  <Lucide.AlertCircle size={12} className="shrink-0 text-amber-600" />
                  <span>
                    <strong>Allergens:</strong> {item.nutritionalInfo.allergens.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Extras Customization */}
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Lucide.PlusCircle size={12} className="text-brand-500" />
              <span>Customize Order (+$1.50 each)</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extrasOptions.map((opt) => {
                const isSelected = selectedExtras.includes(opt.name);
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => handleExtraToggle(opt.name)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-600 shadow-sm'
                        : 'border-slate-100 bg-slate-50 hover:border-brand-200 hover:bg-white text-slate-700 shadow-sm'
                    }`}
                  >
                    <span>{opt.name}</span>
                    <Lucide.Check
                      size={14}
                      className={`transition-opacity ${isSelected ? 'opacity-100 text-brand-600' : 'opacity-0'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Lucide.MessageSquareCode size={12} className="text-brand-500" />
              <span>Special Instructions</span>
            </h5>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g., no onions, sauce on the side, well done..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-400 resize-none h-24 shadow-sm"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl p-1.5 shrink-0 shadow-sm">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
            >
              <Lucide.Minus size={14} />
            </button>
            <span className="font-bold text-sm text-slate-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
            >
              <Lucide.Plus size={14} />
            </button>
          </div>

          {/* Action button */}
          <button
            onClick={handleAddToCart}
            className="flex-grow py-3 px-6 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-between"
          >
            <span>Add to Basket</span>
            <span className="font-black text-white/90 border-l border-white/20 pl-3 ml-2">${itemTotal.toFixed(2)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
