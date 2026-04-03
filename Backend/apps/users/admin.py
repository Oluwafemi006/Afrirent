from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Profile


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    fields = ['phone_number', 'address', 'dob', 'identity_document', 'identity_verified_at']
    readonly_fields = ['identity_verified_at']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [ProfileInline]
    list_display = ['username', 'email', 'full_name', 'is_verified', 'is_staff', 'date_joined']
    list_filter = ['is_verified', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    readonly_fields = ['date_joined', 'last_login']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('AfriRent', {
            'fields': ('avatar', 'bio', 'is_verified'),
        }),
    )
