import random
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import OtpRecord
from .serializers import UserSerializer
from jobs.models import Job
from customers.models import CustomerProfile
from employees.models import EmployeeProfile


User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    # Add custom claims
    refresh["role"] = user.role
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        role = request.data.get("role")
        username_or_id = request.data.get("username", "").strip()
        password = request.data.get("password")
        job_sheet_no = request.data.get("job_sheet_no")
        otp_code = request.data.get("otp_code")

        if not role:
            return Response({"error": "Role is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. OWNER / EMPLOYEE (Password-based login)
        if role in ["owner", "employee"]:
            if not username_or_id or not password:
                return Response({"error": "Username/ID and password are required"}, status=status.HTTP_400_BAD_REQUEST)

            # Find user
            user = None
            if role == "owner":
                # Owner can login by username 'owner', mobile, or email
                user = User.objects.filter(role="owner").filter(
                    models.Q(username__iexact=username_or_id) |
                    models.Q(mobile=username_or_id) |
                    models.Q(email__iexact=username_or_id)
                ).first()
            else:
                # Employee can login by employee_id, username, mobile, email
                # Check EmployeeProfile first
                emp_profile = EmployeeProfile.objects.filter(
                    models.Q(employee_id__iexact=username_or_id) |
                    models.Q(user__username__iexact=username_or_id) |
                    models.Q(user__mobile=username_or_id) |
                    models.Q(user__email__iexact=username_or_id)
                ).first()
                if emp_profile:
                    if emp_profile.suspended:
                        return Response({"error": "Account suspended. Contact owner."}, status=status.HTTP_403_FORBIDDEN)
                    user = emp_profile.user

            if not user or not user.check_password(password):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            tokens = get_tokens_for_user(user)
            return Response({
                "tokens": tokens,
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        # 2. CUSTOMER
        elif role == "customer":
            if not username_or_id:
                return Response({"error": "Mobile or Email is required"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(role="customer").filter(
                models.Q(mobile=username_or_id) | models.Q(email__iexact=username_or_id)
            ).first()

            if not user:
                return Response({"error": "Customer account not found"}, status=status.HTTP_404_NOT_FOUND)

            # Case A: Job Sheet login
            if job_sheet_no:
                job = Job.objects.filter(job_sheet_no__iexact=job_sheet_no, customer=user).first()
                if not job:
                    return Response({"error": "Job sheet not found or does not belong to this customer"}, status=status.HTTP_404_NOT_FOUND)
                
                tokens = get_tokens_for_user(user)
                return Response({
                    "tokens": tokens,
                    "user": UserSerializer(user).data
                }, status=status.HTTP_200_OK)

            # Case B: OTP login
            elif otp_code:
                # Verify OTP
                ten_minutes_ago = timezone.now() - timedelta(minutes=10)
                otp_rec = OtpRecord.objects.filter(
                    mobile=user.mobile,
                    code=otp_code,
                    purpose="login",
                    is_verified=False,
                    created_at__gte=ten_minutes_ago
                ).last()

                if not otp_rec:
                    return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

                otp_rec.is_verified = True
                otp_rec.save()

                tokens = get_tokens_for_user(user)
                return Response({
                    "tokens": tokens,
                    "user": UserSerializer(user).data
                }, status=status.HTTP_200_OK)

            else:
                return Response({"error": "Provide either job sheet number or OTP code to login"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)


class SendOtpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mobile_or_email = request.data.get("mobile", "").strip()
        purpose = request.data.get("purpose", "login")  # login or delivery
        job_sheet_no = request.data.get("job_sheet_no")

        if not mobile_or_email:
            return Response({"error": "Mobile number or Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find customer user
        user = User.objects.filter(role="customer").filter(
            models.Q(mobile=mobile_or_email) | models.Q(email__iexact=mobile_or_email)
        ).first()

        if not user:
            return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user.mobile:
            return Response({"error": "Customer mobile number not set"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate 6 digit code
        code = str(random.randint(100000, 999999))
        
        # Save record
        OtpRecord.objects.create(
            mobile=user.mobile,
            code=code,
            purpose=purpose,
            job_sheet_no=job_sheet_no
        )

        # In production, integrate actual SMS gateway.
        # For our demo / API response, we return the OTP code directly.
        return Response({
            "message": f"OTP sent to {user.mobile}",
            "demo_otp": code  # Return code for testing/development simulation
        }, status=status.HTTP_200_OK)


class VerifyOtpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mobile = request.data.get("mobile", "").strip()
        code = request.data.get("otp_code", "").strip()
        purpose = request.data.get("purpose", "delivery")
        job_sheet_no = request.data.get("job_sheet_no")

        if not mobile or not code:
            return Response({"error": "Mobile and OTP code are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        ten_minutes_ago = timezone.now() - timedelta(minutes=10)
        otp_rec = OtpRecord.objects.filter(
            mobile=mobile,
            code=code,
            purpose=purpose,
            is_verified=False,
            created_at__gte=ten_minutes_ago
        )
        if job_sheet_no:
            otp_rec = otp_rec.filter(job_sheet_no=job_sheet_no)

        otp_record = otp_rec.last()

        if not otp_record:
            return Response({"verified": False, "error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        otp_record.is_verified = True
        otp_record.save()

        return Response({"verified": True, "message": "OTP verified successfully"}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
