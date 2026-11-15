import csv
import hashlib
import io
from django.contrib.auth import authenticate
from django.db.models import Sum
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AuditLog, Dj1948Batch, NuamUser, TaxQualification
from .permissions import IsNuamAdmin, IsNuamOperatorOrAdmin
from .serializers import (
    ROLE_PERMISSIONS,
    AuditLogSerializer,
    Dj1948BatchSerializer,
    NuamUserSerializer,
    TaxQualificationSerializer,
)
from .supabase_client import sync_audit_to_supabase

ROLE_CATALOG = [
    {
        'role': 'admin',
        'label': 'Administrador',
        'description': 'Control total de usuarios, roles RBAC, calificaciones tributarias y presentación DJ1948.',
        'permissions': ROLE_PERMISSIONS['admin'],
    },
    {
        'role': 'operador',
        'label': 'Operador',
        'description': 'Creación/edición de calificaciones, carga masiva DJ1948 y reportes sin gestión de usuarios.',
        'permissions': ROLE_PERMISSIONS['operador'],
    },
    {
        'role': 'consultor',
        'label': 'Consultor',
        'description': 'Lectura de paneles tributarios, auditoría y exportación de reportes regulatorios.',
        'permissions': ROLE_PERMISSIONS['consultor'],
    },
]


def _client_ip(request) -> str:
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '127.0.0.1')


def _log_audit(request, action_name: str, module: str, detail: str, user_override=None):
    actor = user_override or getattr(request, 'user', None)
    user_name = getattr(actor, 'full_name', 'Sistema NUAM')
    user_id = str(getattr(actor, 'id', 'system'))
    raw = f'{action_name}:{module}:{user_id}:{timezone.now().isoformat()}'
    hash_code = '#' + hashlib.sha256(raw.encode('utf-8')).hexdigest()[:8].upper()
    ip_addr = _client_ip(request)
    log = AuditLog.objects.create(
        action=action_name,
        module=module,
        user_name=user_name,
        user_id=user_id,
        ip_address=ip_addr,
        hash_code=hash_code,
        detail=detail,
    )
    sync_audit_to_supabase({
        'action': action_name,
        'module': module,
        'user_name': user_name,
        'user_id': user_id,
        'ip_address': ip_addr,
        'hash_code': hash_code,
        'detail': detail,
    })
    return log


