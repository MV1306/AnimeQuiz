import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Quiz from './pages/Quiz';
import FinalResult from './pages/FinalResult';
import Footer from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quiz/:participantId" element={<Quiz />} />
            <Route path="/result/:participantId" element={<FinalResult />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
