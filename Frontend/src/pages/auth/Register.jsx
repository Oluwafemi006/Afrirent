/**
 * Page d'inscription - Design moderne et sophistiqué
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      navigate('/');
    } catch (error) {
      console.error('Erreur inscription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="grid md:grid-cols-2">
          {/* Left side - Branding */}
          <div className="hidden md:flex bg-gradient-to-br from-primary-600 to-secondary-600 p-12 flex-col justify-between relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Bienvenue sur AfriRent
              </h1>
              <p className="text-primary-100 text-lg">
                La plateforme de location entre particuliers la plus simple et sécurisée.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 text-white"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Paiements sécurisés</h3>
                  <p className="text-sm text-primary-100">
                    Système de séquestre pour protéger vos transactions
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Communauté vérifiée</h3>
                  <p className="text-sm text-primary-100">
                    Tous les utilisateurs passent par une vérification d'identité
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          </div>

          {/* Right side - Form */}
          <div className="p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Créer un compte
                </h2>
                <p className="text-gray-600">
                  Rejoignez des milliers d'utilisateurs
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      {...register('first_name', { required: 'Prénom requis' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      {...register('last_name', { required: 'Nom requis' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      {...register('username', {
                        required: 'Username requis',
                        minLength: { value: 3, message: 'Min. 3 caractères' },
                      })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="johndoe"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email requis',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email invalide',
                        },
                      })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Mot de passe requis',
                        minLength: { value: 8, message: 'Min. 8 caractères' },
                      })}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('password_confirm', {
                        required: 'Confirmation requise',
                        validate: (value) =>
                          value === password || 'Les mots de passe ne correspondent pas',
                      })}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password_confirm && (
                    <p className="text-red-500 text-sm mt-1">{errors.password_confirm.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Créer mon compte</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Déjà un compte ?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 font-semibold hover:text-primary-700 transition"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}