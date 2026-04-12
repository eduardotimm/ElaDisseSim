import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Guest {
  id: number;
  name: string;
  isConfirmed: boolean | null;
}

interface Family {
  id: number;
  name: string;
  guests: Guest[];
}

export default function RsvpConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const family: Family | undefined = location.state?.family;

  const [guests, setGuests] = useState<Guest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!family) {
      navigate('/rsvp');
    } else {
      setGuests(family.guests || []);
    }
  }, [family, navigate]);

  const handlePresenceChange = (id: number, status: boolean | null) => {
    setGuests(guests.map(g => g.id === id ? { ...g, isConfirmed: status } : g));
  };

  const handleConfirm = async () => {
    if (!family) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5062/api/families/${family.id}/rsvp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: guests.map(g => ({ id: g.id, isConfirmed: g.isConfirmed })) })
      });

      if (response.ok) {
        alert('Presença confirmada com sucesso!');
        navigate('/presentes');
      } else {
        alert('Erro ao confirmar presença.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!family) return null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-16 px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full border border-stone-100">
        <h2 className="text-3xl font-serif text-green-900 mb-2 text-center">{family.name}</h2>
        <p className="text-stone-500 mb-10 font-light text-center">Confirme abaixo a presença de cada convidado do seu núcleo.</p>
        
        <div className="space-y-4 mb-10">
          {guests.map((guest) => (
            <div key={guest.id} className="flex flex-col gap-3 p-4 rounded-xl border border-stone-100 bg-stone-50/50">
              <span className="text-lg text-stone-700 font-medium text-center">{guest.name}</span>
              
              <div className="flex bg-stone-200/70 rounded-lg p-1 gap-1">
                <button
                  onClick={() => handlePresenceChange(guest.id, false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${guest.isConfirmed === false ? 'bg-red-500 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-200'}`}
                >
                  Não vai
                </button>
                <button
                  onClick={() => handlePresenceChange(guest.id, null)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${guest.isConfirmed === null ? 'bg-stone-400 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-200'}`}
                >
                  Pendente
                </button>
                <button
                  onClick={() => handlePresenceChange(guest.id, true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${guest.isConfirmed === true ? 'bg-green-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-200'}`}
                >
                  Vai
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleConfirm} disabled={isSubmitting} className="w-full bg-green-800 hover:bg-green-900 text-white font-serif tracking-widest text-lg py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50">
          {isSubmitting ? 'Salvando...' : 'Confirmar e Ver Presentes'}
        </button>
      </div>
    </div>
  );
}