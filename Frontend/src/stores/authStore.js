/**
 * Auth Store - Gestion globale de l'authentification avec Zustand
 * Utilise localStorage pour la persistance
 */
import { create } from "zustand";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  register as apiRegister,
} from "../services/api";
import { toast } from "react-toastify";

const useAuthStore = create((set, get) => ({
  // État
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  loading: false,
  error: null,

  /**
   * Initialise l'auth au chargement de l'app
   * Récupère les infos utilisateur si token présent
   */
  initialize: async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        set({ loading: true });
        const response = await getCurrentUser();
        set({
          user: response.data,
          isAuthenticated: true,
          loading: false,
        });
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        // Token invalide : reset
        get().logout();
        set({ loading: false });
      }
    }
  },

  /**
   * Inscription
   * @param {Object} userData - Données d'inscription
   */
  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await apiRegister(userData);

      const { user, tokens } = response.data;

      // Stocker les tokens et l'utilisateur
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
        isAuthenticated: true,
        loading: false,
      });

      toast.success("Compte créé avec succès !");
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.message || "Erreur lors de l'inscription";
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  /**
   * Connexion
   * @param {string} username - Username ou email
   * @param {string} password - Mot de passe
   */
  login: async (username, password) => {
    try {
      set({ loading: true, error: null });
      const response = await apiLogin(username, password);

      const { user, tokens } = response.data;

      // Stocker les tokens et l'utilisateur
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
        isAuthenticated: true,
        loading: false,
      });

      toast.success(`Bienvenue ${user.username} !`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Identifiants incorrects";
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    try {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Nettoyer le state et localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });

      toast.info("Vous êtes déconnecté");
    }
  },

  /**
   * Met à jour les données utilisateur dans le store
   * @param {Object} userData - Nouvelles données utilisateur
   */
  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  /**
   * Rafraîchit les données utilisateur depuis l'API
   */
  refreshUser: async () => {
    try {
      const response = await getCurrentUser();
      get().updateUser(response.data);
    } catch (error) {
      console.error("Erreur lors du refresh utilisateur:", error);
    }
  },
}));

export default useAuthStore;
