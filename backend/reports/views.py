from django.db.models import Sum, Count
from rest_framework import permissions, status, views
from rest_framework.response import Response
from django.db.models import Q
from jobs.models import Job
from jobs.serializers import JobSerializer
from django.utils.dateparse import parse_date

class ReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "owner":
            return Response({"error": "Only the owner has access to reports"}, status=status.HTTP_403_FORBIDDEN)

        qs = Job.objects.all()

        # Date range filters
        start_date_str = request.query_params.get("startDate")
        end_date_str = request.query_params.get("endDate")
        
        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                qs = qs.filter(created_at__date__gte=start_date)

        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                qs = qs.filter(created_at__date__lte=end_date)

        # Other filters
        repair_status = request.query_params.get("repairStatus")
        if repair_status:
            qs = qs.filter(repair_status=repair_status)

        delivery_status = request.query_params.get("deliveryStatus")
        if delivery_status:
            qs = qs.filter(delivery_status=delivery_status)

        employee_pk = request.query_params.get("employeePk")
        if employee_pk:
            qs = qs.filter(assigned_employee__id=employee_pk)

        # Calculations
        metrics = qs.aggregate(
            total_jobs=Count("id"),
            total_amount=Sum("amount"),
            pending_count=Count("id", filter=Q(repair_status="Pending")),
            in_progress_count=Count("id", filter=Q(repair_status="In Progress")),
            completed_count=Count("id", filter=Q(repair_status="Completed")),
            delivered_count=Count("id", filter=Q(delivery_status="Delivered"))
        )

        serializer = JobSerializer(qs, many=True, context={"request": request})

        return Response({
            "summary": {
                "totalJobs": metrics["total_jobs"] or 0,
                "totalAmount": float(metrics["total_amount"] or 0.0),
                "pendingRepairs": metrics["pending_count"] or 0,
                "inProgressRepairs": metrics["in_progress_count"] or 0,
                "completedRepairs": metrics["completed_count"] or 0,
                "deliveredRepairs": metrics["delivered_count"] or 0
            },
            "jobs": serializer.data
        }, status=status.HTTP_200_OK)
