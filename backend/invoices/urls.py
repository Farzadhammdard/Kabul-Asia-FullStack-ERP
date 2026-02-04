from django.urls import path
from .views import (
    FinanceSummaryView,
    InvoiceListCreateView,
    InvoiceRetrieveUpdateDestroyView,
)

urlpatterns = [
    path("invoices/", InvoiceListCreateView.as_view(), name="invoice-list-create"),
    path("invoices/<int:pk>/", InvoiceRetrieveUpdateDestroyView.as_view(), name="invoice-detail"),
    path("invoices/summary/", FinanceSummaryView.as_view(), name="invoice-summary"),
]
