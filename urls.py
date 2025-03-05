from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # админка будет доступна по /admin/
    path('tests/', include('tests.urls')),  # URLs для приложения tests
] 