from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.models import User

from .serializers import (
    UserListSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    CompanySettingSerializer,
    ProjectSerializer,
    ServiceSerializer,
)
from .models import Project, CompanySetting, Service
from .permissions import IsAdminOrReadOnly


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsAuthenticated, IsAdminUser]

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


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("-created_at")
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
