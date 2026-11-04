from django.db import models
from django.conf import settings

class EmployeeProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile"
    )
    employee_id = models.CharField(max_length=20, unique=True)
    address = models.TextField(blank=True, null=True)
    joining_date = models.DateField(blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    employee_role = models.CharField(max_length=50, blank=True, null=True)  # e.g., Senior Technician
    suspended = models.BooleanField(default=False)
    photo = models.ImageField(upload_to="employees/", null=True, blank=True)

    def __str__(self):
        return f"{self.employee_id} - {self.user.username}"
