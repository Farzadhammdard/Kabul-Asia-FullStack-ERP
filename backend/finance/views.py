from datetime import date
from django.utils import timezone
from django.db.models import Sum, F
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from invoices.models import InvoiceItem
from .models import Expense
from .serializers import ExpenseSerializer
from core.permissions import IsAdminOrReadOnly
from django.http import HttpResponse


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by("-date", "-id")
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        return qs


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def finance_report(request):
    start = request.query_params.get("start")
    end = request.query_params.get("end")
    report = _compute_report(start, end)
    return Response(report)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def finance_report_pdf(request):
    try:
        from weasyprint import HTML
    except Exception:
        return Response(
            {"detail": "کتابخانه‌های سیستمی WeasyPrint نصب نیستند. نصب کامل WeasyPrint لازم است."},
            status=500,
        )
    start = request.query_params.get("start")
    end = request.query_params.get("end")
    report = _compute_report(start, end)

    date_range = "همه تاریخ‌ها"
    if start and end:
        date_range = f"{start} تا {end}"
    elif start:
        date_range = f"از {start}"
    elif end:
        date_range = f"تا {end}"

    html = f"""
    <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8"/>
        <style>
          body {{ font-family: sans-serif; background: #fff; color: #111; }}
          .container {{ padding: 24px; }}
          h1 {{ margin: 0 0 8px 0; }}
          .meta {{ color: #666; font-size: 12px; margin-bottom: 16px; }}
          .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }}
          .card {{ border: 1px solid #ddd; padding: 12px; border-radius: 8px; }}
          table {{ width: 100%; border-collapse: collapse; }}
          th, td {{ border: 1px solid #eee; padding: 8px; text-align: right; font-size: 12px; }}
          th {{ background: #f7f7f7; }}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>گزارش مالی</h1>
          <div class="meta">بازه: {date_range}</div>

          <div class="grid">
            <div class="card">درآمد کل: {report["total_sales"]}</div>
            <div class="card">هزینه‌ها: {report["total_expenses"]}</div>
            <div class="card">سود خالص: {report["profit"]}</div>
          </div>

          <h3>محصولات پرفروش</h3>
          <table>
            <thead>
              <tr>
                <th>محصول</th>
                <th>تعداد</th>
              </tr>
            </thead>
            <tbody>
              {''.join([f"<tr><td>{p['product__name']}</td><td>{p['total_qty']}</td></tr>" for p in report["top_products"]])}
            </tbody>
          </table>
        </div>
      </body>
    </html>
    """

    pdf = HTML(string=html).write_pdf()
    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = "attachment; filename=finance-report.pdf"
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def finance_monthly(request):
    today = timezone.now().date()
    start_month = date(today.year, today.month, 1)

    income_by_month = {
        item["month"].date(): item["total"]
        for item in (
            InvoiceItem.objects
            .annotate(month=TruncMonth("invoice__created_at"))
            .values("month")
            .annotate(total=Sum(F("quantity") * F("price")))
        )
        if item["month"]
    }

    expense_by_month = {
        item["month"].date(): item["total"]
        for item in (
            Expense.objects
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
        )
        if item["month"]
    }

    def month_shift(dt, months):
        year = dt.year + (dt.month - 1 + months) // 12
        month = (dt.month - 1 + months) % 12 + 1
        return date(year, month, 1)

    months = [month_shift(start_month, -i) for i in range(11, -1, -1)]
    payload = []
    for m in months:
        payload.append({
            "label": f"{m.year}/{m.month:02d}",
            "income": income_by_month.get(m, 0) or 0,
            "expense": expense_by_month.get(m, 0) or 0,
        })

    return Response(payload)


def _compute_report(start, end):
    items = InvoiceItem.objects.all()
    expenses_qs = Expense.objects.all()

    if start:
        items = items.filter(invoice__created_at__date__gte=start)
        expenses_qs = expenses_qs.filter(date__gte=start)
    if end:
        items = items.filter(invoice__created_at__date__lte=end)
        expenses_qs = expenses_qs.filter(date__lte=end)

    total_sales = items.aggregate(
        total=Sum(F("quantity") * F("price"))
    )["total"] or 0

    total_invoices = items.values("invoice").distinct().count()
    total_expenses = expenses_qs.aggregate(total=Sum("amount"))["total"] or 0
    profit = total_sales - total_expenses

    top_products = (
        items
        .values("product__name")
        .annotate(total_qty=Sum("quantity"))
        .order_by("-total_qty")[:5]
    )

    return {
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "profit": profit,
        "total_invoices": total_invoices,
        "top_products": list(top_products),
    }
