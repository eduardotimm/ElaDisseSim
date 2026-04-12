import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Guest {
  id: number;
  name: string;
  isConfirmed: boolean | null;
}

interface Family {
  id: number;
  name: string;
  phoneNumber: string;
  guests: Guest[];
}

interface Gift {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isPurchased: boolean;
  purchasedBy?: string | null;
}

interface Vendor {
  id: number;
  name: string;
  category?: string | null;
  totalAmount?: number | null;
  isPerPerson: boolean;
  paidAmount?: number | null;
  dueDate?: string | null;
  isHired: boolean;
  phone?: string | null;
  notes?: string | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'convidados' | 'presentes' | 'fornecedores' | 'financeiro'>('convidados');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Estados do Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guests, setGuests] = useState<{ id?: number; name: string; isConfirmed: boolean | null }[]>([{ name: '', isConfirmed: null }]);
  const [editingFamilyId, setEditingFamilyId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [expandedFamilies, setExpandedFamilies] = useState<number[]>([]);

  // Estados do Modal e Formulário de Presentes
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<number | null>(null);
  const [giftTitle, setGiftTitle] = useState('');
  const [giftDescription, setGiftDescription] = useState('');
  const [giftPrice, setGiftPrice] = useState<number | ''>('');
  const [giftImageUrl, setGiftImageUrl] = useState('');
  const [giftIsPurchased, setGiftIsPurchased] = useState(false);
  const [giftPurchasedBy, setGiftPurchasedBy] = useState('');

  // Estados do Modal e Formulário de Fornecedores
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<number | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('');
  const [vendorTotalAmount, setVendorTotalAmount] = useState<number | ''>('');
  const [vendorIsPerPerson, setVendorIsPerPerson] = useState(false);
  const [vendorPaidAmount, setVendorPaidAmount] = useState<number | ''>('');
  const [vendorDueDate, setVendorDueDate] = useState('');
  const [vendorIsHired, setVendorIsHired] = useState(false);
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');

  const fetchFamilies = async () => {
    try {
      const response = await fetch('http://localhost:5062/api/families');
      if (response.ok) {
        const data = await response.json();
        setFamilies(data);
      } else {
        const err = await response.text();
        console.error('Erro na API:', err);
      }
    } catch (error) {
      console.error('Erro ao buscar famílias:', error);
    }
  };

  const fetchGifts = async () => {
    try {
      const response = await fetch('http://localhost:5062/api/gifts');
      if (response.ok) {
        const data = await response.json();
        setGifts(data);
      }
    } catch (error) {
      console.error('Erro ao buscar presentes:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5062/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFamilies();
      fetchGifts();
      fetchVendors();
    }
  }, [isAuthenticated]);

  const toggleFamily = (id: number) => {
    setExpandedFamilies(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const totalConfirmedGuests = families.flatMap(f => f.guests).filter(g => g.isConfirmed === true).length;

  const openCreateModal = () => {
    setEditingFamilyId(null);
    setFamilyName('');
    setPhoneNumber('');
    setGuests([{ name: '', isConfirmed: null }]);
    setIsModalOpen(true);
  };

  const openEditModal = (family: Family) => {
    setEditingFamilyId(family.id);
    setFamilyName(family.name);
    setPhoneNumber(family.phoneNumber);
    setGuests(family.guests && family.guests.length > 0 ? family.guests : [{ name: '', isConfirmed: null }]);
    setIsModalOpen(true);
  };

  const openCreateGiftModal = () => {
    setEditingGiftId(null);
    setGiftTitle('');
    setGiftDescription('');
    setGiftPrice('');
    setGiftImageUrl('');
    setGiftIsPurchased(false);
    setGiftPurchasedBy('');
    setIsGiftModalOpen(true);
  };

  const openEditGiftModal = (gift: Gift) => {
    setEditingGiftId(gift.id);
    setGiftTitle(gift.title);
    setGiftDescription(gift.description);
    setGiftPrice(gift.price);
    setGiftImageUrl(gift.imageUrl || '');
    setGiftIsPurchased(gift.isPurchased);
    setGiftPurchasedBy(gift.purchasedBy || '');
    setIsGiftModalOpen(true);
  };

  const openCreateVendorModal = () => {
    setEditingVendorId(null);
    setVendorName('');
    setVendorCategory('');
    setVendorTotalAmount('');
    setVendorIsPerPerson(false);
    setVendorPaidAmount('');
    setVendorDueDate('');
    setVendorIsHired(false);
    setVendorPhone('');
    setVendorNotes('');
    setIsVendorModalOpen(true);
  };

  const openEditVendorModal = (vendor: Vendor) => {
    setEditingVendorId(vendor.id);
    setVendorName(vendor.name);
    setVendorCategory(vendor.category || '');
    setVendorTotalAmount(vendor.totalAmount ?? '');
    setVendorIsPerPerson(vendor.isPerPerson || false);
    setVendorPaidAmount(vendor.paidAmount ?? '');
    setVendorDueDate(vendor.dueDate || '');
    setVendorIsHired(vendor.isHired);
    setVendorPhone(vendor.phone || '');
    setVendorNotes(vendor.notes || '');
    setIsVendorModalOpen(true);
  };

  const handleAddGuest = () => {
    if (guests.length < 6) setGuests([...guests, { name: '', isConfirmed: null }]);
  };

  const handleRemoveGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleGuestChange = (index: number, value: string) => {
    const newGuests = [...guests];
    newGuests[index].name = value;
    setGuests(newGuests);
  };

  const handleGuestStatusChange = (index: number, status: boolean | null) => {
    const newGuests = [...guests];
    newGuests[index].isConfirmed = status;
    setGuests(newGuests);
  };

  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingFamilyId 
        ? `http://localhost:5062/api/families/${editingFamilyId}`
        : 'http://localhost:5062/api/families';
      const method = editingFamilyId ? 'PUT' : 'POST';
      const bodyData = { familyName, phoneNumber, guests: guests.filter(g => g.name.trim() !== '') };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      if (response.ok) {
        alert(editingFamilyId ? 'Família atualizada com sucesso!' : 'Família cadastrada com sucesso!');
        setIsModalOpen(false);
        fetchFamilies(); // Atualiza a lista automaticamente após o cadastro
      } else {
        const err = await response.text();
        alert('Erro do Servidor: ' + err);
      }
    } catch (err) {
      alert('Erro ao conectar. O backend está rodando e com o CORS configurado?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFamily = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta família e todos os seus convidados?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5062/api/families/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchFamilies(); // Atualiza a lista removendo o excluído
      } else {
        const err = await response.text();
        alert('Erro ao excluir: ' + err);
      }
    } catch (error) {
      console.error('Erro ao excluir família:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleConfirmAllGuests = async () => {
    if (!window.confirm('Tem certeza que deseja confirmar a presença de TODOS os convidados cadastrados de uma vez?')) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5062/api/families/confirm-all', { method: 'PUT' });
      
      if (response.ok) {
        alert('A presença de todos os convidados foi confirmada com sucesso!');
        fetchFamilies();
      } else {
        alert('Erro ao confirmar todos: ' + await response.text());
      }
    } catch (error) {
      console.error('Erro ao confirmar convidados:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingGiftId 
        ? `http://localhost:5062/api/gifts/${editingGiftId}`
        : 'http://localhost:5062/api/gifts';
      const method = editingGiftId ? 'PUT' : 'POST';
      const bodyData = {
        title: giftTitle,
        description: giftDescription,
        price: Number(giftPrice),
        imageUrl: giftImageUrl || null,
        isPurchased: giftIsPurchased,
        purchasedBy: giftIsPurchased ? (giftPurchasedBy || null) : null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      if (response.ok) {
        alert(editingGiftId ? 'Presente atualizado com sucesso!' : 'Presente cadastrado com sucesso!');
        setIsGiftModalOpen(false);
        fetchGifts();
      } else {
        const err = await response.text();
        alert('Erro do Servidor: ' + err);
      }
    } catch (err) {
      alert('Erro ao conectar. O backend está rodando e com o CORS configurado?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGift = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este presente?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5062/api/gifts/${id}`, { method: 'DELETE' });
      if (response.ok) fetchGifts();
      else alert('Erro ao excluir: ' + await response.text());
    } catch (error) {
      console.error('Erro ao excluir presente:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingVendorId 
        ? `http://localhost:5062/api/vendors/${editingVendorId}`
        : 'http://localhost:5062/api/vendors';
      const method = editingVendorId ? 'PUT' : 'POST';
      const bodyData = {
        name: vendorName,
        category: vendorCategory || null,
        totalAmount: vendorTotalAmount === '' ? null : Number(vendorTotalAmount),
        isPerPerson: vendorIsPerPerson,
        paidAmount: vendorPaidAmount === '' ? null : Number(vendorPaidAmount),
        dueDate: vendorDueDate || null,
        isHired: vendorIsHired,
        phone: vendorPhone || null,
        notes: vendorNotes || null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      if (response.ok) {
        alert(editingVendorId ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!');
        setIsVendorModalOpen(false);
        fetchVendors();
      } else {
        const err = await response.text();
        alert('Erro do Servidor: ' + err);
      }
    } catch (err) {
      alert('Erro ao conectar. O backend está rodando e com o CORS configurado?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVendor = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5062/api/vendors/${id}`, { method: 'DELETE' });
      if (response.ok) fetchVendors();
      else alert('Erro ao excluir: ' + await response.text());
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação Hardcoded
    if (username === 'Tovom' && password === 'XingLing12#') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  // Tela de Login (Se não estiver autenticado)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-md w-full text-center border border-slate-200">
          <h2 className="text-3xl font-serif text-slate-800 mb-2">Acesso Restrito</h2>
          <p className="text-slate-500 mb-8 font-light">Insira suas credenciais para acessar o painel.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Usuário" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all text-center text-lg text-slate-700"
              required
            />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all text-center text-lg text-slate-700"
              required
            />
            {error && <p className="text-red-500 text-sm font-medium mt-1">{error}</p>}
            
            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-serif tracking-widest text-lg py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 mt-2">
              Entrar
            </button>
          </form>
          
          <button onClick={() => navigate('/')} className="mt-8 text-sm text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Voltar ao Site</button>
        </div>
      </div>
    );
  }

  // Painel Administrativo (Se estiver autenticado)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar (Menu Lateral) */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-serif text-slate-800 tracking-wide">Painel Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('convidados')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'convidados' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Gestão de Convidados
          </button>
          <button 
            onClick={() => setActiveTab('presentes')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'presentes' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Gestão de Presentes
          </button>
        <button 
          onClick={() => setActiveTab('fornecedores')}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'fornecedores' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Gestão de Fornecedores
        </button>
        <button 
          onClick={() => setActiveTab('financeiro')}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'financeiro' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Dashboard Financeiro
        </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => navigate('/')} className="w-full text-left px-4 py-3 text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest text-xs font-bold">
            ← Voltar ao Site
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        {/* Aba: Gestão de Convidados */}
        {activeTab === 'convidados' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-3xl font-serif text-slate-800">Famílias & Convidados</h2>
              <div className="flex gap-3">
                <button onClick={handleConfirmAllGuests} disabled={isSubmitting} className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 font-medium disabled:opacity-50">
                  Confirmar Todos
                </button>
                <button onClick={openCreateModal} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 font-medium">
                  + Cadastrar Novo
                </button>
              </div>
            </div>

            {/* Tabela de Dados Mockada */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="p-5 font-semibold w-10"></th>
                    <th className="p-5 font-semibold">Núcleo Familiar</th>
                    <th className="p-5 font-semibold">Telefone (Login)</th>
                    <th className="p-5 font-semibold text-center">Convidados</th>
                    <th className="p-5 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {families.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-slate-500">Nenhuma família cadastrada ainda.</td>
                    </tr>
                  ) : (
                    families.map((family) => (
                      <React.Fragment key={family.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="p-5 text-center">
                            <button onClick={() => toggleFamily(family.id)} className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors">
                              {expandedFamilies.includes(family.id) ? '▼' : '▶'}
                            </button>
                          </td>
                          <td className="p-5 text-slate-800 font-medium">{family.name}</td>
                          <td className="p-5 text-slate-500">{family.phoneNumber}</td>
                          <td className="p-5 text-slate-500 text-center">{family.guests?.length || 0}</td>
                          <td className="p-5 text-right">
                            <button onClick={() => openEditModal(family)} className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4 transition-colors">Editar</button>
                            <button onClick={() => handleDeleteFamily(family.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">Excluir</button>
                          </td>
                        </tr>
                        {expandedFamilies.includes(family.id) && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={5} className="p-0">
                              <div className="px-16 py-4 text-sm text-slate-600 border-b border-slate-100">
                                <ul className="list-disc pl-5 space-y-1">
                                  {family.guests?.map((guest) => (
                                    <li key={guest.id}>
                                      <span className="font-medium text-slate-700">{guest.name}</span>
                                      {guest.isConfirmed === true && <span className="ml-2 text-green-600 font-medium text-xs uppercase tracking-wider">(Confirmado)</span>}
                                      {guest.isConfirmed === false && <span className="ml-2 text-red-500 font-medium text-xs uppercase tracking-wider">(Não Vai)</span>}
                                      {guest.isConfirmed === null && <span className="ml-2 text-slate-400 text-xs uppercase tracking-wider">(Pendente)</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba: Gestão de Presentes */}
        {activeTab === 'presentes' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-3xl font-serif text-slate-800">Gestão de Presentes</h2>
              <button onClick={openCreateGiftModal} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 font-medium">
                + Cadastrar Novo
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="p-5 font-semibold">Presente</th>
                    <th className="p-5 font-semibold">Valor (R$)</th>
                    <th className="p-5 font-semibold text-center">Status</th>
                    <th className="p-5 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gifts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-5 text-center text-slate-500">Nenhum presente cadastrado ainda.</td>
                    </tr>
                  ) : (
                    gifts.map((gift) => (
                      <tr key={gift.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-slate-800 font-medium">
                          <div className="flex items-center gap-3">
                            {gift.imageUrl ? <img src={gift.imageUrl} alt={gift.title} className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">Sem img</div>}
                            <span>{gift.title}</span>
                          </div>
                        </td>
                        <td className="p-5 text-slate-500">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.price)}
                        </td>
                        <td className="p-5 text-center">
                          {gift.isPurchased ? (
                            <div className="flex flex-col items-center">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Comprado</span>
                              {gift.purchasedBy && <span className="text-[10px] text-slate-400 mt-1 text-center">por {gift.purchasedBy}</span>}
                            </div>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Disponível</span>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <button onClick={() => openEditGiftModal(gift)} className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4 transition-colors">Editar</button>
                          <button onClick={() => handleDeleteGift(gift.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">Excluir</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba: Gestão de Fornecedores */}
        {activeTab === 'fornecedores' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-3xl font-serif text-slate-800">Gestão de Fornecedores</h2>
              <button onClick={openCreateVendorModal} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 font-medium">
                + Cadastrar Novo
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="p-5 font-semibold">Fornecedor</th>
                    <th className="p-5 font-semibold text-center">Tipo</th>
                    <th className="p-5 font-semibold text-right">Valor Total</th>
                    <th className="p-5 font-semibold text-center">Status</th>
                    <th className="p-5 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-slate-500">Nenhum fornecedor cadastrado ainda.</td>
                    </tr>
                  ) : (
                    vendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-slate-800 font-medium">
                          <div className="flex flex-col">
                            <span>{vendor.name}</span>
                            {vendor.phone && <span className="text-xs text-slate-400 font-normal mt-0.5">{vendor.phone}</span>}
                          </div>
                        </td>
                        <td className="p-5 text-slate-500 text-center">{vendor.category || '-'}</td>
                        <td className="p-5 text-slate-500 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-slate-700 font-medium">
                              {vendor.totalAmount ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendor.isPerPerson ? vendor.totalAmount * totalConfirmedGuests : vendor.totalAmount) : '-'}
                            </span>
                            {vendor.isPerPerson && vendor.totalAmount && <span className="text-[10px] text-slate-400 mt-0.5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendor.totalAmount)} p/ pessoa</span>}
                            {vendor.paidAmount != null && vendor.paidAmount > 0 && <span className="text-xs text-green-600 font-normal mt-0.5">Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendor.paidAmount)}</span>}
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          {vendor.isHired ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Fechado</span>
                          ) : (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Em Orçamento</span>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <button onClick={() => openEditVendorModal(vendor)} className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4 transition-colors">Editar</button>
                          <button onClick={() => handleDeleteVendor(vendor.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">Excluir</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba: Dashboard Financeiro */}
        {activeTab === 'financeiro' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-3xl font-serif text-slate-800">Dashboard Financeiro</h2>
            </div>

            {/* Resumo em Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Custo Estimado Total</h3>
                <p className="text-3xl font-serif text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendors.reduce((acc, v) => acc + (v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0)), 0))}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Total Já Pago</h3>
                <p className="text-3xl font-serif text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendors.reduce((acc, v) => acc + (v.paidAmount || 0), 0))}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Falta Pagar</h3>
                <p className="text-3xl font-serif text-red-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    vendors.reduce((acc, v) => acc + (v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0)), 0) - vendors.reduce((acc, v) => acc + (v.paidAmount || 0), 0)
                  )}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Presentes Recebidos</h3>
                <p className="text-3xl font-serif text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gifts.filter(g => g.isPurchased).reduce((acc, g) => acc + Number(g.price || 0), 0))}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Convidados Confirmados</h3>
                <p className="text-3xl font-serif text-slate-800">
                  {totalConfirmedGuests}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Custo Médio por Convidado</h3>
                <p className="text-3xl font-serif text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    (() => {
                      const categoriasVariaveis = ['buffet', 'papelaria', 'lembrancinhas', 'lembrancinha', 'doces'];
                      const custoVariavel = vendors
                        .filter(v => v.category && categoriasVariaveis.includes(v.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()))
                        .reduce((acc, v) => acc + (v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0)), 0);
                      return totalConfirmedGuests > 0 ? custoVariavel / totalConfirmedGuests : 0;
                    })()
                  )}
                </p>
                <p className="text-[10px] leading-tight text-slate-400 mt-2">Apenas Buffet, Decoração, Papelaria e Lembrancinhas</p>
              </div>
            </div>

            <h3 className="text-2xl font-serif text-slate-800 mb-6">Balanço por Família (Brincadeira)</h3>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="p-5 font-semibold">Família</th>
                    <th className="p-5 font-semibold text-center">Confirmados</th>
                    <th className="p-5 font-semibold text-right">Custo Gerado</th>
                    <th className="p-5 font-semibold text-right">Presentes Dados</th>
                    <th className="p-5 font-semibold text-right">Prejuízo / Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const categoriasVariaveis = ['buffet', 'decoracao', 'papelaria', 'lembrancinhas', 'lembrancinha'];
                    const custoVariavel = vendors
                      .filter(v => v.category && categoriasVariaveis.includes(v.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()))
                      .reduce((acc, v) => acc + (v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0)), 0);
                    const mediaPorConvidado = totalConfirmedGuests > 0 ? custoVariavel / totalConfirmedGuests : 0;

                    // Calcula os dados e ordena do maior prejuízo para o maior lucro
                    const familiasProcessadas = families.map(f => {
                      const confCount = f.guests.filter(g => g.isConfirmed === true).length;
                      const custo = confCount * mediaPorConvidado;
                      const presentes = gifts
                        .filter(g => g.isPurchased && g.purchasedBy?.trim().toLowerCase() === f.name.trim().toLowerCase())
                        .reduce((acc, g) => acc + Number(g.price || 0), 0);
                      const saldo = custo - presentes;
                      return { ...f, confCount, custo, presentes, saldo };
                    }).sort((a, b) => b.saldo - a.saldo);

                    return familiasProcessadas.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-slate-800 font-medium">{f.name}</td>
                        <td className="p-5 text-slate-500 text-center">{f.confCount}</td>
                        <td className="p-5 text-slate-500 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.custo)}</td>
                        <td className="p-5 text-green-600 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.presentes)}</td>
                        <td className={`p-5 text-right font-medium ${f.saldo > 0 ? 'text-red-500' : 'text-blue-600'}`}>
                          {f.saldo > 0 ? 'Prejuízo: ' : 'Lucro: '}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(f.saldo))}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Modal de Cadastro de Nova Família */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-slate-800">{editingFamilyId ? 'Editar Família' : 'Nova Família'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSaveFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Núcleo Familiar</label>
                <input type="text" required value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="Ex: Família Silva" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp (Chefe da Família)</label>
                <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="11999999999" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Convidados ({guests.length}/6)</label>
                  {guests.length < 6 && (
                    <button type="button" onClick={handleAddGuest} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Adicionar</button>
                  )}
                </div>
                {guests.map((guest, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input type="text" required value={guest.name} onChange={e => handleGuestChange(index, e.target.value)} placeholder={index === 0 ? "Nome do Chefe da Família" : `Nome do Acompanhante ${index}`} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                    
                    <select
                      value={guest.isConfirmed === true ? 'true' : guest.isConfirmed === false ? 'false' : 'null'}
                      onChange={e => handleGuestStatusChange(index, e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
                      className="w-32 px-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white text-sm text-slate-700"
                    >
                      <option value="null">Pendente</option>
                      <option value="true">Confirmado</option>
                      <option value="false">Não Vai</option>
                    </select>
                    
                    {guests.length > 1 && (
                      <button type="button" onClick={() => handleRemoveGuest(index)} className="text-red-500 hover:text-red-700 px-2 text-xl">&times;</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar Família'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Novo Presente */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-slate-800">{editingGiftId ? 'Editar Presente' : 'Novo Presente'}</h3>
              <button onClick={() => setIsGiftModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSaveGift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título do Presente</label>
                <input type="text" required value={giftTitle} onChange={e => setGiftTitle(e.target.value)} placeholder="Ex: Cotas de Lua de Mel" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea rows={3} required value={giftDescription} onChange={e => setGiftDescription(e.target.value)} placeholder="Breve descrição do presente..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input type="number" step="0.01" min="0" required value={giftPrice} onChange={e => setGiftPrice(parseFloat(e.target.value))} placeholder="Ex: 500.00" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL da Imagem (Opcional)</label>
                <input type="url" value={giftImageUrl} onChange={e => setGiftImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPurchased" checked={giftIsPurchased} onChange={e => setGiftIsPurchased(e.target.checked)} className="w-5 h-5 rounded-md border-slate-300 text-slate-800 focus:ring-slate-800" />
                  <label htmlFor="isPurchased" className="text-sm font-medium text-slate-700 cursor-pointer">Marcar como comprado manualmente</label>
                </div>
                {giftIsPurchased && (
                  <div className="pl-7">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Comprado por:</label>
                    <select value={giftPurchasedBy} onChange={e => setGiftPurchasedBy(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-700 bg-white">
                      <option value="">Selecione quem comprou...</option>
                      <option value="Convidado Não Listado">Convidado Não Listado</option>
                      {families.map(f => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsGiftModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar Presente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Novo Fornecedor */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-slate-800">{editingVendorId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Fornecedor</label>
                <input type="text" required value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Ex: Doce Sonho" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria/Tipo</label>
                  <input type="text" value={vendorCategory} onChange={e => setVendorCategory(e.target.value)} placeholder="Ex: Doces, Decoração..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone/Contato</label>
                  <input type="tel" value={vendorPhone} onChange={e => setVendorPhone(e.target.value)} placeholder="Ex: (11) 99999-9999" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{vendorIsPerPerson ? 'Valor por Pessoa (R$)' : 'Valor Total (R$)'}</label>
                  <input type="number" step="0.01" min="0" value={vendorTotalAmount} onChange={e => setVendorTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder={vendorIsPerPerson ? "Ex: 150.00" : "Ex: 1500.00"} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="isPerPerson" checked={vendorIsPerPerson} onChange={e => setVendorIsPerPerson(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800" />
                    <label htmlFor="isPerPerson" className="text-xs font-medium text-slate-600 cursor-pointer leading-tight">Preço por pessoa (multiplica pelos convidados confirmados)</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Pago (R$)</label>
                  <input type="number" step="0.01" min="0" value={vendorPaidAmount} onChange={e => setVendorPaidAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="Ex: 500.00" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Pagamento</label>
                <input type="text" value={vendorDueDate} onChange={e => setVendorDueDate(e.target.value)} placeholder="Ex: Metade até 10/10, restante na semana" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Anotações adicionais</label>
                <textarea rows={2} value={vendorNotes} onChange={e => setVendorNotes(e.target.value)} placeholder="Detalhes do contrato, pendências..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isHired" checked={vendorIsHired} onChange={e => setVendorIsHired(e.target.checked)} className="w-5 h-5 rounded-md border-slate-300 text-slate-800 focus:ring-slate-800" />
                  <label htmlFor="isHired" className="text-sm font-medium text-slate-700 cursor-pointer">Contrato Fechado (Fornecedor Contratado)</label>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsVendorModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
