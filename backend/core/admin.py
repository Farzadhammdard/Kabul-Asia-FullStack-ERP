from django.contrib import admin
from .models import Project, Service, CompanySetting, Employee

admin.site.register(Project)
admin.site.register(Service)
admin.site.register(CompanySetting)
admin.site.register(Employee)
