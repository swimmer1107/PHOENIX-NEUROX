import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import RiskAnalyzer from './pages/RiskAnalyzer';
import MigrationGuide from './pages/MigrationGuide';
import { Toaster } from 'react-hot-toast';

// New AI Assistant System
import { AIAssistantProvider, useAIAssistant } from "./hooks/useAIAssistant.jsx";
import AIAssistantDrawer from "./components/AIAssistantDrawer";
import FloatingChatBubble from "./components/FloatingChatBubble";

function AppContent() {
  const { isOpen, closeAssistant } = useAIAssistant();
  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-background relative">
      <Navbar />
      <main className="relative z-10 w-full overflow-hidden">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/risk-analyzer" element={<RiskAnalyzer />} />
          <Route path="/migration-guide" element={<MigrationGuide />} />
        </Routes>
      </main>
      
      {/* AI Assistant Components */}
      <AIAssistantDrawer isOpen={isOpen} onClose={closeAssistant} />
      <FloatingChatBubble />

      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f1117',
            color: '#fff',
            borderLeft: '4px solid #00ff88',
            zIndex: 9999,
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          },
          success: {
            style: {
              borderLeft: '4px solid #00ff88',
            },
            iconTheme: {
              primary: '#00ff88',
              secondary: '#0f1117',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #ff4444',
            },
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AIAssistantProvider>
      <Router>
        <AppContent />
      </Router>
    </AIAssistantProvider>
  );
}
