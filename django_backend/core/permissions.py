from rest_framework import permissions


class IsNuamAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'admin'
            and getattr(request.user, 'active', True)
        )


class IsNuamOperatorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ('admin', 'operador')
            and getattr(request.user, 'active', True)
        )
