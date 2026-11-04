from django.db import models
from jobs.models import Job

class Invoice(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ("Unpaid", "Unpaid"),
        ("Paid", "Paid"),
    )

    invoice_no = models.CharField(max_length=50, unique=True)
    job = models.OneToOneField(
        Job,
        on_delete=models.CASCADE,
        related_name="invoice"
    )
    invoice_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, default="Cash")  # Cash, UPI, Card
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="Unpaid")
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Automatically compute totals based on job amount if they are 0
        if self.subtotal == 0 and self.job:
            self.subtotal = self.job.amount
        
        # Calculate GST amount and total
        self.gst_amount = (self.subtotal * self.gst_rate) / 100
        self.total_amount = self.subtotal + self.gst_amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_no} for Job {self.job.job_sheet_no}"
