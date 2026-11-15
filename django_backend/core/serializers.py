from rest_framework import serializers
from .models import AuditLog, Dj1948Batch, NuamUser, TaxQualification


ROLE_PERMISSIONS = {
    'admin': {
        'viewDashboard': True,
        'createQualification': True,
        'editQualification': True,
        'deleteQualification': True,
        'uploadDj1948': True,
        'presentDj1948': True,
        'exportReports': True,
        'manageUsers': True,
    },
    'operador': {
        'viewDashboard': True,
        'createQualification': True,
        'editQualification': True,
        'deleteQualification': False,
        'uploadDj1948': True,
        'presentDj1948': True,
        'exportReports': True,
        'manageUsers': False,
    },
    'consultor': {
        'viewDashboard': True,
        'createQualification': False,
        'editQualification': False,
        'deleteQualification': False,
        'uploadDj1948': False,
        'presentDj1948': False,
        'exportReports': True,
        'manageUsers': False,
    },
}


class NuamUserSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')
    lastLoginAt = serializers.DateTimeField(source='last_login_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = NuamUser
        fields = [
            'id',
            'email',
            'fullName',
            'role',
            'market',
            'active',
            'lastLoginAt',
            'createdAt',
            'password',
        ]
        read_only_fields = ['id', 'lastLoginAt', 'createdAt']

    def create(self, validated_data):
        password = validated_data.pop('password', None) or 'nuam2026!'
        user = NuamUser.objects.create_user(password=password, **validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class TaxQualificationSerializer(serializers.ModelSerializer):
    rutEmisor = serializers.CharField(source='rut_emisor')
    tipoRenta = serializers.CharField(source='tipo_renta')
    montoBruto = serializers.FloatField(source='monto_bruto')
    factor8 = serializers.FloatField(source='factor_8')
    factor10 = serializers.FloatField(source='factor_10')
    factor15 = serializers.FloatField(source='factor_15')
    ownerId = serializers.SerializerMethodField()
    createdByName = serializers.CharField(source='created_by_name', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = TaxQualification
        fields = [
            'id',
            'emisor',
            'rutEmisor',
            'mercado',
            'ejercicio',
            'tipoRenta',
            'montoBruto',
            'factor8',
            'factor10',
            'factor15',
            'estado',
            'ownerId',
            'createdByName',
            'createdAt',
            'updatedAt',
        ]
        read_only_fields = ['id', 'ownerId', 'createdByName', 'createdAt', 'updatedAt']

    def get_ownerId(self, obj):
        return str(obj.owner_id) if obj.owner_id else ''


class Dj1948BatchSerializer(serializers.ModelSerializer):
    displayId = serializers.IntegerField(source='display_id', read_only=True)
    fileName = serializers.CharField(source='file_name')
    processType = serializers.CharField(source='process_type')
    processedCount = serializers.IntegerField(source='processed_count')
    successCount = serializers.IntegerField(source='success_count')
    errorCount = serializers.IntegerField(source='error_count')
    ownerId = serializers.SerializerMethodField()
    uploadedByName = serializers.CharField(source='uploaded_by_name', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Dj1948Batch
        fields = [
            'id',
            'displayId',
            'fileName',
            'ejercicio',
            'processType',
            'processedCount',
            'successCount',
            'errorCount',
            'estado',
            'ownerId',
            'uploadedByName',
            'createdAt',
        ]

    def get_ownerId(self, obj):
        return str(obj.owner_id) if obj.owner_id else ''


class AuditLogSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user_name')
    userId = serializers.CharField(source='user_id')
    ipAddress = serializers.CharField(source='ip_address')
    hashCode = serializers.CharField(source='hash_code')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'action',
            'module',
            'userName',
            'userId',
            'ipAddress',
            'hashCode',
            'detail',
            'createdAt',
        ]
