from django.core.management.base import BaseCommand
from django.utils.text import slugify
import re
from apps.products.models import Category


class Command(BaseCommand):
    help = 'Peuple les catégories essentielles pour AfriRent si elles n\'existent pas'

    CATEGORIES_DATA = [
        {'name': 'Électronique', 'icon': 'Smartphone', 'order': 1},
        {'name': 'Véhicules', 'icon': 'CarFront', 'order': 2},
        {'name': 'Immobilier', 'icon': 'Home', 'order': 3},
        {'name': 'Meubles', 'icon': 'Armchair', 'order': 4},
        {'name': 'Vêtements', 'icon': 'Tshirt', 'order': 5},
        {'name': 'Maison & Jardin', 'icon': 'Plant', 'order': 6},
        {'name': 'Sport & Loisirs', 'icon': 'Dumbbell', 'order': 7},
        {'name': 'Beauté & Santé', 'icon': 'Spray', 'order': 8},
        {'name': 'Livres & Jeux', 'icon': 'BookOpen', 'order': 9},
        {'name': 'Services', 'icon': 'HandCoins', 'order': 10},
        {'name': 'Autres', 'icon': 'Package', 'order': 99},
    ]

    def handle(self, *args, **options):
        created_count = 0
        existing_count = Category.objects.filter(is_active=True).count()
        
        if existing_count > 0:
            self.stdout.write(
                self.style.WARNING(f'{existing_count} catégories actives déjà présentes. Rien à faire.')
            )
            return
        
        for data in self.CATEGORIES_DATA:
            name = data['name']
            if not Category.objects.filter(name=name).exists():
                slug = slugify(name)
                slug = re.sub(r'[^a-z0-9-]', '', slug)
                
                category = Category.objects.create(
                    name=name,
                    slug=slug,
                    icon=data['icon'],
                    order=data['order'],
                    is_active=True
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Créée: {category.name} (ID: {category.id})')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Déjà existante: {name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Commande terminée. {created_count} catégories créées. '
                f'Total actif: {Category.objects.filter(is_active=True).count()}'
            )
        )

