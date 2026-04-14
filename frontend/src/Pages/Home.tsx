import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<{ id: number; question: string; answer: string }[]>([]);

  useEffect(() => {
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
    fetchFaqs();
  }, []);

  const calculateTimeLeft = () => {
    // Coloque a data do seu casamento aqui (Ano-Mês-DiaTHora:Minuto:Segundo)
    const weddingDate = new Date('2027-08-21T16:00:00'); 
    const difference = weddingDate.getTime() - new Date().getTime();

    if (difference > 0) {
      return {
        Dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        Horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        Minutos: Math.floor((difference / 1000 / 60) % 60),
        Segundos: Math.floor((difference / 1000) % 60),
      };
    }
    return { Dias: 0, Horas: 0, Minutos: 0, Segundos: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory bg-gradient-to-br from-stone-50 via-white to-stone-200 font-sans text-gray-800 relative scroll-smooth">
      {/* Contêiner Principal de Scroll Snap */}
      
      {/* Header Sutil (Fixo no topo) */}
      <header className="fixed top-0 left-0 w-full py-4 px-8 md:px-16 flex justify-between items-center bg-white/40 backdrop-blur-md z-50 border-b border-white/20">
        <div className="text-xl md:text-2xl font-serif text-green-900 tracking-widest">A & E</div>
        <nav className="hidden md:flex gap-8 text-xs md:text-sm tracking-[0.2em] text-stone-500 uppercase font-semibold">
          <a href="#historia" className="hover:text-green-800 transition-colors">História</a>
          <a href="#local" className="hover:text-green-800 transition-colors">Local</a>
          <button onClick={() => navigate('/presentes')} className="hover:text-green-800 transition-colors uppercase">Lista de Presentes</button>
        </nav>
      </header>

      {/* SEÇÃO 1: Hero (Save the Date) */}
      <section id="inicio" className="min-h-screen w-full snap-start flex flex-col md:flex-row items-center justify-between p-8 md:p-24 pt-24">
        <div className="w-full md:w-1/2 text-center md:text-left mb-16 md:mb-0">
          <h2 className="text-xs md:text-sm tracking-[0.4em] text-gray-400 uppercase mb-4">Save the Date</h2>
          <h1 className="text-6xl md:text-8xl font-serif text-green-900 mb-6 pb-2 leading-tight">
            Anna &<br />Eduardo
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-light tracking-wider">
            21 de Agosto de 2027
          </p>
        </div>

        <div className="w-full md:w-1/2 flex flex-wrap justify-center gap-6 md:gap-10">
          {Object.entries(timeLeft).map(([interval, value]) => (
            <div key={interval} className="flex flex-col items-center">
              <span className="text-6xl md:text-8xl font-serif bg-gradient-to-b from-gray-600 to-gray-300 bg-clip-text text-transparent mb-2">
                {value.toString().padStart(2, '0')}
              </span>
              <span className="text-xs md:text-sm tracking-[0.2em] text-gray-400 uppercase">{interval}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 2: Nossa História */}
      <section id="historia" className="min-h-screen w-full snap-start flex flex-col items-center justify-center p-8 md:p-24 pt-24 bg-white/30">
        <div className="w-full text-center max-w-7xl">
          <h3 className="text-sm tracking-[0.3em] text-gray-400 uppercase mb-8">Nossa História</h3>
          
          {/* Carrossel de Fotos */}
          <div className="flex gap-6 md:gap-8 overflow-x-auto pb-8 snap-x snap-mandatory px-4 md:px-0 mb-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#14532d transparent' }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex flex-col items-center snap-center shrink-0">
                <img 
                  src={`https://picsum.photos/seed/${item * 15}/300/400`}
                  alt={`Nossa foto ${item}`}
                  className="w-56 md:w-72 h-80 md:h-[26rem] object-cover rounded-2xl shadow-lg hover:opacity-95 transition-opacity mb-4"
                />
                <p className="text-sm md:text-base text-stone-500 font-light italic">
                  Legenda da foto {item}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 md:p-10 rounded-3xl shadow-sm border border-white/50 max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-stone-600 font-light leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
            </p>
            <p className="text-base md:text-lg text-stone-600 font-light leading-relaxed">
              Nunc ut sem vitae risus tristique posuere. Praesent et nisl in neque condimentum scelerisque.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: Local e Confirmação */}
      <section id="local" className="min-h-screen w-full snap-start flex flex-col items-center justify-center p-8 md:p-24 pt-24 relative">
        <div className="max-w-5xl w-full flex flex-col items-center">
          <h3 className="text-sm tracking-[0.3em] text-gray-400 uppercase mb-8">Onde Vamos Celebrar</h3>
          
          {/* Mapa do Google (Iframe) */}
          <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg border border-stone-200 mb-12 bg-stone-200">
            <iframe 
              src="https://maps.google.com/maps?q=Av.%20Dr.%20Epit%C3%A1cio%20Pessoa%2C%20100%20-%20Boqueir%C3%A3o%2C%20Santos%20-%20SP%2C%2011045-300&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Local do Casamento"
            ></iframe>
          </div>

          {/* Botão Sou Convidado */}
          <button onClick={() => navigate('/rsvp')} className="bg-green-800 hover:bg-green-900 text-white font-serif tracking-widest text-lg md:text-xl py-4 px-12 rounded-full shadow-xl hover:shadow-green-900/30 transition-all transform hover:-translate-y-1 mb-16">
            Sou Convidado
          </button>

          {/* Dúvidas Frequentes (FAQ) */}
          <div className="w-full max-w-3xl text-left mb-12">
            <h3 className="text-sm tracking-[0.3em] text-gray-400 uppercase mb-6 text-center">Dúvidas Frequentes</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                  >
                    <span className="font-medium text-stone-700">{faq.question}</span>
                    <span className="text-green-800 font-bold text-xl leading-none">{openFaq === index ? '-' : '+'}</span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-stone-600 font-light text-sm md:text-base">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Acesso Admin movido para a última seção */}
        <footer className="absolute bottom-6 w-full flex justify-center">
          <button onClick={() => navigate('/admin')} className="text-stone-300 hover:text-stone-400 transition-colors" title="Painel Administrativo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" viewBox="0 0 256 256">
              <path d="M147.31,90.62l-83.6,83.59a24.08,24.08,0,0,0,0,34.06,24.23,24.23,0,0,0,34.12,0l83.58-83.6Z"></path>
              <path d="M185.34,104.57l35.15-35.16a16.08,16.08,0,0,0-1.85-24.16L185.25,23.3a16,16,0,0,0-24.12,1.88L126,60.33a40.08,40.08,0,0,0,2.15,58.37A40.16,40.16,0,0,0,185.34,104.57Z"></path>
            </svg>
          </button>
        </footer>
      </section>
    </div>
  );
}