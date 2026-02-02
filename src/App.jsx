import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Package, Loader2, X, Euro, Minus, QrCode } from 'lucide-react';

// --- 1. 配置你的云端信息 (请务必检查这里) ---
const supabase = createClient(
  'https://jeducgvhiesgwccibiho.supabase.co', 
  'sb_publishable_-Xx7niM1TNk4awqT_V_SgQ_rY8G27HN'
);

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '冰货', quantity: 0, price: 0 });

  useEffect(() => {
    fetchInventory();
  }, []);

  // 读取库存
  async function fetchInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.error('读取出错:', error);
    else setItems(data || []);
    setLoading(false);
  }

  // 入库功能
  async function handleAdd() {
    if (!newItem.name) return alert("请输入货品名称");
    
    const dataToSubmit = {
      ...newItem,
      quantity: parseInt(newItem.quantity) || 0,
      price: parseFloat(newItem.price) || 0
    };

    const { error } = await supabase.from('inventory').insert([dataToSubmit]);

    if (!error) {
      setNewItem({ name: '', category: '冰货', quantity: 0, price: 0 });
      setShowAdd(false);
      fetchInventory();
    }
  }

  // --- 【新增：出库功能】 ---
  async function handleReduce(id, currentQty) {
    if (currentQty <= 0) return alert("库存已经为0了，请先补货");
    
    const { error } = await supabase
      .from('inventory')
      .update({ quantity: currentQty - 1 })
      .eq('id', id);
    
    if (!error) {
      // 局部更新列表，让反应更快
      setItems(items.map(item => item.id === id ? {...item, quantity: item.quantity - 1} : item));
    }
  }

  // 删除货品
  async function handleDelete(id) {
    if (window.confirm('确定要删除这个货品吗？')) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (!error) fetchInventory();
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] max-w-md mx-auto border-x border-gray-100 shadow-2xl relative text-gray-800 font-sans">
      
      {/* 顶部标题栏 */}
      <header className="bg-white/80 backdrop-blur-md p-5 sticky top-0 z-20 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 p-1.5 rounded-lg shadow-sm text-white">
            <Package size={20}/>
          </div>
          <h1 className="text-xl font-black tracking-tight">中国楼仓库</h1>
        </div>
        {loading && <Loader2 className="animate-spin text-red-500" size={20}/>}
      </header>

      {/* 列表内容 */}
      <main className="p-4 space-y-4 pb-32">
        {items.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-300 font-medium">仓库是空的，点击下方入库</div>
        )}
        
        {items.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-bold uppercase">{item.category}</span>
                <h3 className="font-bold text-lg">{item.name}</h3>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium">
                <p className="text-gray-400">库存 <span className={item.quantity < 5 ? "text-red-500 font-black" : "text-gray-900"}>{item.quantity}</span></p>
                <p className="text-gray-400">单价 <span className="text-red-500 font-bold">€{item.price}</span></p>
              </div>
            </div>

            {/* 操作按钮区 */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleReduce(item.id, item.quantity)}
                className="bg-gray-100 text-gray-600 p-3 rounded-2xl hover:bg-red-100 hover:text-red-600 active:scale-90 transition-all"
                title="快速出库"
              >
                <Minus size={20} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-gray-200 hover:text-red-400 p-2">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* 底部浮动控制栏 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] flex gap-3">
        <button 
          onClick={() => setShowAdd(true)}
          className="flex-1 bg-gray-900 text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all"
        >
          <Plus size={22}/> 入库登记
        </button>
        {/* 预留扫码快捷入口 */}
        <button 
          onClick={() => alert("扫码功能需要在上线部署并开启 HTTPS 后使用。下一阶段为您接入摄像头！")}
          className="bg-white border-2 border-gray-900 text-gray-900 p-4 rounded-[2rem] shadow-xl active:scale-95 transition-all"
        >
          <QrCode size={22}/>
        </button>
      </div>

      {/* 添加弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-end">
          <div className="bg-white w-full rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">入库信息</h2>
              <button onClick={() => setShowAdd(false)} className="bg-gray-100 p-2.5 rounded-full text-gray-500"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-4 uppercase">货品名称</label>
                <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-red-500 transition-all font-bold" 
                  placeholder="输入名称" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-4 uppercase">分类</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-red-500 font-bold" 
                    value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    <option>冰货</option><option>酒水</option><option>干货</option><option>杂货</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-4 uppercase">数量</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-red-500 font-bold" 
                    type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})}/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-4 uppercase">单价 (€)</label>
                <div className="relative">
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-red-500 font-bold pl-12 text-red-600" 
                    type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}/>
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20}/>
                </div>
              </div>
              
              <button onClick={handleAdd} className="w-full bg-red-500 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-red-200 mt-4 active:scale-95 transition-all">
                确认存入云端
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}