from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all().order_by("-created_at")
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "customer":
            return Notification.objects.filter(recipient=user).order_by("-created_at")
        
        # Owners and employees see notifications addressed to them specifically OR general notifications (recipient is Null)
        return Notification.objects.filter(
            recipient__isnull=True
        ) | Notification.objects.filter(recipient=user).order_by("-created_at")

    @action(detail=True, methods=["post"], url_path="read")
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.read = True
        notif.save()
        return Response({"status": "success", "message": "Notification marked as read"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        qs = self.get_queryset()
        qs.update(read=True)
        return Response({"status": "success", "message": "All notifications marked as read"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="clear-all")
    def clear_all(self, request):
        qs = self.get_queryset()
        qs.delete()
        return Response({"status": "success", "message": "All notifications cleared"}, status=status.HTTP_200_OK)
