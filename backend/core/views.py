from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.conf import settings

from .serializers import (
    UserListSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    CompanySettingSerializer,
    ProjectSerializer,
    ServiceSerializer,
    EmployeeSerializer,
    CurrentUserSerializer,
    ResetPasswordSerializer,
    UserProfileSerializer,
)
from .models import Project, CompanySetting, Service, Employee, UserProfile
from .permissions import IsAdminOrReadOnly


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create"]:
            return UserCreateSerializer
        if self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserListSerializer


class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "رمز عبور با موفقیت تغییر کرد"}, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    permission_classes = []
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        admin_token = getattr(settings, "RESET_PASSWORD_TOKEN", "")
        if not admin_token or token != admin_token:
            return Response({"detail": "کد بازیابی نادرست است."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username=serializer.validated_data["username"])
        except User.DoesNotExist:
            return Response({"detail": "کاربر یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "رمز عبور با موفقیت بازیابی شد."}, status=status.HTTP_200_OK)


class CurrentUserView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CurrentUserSerializer

    def get(self, request):
        return Response(self.serializer_class(request.user).data)


class UserProfileView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(self.serializer_class(profile).data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CompanySettingView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = CompanySettingSerializer

    def get(self, request):
        settings_obj, _ = CompanySetting.objects.get_or_create(id=1)
        return Response(self.serializer_class(settings_obj).data)

    def put(self, request):
        settings_obj, _ = CompanySetting.objects.get_or_create(id=1)
        serializer = self.get_serializer(settings_obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        settings_obj, _ = CompanySetting.objects.get_or_create(id=1)
        serializer = self.get_serializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("-created_at")
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-created_at")
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
