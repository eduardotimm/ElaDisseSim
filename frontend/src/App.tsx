import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Rsvp from './Pages/Rsvp';
import RsvpConfirm from './Pages/RsvpConfirm';
import Presentes from './Pages/Presentes';
import Admin from './Pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/rsvp/confirmar" element={<RsvpConfirm />} />
        <Route path="/presentes" element={<Presentes />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
