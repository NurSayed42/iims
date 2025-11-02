# serializers.py
from rest_framework import serializers
from .models import CustomUser, Inspection, NewInspection
from django.contrib.auth.password_validation import validate_password

# New Inspection Serializer
class NewInspectionSerializer(serializers.ModelSerializer):
    assigned_inspector_name = serializers.CharField(source='assigned_inspector.user_name', read_only=True)
    
    class Meta:
        model = NewInspection
        fields = [
            'id',
            'project',
            'client_name',
            'industry_name', 
            'phone_number',
            'assigned_inspector',
            'branch_name',
            'status',
            'created_at',
            'updated_at',
            'assigned_inspector_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_assigned_inspector(self, value):
        # Check if the assigned user is actually an inspector
        if value.role != 'inspector':
            raise serializers.ValidationError("The assigned user must be an inspector.")
        return value

class InspectionSerializer(serializers.ModelSerializer):
    inspector_name = serializers.CharField(source='inspector.username', read_only=True)
    inspector_id = serializers.IntegerField(source='inspector.id', read_only=True)
    location_summary = serializers.SerializerMethodField()
    first_location = serializers.SerializerMethodField()
    last_location = serializers.SerializerMethodField()
    
    class Meta:
        model = Inspection
        fields = '__all__'
        read_only_fields = ('inspector', 'created_at', 'updated_at')
    
    def get_location_summary(self, obj):
        return obj.get_location_summary()
    
    def get_first_location(self, obj):
        return obj.get_first_location()
    
    def get_last_location(self, obj):
        return obj.get_last_location()

class InspectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inspection
        exclude = ('inspector',)
        
    def create(self, validated_data):
        # Automatically set the inspector from request user
        validated_data['inspector'] = self.context['request'].user
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','user_name','email','employee_id','branch_name','role','is_active']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    class Meta:
        model = CustomUser
        fields = ['id','user_name','email','password','employee_id','branch_name','role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField()
