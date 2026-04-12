import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Rsvp() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5062/api/families/by-phone/${encodeURIComponent(phone)}`);
      
      if (response.ok) {
        const family = await response.json();
        navigate('/rsvp/confirmar', { state: { family } });
      } else {
        setError('Convite não encontrado. Verifique o número digitado.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-stone-100">
        <h2 className="text-3xl font-serif text-green-900 mb-2">Acesse seu Convite</h2>
        <p className="text-stone-500 mb-8 font-light">Digite seu número de WhatsApp para confirmar sua presença.</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="tel" 
            placeholder="(11) 99999-9999" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all text-center text-lg text-gray-700 tracking-wider"
            required
          />
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full bg-green-800 hover:bg-green-900 text-white font-serif tracking-widest text-lg py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 mt-2 disabled:opacity-50">
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        
        <button onClick={() => navigate('/')} className="mt-8 text-sm text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest">Voltar</button>
      </div>
    </div>
  );
}