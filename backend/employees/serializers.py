import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EmployeeProfile

User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(source="employee_profile.employee_id", read_only=True)
    address = serializers.CharField(source="employee_profile.address", required=False, allow_blank=True, allow_null=True)
    joining_date = serializers.DateField(source="employee_profile.joining_date", required=False, allow_null=True)
    salary = serializers.DecimalField(source="employee_profile.salary", max_digits=10, decimal_places=2, default=0.00)
    employee_role = serializers.CharField(source="employee_profile.employee_role", required=False, allow_blank=True, allow_null=True)
    suspended = serializers.BooleanField(source="employee_profile.suspended", read_only=True)
    photo = serializers.ImageField(source="employee_profile.photo", required=False, allow_null=True)
    name = serializers.CharField(source="first_name")
    mobile = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["pk", "employee_id", "username", "name", "mobile", "email", "address", "joining_date", "salary", "employee_role", "suspended", "photo", "password"]

    def create(self, validated_data):
        profile_data = validated_data.pop("employee_profile", {})
        name = validated_data.pop("first_name", "")
        password = validated_data.pop("password", "emp123")
        
        # Generate new EMP ID
        last_profile = EmployeeProfile.objects.all().order_by("-employee_id").first()
        if last_profile:
            match = re.search(r"\d+", last_profile.employee_id)
            num = int(match.group() if match else 0)
            next_id = f"EMP{str(num + 1).zfill(3)}"
        else:
            next_id = "EMP001"

        # Create user
        user = User.objects.create(
            username=validated_data.get("username") or next_id,
            first_name=name,
            mobile=validated_data.get("mobile"),
            email=validated_data.get("email"),
            role="employee"
        )
        user.set_password(password)
        user.save()

        # Create employee profile
        EmployeeProfile.objects.create(
            user=user,
            employee_id=next_id,
            address=profile_data.get("address"),
            joining_date=profile_data.get("joining_date"),
            salary=profile_data.get("salary", 0.00),
            employee_role=profile_data.get("employee_role"),
            photo=profile_data.get("photo")
        )
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("employee_profile", {})
        password = validated_data.pop("password", None)
        
        # Update user fields
        instance.username = validated_data.get("username", instance.username)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.mobile = validated_data.get("mobile", instance.mobile)
        instance.email = validated_data.get("email", instance.email)
        if password:
            instance.set_password(password)
        instance.save()

        # Update profile fields
        profile, created = EmployeeProfile.objects.get_or_create(user=instance)
        profile.address = profile_data.get("address", profile.address)
        profile.joining_date = profile_data.get("joining_date", profile.joining_date)
        profile.salary = profile_data.get("salary", profile.salary)
        profile.employee_role = profile_data.get("employee_role", profile.employee_role)
        if "photo" in profile_data:
            profile.photo = profile_data.get("photo")
        profile.save()

        return instance
