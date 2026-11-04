from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, ShopProfileView

router = DefaultRouter()
router.register(r"", JobViewSet, basename="job")

urlpatterns = [
    path("shop/", ShopProfileView.as_view(), name="shop_profile"),
    path("", include(router.urls)),
]
