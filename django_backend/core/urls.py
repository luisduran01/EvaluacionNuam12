from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    AuditLogViewSet,
    Dj1948BatchViewSet,
    TaxQualificationViewSet,
    UserViewSet,
    dashboard_summary_view,
    dj1948_present_view,
    dj1948_template_view,
    forgot_password_view,
    health_view,
    login_view,
    logout_view,
    me_view,
    realtime_report_view,
    refresh_view,
    roles_view,
)

router = DefaultRouter(trailing_slash=False)
router.register(r'users', UserViewSet, basename='users')
router.register(r'qualifications', TaxQualificationViewSet, basename='qualifications')
router.register(r'dj1948/batches', Dj1948BatchViewSet, basename='dj1948-batches')
router.register(r'audit', AuditLogViewSet, basename='audit')

urlpatterns = [
    path('health', health_view, name='health'),
    path('auth/login', login_view, name='auth-login'),
    path('auth/refresh', refresh_view, name='auth-refresh'),
    path('auth/forgot-password', forgot_password_view, name='auth-forgot-password'),
    path('auth/logout', logout_view, name='auth-logout'),
    path('auth/me', me_view, name='auth-me'),
    path('roles', roles_view, name='roles'),
    path('dashboard/summary', dashboard_summary_view, name='dashboard-summary'),
    path('dj1948/template', dj1948_template_view, name='dj1948-template'),
    path('dj1948/present', dj1948_present_view, name='dj1948-present'),
    path('reports/realtime', realtime_report_view, name='reports-realtime'),
    path('', include(router.urls)),
]
