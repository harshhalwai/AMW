from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("employee", "Employee"),
        ("customer", "Customer"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="customer"
    )

    mobile = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True
    )

    email = models.EmailField(
        unique=True,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class OtpRecord(models.Model):

    PURPOSE_CHOICES = (
        ("login", "Login"),
        ("delivery", "Delivery"),
    )

    CHANNEL_CHOICES = (
        ("sms", "SMS"),
        ("email", "Email"),
    )

    # Existing fields - preserved for compatibility
    mobile = models.CharField(
        max_length=15,
        blank=True,
        default=""
    )

    email = models.EmailField(
        blank=True,
        default=""
    )

    # Existing delivery OTP field.
    # Do not use this field for new login OTPs.
    code = models.CharField(
        max_length=6,
        blank=True,
        default=""
    )

    # New authentication fields
    channel = models.CharField(
        max_length=10,
        choices=CHANNEL_CHOICES,
        default="sms"
    )

    code_hash = models.CharField(
        max_length=128,
        blank=True,
        default=""
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True
    )

    attempts = models.PositiveSmallIntegerField(
        default=0
    )

    # Existing fields - preserved
    purpose = models.CharField(
        max_length=20,
        choices=PURPOSE_CHOICES,
        default="login"
    )

    job_sheet_no = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_verified = models.BooleanField(
        default=False
    )

    def __str__(self):
        return (
            f"OTP record for "
            f"{self.email or self.mobile} "
            f"({self.purpose})"
        )
