import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import './index.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('https://tmbill-backend-8tfv.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.log(err);
      setError('Something went wrong');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Login/Signup</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-xs text-red-500 mt-2 text-center">
          Note: Backend is hosted on a free tier, so it might take 50+ seconds to respond.
        </p>
      </form>
    </div>
  );
};

const Home = () => {
  const [todos, setTodos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://tmbill-backend-8tfv.onrender.com/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTodos(data['data']);
      } else {
        setTodos([]);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addOrUpdateTodo = async () => {
    if (!title || !description) return;
    setIsSaving(true);
    const token = localStorage.getItem('token');
    const url = editId
      ? `https://tmbill-backend-8tfv.onrender.com/api/tasks/${editId}`
      : 'https://tmbill-backend-8tfv.onrender.com/api/tasks';
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { title, description, is_completed: isCompleted } : { title, description };
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchTodos();
        setTitle('');
        setDesc('');
        setIsCompleted(false);
        setEditId(null);
        setShowDialog(false);
      }
    } catch (err) {
      console.error('Failed to save task:', err);
    }
    setIsSaving(false);
  };

  const deleteTodo = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://tmbill-backend-8tfv.onrender.com/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) fetchTodos();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleEdit = (todo) => {
    setTitle(todo.title);
    setDesc(todo.description);
    setIsCompleted(todo.is_completed);
    setEditId(todo.id);
    setShowDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-green-700">Welcome</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDialog(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-green-700 animate-pulse">Loading todos...</div>
      ) : todos.length === 0 ? (
        <div className="text-red-500">No todo found</div>
      ) : (
        todos.map((todo, index) => (
          <div
            key={index}
            className="bg-white p-4 mb-3 shadow rounded border-l-4 border-green-600"
          >
            <h3 className="text-lg font-semibold text-green-800">{todo.title}</h3>
            <p className="text-gray-600 mb-2">{todo.description}</p>
            <p className="text-sm text-gray-500 mb-2">Completed: {todo.is_completed ? 'Yes' : 'No'}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(todo)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">{editId ? 'Update Todo' : 'Add Todo'}</h2>
              <button onClick={() => {
                setShowDialog(false);
                setEditId(null);
                setTitle('');
                setDesc('');
                setIsCompleted(false);
              }} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            {editId && (
              <div className="mb-4">
                <label className="block mb-1 text-gray-700 font-medium">Is Completed</label>
                <select
                  value={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.value === 'true')}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="false">False</option>
                  <option value="true">True</option>
                </select>
              </div>
            )}
            <button
              onClick={addOrUpdateTodo}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

const AppWrapper = () => {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-700 font-bold text-xl animate-pulse">Loading...</div>
      </div>
    );

  return (
    <Router>
      <Routes>
        <Route path="/" element={!hasToken ? <Login /> : <Navigate to="/home" />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default AppWrapper;
