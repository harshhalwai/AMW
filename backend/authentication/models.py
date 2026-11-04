from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("employee", "Employee"),
        ("customer", "Customer"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")
    mobile = models.CharField(max_length=15, unique=True, null=True, blank=True)
    
    # Force email to be unique if provided, but it can be null/blank
    email = models.EmailField(unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class OtpRecord(models.Model):
    PURPOSE_CHOICES = (
        ("login", "Login"),
        ("delivery", "Delivery"),
    )
    mobile = models.CharField(max_length=15)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default="login")
    job_sheet_no = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP {self.code} for {self.mobile} ({self.purpose})"
