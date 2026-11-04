from rest_framework import serializers
from .models import RepairTimeline

class RepairTimelineSerializer(serializers.ModelSerializer):
    updatedByName = serializers.CharField(source="updated_by.first_name", read_only=True)
    updatedByRole = serializers.CharField(source="updated_by.role", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = RepairTimeline
        fields = ["id", "job", "status", "notes", "photo", "updatedByName", "updatedByRole", "createdAt"]
        read_only_fields = ["id", "createdAt"]
