from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, F
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Invoice, InvoiceItem
from .serializers import (
    InvoiceSerializer,
    InvoiceCreateSerializer,
    InvoiceUpdateSerializer,
    InvoiceItemSerializer,
)
from core.permissions import IsAdminOrReadOnly


class FinanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()

        invoices = Invoice.objects.all()
        today_invoices = invoices.filter(created_at__date=today)

        total_sales = sum(inv.total_amount for inv in invoices)
        today_sales = sum(inv.total_amount for inv in today_invoices)

        return Response({
            "today_income": today_sales,
            "invoice_count": invoices.count(),
            "total_sales": total_sales,
        })


class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return InvoiceCreateSerializer
        return InvoiceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            invoice = serializer.save()
        read_serializer = InvoiceSerializer(invoice)
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class InvoiceRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all()
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    lookup_field = "pk"

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return InvoiceUpdateSerializer
        return InvoiceSerializer
