from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import RepairTimeline
from .serializers import RepairTimelineSerializer
from jobs.models import Job

class RepairTimelineViewSet(viewsets.ModelViewSet):
    serializer_class = RepairTimelineSerializer
    queryset = RepairTimeline.objects.all().order_by("created_at")
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = RepairTimeline.objects.all()
        job_id = self.request.query_params.get("job_id")
        job_sheet_no = self.request.query_params.get("job_sheet_no")

        if job_id:
            qs = qs.filter(job__id=job_id)
        elif job_sheet_no:
            qs = qs.filter(job__job_sheet_no__iexact=job_sheet_no)
        else:
            # Customers can only view their own jobs' timelines
            user = self.request.user
            if user.role == "customer":
                qs = qs.filter(job__customer=user)

        return qs.order_by("created_at")

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