@api_view(['GET'])
@permission_classes([AllowAny])
def health_view(request):
    return Response({
        'status': 'ok',
        'engine': 'django-rest-framework + supabase-postgres',
        'timestamp': timezone.now().isoformat(),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''
    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({'error': 'Credenciales institucionales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.active:
        return Response({'error': 'Cuenta corporativa desactivada.'}, status=status.HTTP_403_FORBIDDEN)

    user.last_login_at = timezone.now()
    user.save(update_fields=['last_login_at'])
    refresh = RefreshToken.for_user(user)
    _log_audit(request, 'LOGIN', 'USUARIO', f'Inicio de sesión JWT en Django ({user.role.upper()}).', user)

    return Response({
        'accessToken': str(refresh.access_token),
        'refreshToken': str(refresh),
        'expiresIn': 3600,
        'user': NuamUserSerializer(user).data,
        'permissions': ROLE_PERMISSIONS.get(user.role, ROLE_PERMISSIONS['consultor']),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(request):
    token_str = request.data.get('refreshToken') or request.data.get('refresh')
    if not token_str:
        return Response({'error': 'refreshToken requerido.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        refresh = RefreshToken(token_str)
        user_id = refresh.get('user_id')
        user = NuamUser.objects.get(id=user_id, active=True)
        return Response({
            'accessToken': str(refresh.access_token),
            'refreshToken': str(refresh),
            'expiresIn': 3600,
            'user': NuamUserSerializer(user).data,
            'permissions': ROLE_PERMISSIONS.get(user.role, ROLE_PERMISSIONS['consultor']),
        })
    except Exception:
        return Response({'error': 'Token de refresco inválido o expirado.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    email = (request.data.get('email') or '').strip().lower()
    if not email:
        return Response({'error': 'Debe ingresar un correo válido.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({
        'message': f'Se enviaron instrucciones de restablecimiento corporativo a {email}.'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    _log_audit(request, 'LOGOUT', 'USUARIO', 'Cierre de sesión JWT.')
    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response({
        'user': NuamUserSerializer(request.user).data,
        'permissions': ROLE_PERMISSIONS.get(request.user.role, ROLE_PERMISSIONS['consultor']),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def roles_view(request):
    return Response(ROLE_CATALOG)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary_view(request):
    quals = TaxQualification.objects.all()
    total = quals.count()
    vigentes = quals.filter(estado='VIGENTE').count()
    borrador = quals.filter(estado='BORRADOR').count()
    presentadas = quals.filter(estado='PRESENTADO').count()
    cargas = Dj1948Batch.objects.count()
    total_monto = float(quals.aggregate(s=Sum('monto_bruto'))['s'] or 0)

    market_names = {'CL': 'Santiago (CL)', 'PE': 'Lima (PE)', 'CO': 'Colombia (CO)'}
    by_market = []
    for code, label in market_names.items():
        qs = quals.filter(mercado=code)
        by_market.append({
            'market': code,
            'label': label,
            'count': qs.count(),
            'montoTotal': float(qs.aggregate(s=Sum('monto_bruto'))['s'] or 0),
        })

    by_year = []
    for yr in (2023, 2024, 2025, 2026):
        qs = quals.filter(ejercicio=yr)
        by_year.append({
            'year': yr,
            'vigentes': qs.filter(estado='VIGENTE').count(),
            'borrador': qs.filter(estado='BORRADOR').count(),
            'presentadas': qs.filter(estado='PRESENTADO').count(),
        })

    return Response({
        'totalCalificaciones': total,
        'vigentes': vigentes,
        'borrador': borrador,
        'presentadas': presentadas,
        'cargasDj1948': cargas,
        'yoyGrowthPct': 20,
        'totalMontoBruto': total_monto,
        'byMarket': by_market,
        'byYear': by_year,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def dj1948_template_view(request):
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="plantilla_dj1948_nuam.csv"'
    writer = csv.writer(response, delimiter=';')
    writer.writerow([
        'EMISOR', 'RUT_EMISOR', 'MERCADO', 'EJERCICIO', 'TIPO_RENTA',
        'MONTO_BRUTO', 'FACTOR_8', 'FACTOR_10', 'FACTOR_15', 'ESTADO'
    ])
    writer.writerow([
        'Banco de Chile', '97.004.000-5', 'CL', 2024,
        'Dividendos Ordinarios DJ1948', 120000000, 0.273972, 0.145, 0.05, 'VIGENTE'
    ])
    return response


@api_view(['POST'])
@permission_classes([IsNuamOperatorOrAdmin])
def dj1948_present_view(request):
    year = int(request.data.get('year') or 2024)
    qs = TaxQualification.objects.filter(ejercicio=year, estado='VIGENTE')
    count = qs.count()
    qs.update(estado='PRESENTADO', updated_at=timezone.now())
    folio = f'DJ1948-{year}-{str(timezone.now().timestamp()).replace(".", "")[-6:]}'
    _log_audit(request, 'PRESENTACION_DJ1948', 'DJ1948', f'Folio {folio} emitido ({count} registros).')
    return Response({'presentedCount': count, 'folio': folio})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def realtime_report_view(request):
    summary_res = dashboard_summary_view(request._request)
    return Response({
        'summary': summary_res.data,
        'activeUsers': NuamUser.objects.filter(active=True).count(),
        'recentBatches': Dj1948BatchSerializer(Dj1948Batch.objects.all()[:5], many=True).data,
        'recentAudit': AuditLogSerializer(AuditLog.objects.all()[:10], many=True).data,
        'generatedAt': timezone.now().isoformat(),
    })


class UserViewSet(viewsets.ModelViewSet):
    queryset = NuamUser.objects.all()
    serializer_class = NuamUserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsNuamAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        user = serializer.save()
        _log_audit(self.request, 'CREAR_USUARIO', 'ADMIN_USUARIOS', f'Usuario creado: {user.email} ({user.role})')

    def perform_update(self, serializer):
        user = serializer.save()
        _log_audit(self.request, 'ACTUALIZAR_USUARIO', 'ADMIN_USUARIOS', f'Usuario actualizado: {user.email} ({user.role})')

    def perform_destroy(self, instance):
        email = instance.email
        instance.delete()
        _log_audit(self.request, 'ELIMINAR_USUARIO', 'ADMIN_USUARIOS', f'Usuario eliminado: {email}')


class TaxQualificationViewSet(viewsets.ModelViewSet):
    queryset = TaxQualification.objects.all()
    serializer_class = TaxQualificationSerializer
    permission_classes = [IsNuamOperatorOrAdmin]

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsNuamAdmin()]
        return [IsNuamOperatorOrAdmin()]

    def perform_create(self, serializer):
        obj = serializer.save(owner=self.request.user, created_by_name=self.request.user.full_name)
        _log_audit(self.request, 'CREAR_CALIFICACION', 'CALIFICACIONES', f'{obj.emisor} ({obj.mercado})')

    def perform_update(self, serializer):
        obj = serializer.save()
        _log_audit(self.request, 'ACTUALIZAR_CALIFICACION', 'CALIFICACIONES', f'{obj.emisor} -> {obj.estado}')

    def perform_destroy(self, instance):
        label = f'{instance.emisor} ({instance.mercado})'
        instance.delete()
        _log_audit(self.request, 'ELIMINAR_CALIFICACION', 'CALIFICACIONES', f'Eliminada: {label}')


class Dj1948BatchViewSet(viewsets.ModelViewSet):
    queryset = Dj1948Batch.objects.all()
    serializer_class = Dj1948BatchSerializer
    permission_classes = [IsNuamOperatorOrAdmin]

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsNuamAdmin()]
        return [IsNuamOperatorOrAdmin()]

    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        file_name = request.data.get('fileName') or 'DJ1948_CARGA.csv'
        ejercicio = int(request.data.get('ejercicio') or 2024)
        process_type = request.data.get('processType') or 'Declaración Jurada 1948'
        content = request.data.get('content') or ''

        lines = [line.strip() for line in content.splitlines() if line.strip()]
        rows = lines[1:] if len(lines) > 1 and 'EMISOR' in lines[0].upper() else lines
        success_count = 0
        error_count = 0

        for row_text in rows:
            sep = ';' if ';' in row_text else ','
            parts = [p.strip() for p in row_text.split(sep)]
            if len(parts) < 6 or not parts[0]:
                error_count += 1
                continue
            try:
                mercado = parts[2].upper() if parts[2].upper() in ('CL', 'PE', 'CO') else 'CL'
                estado = parts[9].upper() if len(parts) > 9 and parts[9].upper() in ('VIGENTE', 'BORRADOR', 'PRESENTADO') else 'VIGENTE'
                TaxQualification.objects.create(
                    emisor=parts[0],
                    rut_emisor=parts[1],
                    mercado=mercado,
                    ejercicio=int(parts[3]) if parts[3].isdigit() else ejercicio,
                    tipo_renta=parts[4],
                    monto_bruto=float(parts[5] or 0),
                    factor_8=float(parts[6] or 0) if len(parts) > 6 else 0,
                    factor_10=float(parts[7] or 0) if len(parts) > 7 else 0,
                    factor_15=float(parts[8] or 0) if len(parts) > 8 else 0,
                    estado=estado,
                    owner=request.user,
                    created_by_name=request.user.full_name,
                )
                success_count += 1
            except Exception:
                error_count += 1

        next_id = (Dj1948Batch.objects.count() or 0) + 1
        batch = Dj1948Batch.objects.create(
            display_id=next_id,
            file_name=file_name,
            ejercicio=ejercicio,
            process_type=process_type,
            processed_count=success_count + error_count,
            success_count=success_count,
            error_count=error_count,
            estado='EXITOSO' if error_count == 0 else 'CON_ERRORES',
            owner=request.user,
            uploaded_by_name=request.user.full_name,
        )
        _log_audit(request, 'CARGA_MASIVA', 'CARGA_ARCHIVO', f'{file_name} ({success_count} exitosos, {error_count} errores)')
        return Response(Dj1948BatchSerializer(batch).data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        name = instance.file_name
        instance.delete()
        _log_audit(self.request, 'ELIMINAR_LOTE_DJ1948', 'CARGA_ARCHIVO', f'Lote eliminado: {name}')


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
