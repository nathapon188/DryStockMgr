import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, ClipboardCheck, Trash2, Send, Search } from 'lucide-react';
import { DRY_STOCK_ITEMS } from './constants';

export default function App() {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return DRY_STOCK_ITEMS.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleQuantityChange = (id: string, value: string) => {
    setQuantities(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const generateOrder = () => {
    const orderLines = DRY_STOCK_ITEMS
      .filter(item => {
        const qty = quantities[item.id];
        return qty && qty !== '-' && qty !== '0' && qty.trim() !== '';
      })
      .map(item => `${item.name}: ${quantities[item.id]} ${item.unit}`);

    if (orderLines.length === 0) {
      setGeneratedText('No items selected for the order.');
      return;
    }

    const header = "Dry Stock Order\n-------------------\n";
    const footer = "\n-------------------\nThank you,\nNat";
    setGeneratedText(header + orderLines.join('\n') + footer);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all quantities?')) {
      setQuantities({});
      setGeneratedText('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-[#141414] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif italic text-4xl mb-1">Tamrab Thai</h1>
            <p className="text-xs uppercase tracking-widest opacity-60 font-mono">Dry Stock Order Manager</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#F5F5F0] transition-colors text-sm uppercase tracking-wider cursor-pointer"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List Section */}
          <section className="bg-white border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col h-[70vh]">
            <div className="p-4 border-b border-[#141414] bg-[#E4E3E0] flex items-center gap-2">
              <Search size={18} className="opacity-50" />
              <input
                type="text"
                placeholder="SEARCH ITEMS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-mono uppercase tracking-tight"
              />
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-[1fr_80px_80px] border-b border-[#141414] bg-[#141414] text-[#F5F5F0] text-[10px] uppercase tracking-widest font-mono sticky top-0 z-10">
                <div className="p-2 border-r border-[#F5F5F0]/20">Item Description</div>
                <div className="p-2 border-r border-[#F5F5F0]/20 text-center">Qty</div>
                <div className="p-2 text-center">Unit</div>
              </div>
              
              {filteredItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_80px] border-b border-[#141414] hover:bg-[#F5F5F0] transition-colors group">
                  <div className="p-3 text-sm border-r border-[#141414] flex items-center">
                    {item.name}
                  </div>
                  <div className="p-0 border-r border-[#141414]">
                    <input
                      type="text"
                      placeholder="-"
                      value={quantities[item.id] || ''}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-full h-full p-3 text-center text-sm font-mono focus:bg-[#141414] focus:text-[#F5F5F0] outline-none transition-colors"
                    />
                  </div>
                  <div className="p-3 text-[10px] uppercase tracking-tighter opacity-60 font-mono text-center flex items-center justify-center">
                    {item.unit}
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="p-8 text-center opacity-40 italic font-serif">No items found matching your search.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#141414] bg-[#E4E3E0]">
              <button
                onClick={generateOrder}
                className="w-full py-3 bg-[#141414] text-[#F5F5F0] uppercase tracking-[0.2em] font-bold hover:bg-[#333] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={18} />
                Generate Order
              </button>
            </div>
          </section>

          {/* Result Section */}
          <section className="flex flex-col gap-4">
            <div className="bg-[#141414] text-[#F5F5F0] p-4 border border-[#141414] shadow-[4px_4px_0px_0px_rgba(228,227,224,1)]">
              <h2 className="font-mono text-xs uppercase tracking-widest mb-4 opacity-70">Order Preview</h2>
              
              <AnimatePresence mode="wait">
                {generatedText ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                  >
                    <pre className="font-mono text-sm whitespace-pre-wrap bg-[#222] p-6 border border-white/10 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar-dark leading-relaxed">
                      {generatedText}
                    </pre>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-6 py-3 transition-all uppercase tracking-widest text-xs font-bold cursor-pointer ${
                          isCopied 
                            ? 'bg-green-600 text-white' 
                            : 'bg-[#F5F5F0] text-[#141414] hover:bg-white'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <ClipboardCheck size={16} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Clipboard size={16} />
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30 border border-dashed border-white/20">
                    <Send size={48} strokeWidth={1} className="mb-4" />
                    <p className="font-serif italic text-lg text-center px-8">
                      Fill in quantities and click "Generate Order" to see your text-ready list here.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-[#E4E3E0] p-4 border border-[#141414] text-[11px] font-mono leading-tight">
              <p className="uppercase font-bold mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1 opacity-70">
                <li>Enter quantities in the center column.</li>
                <li>Items with empty, "0", or "-" values will be excluded.</li>
                <li>Use the search bar to quickly find specific items.</li>
                <li>Click "Generate Order" to format the list for messaging.</li>
                <li>Copy the result and paste it into your messaging app.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F5F5F0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #141414;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #222;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #444;
        }
      `}</style>
    </div>
  );
}
