import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Job, ShopProfile
from customers.models import CustomerProfile
from employees.models import EmployeeProfile

User = get_user_model()

class ShopProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopProfile
        fields = ["name", "address", "contact", "logo", "email", "gstin"]


class JobSerializer(serializers.ModelSerializer):
    # Map read-only fields from related models
    id = serializers.UUIDField(read_only=True)
    jobSheetNo = serializers.CharField(source="job_sheet_no", read_only=True)
    jobDate = serializers.DateField(source="job_date", read_only=True)
    
    customerId = serializers.SerializerMethodField(read_only=True)
    customerName = serializers.CharField(source="customer.first_name", required=False)
    customerMobile = serializers.CharField(source="customer.mobile", required=False)
    customerEmail = serializers.CharField(source="customer.email", required=False, allow_blank=True, allow_null=True)
    
    mobileType = serializers.CharField(source="mobile_type")
    passwordType = serializers.CharField(source="password_type")
    passwordValue = serializers.CharField(source="password_value", required=False, allow_blank=True)
    featuresInstalled = serializers.CharField(source="features_installed", required=False, allow_blank=True, allow_null=True)
    
    repairStatus = serializers.CharField(source="repair_status", default="Pending")
    deliveryStatus = serializers.CharField(source="delivery_status", default="Pending")
    deliveryDate = serializers.DateField(source="delivery_date", required=False, allow_null=True)
    
    assignedEmployeeId = serializers.SerializerMethodField(read_only=True)
    assignedEmployeePk = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    completedAt = serializers.DateTimeField(source="completed_at", read_only=True)
    lastUpdatedBy = serializers.SerializerMethodField(read_only=True)
    lastUpdatedAt = serializers.DateTimeField(source="last_updated_at", read_only=True)

    # Nested custom structures matching frontend store.ts
    deliveryLog = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "jobSheetNo", "jobDate", "customerId", "customerName", "customerMobile", 
            "customerEmail", "brand", "model", "color", "mobileType", "picture", 
            "passwordType", "passwordValue", "fault", "description", "featuresInstalled", 
            "amount", "repairStatus", "deliveryStatus", "deliveryDate", "assignedEmployeeId", 
            "assignedEmployeePk", "createdAt", "completedAt", "lastUpdatedBy", "lastUpdatedAt",
            "deliveryLog", "rating"
        ]

    def get_customerId(self, obj):
        try:
            return obj.customer.customer_profile.customer_id
        except AttributeError:
            return None

    def get_assignedEmployeeId(self, obj):
        if obj.assigned_employee:
            try:
                return obj.assigned_employee.employee_profile.employee_id
            except AttributeError:
                return None
        return None

    def get_lastUpdatedBy(self, obj):
        return obj.last_updated_by.first_name if obj.last_updated_by else None

    def get_deliveryLog(self, obj):
        if obj.delivery_status == "Delivered" or obj.otp_verified_at:
            return {
                "otpVerifiedAt": obj.otp_verified_at.isoformat() if obj.otp_verified_at else None,
                "deliveredBy": obj.delivered_by.first_name if obj.delivered_by else "",
                "ownerApproved": obj.owner_approved
            }
        return None

    def get_rating(self, obj):
        if obj.rating_stars is not None:
            return {
                "stars": obj.rating_stars,
                "comment": obj.rating_comment or "",
                "employeeId": self.get_assignedEmployeeId(obj)
            }
        return None

    def create(self, validated_data):
        # Extract customer info
        customer_name = self.initial_data.get("customerName")
        customer_mobile = self.initial_data.get("customerMobile")
        customer_email = self.initial_data.get("customerEmail")

        if not customer_mobile:
            raise serializers.ValidationError({"customerMobile": "Customer mobile is required."})

        # 1. Create or Find Customer User
        user = User.objects.filter(role="customer", mobile=customer_mobile).first()
        if not user:
            # Generate next CUS ID
            last_profile = CustomerProfile.objects.all().order_by("-customer_id").first()
            if last_profile:
                match = re.search(r"\d+", last_profile.customer_id)
                num = int(match.group() if match else 0)
                next_id = f"CUS{str(num + 1).zfill(3)}"
            else:
                next_id = "CUS001"

            user = User.objects.create(
                username=next_id,
                first_name=customer_name or "Walk-in Customer",
                mobile=customer_mobile,
                email=customer_email if customer_email else None,
                role="customer"
            )
            user.set_password("cust123")  # Default password
            user.save()
            CustomerProfile.objects.create(user=user, customer_id=next_id)

        validated_data["customer"] = user

        # 2. Assign employee if provided
        emp_pk = validated_data.pop("assignedEmployeePk", None)
        if emp_pk:
            try:
                emp = User.objects.get(pk=emp_pk, role="employee")
                validated_data["assigned_employee"] = emp
            except User.DoesNotExist:
                pass

        # 3. Generate Job Sheet No: AMW-1001, etc.
        last_job = Job.objects.all().order_by("-created_at").first()
        if last_job:
            match = re.search(r"\d+", last_job.job_sheet_no)
            num = int(match.group() if match else 1000)
            next_sheet = f"AMW-{num + 1}"
        else:
            next_sheet = "AMW-1001"

        validated_data["job_sheet_no"] = next_sheet

        # Set updater
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["last_updated_by"] = request.user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle employee change
        if "assignedEmployeePk" in self.initial_data:
            emp_pk = self.initial_data.get("assignedEmployeePk")
            if emp_pk:
                try:
                    emp = User.objects.get(pk=emp_pk, role="employee")
                    instance.assigned_employee = emp
                except User.DoesNotExist:
                    instance.assigned_employee = None
            else:
                instance.assigned_employee = None

        # Check status transitions
        old_repair_status = instance.repair_status
        new_repair_status = validated_data.get("repair_status", old_repair_status)

        if old_repair_status != "Completed" and new_repair_status == "Completed":
            instance.completed_at = timezone.now()
            
        # Update last updater
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            instance.last_updated_by = request.user

        return super().update(instance, validated_data)
