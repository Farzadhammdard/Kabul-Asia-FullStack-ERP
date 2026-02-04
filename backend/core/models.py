from django.db import models

class Project(models.Model):
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to="projects/", blank=True, null=True)
    video = models.FileField(upload_to="projects/videos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Service(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CompanySetting(models.Model):
    company_name = models.CharField(max_length=200, default="کابل آسیا")
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    currency = models.CharField(max_length=10, default="AFN")
    theme = models.CharField(max_length=20, default="dark")
    logo = models.ImageField(upload_to="company/", blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)


class Invoice(models.Model):
    customer_name = models.CharField(max_length=200)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.customer_name
