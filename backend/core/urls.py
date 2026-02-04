from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ChangePasswordView, CompanySettingView, ProjectViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"services", ServiceViewSet, basename="service")

urlpatterns = [
    path("", include(router.urls)),
    path("users/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("settings/company/", CompanySettingView.as_view(), name="company-settings"),
]
