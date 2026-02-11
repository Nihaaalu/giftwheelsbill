
import React, { useState, useMemo } from 'react';
import { Download, Camera, Trash2, IndianRupee, User, Phone, Plus, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PRODUCTS, SHOP_ADDRESS, THANK_YOU_NOTE } from './constants';
import { InvoiceState, CustomItem } from './types';

const App: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [state, setState] = useState<InvoiceState>({
    logo: null,
    customer: { name: '', phone: '', address: '' },
    selectedProducts: {},
    customItems: [],
    shippingCharges: 0,
    amountPaid: 0,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductToggle = (productId: string) => {
    setState(prev => {
      const newSelected = { ...prev.selectedProducts };
      if (newSelected[productId]) {
        delete newSelected[productId];
      } else {
        newSelected[productId] = 1;
      }
      return { ...prev, selectedProducts: newSelected };
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const val = Math.max(1, quantity);
    setState(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [productId]: val,
      },
    }));
  };

  const addCustomItem = () => {
    const newItem: CustomItem = {
      id: `custom-${Date.now()}`,
      name: '',
      price: 0,
      quantity: 1,
    };
    setState(prev => ({ ...prev, customItems: [...prev.customItems, newItem] }));
  };

  const updateCustomItem = (id: string, field: keyof CustomItem, value: string | number) => {
    setState(prev => ({
      ...prev,
      customItems: prev.customItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeCustomItem = (id: string) => {
    setState(prev => ({
      ...prev,
      customItems: prev.customItems.filter(item => item.id !== id),
    }));
  };

  const subtotal = useMemo(() => {
    const standardSub = Object.entries(state.selectedProducts).reduce((sum, [id, qty]) => {
      const product = PRODUCTS.find(p => p.id === id);
      return sum + (product?.price || 0) * qty;
    }, 0);
    const customSub = state.customItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return standardSub + customSub;
  }, [state.selectedProducts, state.customItems]);

  const finalTotal = subtotal + (state.shippingCharges || 0);
  const balance = finalTotal - (state.amountPaid || 0);

  const handleDownloadPDF = async () => {
    console.log("one:64.vault: Starting 2-Page PDF Export...");
    const page1 = document.getElementById("pdf-page-1");
    const page2 = document.getElementById("pdf-page-2");
    
    if (!page1 || !page2) {
      alert("PDF generation failed: Source elements not found.");
      return;
    }

    setIsExporting(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const capturePage = async (el: HTMLElement) => {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: el.offsetWidth,
          height: el.offsetHeight
        });
        return canvas.toDataURL('image/png', 1.0);
      };

      const imgData1 = await capturePage(page1);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (page1.offsetHeight * pdfWidth) / page1.offsetWidth;
      pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight);

      pdf.addPage();
      const imgData2 = await capturePage(page2);
      const pdfHeight2 = (page2.offsetHeight * pdfWidth) / page2.offsetWidth;
      pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight2);

      const timestamp = new Date().getTime();
      pdf.save(`one_64_vault_Invoice_${timestamp}.pdf`);
      
      console.log("one:64.vault: PDF Export Complete.");
    } catch (error) {
      console.error("one:64.vault: PDF Export Error:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const inputClasses = "w-full mt-1 px-4 py-2 bg-[#000000] border border-[#2A2A2A] rounded-lg focus:border-white outline-none transition-all text-white placeholder-[#8A8A8A]";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 md:p-8 overflow-x-hidden">
      <div className="no-print w-full max-w-6xl mb-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0F0F0F] p-6 rounded-xl border border-[#2A2A2A] gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">one:64.vault</h1>
            <p className="text-[#BFBFBF]">Professional PDF Invoice Generator</p>
          </div>
          
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className={`flex items-center gap-3 bg-white text-black px-10 py-5 rounded-lg font-black transition-all active:scale-95 shadow-2xl cursor-pointer uppercase tracking-tight text-lg ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            {isExporting ? <span className="animate-pulse">Exporting PDF...</span> : <span>Export to PDF</span>}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section className="bg-[#0F0F0F] p-6 rounded-xl border border-[#2A2A2A]">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Camera size={20} /> Store Logo
              </h2>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#2A2A2A] rounded-lg p-6 hover:border-white transition-colors cursor-pointer bg-[#000000]">
                  <span className="text-sm text-[#8A8A8A]">Click to upload logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {state.logo && (
                  <div className="relative group">
                    <img src={state.logo} alt="Logo Preview" className="h-20 w-20 object-contain rounded border border-[#2A2A2A] bg-white p-1" />
                    <button type="button" onClick={() => setState(prev => ({ ...prev, logo: null }))} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"><Trash2 size={12} /></button>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-[#0F0F0F] p-6 rounded-xl border border-[#2A2A2A] space-y-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white"><User size={20} /> Customer Details</h2>
              <div className="space-y-3">
                <input type="text" value={state.customer.name} onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, name: e.target.value } }))} className={inputClasses} placeholder="Customer Name" />
                <input type="tel" value={state.customer.phone} onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, phone: e.target.value } }))} className={inputClasses} placeholder="Phone Number" />
                <textarea value={state.customer.address} onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, address: e.target.value } }))} rows={3} className={`${inputClasses} resize-none`} placeholder="Customer Address" />
              </div>
            </section>

            <section className="bg-[#0F0F0F] p-6 rounded-xl border border-[#2A2A2A]">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white"><IndianRupee size={20} /> Products Selection</h2>
              <div className="space-y-2 mb-4">
                {PRODUCTS.map((product) => (
                  <div key={product.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${state.selectedProducts[product.id] ? 'border-white bg-[#1A1A1A]' : 'border-[#2A2A2A] bg-[#000000]'}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={!!state.selectedProducts[product.id]} onChange={() => handleProductToggle(product.id)} className="w-5 h-5 appearance-none border border-white rounded cursor-pointer checked:bg-white transition-all relative after:content-[''] after:absolute after:inset-0 after:bg-black after:scale-0 checked:after:scale-[0.5] after:rounded-sm after:transition-transform" />
                      <div>
                        <div className="text-sm font-semibold text-white">{product.name}</div>
                        <div className="text-xs text-[#CFCFCF]">₹{product.price}</div>
                      </div>
                    </div>
                    {state.selectedProducts[product.id] !== undefined && (
                      <input type="number" min="1" value={state.selectedProducts[product.id]} onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)} className="w-16 px-2 py-1 text-center bg-[#000000] border border-[#2A2A2A] text-white rounded-md outline-none focus:border-white" />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-[#2A2A2A]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Custom Items</h3>
                {state.customItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 bg-[#000000] p-3 rounded-lg border border-[#2A2A2A]">
                    <div className="col-span-6">
                      <input 
                        type="text" 
                        placeholder="Item Name" 
                        value={item.name} 
                        onChange={(e) => updateCustomItem(item.id, 'name', e.target.value)} 
                        className="w-full text-xs px-2 py-1 bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded focus:border-white outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        placeholder="Price" 
                        value={item.price || ''} 
                        onChange={(e) => updateCustomItem(item.id, 'price', parseFloat(e.target.value) || 0)} 
                        className="w-full text-xs px-2 py-1 bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded focus:border-white outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateCustomItem(item.id, 'quantity', parseInt(e.target.value) || 1)} 
                        className="w-full text-xs px-2 py-1 bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded focus:border-white outline-none text-center"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button onClick={() => removeCustomItem(item.id)} className="text-red-500 hover:text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={addCustomItem}
                  className="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-[#2A2A2A] text-[#8A8A8A] text-xs font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all rounded-lg"
                >
                  <Plus size={14} /> Add Custom Product
                </button>
              </div>
            </section>

            <section className="bg-[#0F0F0F] p-6 rounded-xl border border-[#2A2A2A] space-y-4">
              <h2 className="text-lg font-semibold mb-4 text-white">Shipping & Payment</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={state.shippingCharges || ""} onChange={(e) => setState(prev => ({ ...prev, shippingCharges: parseFloat(e.target.value) || 0 }))} className={inputClasses} placeholder="Shipping Cost" />
                <input type="number" value={state.amountPaid || ""} onChange={(e) => setState(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))} className={inputClasses} placeholder="Paid Amount" />
              </div>
            </section>
          </div>

          <div className="hidden lg:block sticky top-8">
            <h2 className="text-sm font-bold text-[#8A8A8A] uppercase tracking-widest px-2 mb-4">Preview</h2>
            <div className="rounded-xl overflow-hidden shadow-2xl border border-[#2A2A2A]">
              <InvoicePreview state={state} subtotal={subtotal} finalTotal={finalTotal} balance={balance} />
            </div>
          </div>
        </div>
      </div>

      <div id="pdf-export-root" style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 1 }}>
        <div id="pdf-page-1" style={{ width: '210mm', backgroundColor: '#ffffff' }}>
          <InvoicePreview state={state} subtotal={subtotal} finalTotal={finalTotal} balance={balance} showPolicy={false} />
        </div>
        <div id="pdf-page-2" style={{ width: '210mm', backgroundColor: '#ffffff' }}>
          <PolicyPage />
        </div>
      </div>

      <footer className="no-print mt-12 py-8 text-[#8A8A8A] text-xs text-center border-t border-[#2A2A2A] w-full max-w-6xl">
        &copy; {new Date().getFullYear()} one:64.vault Jalandhar.
      </footer>
    </div>
  );
};

interface PreviewProps {
  state: InvoiceState;
  subtotal: number;
  finalTotal: number;
  balance: number;
  showPolicy?: boolean;
}

const InvoicePreview: React.FC<PreviewProps> = ({ state, subtotal, finalTotal, balance, showPolicy = true }) => {
  const standardItems = PRODUCTS.filter(p => state.selectedProducts[p.id]).map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    quantity: state.selectedProducts[p.id]
  }));

  const allItems = [...standardItems, ...state.customItems];

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <div className="bg-white overflow-hidden w-full min-h-[297mm] flex flex-col p-10 text-gray-800">
      <div className="flex justify-between items-start mb-10 border-b border-gray-100 pb-8">
        <div className="space-y-4">
          {state.logo ? <img src={state.logo} alt="Logo" className="max-h-20 max-w-[200px] object-contain" /> : <div className="text-black font-black text-4xl tracking-tighter">one:64.vault</div>}
          <div className="text-sm">
            <p className="font-bold text-gray-900">Address:</p>
            <p className="text-gray-600">{SHOP_ADDRESS}</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-black text-black mb-2 tracking-tighter uppercase">Invoice</h1>
          <p className="text-sm text-gray-500 font-bold">{formattedDate}</p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To:</h3>
        <div className="space-y-1 font-bold">
          <div className="text-gray-900 text-lg leading-tight uppercase">{state.customer.name || '---'}</div>
          <div className="text-gray-600 text-sm">{state.customer.phone || '---'}</div>
          <div className="text-gray-600 text-sm whitespace-pre-line leading-tight">{state.customer.address || '---'}</div>
        </div>
      </div>

      <div className="flex-grow">
        <table className="w-full" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: '55%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="py-4 text-left">Description</th>
              <th className="py-4 text-center">Price</th>
              <th className="py-4 text-center">Qty</th>
              <th className="py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allItems.length > 0 ? allItems.map((item) => {
              const total = item.price * item.quantity;
              return (
                <tr key={item.id} className="text-sm">
                  <td className="py-5 font-bold text-gray-900 text-left overflow-hidden">{item.name || 'Custom Item'}</td>
                  <td className="py-5 text-center text-gray-600 font-medium">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="py-5 text-center text-gray-600 font-medium">{item.quantity}</td>
                  <td className="py-5 text-right font-black text-gray-900">₹{total.toLocaleString('en-IN')}</td>
                </tr>
              );
            }) : <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No Items Selected</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-12 border-t-2 border-gray-100 pt-8 flex justify-end">
        <div className="w-full max-w-xs space-y-3 font-bold">
          <div className="flex justify-between text-sm"><span className="text-gray-500 uppercase">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 uppercase">Shipping</span><span>₹{state.shippingCharges.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between items-center pt-3 border-t-4 border-black text-2xl font-black uppercase tracking-tighter"><span>Total</span><span>₹{finalTotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-sm pt-2 text-gray-400 italic"><span>Paid</span><span>₹{state.amountPaid.toLocaleString('en-IN')}</span></div>
          <div className="mt-4">
            {balance <= 0 ? <div className="bg-black text-white px-4 py-2 rounded font-black text-center text-xs uppercase tracking-widest">Full Payment Done</div> : 
            <div className="border-2 border-red-600 text-red-600 px-4 py-2 rounded font-black text-center text-xs uppercase tracking-widest">Balance Due: ₹{balance.toLocaleString('en-IN')}</div>}
          </div>
        </div>
      </div>

      {showPolicy && (
        <div className="mt-12 pt-8 border-t border-gray-100 lg:hidden">
          <PolicyContent />
        </div>
      )}

      <div className="mt-20 pt-10 border-t border-gray-100 text-center space-y-2">
        <p className="text-black font-black italic text-2xl tracking-tight uppercase">{THANK_YOU_NOTE}</p>
        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">one:64.vault</p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-80">Computer Generated Invoice</p>
      </div>
    </div>
  );
};

const PolicyContent: React.FC = () => (
  <>
    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Payment & Delivery Policy</h4>
    <ul className="text-[10px] text-gray-500 space-y-2 font-medium leading-relaxed list-none">
      <li>• Payment must be completed within 24 hours of receiving this invoice.</li>
      <li>• Cash on Delivery (COD) is not available. Only prepaid orders are accepted.</li>
      <li>• Orders will be dispatched after successful payment confirmation.</li>
      <li>• Delivery typically takes 3–4 working days from the date of dispatch.</li>
      <li>• Delivery charges include packaging costs such as boxes, tape, and protective materials.</li>
    </ul>
  </>
);

const PolicyPage: React.FC = () => (
  <div className="bg-white w-full min-h-[297mm] p-20 text-gray-800 flex flex-col items-center">
    <div className="w-full max-w-2xl text-center border-b-2 border-black pb-8 mb-12">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Payment & Delivery Policy</h2>
    </div>
    <div className="w-full max-w-2xl space-y-6">
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
         <PolicyContent />
      </div>
    </div>
    <div className="mt-auto pt-10 text-center opacity-30 text-[9px] uppercase font-bold tracking-widest">one:64.vault Policy Document</div>
  </div>
);

export default App;
