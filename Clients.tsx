import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, LogOut, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientsData);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'clients'), formData);
        toast.success('Cliente cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchClients();
      setFormData({ nome: '', email: '', telefone: '', endereco: '' });
      setEditingClient(null);
    } catch (error) {
      toast.error(editingClient ? 'Erro ao atualizar cliente' : 'Erro ao cadastrar cliente');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nome: client.nome,
      email: client.email,
      telefone: client.telefone,
      endereco: client.endereco
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteDoc(doc(db, 'clients', id));
        toast.success('Cliente excluído com sucesso!');
        fetchClients();
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefone.includes(searchTerm) ||
    client.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="glass-effect shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-primary-500" />
              <h1 className="text-xl font-semibold text-gray-800">
                Gerenciamento de Clientes
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-style pl-10 w-full"
            />
          </div>
          <button
            onClick={() => {
              setEditingClient(null);
              setFormData({ nome: '', email: '', telefone: '', endereco: '' });
              setIsModalOpen(true);
            }}
            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="glass-effect rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 break-words max-w-[80%]">{client.nome}</h3>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start text-gray-600">
                    <Mail className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm break-words">{client.email}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <Phone className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm break-words">{client.telefone}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm break-words">{client.endereco}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom glass-effect rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit} className="animate-fade-in">
                <div className="px-6 pt-6 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">
                    {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        required
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        required
                        className="input-style"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 bg-opacity-70 px-6 py-4 flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-200"
                  >
                    {editingClient ? 'Atualizar' : 'Cadastrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex justify-center px-6 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}