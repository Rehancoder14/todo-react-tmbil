import React, { useState, useEffect } from 'react';
import {
  HashRouter as Router, // ✅ Fix for 404 on refresh
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import './index.css';

// ✅ Login Component
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
    const res = await fetch('https://tmbill-backend-8tfv.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      navigate('/home');
    } else {
      // Show custom message if token is missing even when res.ok
      setError(data.message || 'Invalid credentials');
    }
  } catch (err) {
    console.error('Login failed:', err);
    setError('Something went wrong. Please try again.');
  }
  setIsLoading(false);
};

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Login/Signup</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
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
          Note: Backend may take ~50s to wake up.
        </p>
      </form>
    </div>
  );
};

// ✅ Home Component
const Home = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://tmbill-backend-8tfv.onrender.com/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTodos(data.data || []);
      } else {
        setTodos([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setTodos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddOrUpdate = async () => {
    const token = localStorage.getItem('token');
    const payload = {
      title,
      description,
      ...(isEditing ? { is_completed: isCompleted } : {}),
    };

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `https://tmbill-backend-8tfv.onrender.com/api/tasks/${editId}`
      : 'https://tmbill-backend-8tfv.onrender.com/api/tasks';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setIsCompleted(false);
        setIsEditing(false);
        setShowDialog(false);
        await fetchTodos();
      }
    } catch (err) {
      console.error('Failed to submit task:', err);
    }
  };

  const handleEdit = (todo) => {
    setTitle(todo.title);
    setDescription(todo.description);
    setIsCompleted(todo.is_completed || false);
    setEditId(todo.id);
    setIsEditing(true);
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://tmbill-backend-8tfv.onrender.com/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchTodos();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // ✅ hard reload to root
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-6 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-green-700">Welcome!</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTitle('');
              setDescription('');
              setIsCompleted(false);
              setIsEditing(false);
              setShowDialog(true);
            }}
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
        <p className="text-green-600 text-center animate-pulse">Loading todos...</p>
      ) : todos.length === 0 ? (
        <p className="text-center text-red-500">No todos found</p>
      ) : (
        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white p-4 shadow rounded border-l-4 border-green-600"
            >
              <h3 className="text-lg font-semibold text-green-800">{todo.title}</h3>
              <p className="text-gray-600">{todo.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Completed: {todo.is_completed ? '✅' : '❌'}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(todo)}
                  className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center px-4 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">
                {isEditing ? 'Update Todo' : 'Add Todo'}
              </h2>
              <button onClick={() => setShowDialog(false)} className="text-gray-500 hover:text-gray-800">
                &times;
              </button>
            </div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            {isEditing && (
              <select
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                value={isCompleted}
                onChange={(e) => setIsCompleted(e.target.value === 'true')}
              >
                <option value="false">Not Completed</option>
                <option value="true">Completed</option>
              </select>
            )}
            <button
              onClick={handleAddOrUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              {isEditing ? 'Update' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// ✅ App Wrapper
const AppWrapper = () => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-green-600 text-xl font-bold animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/home" /> : <Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppWrapper;
