from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import finance_report, finance_monthly, finance_report_pdf, ExpenseViewSet

router = DefaultRouter()
router.register(r"expenses", ExpenseViewSet, basename="expense")

urlpatterns = [
    path("finance/report/", finance_report, name="finance-report"),
    path("finance/report/pdf/", finance_report_pdf, name="finance-report-pdf"),
    path("finance/monthly/", finance_monthly, name="finance-monthly"),
    path("finance/", include(router.urls)),
]
