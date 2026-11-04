import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomerProfile, Message

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.first_name", read_only=True)
    customer_mobile = serializers.CharField(source="customer.mobile", read_only=True)
    customer_id = serializers.CharField(source="customer.customer_profile.customer_id", read_only=True)
    sent_by_name = serializers.CharField(source="sent_by.first_name", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "customer", "customer_id", "customer_name", "customer_mobile", "subject", "body", "sent_by", "sent_by_name", "sent_by_role", "read", "created_at"]
        read_only_fields = ["sent_by", "sent_by_role", "read", "created_at"]

class CustomerSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="customer_profile.customer_id", read_only=True)
    name = serializers.CharField(source="first_name")
    mobile = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ["id", "pk", "name", "mobile", "email"]

    def create(self, validated_data):
        name = validated_data.pop("first_name", "")
        mobile = validated_data.get("mobile")
        email = validated_data.get("email")

        # Generate a customer username
        last_profile = CustomerProfile.objects.all().order_by("-customer_id").first()
        if last_profile:
            match = re.search(r"\d+", last_profile.customer_id)
            num = int(match.group() if match else 0)
            next_id = f"CUS{str(num + 1).zfill(3)}"
        else:
            next_id = "CUS001"

        # Create user
        user = User.objects.create(
            username=next_id,
            first_name=name,
            mobile=mobile,
            email=email if email else None,
            role="customer"
        )
        user.set_password("cust123")  # Default password
        user.save()

        # Create profile
        CustomerProfile.objects.create(user=user, customer_id=next_id)
        return user

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.mobile = validated_data.get("mobile", instance.mobile)
        instance.email = validated_data.get("email", instance.email)
        instance.save()
        return instance
