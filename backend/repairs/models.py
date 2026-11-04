from django.db import models
from django.conf import settings
from jobs.models import Job

class RepairTimeline(models.Model):
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="timeline"
    )
    status = models.CharField(max_length=50)
    notes = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to="repairs/timeline/", null=True, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Timeline for {self.job.job_sheet_no} - {self.status} at {self.created_at}"
