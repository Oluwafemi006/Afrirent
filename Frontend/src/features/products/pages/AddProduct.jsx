/**
 * AddProduct Page
 * Formulaire pour créer une nouvelle annonce
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, Loader } from 'lucide-react';
import { createProduct, getCategories, createCategory } from '../api/products';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    location: '',
  });

  const [categoryInput, setCategoryInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getCategories();
        setCategories(response.data.results || response.data);
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
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Limiter à 5 images
    if (selectedFiles.length + files.length > 5) {
      toast.warning('Maximum 5 images autorisées');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);

    // Créer des aperçus
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Veuillez entrer un titre');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Veuillez entrer une description');
      return;
    }
    if (!formData.price) {
      toast.error('Veuillez entrer un prix');
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error('Veuillez ajouter au moins une image');
      return;
    }

    try {
      setLoading(true);

      let categoryId = formData.category;
      if (!categoryId && categoryInput.trim()) {
        try {
          const catResponse = await createCategory(categoryInput.trim());
          categoryId = catResponse.data.id;
          setCategories(prev => [...prev, catResponse.data]);
        } catch (catErr) {
          toast.error('Erreur lors de la création de la catégorie');
          setLoading(false);
          return;
        }
      }
      if (!categoryId) {
        toast.error('Veuillez sélectionner ou créer une catégorie');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('category', categoryId);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('location', formData.location);

      selectedFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await createProduct(formDataToSend);
      toast.success('Annonce créée avec succès!');
      navigate(`/products/${response.data.id}`);
    } catch (err) {
      console.error('Erreur:', err);
      const errorMsg = err.response?.data?.detail ||
                       Object.values(err.response?.data || {}).flat()[0] ||
                       'Erreur lors de la création de l\'annonce';
      toast.error(errorMsg);
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
                    step="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">FCFA</span>
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                  Catégorie *
                </label>
                {categoriesLoading ? (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-500">Chargement...</div>
                ) : (
                  <>
                    <input
                      type="text"
                      id="category"
                      list="category-list"
                      value={categoryInput}
                      onChange={(e) => {
                        setCategoryInput(e.target.value);
                        const match = categories.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                        setFormData(prev => ({ ...prev, category: match ? match.id : '' }));
                      }}
                      placeholder="Tapez ou sélectionnez une catégorie"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <datalist id="category-list">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name} />
                      ))}
                    </datalist>
                    {categoryInput && !formData.category && (
                      <p className="text-xs text-blue-600 mt-1">
                        Nouvelle catégorie &quot;{categoryInput}&quot; sera créée
                      </p>
                    )}
                  </>
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
                Photos de l'article * ({selectedFiles.length}/5)
              </label>

              {/* Upload Zone */}
              {selectedFiles.length < 5 && (
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
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                  {previewImages.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Principal
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
