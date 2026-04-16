import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* À propos */}
          <div>
            <div className="flex items-center space-x-3 mb-6 text-white">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center border border-white border-opacity-10">
                <span className="font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold">Afrirent</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              La plateforme de petites annonces leader en Afrique. 
              Vendez, achetez et louez en toute confiance près de chez vous.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Liens utiles</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/products/new" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Déposer une annonce
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Parcourir les offres
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Comment ça marche ?
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Sécurité & Conseils
                </a>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Légal</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>contact@afrirent.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+221 33 000 00 00</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Dakar, Sénégal / Abidjan, CI</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2025 Afrirent. Toutes les annonces sont sous la responsabilité de leurs auteurs.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">FAQ</a>
            <a href="#" className="hover:text-white transition">Support</a>
            <a href="#" className="hover:text-white transition">Partenaires</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
