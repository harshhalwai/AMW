import uuid
from django.db import models
from django.conf import settings

class Job(models.Model):
    MOBILE_TYPE_CHOICES = (
        ("Android", "Android"),
        ("Keypad", "Keypad"),
        ("iPhone", "iPhone"),
    )
    PASSWORD_TYPE_CHOICES = (
        ("PIN", "PIN"),
        ("Password", "Password"),
        ("Pattern", "Pattern"),
    )
    REPAIR_STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    )
    DELIVERY_STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Ready for Delivery", "Ready for Delivery"),
        ("Delivered", "Delivered"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_sheet_no = models.CharField(max_length=50, unique=True)
    job_date = models.DateField(auto_now_add=True)
    
    # Customer relationship
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_jobs"
    )

    # Device Details
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    mobile_type = models.CharField(max_length=20, choices=MOBILE_TYPE_CHOICES, default="Android")
    picture = models.ImageField(upload_to="repairs/", null=True, blank=True)
    
    # Lock details
    password_type = models.CharField(max_length=20, choices=PASSWORD_TYPE_CHOICES, default="PIN")
    password_value = models.CharField(max_length=100, blank=True)

    # Fault details
    fault = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    features_installed = models.TextField(blank=True, null=True)  # comma separated or json
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Statuses
    repair_status = models.CharField(max_length=20, choices=REPAIR_STATUS_CHOICES, default="Pending")
    delivery_status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default="Pending")
    delivery_date = models.DateField(null=True, blank=True)

    # Assignment and Updates
    assigned_employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_jobs"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_jobs"
    )
    last_updated_at = models.DateTimeField(auto_now=True)

    # Delivery & Verification
    otp_verified_at = models.DateTimeField(null=True, blank=True)
    delivered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivered_jobs_log"
    )
    owner_approved = models.BooleanField(default=False)

    # Customer Feedback & Ratings
    rating_stars = models.IntegerField(null=True, blank=True)
    rating_comment = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.job_sheet_no} - {self.brand} {self.model} ({self.repair_status})"


class ShopProfile(models.Model):
    name = models.CharField(max_length=100, default="Amit Mobile World (AMW)")
    address = models.TextField(blank=True, null=True)
    contact = models.CharField(max_length=20, blank=True, null=True)
    logo = models.ImageField(upload_to="shop/", null=True, blank=True)
    email = models.EmailField(blank=True, null=True)
    gstin = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name

