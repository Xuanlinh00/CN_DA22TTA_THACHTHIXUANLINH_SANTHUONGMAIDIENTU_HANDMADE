import { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập</h1>
      <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-3">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
        />
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={e => setForm(s => ({ ...s, password: e.target.value }))}
        />
        <button className="w-full bg-primary text-white rounded px-4 py-2">Đăng nhập</button>
      </form>
    </div>
  );
}
