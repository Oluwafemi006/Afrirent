/**
 * AddProduct Page
 * Formulaire pour créer une nouvelle annonce avec combobox auto-création catégories
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, Loader } from 'lucide-react';
import { createProduct, getCategories, createCategoryIfNotExists } from '../api/products';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    location: '',
  });

  // Category ID pour backend (string ou number)
  const [categoryId, setCategoryId] = useState('');

  // Status création catégorie
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Gestion unifiée des images (fichier + aperçu)
  const [images, setImages] = useState([]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getCategories();
        // Gérer le cas où la réponse est paginée ou directe
        const cats = response.data.results || response.data;
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Erreur chargement catégories:', err);
        toast.error('Erreur lors du chargement des catégories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Reset category ID quand on tape
    if (name === 'category') {
      setCategoryId('');
    }
  };

  // Handle category input - chercher ou créer
  const handleCategoryChange = async (categoryName) => {
    if (!categoryName || categoryName.trim().length < 2) {
      setFormData(prev => ({ ...prev, category: '' }));
      setCategoryId('');
      return;
    }

    try {
      setCreatingCategory(true);
      const result = await createCategoryIfNotExists(categoryName);
      
      setFormData(prev => ({ ...prev, category: result.category.name }));
      setCategoryId(result.category.id);
      
      if (result.created) {
        toast.success(`Nouvelle catégorie "${result.category.name}" créée !`);
        // Refresh liste catégories
        const response = await getCategories();
        const cats = response.data.results || response.data;
        setCategories(Array.isArray(cats) ? cats : []);
      }
    } catch (err) {
      toast.error('Erreur avec la catégorie');
      console.error(err);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      toast.warning('Maximum 5 images autorisées');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations de base
    if (!formData.title.trim()) return toast.error('Veuillez entrer un titre');
    if (!formData.description.trim()) return toast.error('Veuillez entrer une description');
    if (!formData.price) return toast.error('Veuillez entrer un prix');
    if (!formData.category) return toast.error('Veuillez entrer une catégorie');
    if (images.length === 0) return toast.error('Veuillez ajouter au moins une image');

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      // Envoyer le prix comme un entier (le backend a decimal_places=0)
      formDataToSend.append('price', Math.round(parseFloat(formData.price)));
      
      // Utiliser categoryId (string ou number OK pour backend)
      formDataToSend.append('category', categoryId || formData.category);
      
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('location', formData.location.trim());

      images.forEach((imgObj) => {
        formDataToSend.append('images', imgObj.file);
      });

      const response = await createProduct(formDataToSend);
      
      if (response.data && response.data.id) {
        toast.success('Annonce créée avec succès!');
        navigate(`/products/${response.data.id}`);
      } else {
        throw new Error('ID du produit manquant dans la réponse');
      }
    } catch (err) {
      console.error('Erreur creation annonce:', err);
      const data = err.response?.data;
      let errorMsg = 'Erreur lors de la création de l\'annonce';
      
      if (data) {
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else {
          // Extraire tous les messages d'erreur des champs
          const errorMessages = [];
          Object.entries(data).forEach(([field, errors]) => {
            const fieldName = field === 'images' ? 'Images' : 
                             field === 'price' ? 'Prix' : 
                             field === 'category' ? 'Catégorie' : field;
            
            if (Array.isArray(errors)) {
              errorMessages.push(`${fieldName}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              errorMessages.push(`${fieldName}: ${errors}`);
            }
          });
          
          if (errorMessages.length > 0) {
            errorMsg = errorMessages.join(' | ');
          }
        }
      }
      
      toast.error(errorMsg, { autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const conditions = [
    { value: 'new', label: 'Neuf' },
    { value: 'good', label: 'Bon état' },
    { value: 'fair', label: 'État acceptable' },
    { value: 'damaged', label: 'Endommagé' },
  ];

  const handleCategoryInputBlur = () => {
    if (formData.category && !categoryId) {
      // Auto-créer si nouvelle sur blur
      handleCategoryChange(formData.category);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Créer une annonce</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: iPhone 13 Pro en bon état"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre article en détail..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={2000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Prix */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">
                  Prix (FCFA) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="absolute right-4 top-3 text-gray-500">FCFA</span>
                </div>
              </div>

              {/* Catégorie Combobox */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                  Catégorie * 
                  <span className="text-xs text-gray-500 ml-1">(Tapez pour créer nouvelle)</span>
                </label>
                {categoriesLoading ? (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-500 flex items-center gap-2">
                    <Loader className="animate-spin" size={16} /> Chargement...
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      id="category"
                      name="category"
                      list="categories-list"
                      value={formData.category}
                      onChange={handleInputChange}
                      onBlur={handleCategoryInputBlur}
                      placeholder="Ex: Vélo électrique, Ordinateur portable..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <datalist id="categories-list">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name} />
                      ))}
                    </datalist>
                    {creatingCategory && (
                      <div className="absolute right-3 top-3">
                        <Loader className="animate-spin text-blue-500" size={16} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* État */}
              <div>
                <label htmlFor="condition" className="block text-sm font-semibold text-gray-900 mb-2">
                  État de l'article *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Localisation */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: Cotonou, Akpakpa"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Photos de l'article * ({images.length}/5)
              </label>

              {/* Upload Zone */}
              {images.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition block">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold mb-1">
                    Cliquez pour ajouter des photos
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG ou GIF (Max 5 images)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}

              {/* Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Créer l'annonce
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
