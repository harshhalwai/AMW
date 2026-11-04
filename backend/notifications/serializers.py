from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    actorName = serializers.CharField(source="actor_name", required=False, allow_blank=True, allow_null=True)
    actorRole = serializers.CharField(source="actor_role", required=False, allow_blank=True, allow_null=True)
    jobSheetNo = serializers.CharField(source="job_sheet_no", required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Notification
        fields = ["id", "type", "title", "message", "actorName", "actorRole", "jobSheetNo", "read", "createdAt"]
        read_only_fields = ["id", "createdAt"]
