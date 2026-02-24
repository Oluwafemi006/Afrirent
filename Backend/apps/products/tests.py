"""
Products Tests
Tests unitaires pour les modèles et serializers
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Category, Product, ProductImage

User = get_user_model()


class CategoryModelTest(TestCase):
    """Tests pour le modèle Category"""
    
    def setUp(self):
        self.category = Category.objects.create(
            name='Électronique',
            slug='electronique',
            description='Produits électroniques',
            is_active=True,
            order=1
        )
    
    def test_create_category(self):
        """Test création d'une catégorie"""
        self.assertEqual(self.category.name, 'Électronique')
        self.assertTrue(self.category.is_active)
    
    def test_category_str(self):
        """Test la représentation string"""
        self.assertEqual(str(self.category), 'Électronique')
    
    def test_category_ordering(self):
        """Test l'ordre des catégories"""
        Category.objects.create(
            name='Vêtements',
            slug='vetements',
            order=2
        )
        categories = Category.objects.all()
        self.assertEqual(categories[0].name, 'Électronique')
        self.assertEqual(categories[1].name, 'Vêtements')


class ProductModelTest(TestCase):
    """Tests pour le modèle Product"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Électronique',
            slug='electronique'
        )
        
        self.product = Product.objects.create(
            seller=self.user,
            category=self.category,
            title='iPhone 13',
            description='iPhone 13 en très bon état',
            price=500000,
            status='active',
            condition='good',
            location='Cotonou'
        )
    
    def test_create_product(self):
        """Test création d'un produit"""
        self.assertEqual(self.product.seller, self.user)
        self.assertEqual(self.product.title, 'iPhone 13')
        self.assertEqual(self.product.price, 500000)
        self.assertTrue(self.product.is_available)
    
    def test_product_str(self):
        """Test la représentation string"""
        self.assertEqual(str(self.product), 'iPhone 13')
    
    def test_product_status_not_available(self):
        """Test que le produit vendu n'est pas disponible"""
        self.product.status = 'sold'
        self.product.save()
        self.assertFalse(self.product.is_available)
    
    def test_increment_views(self):
        """Test l'incrémentation des vues"""
        self.assertEqual(self.product.views_count, 0)
        self.product.increment_views()
        self.product.refresh_from_db()
        self.assertEqual(self.product.views_count, 1)
    
    def test_product_with_negative_price(self):
        """Test qu'on ne peut pas créer un produit avec prix négatif"""
        with self.assertRaises(Exception):
            Product.objects.create(
                seller=self.user,
                category=self.category,
                title='Produit test',
                description='Test',
                price=-1000,
                location='Test'
            )


class ProductImageModelTest(TestCase):
    """Tests pour le modèle ProductImage"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Électronique',
            slug='electronique'
        )
        
        self.product = Product.objects.create(
            seller=self.user,
            category=self.category,
            title='iPhone 13',
            description='Test',
            price=500000,
            location='Cotonou'
        )
    
    def test_product_main_image(self):
        """Test la récupération de la première image"""
        # Sans images
        self.assertIsNone(self.product.main_image)
        
        # Avec images (simulé sans Cloudinary en test)
        # En test, on peut juste vérifier la logique


class ProductAPITest(APITestCase):
    """Tests pour les APIs de produits"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Électronique',
            slug='electronique'
        )
        
        self.product = Product.objects.create(
            seller=self.user,
            category=self.category,
            title='iPhone 13',
            description='Test',
            price=500000,
            status='active',
            location='Cotonou'
        )
    
    def test_get_products_list(self):
        """Test GET /api/products/"""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_product_detail(self):
        """Test GET /api/products/{id}/"""
        response = self.client.get(f'/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'iPhone 13')
    
    def test_create_product_authenticated(self):
        """Test création d'un produit (authentifié)"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'Samsung Galaxy',
            'description': 'Test',
            'price': 400000,
            'condition': 'good',
            'category': self.category.id,
            'location': 'Cotonou'
        }
        
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Samsung Galaxy')
    
    def test_create_product_unauthenticated(self):
        """Test création sans authentification"""
        data = {
            'title': 'Samsung Galaxy',
            'description': 'Test',
            'price': 400000,
            'condition': 'good',
            'location': 'Cotonou'
        }
        
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_own_product(self):
        """Test modification de son propre produit"""
        self.client.force_authenticate(user=self.user)
        
        data = {'title': 'iPhone 14'}
        response = self.client.patch(
            f'/api/products/{self.product.id}/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.title, 'iPhone 14')
    
    def test_update_other_product(self):
        """Test qu'on ne peut pas modifier le produit d'un autre"""
        self.client.force_authenticate(user=self.other_user)
        
        data = {'title': 'Modified'}
        response = self.client.patch(
            f'/api/products/{self.product.id}/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_categories(self):
        """Test GET /api/products/categories/"""
        response = self.client.get('/api/products/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_my_products_endpoint(self):
        """Test GET /api/products/my-products/"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get('/api/products/my-products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_change_product_status(self):
        """Test PATCH /api/products/{id}/status/"""
        self.client.force_authenticate(user=self.user)
        
        data = {'status': 'sold'}
        response = self.client.patch(
            f'/api/products/{self.product.id}/status/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.status, 'sold')
