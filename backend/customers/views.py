from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import CustomerProfile, Message

from .serializers import CustomerSerializer, MessageSerializer

User = get_user_model()

class IsOwnerOrEmployee(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["owner", "employee"]

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    queryset = User.objects.filter(role="customer")

    def get_permissions(self):
        if self.action in ["list", "create", "destroy"]:
            return [IsOwnerOrEmployee()]
        # Allow a customer to retrieve or update their own profile
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["owner", "employee"]:
            return User.objects.filter(role="customer")
        # Customers can only see their own user record
        return User.objects.filter(id=user.id)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    queryset = Message.objects.all().order_by("-created_at")
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["owner", "employee"]:
            # Optionally filter by customer query parameter if provided
            customer_id = self.request.query_params.get("customer_id")
            if customer_id:
                return Message.objects.filter(customer__id=customer_id).order_by("-created_at")
            return Message.objects.all().order_by("-created_at")
        # Customer can only see their own messages
        return Message.objects.filter(customer=user).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        
        # If the sender is employee/owner, they must specify the customer ID in the request body.
        # If the sender is a customer, we automatically set customer to self.
        if user.role == "customer":
            serializer.save(
                customer=user,
                sent_by=user,
                sent_by_role="customer"
            )
        else:
            customer_pk = self.request.data.get("customer")
            try:
                customer_user = User.objects.get(pk=customer_pk, role="customer")
            except User.DoesNotExist:
                raise serializers.ValidationError({"customer": "A valid customer user PK is required."})
            
            serializer.save(
                customer=customer_user,
                sent_by=user,
                sent_by_role=user.role
            )
