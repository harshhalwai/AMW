from django.db import models
from django.conf import settings

class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile"
    )
    customer_id = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.customer_id} - {self.user.username}"

class Message(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    subject = models.CharField(max_length=255)
    body = models.TextField()
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    sent_by_role = models.CharField(max_length=20)  # owner, employee, customer
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sent_by.username} - {self.subject}"
