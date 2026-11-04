from django.db import models
from django.conf import settings

class Notification(models.Model):
    type = models.CharField(max_length=50)  # e.g., 'job_added', 'repair_completed'
    title = models.CharField(max_length=255)
    message = models.TextField()
    actor_name = models.CharField(max_length=100, blank=True, null=True)
    actor_role = models.CharField(max_length=50, blank=True, null=True)
    job_sheet_no = models.CharField(max_length=50, blank=True, null=True)
    
    # Recipient can be null for system-wide alerts, or linked to a specific user
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - Read: {self.read}"
