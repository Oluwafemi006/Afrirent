import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Upload, Shield, Loader2, Save, Camera } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { updateUser, verifyIdentity, getUserStats } from '../../services/api';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, updateUser: updateStoreUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    phone_number: user?.profile?.phone_number || '',
    address: user?.profile?.address || '',
    dob: user?.profile?.dob || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user?.id) {
      getUserStats(user.id).then(res => setStats(res.data)).catch(console.error);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData };
      if (avatarFile) data.avatar = avatarFile;
      
      const response = await updateUser(user.id, data);
      updateStoreUser(response.data);
      toast.success('Profil mis à jour avec succès !');
      setEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      await verifyIdentity(file);
      toast.success('Document envoyé ! Vérification en cours.');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header avec avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6"
        >
          <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-600" />
          <div className="px-8 pb-8">
            <div className="flex items-end -mt-16 mb-6">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt={user?.username}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                />
                {editing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
                    <Camera className="w-8 h-8 text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}
              </div>
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user?.full_name}</h1>
                    <p className="text-gray-600">@{user?.username}</p>
                  </div>
                  {user?.is_verified && (
                    <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Vérifié</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.products_count}</div>
                  <div className="text-sm text-gray-600">Produits</div>
                </div>
                <div className="bg-secondary-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-secondary-600">{stats.transactions_count}</div>
                  <div className="text-sm text-gray-600">Transactions</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.reviews_count}</div>
                  <div className="text-sm text-gray-600">Avis</div>
                </div>
              </div>
            )}

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Modifier mon profil
              </button>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!editing}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                placeholder="Parlez-nous de vous..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  placeholder="+229XXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  rows={2}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  placeholder="Cotonou, Akpakpa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </form>
        </motion.div>

        {/* Vérification d'identité */}
        {!user?.is_verified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 mt-6"
          >
            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Vérifiez votre identité
                </h3>
                <p className="text-yellow-800 mb-4">
                  Pour accéder à toutes les fonctionnalités et gagner la confiance de la communauté, vérifiez votre identité en téléchargeant une pièce d'identité (CNI ou Passeport).
                </p>
                <label className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-700 transition cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Télécharger un document</span>
                  <input type="file" accept="image/*,application/pdf" onChange={handleVerifyIdentity} className="hidden" />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}