from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import EmployeeProfile
from .serializers import EmployeeSerializer

User = get_user_model()

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "owner"

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    queryset = User.objects.filter(role="employee").order_by("employee_profile__employee_id")
    permission_classes = [IsOwner]

    @action(detail=True, methods=["post"], url_path="suspend")
    def suspend_employee(self, request, pk=None):
        employee_user = self.get_object()
        profile, created = EmployeeProfile.objects.get_or_create(user=employee_user)
        profile.suspended = True
        profile.save()
        return Response({"message": f"Employee {employee_user.first_name} suspended successfully"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="unsuspend")
    def unsuspend_employee(self, request, pk=None):
        employee_user = self.get_object()
        profile, created = EmployeeProfile.objects.get_or_create(user=employee_user)
        profile.suspended = False
        profile.save()
        return Response({"message": f"Employee {employee_user.first_name} activated successfully"}, status=status.HTTP_200_OK)
