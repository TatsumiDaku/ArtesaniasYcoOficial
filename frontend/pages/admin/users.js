import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchUsers();
    // eslint-disable-next-line
  }, [isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <div className="text-center py-12">Acceso denegado. Solo administradores pueden ver esta página.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Gestión de Usuarios</h1>
      {loading ? (
        <div className="text-center py-12">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay usuarios registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Rol</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">{user.role}</span>
                  </td>
                  <td className="px-4 py-2">
                    {/* Aquí puedes agregar acciones como editar/eliminar */}
                    <button className="text-red-600 hover:underline text-sm" disabled>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 