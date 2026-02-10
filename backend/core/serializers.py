from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, Service, CompanySetting, Employee, UserProfile


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "is_staff", "date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "is_active", "is_staff"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "is_active", "is_staff"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context.get("request").user
        if not user.check_password(attrs.get("old_password")):
            raise serializers.ValidationError({"old_password": "رمز قبلی صحیح نیست"})
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    token = serializers.CharField(required=True)


class CompanySettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySetting
        fields = ["company_name", "address", "phone", "currency", "theme", "logo"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "is_active"]


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["id", "username", "email", "display_name", "avatar"]
