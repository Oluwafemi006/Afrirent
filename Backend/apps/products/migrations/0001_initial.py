# Generated migration for products app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators
import cloudinary.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Nom unique de la catégorie', max_length=100, unique=True, verbose_name='nom')),
                ('slug', models.SlugField(help_text='Identifiant URL-friendly', unique=True, verbose_name='slug')),
                ('description', models.TextField(blank=True, help_text='Description détaillée de la catégorie', verbose_name='description')),
                ('icon', models.CharField(blank=True, help_text="Nom icône Lucide React (ex: 'ShoppingBag', 'Smartphone')", max_length=50, verbose_name='icône')),
                ('order', models.PositiveIntegerField(default=0, help_text='Position d\'affichage dans la liste', verbose_name='ordre')),
                ('is_active', models.BooleanField(default=True, help_text='Afficher cette catégorie', verbose_name='active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='créée le')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='modifiée le')),
            ],
            options={
                'verbose_name': 'catégorie',
                'verbose_name_plural': 'catégories',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Titre attrayant de l\'annonce (200 caractères max)', max_length=200, verbose_name='titre')),
                ('description', models.TextField(help_text='Description détaillée du produit', verbose_name='description')),
                ('price', models.DecimalField(decimal_places=0, help_text='Prix en FCFA', max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='prix')),
                ('status', models.CharField(choices=[('active', 'Actif'), ('sold', 'Vendu'), ('inactive', 'Inactif'), ('pending', 'En attente')], default='active', help_text='État actuel de l\'annonce', max_length=20, verbose_name='statut')),
                ('condition', models.CharField(choices=[('new', 'Neuf'), ('good', 'Bon état'), ('fair', 'État acceptable'), ('damaged', 'Endommagé')], default='good', help_text='Condition physique du produit', max_length=20, verbose_name='état du produit')),
                ('location', models.CharField(help_text='Lieu où se trouve le produit (quartier, ville)', max_length=200, verbose_name='localisation')),
                ('views_count', models.PositiveIntegerField(default=0, verbose_name='nombre de vues')),
                ('is_featured', models.BooleanField(default=False, help_text='Affichage prioritaire dans les listes', verbose_name='en vedette')),
                ('featured_until', models.DateTimeField(blank=True, help_text='Date d\'expiration du statut vedette', null=True, verbose_name='vedette jusqu\'au')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='créé le')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='modifié le')),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='products.category', verbose_name='catégorie')),
                ('seller', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to=settings.AUTH_USER_MODEL, verbose_name='vendeur')),
            ],
            options={
                'verbose_name': 'produit',
                'verbose_name_plural': 'produits',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', cloudinary.models.CloudinaryField(help_text='Image du produit (max 5 Mo)', max_length=255, verbose_name='image')),
                ('order', models.PositiveIntegerField(default=0, help_text='Ordre d\'affichage (0 = première image)', verbose_name='ordre')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True, verbose_name='uploadée le')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='products.product', verbose_name='produit')),
            ],
            options={
                'verbose_name': 'image de produit',
                'verbose_name_plural': 'images de produit',
                'ordering': ['order', 'uploaded_at'],
            },
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['slug'], name='products_ca_slug_idx'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['is_active'], name='products_ca_is_act_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['seller', 'status'], name='products_pr_seller__idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['category', 'status'], name='products_pr_categor_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['status'], name='products_pr_status_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['-created_at'], name='products_pr_created_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['price'], name='products_pr_price_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='productimage',
            unique_together={('product', 'order')},
        ),
    ]
