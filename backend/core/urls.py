from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ChangePasswordView, CompanySettingView, ProjectViewSet, ServiceViewSet, CurrentUserView, EmployeeViewSet, ResetPasswordView, UserProfileView

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"employees", EmployeeViewSet, basename="employee")

urlpatterns = [
    path("users/me/", CurrentUserView.as_view(), name="current-user"),
    path("users/profile/", UserProfileView.as_view(), name="user-profile"),
    path("users/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("users/reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("settings/company/", CompanySettingView.as_view(), name="company-settings"),
    path("", include(router.urls)),
]
