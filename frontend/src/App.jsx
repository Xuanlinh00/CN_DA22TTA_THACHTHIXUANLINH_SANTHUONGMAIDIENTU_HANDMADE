import { Routes, Route } from 'react-router-dom';
import Navbar from './components/jsx/Navbar';
import Footer from './components/jsx/Footer';
import Login from './pages/jsx/Login';
import Register from './pages/jsx/Register';
import ProductList from './pages/jsx/ProductList';
import ProductDetail from './pages/jsx/ProductDetail';
import Revenue from './pages/jsx/Revenue';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/revenue" element={<Revenue userRole="admin" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
