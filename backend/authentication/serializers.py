from rest_framework import serializers
from django.contrib.auth import get_user_model
from employees.models import EmployeeProfile
from customers.models import CustomerProfile

User = get_user_model()

class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = ["employee_id", "address", "joining_date", "salary", "employee_role", "suspended", "photo"]

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ["customer_id"]

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    employee_profile = EmployeeProfileSerializer(read_only=True)
    customer_profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "mobile", "role", "name", "employee_profile", "customer_profile"]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username
