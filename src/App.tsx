import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, ClipboardCheck, Trash2, Send, Search, Package, Leaf, Box } from 'lucide-react';
import { DRY_STOCK_ITEMS, PACKAGING_ITEMS, FRESH_PRODUCE_ITEMS } from './constants';

type TabType = 'dry-stock' | 'packaging' | 'fresh-produce';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dry-stock');
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentItems = useMemo(() => {
    switch (activeTab) {
      case 'dry-stock': return DRY_STOCK_ITEMS;
      case 'packaging': return PACKAGING_ITEMS;
      case 'fresh-produce': return FRESH_PRODUCE_ITEMS;
      default: return [];
    }
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    return currentItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentItems, searchTerm]);

  const handleQuantityChange = (id: string, value: string) => {
    setQuantities(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const generateOrder = () => {
    const tabTitle = activeTab === 'dry-stock' ? 'Dry Stock' : activeTab === 'packaging' ? 'Packaging' : 'Fresh Produce';
    const orderLines = currentItems
      .filter(item => {
        const qty = quantities[item.id];
        return qty && qty !== '-' && qty !== '0' && qty.trim() !== '';
      })
      .map(item => `${item.name}: ${quantities[item.id]} ${item.unit}`);

    if (orderLines.length === 0) {
      setGeneratedText(`No items selected for the ${tabTitle} order.`);
      return;
    }

    const header = `${tabTitle} Order\n-------------------\n`;
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
    if (window.confirm(`Are you sure you want to clear all quantities for ${activeTab}?`)) {
      const newQuantities = { ...quantities };
      currentItems.forEach(item => {
        delete newQuantities[item.id];
      });
      setQuantities(newQuantities);
      setGeneratedText('');
    }
  };

  const tabs = [
    { id: 'dry-stock' as TabType, label: 'Dry Stock', icon: Box },
    { id: 'packaging' as TabType, label: 'Packaging', icon: Package },
    { id: 'fresh-produce' as TabType, label: 'Fresh Produce', icon: Leaf },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#026877] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-[#026877] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif italic text-4xl mb-1">Tamrab Thai</h1>
            <p className="text-xs uppercase tracking-widest opacity-60 font-mono">Order Manager</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 border border-[#026877] hover:bg-[#026877] hover:text-[#F5F5F0] transition-colors text-sm uppercase tracking-wider cursor-pointer"
            >
              <Trash2 size={16} />
              Clear Tab
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
                setGeneratedText('');
              }}
              className={`flex items-center gap-2 px-6 py-3 border border-[#026877] transition-all uppercase tracking-widest text-xs font-bold cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#026877] text-[#F5F5F0] shadow-[4px_4px_0px_0px_rgba(2,104,119,0.2)]' 
                  : 'bg-white hover:bg-[#E4E3E0]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List Section */}
          <section className="bg-white border border-[#026877] shadow-[4px_4px_0px_0px_rgba(2,104,119,1)] flex flex-col h-[70vh]">
            <div className="p-4 border-b border-[#026877] bg-[#E4E3E0] flex items-center gap-2">
              <Search size={18} className="opacity-50" />
              <input
                type="text"
                placeholder={`SEARCH ${activeTab.replace('-', ' ').toUpperCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-mono uppercase tracking-tight"
              />
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-[1fr_80px_80px] border-b border-[#026877] bg-[#026877] text-[#F5F5F0] text-[10px] uppercase tracking-widest font-mono sticky top-0 z-10">
                <div className="p-2 border-r border-[#F5F5F0]/20">Item Description</div>
                <div className="p-2 border-r border-[#F5F5F0]/20 text-center">Qty</div>
                <div className="p-2 text-center">Unit</div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_80px_80px] border-b border-[#026877] hover:bg-[#F5F5F0] transition-colors group">
                      <div className="p-3 text-sm border-r border-[#026877] flex items-center">
                        {item.name}
                      </div>
                      <div className="p-0 border-r border-[#026877]">
                        <input
                          type="text"
                          placeholder="-"
                          value={quantities[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-full h-full p-3 text-center text-sm font-mono focus:bg-[#026877] focus:text-[#F5F5F0] outline-none transition-colors"
                        />
                      </div>
                      <div className="p-3 text-[10px] uppercase tracking-tighter opacity-60 font-mono text-center flex items-center justify-center">
                        {item.unit}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
              {filteredItems.length === 0 && (
                <div className="p-8 text-center opacity-40 italic font-serif">No items found matching your search.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#026877] bg-[#E4E3E0]">
              <button
                onClick={generateOrder}
                className="w-full py-3 bg-[#026877] text-[#F5F5F0] uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={18} />
                Generate {activeTab.replace('-', ' ')} Order
              </button>
            </div>
          </section>

          {/* Result Section */}
          <section className="flex flex-col gap-4">
            <div className="bg-[#026877] text-[#F5F5F0] p-4 border border-[#026877] shadow-[4px_4px_0px_0px_rgba(228,227,224,1)]">
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
                    <pre className="font-mono text-sm whitespace-pre-wrap bg-[#014d58] p-6 border border-white/10 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar-dark leading-relaxed">
                      {generatedText}
                    </pre>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-6 py-3 transition-all uppercase tracking-widest text-xs font-bold cursor-pointer ${
                          isCopied 
                            ? 'bg-green-600 text-white' 
                            : 'bg-[#F5F5F0] text-[#026877] hover:bg-white'
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

            <div className="bg-[#E4E3E0] p-4 border border-[#026877] text-[11px] font-mono leading-tight">
              <p className="uppercase font-bold mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1 opacity-70">
                <li>Select a tab (Dry Stock, Packaging, or Fresh Produce).</li>
                <li>Enter quantities in the center column.</li>
                <li>Items with empty, "0", or "-" values will be excluded.</li>
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
          background: #026877;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #014d58;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #026877;
        }
      `}</style>
    </div>
  );
}
