from django.contrib import admin
from .models import AuditLog, Dj1948Batch, NuamUser, TaxQualification


@admin.register(NuamUser)
class NuamUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'market', 'active', 'last_login_at')
    list_filter = ('role', 'market', 'active')
    search_fields = ('email', 'full_name')


@admin.register(TaxQualification)
class TaxQualificationAdmin(admin.ModelAdmin):
    list_display = ('emisor', 'rut_emisor', 'mercado', 'ejercicio', 'monto_bruto', 'estado')
    list_filter = ('mercado', 'ejercicio', 'estado')
    search_fields = ('emisor', 'rut_emisor')


@admin.register(Dj1948Batch)
class Dj1948BatchAdmin(admin.ModelAdmin):
    list_display = ('display_id', 'file_name', 'ejercicio', 'processed_count', 'estado', 'created_at')
    list_filter = ('ejercicio', 'estado')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'module', 'user_name', 'ip_address', 'hash_code', 'created_at')
    list_filter = ('action', 'module')
