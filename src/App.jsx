import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Eraser 
} from 'lucide-react';

const DEFAULT_CLAUSES = [
  {
    id: '1',
    title: 'Ownership Prior to Full Payment',
    content: 'All Deliverables, work-in-progress materials, source code, designs, documentation, concepts, and other intellectual property created or developed by ARCODIC in connection with the Services ("Work Product") shall remain the exclusive property of ARCODIC until all fees and amounts due under the applicable Statement of Work and the Master Service Agreement have been paid in full and in cleared funds.'
  },
  {
    id: '2',
    title: 'Transfer of Ownership Upon Payment',
    content: 'Subject to full and final payment, ARCODIC assigns to the Client all right, title, and interest in the final Deliverables expressly identified in the applicable Statement of Work. No ownership rights shall transfer, and no implied license shall be granted, prior to full payment.'
  },
  {
    id: '3',
    title: 'Portfolio and Marketing Rights',
    content: "Notwithstanding any transfer of ownership, ARCODIC retains a perpetual, royalty-free right to display, reproduce, and reference the completed Deliverables and the Client's name and logo for portfolio, website, case study, marketing, promotional, and award submission purposes, unless otherwise agreed in writing."
  },
  {
    id: '4',
    title: 'Third-Party and Open-Source Materials',
    content: 'Any third-party tools, libraries, frameworks, plugins, fonts, or open-source software incorporated into the Deliverables remain the property of their respective owners and are subject to their original license terms. ARCODIC makes no representations regarding exclusive ownership of such third-party materials.'
  },
  {
    id: '5',
    title: 'Restrictions on Resale and Redistribution',
    content: "Unless explicitly agreed in writing, the Client may not sell, sublicense, redistribute, or commercially exploit the Deliverables or any portion thereof as a standalone product or service. Any permitted use is limited to the Client's internal business or end-use purposes as contemplated by the applicable Statement of Work."
  },
  {
    id: '6',
    title: 'Reservation of Rights',
    content: "ARCODIC retains all rights not expressly granted to the Client under this Agreement. Nothing in this clause shall be construed as a waiver of ARCODIC's moral rights or proprietary methods, processes, or know-how."
  }
];

