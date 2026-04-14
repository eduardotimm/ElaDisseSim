import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Gift {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isPurchased: boolean;
  reservedUntil?: string | null;
}

// Função utilitária para gerar o código PIX Copia e Cola válido (Padrão EMV / BR Code)
const generatePix = (amount: number, description: string) => {
  const pixKey = "+5511947462080"; // A chave telefone exige o +55 no padrão BR Code
  const merchantName = "Anna e Eduardo";
  const merchantCity = "SAO PAULO";
  
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // Limpa e abrevia a descrição (máx 20 caracteres, sem espaços/especiais para não dar erro em alguns bancos)
  const cleanDesc = description.replace(/[^A-Za-z0-9]/g, '').substring(0, 20).toUpperCase() || 'PRESENTE';
  const payloadKey = formatField('00', 'br.gov.bcb.pix') + formatField('01', pixKey);
  
  const payload = [
    formatField('00', '01'),
    formatField('26', payloadKey),
    formatField('52', '0000'),
    formatField('53', '986'),
    amount > 0 ? formatField('54', amount.toFixed(2)) : '',
    formatField('58', 'BR'),
    formatField('59', merchantName),
    formatField('60', merchantCity),
    formatField('62', formatField('05', cleanDesc))
  ].join('') + '6304'; // 6304 é o ID e Tamanho do CRC16 que vem a seguir

  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
    }
  }
  
  return payload + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

export default function Presentes() {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleSelectGift = (gift: Gift) => {
    setSelectedGift(gift);
    setBuyerPhone('');
    setIsPixModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedGift) return;
    
    const cleanPhone = buyerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Por favor, informe seu telefone com DDD.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`http://localhost:5062/api/gifts/${selectedGift.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone })
      });

      if (response.ok) {
        alert('Reserva realizada com sucesso! Seu presente ficará reservado por 12 horas aguardando a confirmação do PIX. Muito obrigado pelo presente! ❤️');
        setIsPixModalOpen(false);
        setSelectedGift(null);
        fetchGifts(); // Atualiza a lista na tela para riscar o que acabou de ser comprado
      } else {
        const err = await response.text();
        alert('Erro ao confirmar pagamento: ' + err.replace(/["']/g, ''));
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Gera o código PIX (Copia e Cola) real dinamicamente
  const pixCode = selectedGift ? generatePix(selectedGift.price, selectedGift.title) : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixCode);
    alert('Código PIX copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4 font-sans">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-green-900 mb-4">Lista de Presentes</h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto font-light">
            O maior presente é a presença de vocês neste dia tão especial! Mas, se desejarem nos presentear, criamos esta lista com muito carinho.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-stone-500">Carregando lista de presentes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gifts.map((gift) => {
              // Força o horário a ser UTC anexando o 'Z' para evitar erro de fuso horário no frontend
              const isReserved = gift.reservedUntil ? new Date(gift.reservedUntil.endsWith('Z') ? gift.reservedUntil : gift.reservedUntil + 'Z') > new Date() : false;
              const isUnavailable = gift.isPurchased || isReserved;

              return (
              <div 
                key={gift.id} 
                className={`bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm transition-all duration-300 ${isUnavailable ? 'opacity-50 grayscale' : 'hover:shadow-xl hover:-translate-y-1'}`}
              >
                <div className="h-56 bg-stone-200 relative">
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-light">Sem imagem</div>
                  )}
                  {gift.isPurchased ? (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-stone-800 text-white px-6 py-2 rounded-full font-medium tracking-widest text-sm uppercase shadow-lg transform -rotate-12">Comprado</span>
                    </div>
                  ) : isReserved ? (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-amber-500 text-white px-6 py-2 rounded-full font-medium tracking-widest text-sm uppercase shadow-lg transform -rotate-12">Reservado</span>
                    </div>
                  ) : null}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif text-stone-800 mb-2">{gift.title}</h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-2">{gift.description}</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-2xl font-medium text-green-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.price)}
                    </span>
                    <button 
                      onClick={() => handleSelectGift(gift)}
                      disabled={isUnavailable}
                      className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
                    >
                      {gift.isPurchased ? 'Indisponível' : isReserved ? 'Aguardando Pagto' : 'Presentear'}
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        <div className="text-center mt-16">
          <button onClick={() => navigate('/')} className="text-sm text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest">
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* Modal de Pagamento PIX */}
      {isPixModalOpen && selectedGift && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setIsPixModalOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-stone-800 mb-1">Presentear</h3>
              <p className="text-stone-500">{selectedGift.title}</p>
              <div className="text-3xl font-medium text-green-800 mt-4">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedGift.price)}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Seu Telefone (WhatsApp com DDD)</label>
              <input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(formatPhoneNumber(e.target.value))} maxLength={15} placeholder="(11) 99999-9999" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all text-stone-700" required />
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl mb-6 border border-stone-100">
              <p className="text-xs text-stone-500 mb-2 uppercase tracking-widest font-semibold">Código Pix (Copia e Cola)</p>
              <div className="flex gap-2">
                <input type="text" readOnly value={pixCode} className="w-full bg-white text-stone-600 text-sm px-3 py-2 rounded-lg border border-stone-200 outline-none" />
                <button onClick={copyToClipboard} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Copiar</button>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handlePaymentConfirm} 
                disabled={isProcessing}
                className="w-full bg-green-800 hover:bg-green-900 text-white py-4 rounded-xl font-medium text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processando...' : 'Já realizei o pagamento!'}
              </button>
              <button 
                onClick={() => setIsPixModalOpen(false)} 
                className="w-full bg-transparent hover:bg-stone-50 text-stone-500 py-3 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}