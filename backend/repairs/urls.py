from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepairTimelineViewSet

router = DefaultRouter()
router.register(r"timeline", RepairTimelineViewSet, basename="timeline")

urlpatterns = [
    path("", include(router.urls)),
]
