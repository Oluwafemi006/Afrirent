/**
 * Service API pour AfriRent
 * Gère toutes les requêtes HTTP vers le backend Django
 */
import axios from "axios";
import { toast } from "react-toastify";

// Configuration de base d'Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs et le refresh du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et qu'on n'a pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Tenter de rafraîchir le token
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000/api"
          }/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Échec du refresh : déconnecter l'utilisateur
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Afficher un message d'erreur
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      "Une erreur est survenue";
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

// === ENDPOINTS AUTH ===

/**
 * Inscription d'un nouvel utilisateur
 * @param {Object} userData - Données d'inscription
 * @returns {Promise} Réponse avec user + tokens
 */
export const register = (userData) => {
  return api.post("/auth/register/", userData);
};

/**
 * Connexion utilisateur
 * @param {string} username - Username ou email
 * @param {string} password - Mot de passe
 * @returns {Promise} Réponse avec user + tokens
 */
export const login = (username, password) => {
  return api.post("/auth/login/", { username, password });
};

/**
 * Déconnexion utilisateur
 * @param {string} refreshToken - Refresh token à blacklist
 * @returns {Promise}
 */
export const logout = (refreshToken) => {
  return api.post("/auth/logout/", { refresh: refreshToken });
};

/**
 * Récupère le profil de l'utilisateur connecté
 * @returns {Promise} User complet avec profil
 */
export const getCurrentUser = () => {
  return api.get("/auth/me/");
};

// === ENDPOINTS USERS ===

/**
 * Récupère la liste des utilisateurs
 * @param {Object} params - Paramètres de recherche (verified, search)
 * @returns {Promise} Liste paginée d'utilisateurs
 */
export const getUsers = (params = {}) => {
  return api.get("/auth/users/", { params });
};

/**
 * Récupère le détail d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise} User complet
 */
export const getUser = (userId) => {
  return api.get(`/auth/users/${userId}/`);
};

/**
 * Met à jour le profil de l'utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} userData - Données à mettre à jour
 * @returns {Promise} User mis à jour
 */
export const updateUser = (userId, userData) => {
  // Si avatar présent, envoyer en multipart/form-data
  if (userData.avatar instanceof File) {
    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });
    return api.put(`/auth/users/${userId}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.put(`/auth/users/${userId}/`, userData);
};

/**
 * Supprime le compte utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise}
 */
export const deleteUser = (userId) => {
  return api.delete(`/auth/users/${userId}/`);
};

/**
 * Upload document d'identité pour vérification
 * @param {File} document - Fichier CNI/Passeport
 * @returns {Promise}
 */
export const verifyIdentity = (document) => {
  const formData = new FormData();
  formData.append("identity_document", document);
  return api.post("/auth/users/verify/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Récupère les statistiques d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise} Stats (products_count, reviews_count, etc.)
 */
export const getUserStats = (userId) => {
  return api.get(`/auth/users/${userId}/stats/`);
};

// Export de l'instance axios configurée pour usage avancé
export default api;
