from django.contrib import admin
from .models import Project, Service, CompanySetting

admin.site.register(Project)
admin.site.register(Service)
admin.site.register(CompanySetting)
