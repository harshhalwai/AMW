from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Job, ShopProfile
from .serializers import JobSerializer, ShopProfileSerializer
from authentication.models import OtpRecord
from repairs.models import RepairTimeline
from notifications.models import Notification

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    queryset = Job.objects.all().order_by("-created_at")

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Job.objects.none()

        # Filtering logic
        if user.role == "customer":
            qs = Job.objects.filter(customer=user)
        else:
            qs = Job.objects.all()

        # Search parameter (q)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                Q(job_sheet_no__icontains=q) |
                Q(brand__icontains=q) |
                Q(model__icontains=q) |
                Q(customer__first_name__icontains=q) |
                Q(customer__mobile__icontains=q) |
                Q(fault__icontains=q)
            )

        # Filters
        repair_status = self.request.query_params.get("repairStatus")
        if repair_status:
            qs = qs.filter(repair_status=repair_status)

        delivery_status = self.request.query_params.get("deliveryStatus")
        if delivery_status:
            qs = qs.filter(delivery_status=delivery_status)

        employee_id = self.request.query_params.get("assignedEmployeeId")
        if employee_id:
            qs = qs.filter(assigned_employee__employee_profile__employee_id=employee_id)

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        job = serializer.save()
        # Log timeline
        RepairTimeline.objects.create(
            job=job,
            status="Pending",
            notes="Job sheet registered.",
            updated_by=self.request.user
        )
        # Create notification
        Notification.objects.create(
            type="job_added",
            title="New Job Registered",
            message=f"Job {job.job_sheet_no} has been registered for {job.customer.first_name}.",
            actor_name=self.request.user.first_name,
            actor_role=self.request.user.role,
            job_sheet_no=job.job_sheet_no
        )

    def perform_update(self, serializer):
        # Cache old status
        old_job = self.get_object()
        old_repair_status = old_job.repair_status
        old_delivery_status = old_job.delivery_status

        job = serializer.save()

        # Audit repair status transition
        if old_repair_status != job.repair_status:
            notes = f"Repair status changed from {old_repair_status} to {job.repair_status}."
            RepairTimeline.objects.create(
                job=job,
                status=job.repair_status,
                notes=notes,
                updated_by=self.request.user
            )
            # Create notification
            Notification.objects.create(
                type="repair_status",
                title=f"Repair {job.repair_status}",
                message=f"Job {job.job_sheet_no} status updated to {job.repair_status}.",
                actor_name=self.request.user.first_name,
                actor_role=self.request.user.role,
                job_sheet_no=job.job_sheet_no
            )

        # Audit delivery status transition
        if old_delivery_status != job.delivery_status:
            # Create notification
            Notification.objects.create(
                type="delivery_status",
                title=f"Delivery {job.delivery_status}",
                message=f"Job {job.job_sheet_no} delivery is now {job.delivery_status}.",
                actor_name=self.request.user.first_name,
                actor_role=self.request.user.role,
                job_sheet_no=job.job_sheet_no
            )

    @action(detail=True, methods=["post"], url_path="rate")
    def submit_rating(self, request, pk=None):
        job = self.get_object()
        stars = request.data.get("stars")
        comment = request.data.get("comment", "")

        if stars is None:
            return Response({"error": "Stars rating is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stars = int(stars)
            if stars < 1 or stars > 5:
                raise ValueError
        except ValueError:
            return Response({"error": "Stars must be an integer between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)

        job.rating_stars = stars
        job.rating_comment = comment
        job.save()

        Notification.objects.create(
            type="rating_submitted",
            title="Customer Review",
            message=f"Customer gave {stars} stars to Job {job.job_sheet_no}.",
            actor_name=job.customer.first_name,
            actor_role="customer",
            job_sheet_no=job.job_sheet_no
        )

        return Response({"message": "Rating submitted successfully"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="deliver")
    def verify_delivery_otp(self, request, pk=None):
        job = self.get_object()
        otp_code = request.data.get("otp_code")

        if not otp_code:
            return Response({"error": "OTP code is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check last unverified OTP for delivery
        ten_minutes_ago = timezone.now() - timezone.timedelta(minutes=10)
        otp_rec = OtpRecord.objects.filter(
            mobile=job.customer.mobile,
            code=otp_code,
            purpose="delivery",
            job_sheet_no=job.job_sheet_no,
            is_verified=False,
            created_at__gte=ten_minutes_ago
        ).last()

        if not otp_rec:
            return Response({"error": "Invalid or expired OTP code"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP verified
        otp_rec.is_verified = True
        otp_rec.save()

        # Update job status
        job.delivery_status = "Delivered"
        job.delivery_date = timezone.now().date()
        job.otp_verified_at = timezone.now()
        job.delivered_by = request.user
        job.owner_approved = True
        job.save()

        # Create timeline log
        RepairTimeline.objects.create(
            job=job,
            status="Delivered",
            notes=f"Device delivered to customer via OTP verification. Logged by {request.user.first_name}.",
            updated_by=request.user
        )

        # Create notification
        Notification.objects.create(
            type="delivered",
            title="Device Delivered",
            message=f"Job {job.job_sheet_no} has been successfully verified & delivered.",
            actor_name=request.user.first_name,
            actor_role=request.user.role,
            job_sheet_no=job.job_sheet_no
        )

        return Response({
            "message": "OTP verified successfully. Job status updated to Delivered.",
            "job": JobSerializer(job).data
        }, status=status.HTTP_200_OK)


class ShopProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = ShopProfile.objects.first()
        if not profile:
            # Create a default
            profile = ShopProfile.objects.create(
                name="Amit Mobile World (AMW)",
                address="Shop 12, Main Market, Sector 5, New Delhi - 110001",
                contact="+91 98100 12345",
                email="support@amitmobileworld.in",
                gstin="07AAACA1234F1Z5"
            )
        serializer = ShopProfileSerializer(profile)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "owner":
            return Response({"error": "Only the owner can update shop profile"}, status=status.HTTP_403_FORBIDDEN)
        
        profile = ShopProfile.objects.first()
        if not profile:
            profile = ShopProfile()

        serializer = ShopProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
