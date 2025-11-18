// Import các thư viện và component
import Header from './components/Header.jsx';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx'; 

function App() {
  return (
    <div>
      {}
      <Header />

      {/* Đây là phần // ... (trước) */}
      <main>
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={<h2>Đây là Trang Chủ</h2>} />

          {/* THÊM ROUTE MỚI CHO TRANG ĐĂNG NHẬP */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* (Chúng ta sẽ thêm các trang Đăng ký, Sản phẩm... vào đây sau) */}
        </Routes>
      </main>
      {/* Đây là phần // ... (sau) */}
      
      {/* (Chúng ta có thể thêm Footer vào đây sau) */}
    </div>
  );
}

export default App;