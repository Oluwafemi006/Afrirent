/**
 * EditProduct Page
 * Formulaire pour modifier une annonce existante
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Save, X, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { getProductDetail, updateProduct, getCategories, uploadProductImages } from '../api/products';
import useAuthStore from '../../../stores/authStore';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    location: '',
  });

  // Charger le produit
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductDetail(id);
        const prod = response.data;

        // Vérifier que l'utilisateur est propriétaire
        if (user && user.id !== prod.seller.id) {
          setError('Vous n\'avez pas la permission de modifier ce produit');
          return;
        }

        setProduct(prod);
        setFormData({
          title: prod.title,
          description: prod.description,
          price: prod.price.toString(),
          category: prod.category.id,
          condition: prod.condition,
          location: prod.location || '',
        });

        // Charger les images existantes
        if (prod.images && prod.images.length > 0) {
          setPreviewImages(prod.images.map(img => img.image));
        }
      } catch (err) {
        setError('Erreur lors du chargement du produit');
        toast.error('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.results || response.data);
      } catch (err) {
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
    const totalImages = previewImages.length + selectedFiles.length + files.length;

    if (totalImages > 5) {
      toast.warning('Maximum 5 images autorisées au total');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    // Identifier les images nouvelles (celles dans selectedFiles)
    const newImagesCount = previewImages.length - (product?.images?.length || 0);
    if (index >= previewImages.length - newImagesCount) {
      const newIndex = index - (previewImages.length - newImagesCount);
      setSelectedFiles(prev => prev.filter((_, i) => i !== newIndex));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    }
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
    if (!formData.category) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    try {
      setSubmitting(true);

      // Mettre à jour le produit
      await updateProduct(id, {
        ...formData,
        price: parseFloat(formData.price),
      });

      // Uploader les nouvelles images
      if (selectedFiles.length > 0) {
        try {
          await uploadProductImages(id, selectedFiles);
        } catch (err) {
          console.error('Erreur lors de l\'upload:', err);
          toast.warning('Produit mis à jour mais images non uploadées');
        }
      }

      toast.success('Annonce mise à jour avec succès!');
      navigate(`/products/${id}`);
    } catch (err) {
      console.error('Erreur:', err);
      const errorMsg = err.response?.data?.detail || 
                       Object.values(err.response?.data || {}).flat()[0] ||
                       'Erreur lors de la mise à jour';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const conditions = [
    { value: 'new', label: 'Neuf' },
    { value: 'good', label: 'Bon état' },
    { value: 'fair', label: 'Acceptable' },
    { value: 'damaged', label: 'Endommagé' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 mb-4 hover:text-blue-700"
          >
            <ArrowLeft size={20} /> Retour
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-4 hover:text-blue-700"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier l'annonce</h1>

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
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                  placeholder="Ex: Dakar, Plateau"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Photos de l'article * ({previewImages.length}/5)
              </label>

              {/* Upload Zone */}
              {previewImages.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold mb-1">
                    Cliquez ou glissez pour ajouter des photos
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG ou GIF
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
                  {previewImages.map((preview, index) => {
                    const isNewImage = index >= (product?.images?.length || 0);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {isNewImage ? (
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        ) : (
                          <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Existant
                          </span>
                        )}
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(`/products/${id}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Mettre à jour
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

export default EditProduct;
