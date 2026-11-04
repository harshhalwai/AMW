from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    invoiceNo = serializers.CharField(source="invoice_no", read_only=True)
    invoiceDate = serializers.DateField(source="invoice_date", read_only=True)
    paymentMethod = serializers.CharField(source="payment_method")
    paymentStatus = serializers.CharField(source="payment_status")
    gstRate = serializers.DecimalField(source="gst_rate", max_digits=5, decimal_places=2)
    subtotal = serializers.DecimalField(source="subtotal", read_only=True, max_digits=10, decimal_places=2)
    gstAmount = serializers.DecimalField(source="gst_amount", read_only=True, max_digits=10, decimal_places=2)
    totalAmount = serializers.DecimalField(source="total_amount", read_only=True, max_digits=10, decimal_places=2)

    
    # Linked Job details
    jobId = serializers.UUIDField(source="job.id", read_only=True)
    jobSheetNo = serializers.CharField(source="job.job_sheet_no", read_only=True)
    customerName = serializers.CharField(source="job.customer.first_name", read_only=True)
    customerMobile = serializers.CharField(source="job.customer.mobile", read_only=True)
    customerEmail = serializers.CharField(source="job.customer.email", read_only=True)
    deviceDetails = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "invoiceNo", "invoiceDate", "paymentMethod", "paymentStatus", "gstRate",
            "subtotal", "gstAmount", "totalAmount", "jobId", "jobSheetNo", "customerName",
            "customerMobile", "customerEmail", "deviceDetails", "notes"
        ]

    def get_deviceDetails(self, obj):
        if obj.job:
            return f"{obj.job.brand} {obj.job.model} ({obj.job.color})"
        return ""