export default function App() {
  const [clauses, setClauses] = useState(DEFAULT_CLAUSES);
  const [clientName, setClientName] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);
  const contractRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load external scripts for PDF generation
  useEffect(() => {
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    ];

    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }, []);

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
    }
  }, []);

  // Helper to get coordinates for both Mouse and Touch
  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Prevent scrolling when drawing on touch devices
    if (e.touches) e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsSigned(true);
    if (e.touches) e.preventDefault();
  };

  const endDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsSigned(false);
  };

  const addClause = () => {
    const newClause = {
      id: Date.now().toString(),
      title: 'New Section',
      content: 'Enter terms here...'
    };
    setClauses([...clauses, newClause]);
  };

  const updateClause = (id, field, value) => {
    setClauses(clauses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeClause = (id) => {
    setClauses(clauses.filter(c => c.id !== id));
  };

  const exportPDF = async () => {
    if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') return;

    setIsGenerating(true);
    const element = contractRef.current;
    
    try {
      const canvas = await window.html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200 // Force desktop width for PDF rendering consistency
      });
      
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ARCODIC_Agreement_${clientName.replace(/\s+/g, '_') || 'Client'}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans p-4 sm:p-6 md:p-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">ARCODIC</h1>
          <p className="text-[#86868B] text-base sm:text-lg mt-1 font-medium">Digital Rights Manager</p>
        </div>
        <button 
          onClick={exportPDF}
          disabled={isGenerating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-xl shadow-black/10 active:scale-95 no-print"
        >
          {isGenerating ? 'Processing...' : <><Download size={18} /> Export PDF</>}
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        
        {/* Editor Sidebar */}
        <div className="lg:col-span-4 space-y-6 no-print order-2 lg:order-1">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/50">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#86868B] mb-6">Agreement Settings</h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-bold mb-1.5 block ml-1 text-zinc-400 uppercase">Client Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Legal Clauses</h2>
              <button 
                onClick={addClause}
                className="p-2.5 bg-zinc-100 rounded-full text-zinc-600 hover:bg-zinc-200 active:scale-90 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {clauses.map((clause, index) => (
                <div key={clause.id} className="group relative bg-[#F5F5F7] p-5 rounded-[1.5rem] border border-transparent hover:border-zinc-200 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-black text-zinc-400 tracking-tighter uppercase">Section {index + 1}</span>
                    <button onClick={() => removeClause(clause.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input 
                    className="w-full bg-transparent font-bold text-sm mb-2 outline-none border-b border-transparent focus:border-zinc-300"
                    value={clause.title}
                    onChange={(e) => updateClause(clause.id, 'title', e.target.value)}
                  />
                  <textarea 
                    className="w-full bg-transparent text-xs text-zinc-500 leading-relaxed outline-none resize-none h-28"
                    value={clause.content}
                    onChange={(e) => updateClause(clause.id, 'content', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview / Contract Canvas */}
        <div className="lg:col-span-8 order-1 lg:order-2 overflow-x-auto">
          <div 
            ref={contractRef}
            className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden min-h-[1000px] flex flex-col border border-zinc-200/50 w-full min-w-[320px]"
          >
            {/* Minimalist Watermark Header */}
            <div className="p-8 sm:p-16 pb-8 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black tracking-[0.4em] uppercase mb-1 opacity-20">ARCODIC</p>
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-zinc-800">Intellectual Property Rights</h1>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">REF ID</p>
                <p className="text-xs font-mono text-zinc-400">{Date.now().toString().slice(-8)}</p>
              </div>
            </div>

            {/* Document Content */}
            <div className="px-8 sm:px-16 py-8 flex-grow">
              <div className="space-y-12 sm:space-y-16">
                {clauses.map((clause, index) => (
                  <div key={clause.id} className="relative">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
                      <span className="text-xl sm:text-2xl font-light text-zinc-200 w-8 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold mb-3 tracking-tight text-zinc-900 uppercase text-[12px]">{clause.title}</h3>
                        <p className="text-zinc-600 leading-[1.8] font-light text-[14px] sm:text-[15px]">
                          {clause.content.split('{Client}').map((part, i, arr) => (
                            <React.Fragment key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <span className="font-bold text-black border-b border-zinc-200 pb-0.5">
                                  {clientName || '[CLIENT NAME]'}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Area */}
            <div className="px-8 sm:px-16 pt-16 pb-20 border-t border-zinc-50 bg-zinc-50/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-8">AUTHORIZED BY ARCODIC</p>
                  <div className="h-24 sm:h-32 border-b border-zinc-900 flex items-end pb-4">
                    <span className="text-2xl sm:text-3xl font-serif italic tracking-tighter text-zinc-800">Arcodic Creative</span>
                  </div>
                </div>
                
                <div className="no-print">
                  <div className="flex justify-between items-center mb-8">
                    <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase truncate max-w-[150px]">
                      ACCEPTED BY: {clientName || '...'}
                    </p>
                    <button 
                      onClick={clearSignature}
                      className="text-[10px] flex items-center gap-1.5 font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-all active:scale-95"
                    >
                      <Eraser size={12} /> Reset Pad
                    </button>
                  </div>
                  
                  <div className="relative group">
                    <canvas 
                      ref={canvasRef}
                      width={400}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseOut={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                      className="w-full bg-white border border-zinc-200 rounded-[1.5rem] cursor-crosshair shadow-sm touch-none"
                    />
                    {!isSigned && !isDrawing && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-300">DIGITAL SIGNATURE</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-20 flex flex-col sm:flex-row justify-between text-[8px] sm:text-[9px] text-zinc-400 font-bold tracking-[0.1em] gap-4">
                <p>© {new Date().getFullYear()} ARCODIC CREATIVE STUDIO. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-6">
                  <span>CLASS: PROPRIETARY</span>
                  <span className="text-blue-500/50">SECURED BY ARCODIC DIGITAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Confirmation Toast */}
      {isSigned && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 border border-white/10 z-[100] whitespace-nowrap">
          <div className="bg-green-500 rounded-full p-1 shadow-lg shadow-green-500/20">
            <CheckCircle2 className="text-white" size={14} />
          </div>
          <span className="font-semibold text-xs tracking-tight uppercase">Document digitally verified</span>
        </div>
      )}
    </div>
  );
}
