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
  const [paymentType, setPaymentType] = useState<'pix' | 'credit_1x' | 'credit_installments'>('pix');
  const [installments, setInstallments] = useState<number>(2);
  const [isCustomGift, setIsCustomGift] = useState(false);
  const [customGiftValue, setCustomGiftValue] = useState<number | ''>('');

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
    setIsCustomGift(false);
    setBuyerPhone('');
    setPaymentType('pix');
    setInstallments(2);
    setIsPixModalOpen(true);
  };

  const handleSelectCustomGift = () => {
    setSelectedGift({
      id: 0,
      title: 'Presente Personalizado',
      description: 'Valor escolhido livremente',
      price: 0,
      imageUrl: null,
      isPurchased: false
    });
    setIsCustomGift(true);
    setCustomGiftValue('');
    setBuyerPhone('');
    setPaymentType('pix');
    setInstallments(2);
    setIsPixModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedGift) return;
    
    const cleanPhone = buyerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Por favor, informe seu telefone com DDD.');
      return;
    }

    if (isCustomGift) {
      alert('Obrigado pela sua contribuição! Como é um valor personalizado, não precisamos reservá-lo no sistema. Você já pode fechar esta janela. ❤️');
      setIsPixModalOpen(false);
      setSelectedGift(null);
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

  const currentPrice = isCustomGift ? (Number(customGiftValue) || 0) : (selectedGift?.price || 0);

  const pixCode = selectedGift && currentPrice > 0 ? generatePix(currentPrice, selectedGift.title) : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixCode);
    alert('Código PIX copiado para a área de transferência!');
  };

  const getCreditRate = () => {
    if (paymentType === 'credit_1x') return 4.98;
    if (paymentType === 'credit_installments') {
      const rates: Record<number, number> = { 2: 9.57, 3: 10.95, 4: 12.31, 5: 13.64, 6: 14.94 };
      return rates[installments] || 9.57;
    }
    return 0;
  };
  const netAmount = currentPrice * (1 - getCreditRate() / 100);

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
            
            {/* Card de Presente Personalizado (Valor Livre) */}
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-56 bg-stone-200 relative flex items-center justify-center p-8 text-center flex-col">
                 <span className="text-5xl mb-4">💡</span>
                 <span className="text-stone-600 font-medium">Surpreenda os noivos!</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif text-stone-800 mb-2">Outra coisa em mente?</h3>
                <p className="text-stone-500 text-sm mb-4 line-clamp-2">Escolha o valor livre que desejar para contribuir com a nossa lua de mel ou nova casa.</p>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-lg font-medium text-stone-400 italic">
                    Valor livre
                  </span>
                  <button 
                    onClick={handleSelectCustomGift}
                    className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Presentear
                  </button>
                </div>
              </div>
            </div>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsPixModalOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-stone-800 mb-1">Presentear</h3>
              <p className="text-stone-500">{selectedGift.title}</p>
              {isCustomGift ? (
                <div className="mt-6 mb-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Valor do Presente (R$)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customGiftValue}
                    onChange={(e) => setCustomGiftValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex: 150.00"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20 transition-all text-stone-800 text-center text-2xl font-medium shadow-inner bg-stone-50"
                    required
                  />
                </div>
              ) : (
                <div className="text-3xl font-medium text-green-800 mt-4">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedGift.price)}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Seu Telefone (WhatsApp com DDD)</label>
              <input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(formatPhoneNumber(e.target.value))} maxLength={15} placeholder="(11) 99999-9999" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all text-stone-700" required />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Forma de Pagamento</label>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={() => setPaymentType('pix')} className={`border p-4 rounded-xl text-left transition-all ${paymentType === 'pix' ? 'border-green-800 bg-green-50 ring-1 ring-green-800' : 'border-stone-200 hover:bg-stone-50'}`}>
                   <div className="font-semibold text-stone-800">Pix (Sem taxa)</div>
                   <div className="text-xs text-stone-500 mt-1">O valor integral do presente vai para os noivos</div>
                </button>
                <button type="button" onClick={() => setPaymentType('credit_1x')} className={`border p-4 rounded-xl text-left transition-all ${paymentType === 'credit_1x' ? 'border-green-800 bg-green-50 ring-1 ring-green-800' : 'border-stone-200 hover:bg-stone-50'}`}>
                   <div className="font-semibold text-stone-800">Cartão de Crédito à Vista</div>
                   <div className="text-xs text-stone-500 mt-1">Taxa do Mercado Pago deduzida do valor do presente</div>
                </button>
                <button type="button" onClick={() => setPaymentType('credit_installments')} className={`border p-4 rounded-xl text-left transition-all ${paymentType === 'credit_installments' ? 'border-green-800 bg-green-50 ring-1 ring-green-800' : 'border-stone-200 hover:bg-stone-50'}`}>
                   <div className="font-semibold text-stone-800">Cartão de Crédito Parcelado</div>
                   <div className="text-xs text-stone-500 mt-1">Até 6x. Taxa do Mercado Pago deduzida do valor do presente</div>
                </button>
              </div>
            </div>

            {paymentType === 'credit_installments' && (
              <div className="mb-6 animate-fade-in">
                 <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Número de Parcelas</label>
                 <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all text-stone-700 bg-white">
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                    <option value={4}>4x</option>
                    <option value={5}>5x</option>
                    <option value={6}>6x</option>
                 </select>
              </div>
            )}

            {paymentType !== 'pix' && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl mb-6 border border-amber-200 text-sm animate-fade-in">
                 Ao pagar no crédito, o Mercado Pago cobra uma taxa de processamento. Dos <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice)}</strong> do presente, os noivos receberão <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netAmount)}</strong>.
              </div>
            )}

            {paymentType === 'pix' ? (
              <div className="bg-stone-50 p-4 rounded-2xl mb-6 border border-stone-100 animate-fade-in">
                <p className="text-xs text-stone-500 mb-2 uppercase tracking-widest font-semibold">Código Pix (Copia e Cola)</p>
                <div className="flex gap-2">
                  <input type="text" readOnly value={pixCode} placeholder={isCustomGift && currentPrice <= 0 ? "Digite o valor acima para gerar..." : ""} className="w-full bg-white text-stone-600 text-sm px-3 py-2 rounded-lg border border-stone-200 outline-none" />
                  <button onClick={copyToClipboard} disabled={!pixCode} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Copiar</button>
                </div>
              </div>
            ) : isCustomGift ? (
              <div className="bg-stone-50 p-4 rounded-2xl mb-6 border border-stone-100 flex flex-col items-center text-center animate-fade-in">
                <p className="text-sm text-stone-600 mb-4">Para presentes de valor livre no cartão de crédito, por favor, nos chame no WhatsApp para gerar um link de pagamento seguro e na hora para você.</p>
                <a href={`https://wa.me/5511947462080?text=${encodeURIComponent(`Olá, gostaria de presentear os noivos com um valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice)} ${paymentType === 'credit_installments' ? `em ${installments}x` : 'à vista'} no cartão.`)}`} target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl text-sm font-bold tracking-wide transition-colors mb-3 w-full shadow-md flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23-10.11,15.16a8,8,0,0,0-.4,8.19,56.63,56.63,0,0,0,22.41,22.41,8,8,0,0,0,8.19-.4l15.16-10.11,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-1.08L44,214l10.89-33.35a8,8,0,0,0-1.08-6.54A88,88,0,1,1,128,216Z"></path></svg> Falar no WhatsApp
                </a>
              </div>
            ) : (
              <div className="bg-stone-50 p-4 rounded-2xl mb-6 border border-stone-100 flex flex-col items-center text-center animate-fade-in">
                <p className="text-sm text-stone-600 mb-4">Clique no botão abaixo para abrir a página de pagamento segura do Mercado Pago.</p>
                <a href="#" target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl text-sm font-bold tracking-wide transition-colors mb-3 w-full shadow-md">
                  Pagar com Mercado Pago 🔗
                </a>
                <p className="text-xs text-stone-500">Após realizar o pagamento na nova aba, volte aqui e clique no botão verde abaixo para confirmar seu presente!</p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={handlePaymentConfirm} 
                disabled={isProcessing || (isCustomGift && currentPrice <= 0)}
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