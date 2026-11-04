from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, MessageViewSet

router = DefaultRouter()
router.register(r"messages", MessageViewSet, basename="message")
router.register(r"", CustomerViewSet, basename="customer")

urlpatterns = [
    path("", include(router.urls)),
]
