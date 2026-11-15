import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class NuamUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo institucional es obligatorio')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('market', 'REGIONAL')
        return self.create_user(email, password, **extra_fields)


class NuamUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrador'),
        ('operador', 'Operador'),
        ('consultor', 'Consultor'),
    )
    MARKET_CHOICES = (
        ('CL', 'Santiago (CL)'),
        ('PE', 'Lima (PE)'),
        ('CO', 'Colombia (CO)'),
        ('REGIONAL', 'Regional NUAM'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auth_uid = models.UUIDField(null=True, blank=True, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=160)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='consultor')
    market = models.CharField(max_length=16, choices=MARKET_CHOICES, default='REGIONAL')
    active = models.BooleanField(default=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = NuamUserManager()

    class Meta:
        db_table = 'nuam_users'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} ({self.role})'


class TaxQualification(models.Model):
    MARKET_CHOICES = (('CL', 'CL'), ('PE', 'PE'), ('CO', 'CO'))
    STATUS_CHOICES = (
        ('VIGENTE', 'VIGENTE'),
        ('BORRADOR', 'BORRADOR'),
        ('PRESENTADO', 'PRESENTADO'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emisor = models.CharField(max_length=200)
    rut_emisor = models.CharField(max_length=40)
    mercado = models.CharField(max_length=4, choices=MARKET_CHOICES, default='CL')
    ejercicio = models.IntegerField(default=2024)
    tipo_renta = models.CharField(max_length=200)
    monto_bruto = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    factor_8 = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    factor_10 = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    factor_15 = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    estado = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BORRADOR')
    owner = models.ForeignKey(
        NuamUser, on_delete=models.SET_NULL, null=True, related_name='qualifications'
    )
    created_by_name = models.CharField(max_length=160)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_qualifications'
        ordering = ['-updated_at']


class Dj1948Batch(models.Model):
    STATUS_CHOICES = (
        ('EXITOSO', 'EXITOSO'),
        ('CON_ERRORES', 'CON_ERRORES'),
        ('PROCESANDO', 'PROCESANDO'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    display_id = models.IntegerField(default=1)
    file_name = models.CharField(max_length=255)
    ejercicio = models.IntegerField(default=2024)
    process_type = models.CharField(max_length=255)
    processed_count = models.IntegerField(default=0)
    success_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    estado = models.CharField(max_length=20, choices=STATUS_CHOICES, default='EXITOSO')
    owner = models.ForeignKey(
        NuamUser, on_delete=models.SET_NULL, null=True, related_name='batches'
    )
    uploaded_by_name = models.CharField(max_length=160)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'dj1948_batches'
        ordering = ['-created_at']


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action = models.CharField(max_length=60)
    module = models.CharField(max_length=60)
    user_name = models.CharField(max_length=160)
    user_id = models.CharField(max_length=64)
    ip_address = models.CharField(max_length=64, default='127.0.0.1')
    hash_code = models.CharField(max_length=32)
    detail = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
