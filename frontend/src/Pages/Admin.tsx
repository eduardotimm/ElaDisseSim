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
  reservedUntil?: string | null;
}

interface Vendor {
  id: number;
  name: string;
  category?: string | null;
  totalAmount?: number | null;
  isPerPerson: boolean;
  paidAmount?: number | null;
  dueDate?: string | null;
  paymentDate?: string | null;
  installments?: number | null;
  paidInstallments?: number | null;
  status: string;
  considerCost: boolean;
  phone?: string | null;
  notes?: string | null;
}

interface Faq {
  id: number;
  question: string;
  answer: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [activeTab, setActiveTab] = useState<'convidados' | 'presentes' | 'fornecedores' | 'financeiro' | 'faq' | 'calendario'>('convidados');
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
  const [vendorPaymentDate, setVendorPaymentDate] = useState('');
  const [vendorInstallments, setVendorInstallments] = useState<number | ''>('');
  const [vendorPaidInstallments, setVendorPaidInstallments] = useState<number | ''>('');
  const [vendorStatus, setVendorStatus] = useState('A Consultar');
  const [vendorConsiderCost, setVendorConsiderCost] = useState(true);
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');

  // Estados do Modal e Formulário de FAQ
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Estado do Calendário
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Função para formatar o telefone no padrão (11) 99999-9999 dinamicamente
  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  };

  const fetchFamilies = async () => {
    try {
      const response = await fetch('http://localhost:5062/api/families', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        setToken(null);
        setIsAuthenticated(false);
        return;
      }
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
      const response = await fetch('http://localhost:5062/api/vendors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await fetch('http://localhost:5062/api/faqs');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Erro ao buscar FAQs:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFamilies();
      fetchGifts();
      fetchVendors();
      fetchFaqs();
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
    setPhoneNumber(formatPhoneNumber(family.phoneNumber));
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
    setVendorPaymentDate('');
    setVendorInstallments('');
    setVendorPaidInstallments('');
    setVendorStatus('A Consultar');
    setVendorConsiderCost(true);
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
    setVendorPaymentDate(vendor.paymentDate || '');
    setVendorInstallments(vendor.installments || '');
    setVendorPaidInstallments(vendor.paidInstallments ?? 0);
    // Fallback caso a migração do C# não tenha rodado
    setVendorStatus(vendor.status || ((vendor as any).isHired ? 'Contratado' : 'A Consultar'));
    setVendorConsiderCost(vendor.considerCost ?? true);
    setVendorPhone(formatPhoneNumber(vendor.phone || ''));
    setVendorNotes(vendor.notes || '');
    setIsVendorModalOpen(true);
  };

  const openCreateFaqModal = () => {
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setIsFaqModalOpen(true);
  };

  const openEditFaqModal = (faq: Faq) => {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setIsFaqModalOpen(true);
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
      const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove máscara para salvar no banco
      const bodyData = { familyName, phoneNumber: cleanPhone, guests: guests.filter(g => g.name.trim() !== '') };

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleExportToCSV = () => {
    // Cabeçalho do CSV
    let csvContent = "Núcleo Familiar,Telefone,Convidado,Status de Confirmação\n";

    // Percorre as famílias e seus convidados para montar as linhas
    families.forEach(family => {
      family.guests.forEach(guest => {
        const familyName = `"${family.name.replace(/"/g, '""')}"`; // Escapa aspas
        const phone = `"${family.phoneNumber}"`;
        const guestName = `"${guest.name.replace(/"/g, '""')}"`;
        let status = "Pendente";
        if (guest.isConfirmed === true) status = "Confirmado";
        if (guest.isConfirmed === false) status = "Não Vai";

        csvContent += `${familyName},${phone},${guestName},${status}\n`;
      });
    });

    // \ufeff é o BOM (Byte Order Mark) para o Excel entender UTF-8 (Acentuação)
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lista_de_convidados.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmAllGuests = async () => {
    if (!window.confirm('Tem certeza que deseja confirmar a presença de TODOS os convidados cadastrados de uma vez?')) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5062/api/families/confirm-all', { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
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
        purchasedBy: giftPurchasedBy || null
      };

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const response = await fetch(`http://localhost:5062/api/gifts/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchGifts();
      else alert('Erro ao excluir: ' + await response.text());
    } catch (error) {
      console.error('Erro ao excluir presente:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleConfirmReservation = async (id: number) => {
    if (!window.confirm('Confirmar o recebimento do PIX e marcar este presente como Comprado?')) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5062/api/gifts/${id}/confirm-reservation`, { 
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchGifts();
      else alert('Erro ao confirmar: ' + await response.text());
    } catch (error) {
      alert('Erro de conexão com o servidor ao confirmar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!window.confirm('Cancelar a reserva e disponibilizar o presente novamente?')) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5062/api/gifts/${id}/cancel-reservation`, { 
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchGifts();
      else alert('Erro ao cancelar: ' + await response.text());
    } catch (error) {
      alert('Erro de conexão com o servidor ao cancelar reserva.');
    } finally {
      setIsSubmitting(false);
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

      let finalStatus = vendorStatus;
      const total = vendorTotalAmount === '' ? 0 : Number(vendorTotalAmount);
      const paid = vendorPaidAmount === '' ? 0 : Number(vendorPaidAmount);
      // Regra automática do Quitado
      if (total > 0 && paid >= total && finalStatus !== 'Quitado') {
        finalStatus = 'Quitado';
      }

      const bodyData = {
        name: vendorName,
        category: vendorCategory || null,
        totalAmount: vendorTotalAmount === '' ? null : Number(vendorTotalAmount),
        isPerPerson: vendorIsPerPerson,
        paidAmount: vendorPaidAmount === '' ? null : Number(vendorPaidAmount),
        dueDate: vendorDueDate || null,
        paymentDate: vendorPaymentDate || null,
        installments: vendorInstallments === '' ? null : Number(vendorInstallments),
        paidInstallments: vendorPaidInstallments === '' ? 0 : Number(vendorPaidInstallments),
        status: finalStatus,
        considerCost: vendorConsiderCost,
        phone: vendorPhone ? vendorPhone.replace(/\D/g, '') : null, // Remove máscara para salvar no banco
        notes: vendorNotes || null
      };

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const response = await fetch(`http://localhost:5062/api/vendors/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchVendors();
      else alert('Erro ao excluir: ' + await response.text());
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const handlePayParcel = async (vendorId: number, parcelAmount: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    if (!window.confirm(`Deseja confirmar o pagamento desta parcela no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcelAmount)}?\nO valor será somado automaticamente ao total já pago do fornecedor.`)) return;

    setIsSubmitting(true);
    try {
      const newPaidAmount = (vendor.paidAmount || 0) + parcelAmount;
      const newPaidInstallments = (vendor.paidInstallments || 0) + 1;

      let finalStatus = vendor.status || 'A Consultar';
      const total = vendor.totalAmount || 0;
      if (total > 0 && newPaidAmount >= total) {
        finalStatus = 'Quitado';
      }

      const bodyData = {
        name: vendor.name,
        category: vendor.category || null,
        totalAmount: vendor.totalAmount,
        isPerPerson: vendor.isPerPerson,
        paidAmount: newPaidAmount,
        dueDate: vendor.dueDate || null,
        paymentDate: vendor.paymentDate || null,
        installments: vendor.installments,
        paidInstallments: newPaidInstallments,
        status: finalStatus,
        considerCost: vendor.considerCost ?? true,
        phone: vendor.phone ? vendor.phone.replace(/\D/g, '') : null,
        notes: vendor.notes || null
      };

      const response = await fetch(`http://localhost:5062/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        fetchVendors();
      } else {
        alert('Erro ao registrar pagamento: ' + await response.text());
      }
    } catch (err) {
      alert('Erro de conexão com o servidor ao processar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingFaqId 
        ? `http://localhost:5062/api/faqs/${editingFaqId}`
        : 'http://localhost:5062/api/faqs';
      const method = editingFaqId ? 'PUT' : 'POST';
      const bodyData = { question: faqQuestion, answer: faqAnswer };

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      
      if (response.ok) {
        alert(editingFaqId ? 'FAQ atualizada com sucesso!' : 'FAQ cadastrada com sucesso!');
        setIsFaqModalOpen(false);
        fetchFaqs();
      } else {
        alert('Erro do Servidor: ' + await response.text());
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveFaq = async (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= faqs.length) return;
    
    const newFaqs = [...faqs];
    const temp = newFaqs[index];
    newFaqs[index] = newFaqs[newIndex];
    newFaqs[newIndex] = temp;
    setFaqs(newFaqs); // Atualiza UI instantaneamente

    try {
      await fetch('http://localhost:5062/api/faqs/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newFaqs.map(f => f.id))
      });
    } catch (e) {
      console.error('Erro ao reordenar', e);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pergunta?')) return;
    try {
      const response = await fetch(`http://localhost:5062/api/faqs/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchFaqs();
      else alert('Erro ao excluir: ' + await response.text());
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5062/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
      } else if (response.status === 429) {
        setError('Muitas tentativas falhas. O login foi bloqueado por 5 minutos.');
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
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
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-serif tracking-widest text-lg py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 mt-2 disabled:opacity-50">
              {isSubmitting ? 'Verificando...' : 'Entrar'}
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
          onClick={() => setActiveTab('calendario')}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'calendario' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Calendário de Eventos
        </button>
        <button 
          onClick={() => setActiveTab('financeiro')}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'financeiro' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Dashboard Financeiro
        </button>
        <button 
          onClick={() => setActiveTab('faq')}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'faq' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Gestão de FAQ
        </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => navigate('/')} className="w-full text-left px-4 py-3 text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest text-xs font-bold">
            ← Voltar ao Site
          </button>
        <button onClick={() => { localStorage.removeItem('adminToken'); setToken(null); setIsAuthenticated(false); }} className="w-full text-left px-4 py-3 text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest text-xs font-bold mt-2">
          Sair do Painel
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
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExportToCSV} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl shadow-sm transition-all font-medium">
                  ↓ Exportar CSV
                </button>
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
                    gifts.map((gift) => {
                      const isReserved = gift.reservedUntil ? new Date(gift.reservedUntil.endsWith('Z') ? gift.reservedUntil : gift.reservedUntil + 'Z') > new Date() : false;
                      return (
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
                          ) : isReserved ? (
                            <div className="flex flex-col items-center">
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Aguardando PIX</span>
                              {gift.purchasedBy && <span className="text-[10px] text-slate-400 mt-1 text-center">de {gift.purchasedBy}</span>}
                              <div className="flex gap-2 mt-3">
                                <button disabled={isSubmitting} onClick={() => handleConfirmReservation(gift.id)} className="text-[10px] bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm disabled:opacity-50">Aprovar</button>
                                <button disabled={isSubmitting} onClick={() => handleCancelReservation(gift.id)} className="text-[10px] bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 font-medium transition-colors shadow-sm disabled:opacity-50">Cancelar</button>
                              </div>
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
                    )})
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
                            {vendor.paymentDate && <span className="text-[10px] text-rose-500 font-medium mt-1 uppercase tracking-wider">A Partir de: {new Date(vendor.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR')} {vendor.installments && vendor.installments > 1 ? `(${vendor.paidInstallments || 0}/${vendor.installments} pagas)` : ''}</span>}
                          </div>
                        </td>
                        <td className="p-5 text-center flex flex-col items-center justify-center h-full min-h-[5rem]">
                          {(() => {
                            const s = vendor.status || ((vendor as any).isHired ? 'Contratado' : 'A Consultar');
                            if (s === 'A Consultar') return <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">{s}</span>;
                            if (s === 'Em Orçamento') return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{s}</span>;
                            if (s === 'Aguardando Contrato') return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Aguard. Contrato</span>;
                            if (s === 'Contratado') return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{s}</span>;
                            if (s === 'Quitado') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{s}</span>;
                            return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{s}</span>;
                          })()}
                          {vendor.considerCost === false && (
                            <div className="mt-2"><span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold" title="Não contabilizado no Dashboard">Ignorado</span></div>
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

            {(() => {
              const custoPrevisto = vendors
                .filter(v => v.considerCost ?? true) // Agora considera TODOS que tiverem o toggle ativado, independente do status
                .reduce((acc, v) => acc + (v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0)), 0);

              const custoReal = vendors
                .filter(v => (v.considerCost ?? true) && ['Aguardando Contrato', 'Contratado', 'Quitado'].includes(v.status || ''))
                .reduce((acc, v) => acc + (v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0)), 0);

              const totalPago = vendors
                .filter(v => v.considerCost ?? true)
                .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

              const faltaPagarReal = Math.max(0, custoReal - totalPago);

              return (
                <>
            {/* Resumo em Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Custo Previsto</h3>
                <p className="text-3xl font-serif text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoPrevisto)}
                </p>
                <p className="text-[10px] leading-tight text-slate-400 mt-2">Inclui orçamentos e contratos</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Custo Real</h3>
                <p className="text-3xl font-serif text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoReal)}
                </p>
                <p className="text-[10px] leading-tight text-slate-400 mt-2">Apenas contratos fechados</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Total Pago</h3>
                <p className="text-3xl font-serif text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Falta Pagar (Real)</h3>
                <p className="text-3xl font-serif text-red-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faltaPagarReal)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
                        .filter(v => (v.considerCost ?? true) && v.category && categoriasVariaveis.includes(v.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()))
                        .reduce((acc, v) => acc + (v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0)), 0);
                      return totalConfirmedGuests > 0 ? custoVariavel / totalConfirmedGuests : 0;
                    })()
                  )}
                </p>
                <p className="text-[10px] leading-tight text-slate-400 mt-2">Apenas Buffet, Decoração, Papelaria e Lembrancinhas</p>
              </div>
            </div>
                </>
              );
            })()}

            <h3 className="text-2xl font-serif text-slate-800 mb-6">Balanço por Família</h3>
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
                      .filter(v => (v.considerCost ?? true) && ['Aguardando Contrato', 'Contratado', 'Quitado'].includes(v.status || '') && v.category && categoriasVariaveis.includes(v.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()))
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

        {/* Aba: Gestão de FAQ */}
        {activeTab === 'faq' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-3xl font-serif text-slate-800">Dúvidas Frequentes (FAQ)</h2>
              <button onClick={openCreateFaqModal} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 font-medium">
                + Cadastrar Pergunta
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="p-5 font-semibold w-12 text-center">Ordem</th>
                    <th className="p-5 font-semibold w-1/3">Pergunta</th>
                    <th className="p-5 font-semibold">Resposta</th>
                    <th className="p-5 font-semibold text-right w-32 sticky right-0 bg-slate-50 border-l border-slate-200 z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {faqs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-5 text-center text-slate-500">Nenhuma dúvida cadastrada ainda.</td>
                    </tr>
                  ) : (
                    faqs.map((faq, index) => (
                      <tr key={faq.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-center border-r border-slate-100">
                          <div className="flex flex-col items-center gap-1">
                            <button onClick={() => moveFaq(index, -1)} disabled={index === 0} className="text-slate-400 hover:text-slate-800 disabled:opacity-20" title="Mover para cima">▲</button>
                            <button onClick={() => moveFaq(index, 1)} disabled={index === faqs.length - 1} className="text-slate-400 hover:text-slate-800 disabled:opacity-20" title="Mover para baixo">▼</button>
                          </div>
                        </td>
                        <td className="p-5 text-slate-800 font-medium whitespace-pre-wrap">{faq.question}</td>
                        <td className="p-5 text-slate-500 whitespace-pre-wrap">{faq.answer}</td>
                        <td className="p-5 text-right sticky right-0 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100 z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
                          <button onClick={() => openEditFaqModal(faq)} className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4 transition-colors">Editar</button>
                          <button onClick={() => handleDeleteFaq(faq.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">Excluir</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba: Calendário */}
        {activeTab === 'calendario' && (() => {
          const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          const startDay = startOfMonth.getDay(); // 0 = Dom
          const daysInMonth = endOfMonth.getDate();
          
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const weddingDateStr = '2027-08-21';
          
          const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

          // Expande os eventos baseados em parcelas e aplica a fórmula exata de saldo devedor
          const paymentEvents: { vendorId: number; name: string; date: string; dateObj: Date; title: string; amount: number; isPaid: boolean }[] = [];
          vendors.forEach(v => {
            if (!v.paymentDate) return;
            const parcels = v.installments && v.installments > 0 ? v.installments : 1;
            const paidParcels = v.paidInstallments || 0;
            const [year, month, day] = v.paymentDate.split('-').map(Number);
            
            const totalAmount = v.isPerPerson ? (v.totalAmount || 0) * totalConfirmedGuests : (v.totalAmount || 0);
            const paidAmount = v.paidAmount || 0; 

            // A MÁGICA: Valor da parcela = Saldo devedor / Parcelas que faltam pagar
            const parcelAmount = parcels > paidParcels ? (totalAmount - paidAmount) / (parcels - paidParcels) : 0;

            for (let i = 0; i < parcels; i++) {
              const d = new Date(year, month - 1 + i, day, 12, 0, 0); // Avança os meses usando comportamento nativo do JS
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const title = parcels > 1 ? `💸 ${v.name} (${i + 1}/${parcels})` : `💸 ${v.name}`;

              const isPaid = i < paidParcels;
              paymentEvents.push({ vendorId: v.id, name: v.name, date: dateStr, dateObj: d, title, amount: parcelAmount, isPaid });
            }
          });

          const getEventsForDate = (day: number) => {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents: any[] = [];
            if (dateStr === weddingDateStr) dayEvents.push({ type: 'wedding', title: '💍 O Grande Dia!' });
            
            paymentEvents.filter(e => e.date === dateStr).forEach(e => {
              dayEvents.push({ type: 'payment', title: e.title, isPaid: e.isPaid });
            });
            return dayEvents;
          };

          return (
            <div className="max-w-7xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-serif text-slate-800">Calendário de Eventos</h2>
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="text-slate-400 hover:text-slate-800 transition-colors p-2">&lt;</button>
                  <span className="font-medium text-slate-700 min-w-32 text-center">{capitalizedMonthName}</span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="text-slate-400 hover:text-slate-800 transition-colors p-2">&gt;</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="text-center font-bold text-slate-400 text-xs md:text-sm uppercase tracking-wider">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="p-2 md:p-4" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isToday = dateStr === todayStr;
                      const evts = getEventsForDate(day);
                      return (
                        <div key={day} className={`min-h-24 md:min-h-28 p-2 md:p-3 rounded-xl border transition-all overflow-hidden ${isToday ? 'border-blue-300 bg-blue-50/50 shadow-inner' : 'border-slate-100 bg-slate-50/50'} ${evts.length > 0 ? 'ring-1 ring-slate-200 shadow-sm bg-white' : ''}`}>
                          <div className={`text-xs md:text-sm font-semibold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full mb-1 md:mb-2 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>{day}</div>
                          <div className="space-y-1">
                            {evts.map((e, idx) => (
                              <div key={idx} className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-1 md:py-1.5 rounded-md md:rounded-lg leading-tight shadow-sm truncate ${e.type === 'wedding' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : e.isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 line-through opacity-70' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                {e.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
                  <h3 className="text-lg font-serif text-slate-800 mb-6 border-b border-slate-100 pb-4">Próximos Pagamentos</h3>
                  <div className="space-y-4 flex-1">
                    {paymentEvents
                      .filter(e => !e.isPaid && e.amount > 0)
                      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
                      .slice(0, 5)
                      .map((e, idx) => (
                          <div key={`${e.vendorId}-${idx}`} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col overflow-hidden pr-2">
                              <span className="font-medium text-sm text-slate-700 truncate">{e.title.replace('💸 ', '')}</span>
                              <span className={`text-[11px] mt-1 uppercase tracking-wider font-semibold ${e.dateObj < new Date(new Date().setHours(0,0,0,0)) ? 'text-red-500' : 'text-slate-500'}`}>
                                {e.dateObj.toLocaleDateString('pt-BR')} {e.dateObj < new Date(new Date().setHours(0,0,0,0)) && '(Atrasado)'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-rose-600 whitespace-nowrap">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.amount)}
                              </span>
                              <button 
                                onClick={() => handlePayParcel(e.vendorId, e.amount)}
                                title="Confirmar pagamento"
                                className="w-7 h-7 shrink-0 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-full transition-colors shadow-sm"
                              >✓</button>
                            </div>
                          </div>
                      ))
                    }
                    {paymentEvents.filter(e => !e.isPaid && e.amount > 0).length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">Nenhum pagamento agendado.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
                <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(formatPhoneNumber(e.target.value))} maxLength={15} placeholder="(11) 99999-9999" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Convidados ({guests.length}/6)</label>
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
                {guests.length < 6 && (
                  <button type="button" onClick={handleAddGuest} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-left">+ Adicionar acompanhante</button>
                )}
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
                  <input type="tel" value={vendorPhone} onChange={e => setVendorPhone(formatPhoneNumber(e.target.value))} maxLength={15} placeholder="Ex: (11) 99999-9999" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-truncate">Condições</label>
                  <input type="text" value={vendorDueDate} onChange={e => setVendorDueDate(e.target.value)} placeholder="Ex: Assinatura..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-truncate">1º Vencimento</label>
                  <input type="date" value={vendorPaymentDate} onChange={e => setVendorPaymentDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-truncate">Parcelas (Nº)</label>
                  <input type="number" min="1" value={vendorInstallments} onChange={e => setVendorInstallments(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="Ex: 1" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-truncate">Já Pagas (Nº)</label>
                  <input type="number" min="0" value={vendorPaidInstallments} onChange={e => setVendorPaidInstallments(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="Ex: 0" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Anotações adicionais</label>
                <textarea rows={2} value={vendorNotes} onChange={e => setVendorNotes(e.target.value)} placeholder="Detalhes do contrato, pendências..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={vendorStatus} onChange={e => setVendorStatus(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white">
                    <option value="A Consultar">A Consultar</option>
                    <option value="Em Orçamento">Em Orçamento</option>
                    <option value="Aguardando Contrato">Aguardando Contrato</option>
                    <option value="Contratado">Contratado</option>
                    <option value="Quitado">Quitado</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="considerCost" checked={vendorConsiderCost} onChange={e => setVendorConsiderCost(e.target.checked)} className="w-5 h-5 rounded-md border-slate-300 text-slate-800 focus:ring-slate-800" />
                    <label htmlFor="considerCost" className="text-sm font-medium text-slate-700 cursor-pointer leading-tight">Considerar custo nos cálculos do Dashboard?</label>
                  </div>
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

      {/* Modal de Cadastro de FAQ */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-slate-800">{editingFaqId ? 'Editar Pergunta' : 'Nova Pergunta'}</h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pergunta</label>
                <input type="text" required value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} placeholder="Ex: Qual o traje do casamento?" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resposta</label>
                <textarea rows={4} required value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} placeholder="Ex: Esporte Fino..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsFaqModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar Pergunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
