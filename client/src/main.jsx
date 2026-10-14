import { createRoot } from 'react-dom/client'; import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; import AppRouter from './routes/AppRouter.jsx'; import './styles/index.css';
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><AppRouter /></AuthProvider></BrowserRouter>);
