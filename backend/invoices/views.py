import re
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Invoice
from .serializers import InvoiceSerializer
from jobs.models import Job
from django.utils import timezone

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all().order_by("-invoice_date")
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "customer":
            return Invoice.objects.filter(job__customer=user).order_by("-invoice_date")
        return Invoice.objects.all().order_by("-invoice_date")

    def create(self, request, *args, **kwargs):
        job_id = request.data.get("jobId")
        if not job_id:
            return Response({"error": "jobId is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(pk=job_id)
        except (Job.DoesNotExist, ValueError):
            return Response({"error": "Valid Job not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if invoice already exists
        existing_invoice = Invoice.objects.filter(job=job).first()
        if existing_invoice:
            serializer = self.get_serializer(existing_invoice)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Generate invoice number: INV-YYYY-XXXX
        year = timezone.now().year
        last_invoice = Invoice.objects.filter(invoice_no__contains=f"INV-{year}-").order_by("-invoice_no").first()
        if last_invoice:
            match = re.search(r"\d+$", last_invoice.invoice_no)
            num = int(match.group() if match else 1000)
            next_no = f"INV-{year}-{num + 1}"
        else:
            next_no = f"INV-{year}-1001"

        # Create Invoice
        invoice = Invoice.objects.create(
            invoice_no=next_no,
            job=job,
            payment_method=request.data.get("paymentMethod", "Cash"),
            payment_status=request.data.get("paymentStatus", "Unpaid"),
            gst_rate=request.data.get("gstRate", 18.00),
            notes=request.data.get("notes", "")
        )

        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
