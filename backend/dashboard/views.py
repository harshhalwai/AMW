from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import permissions, status, views
from rest_framework.response import Response
from datetime import timedelta
from jobs.models import Job
from invoices.models import Invoice
from employees.models import EmployeeProfile
from repairs.models import RepairTimeline
from django.contrib.auth import get_user_model

User = get_user_model()

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        today = now.date()

        if user.role == "owner":
            # 1. Today's Repairs
            today_repairs = Job.objects.filter(created_at__date=today).count()
            
            # 2. Status Counts
            pending = Job.objects.filter(repair_status="Pending").count()
            in_progress = Job.objects.filter(repair_status="In Progress").count()
            completed = Job.objects.filter(repair_status="Completed").count()
            delivered = Job.objects.filter(delivery_status="Delivered").count()

            # 3. Revenue (Sum of delivered job amounts)
            revenue_data = Job.objects.filter(delivery_status="Delivered").aggregate(total=Sum("amount"))
            total_revenue = revenue_data["total"] or 0.0

            # 4. Weekly Sales (last 7 days)
            weekly_sales = []
            for i in range(6, -1, -1):
                day = today - timedelta(days=i)
                day_total = Job.objects.filter(created_at__date=day).aggregate(total=Sum("amount"))["total"] or 0.0
                weekly_sales.append({
                    "date": day.strftime("%a"),
                    "amount": float(day_total)
                })

            # 5. Monthly Sales (last 6 months)
            monthly_sales = []
            # Simple approximation for 6 months
            for i in range(5, -1, -1):
                # Calculate start and end of that month
                year = today.year
                month = today.month - i
                if month <= 0:
                    month += 12
                    year -= 1
                
                month_total = Job.objects.filter(created_at__year=year, created_at__month=month).aggregate(total=Sum("amount"))["total"] or 0.0
                # Get month name
                month_name = timezone.datetime(year, month, 1).strftime("%b")
                monthly_sales.append({
                    "month": f"{month_name} {year}",
                    "amount": float(month_total)
                })

            # 6. Employees list with counts
            employees = []
            emp_users = User.objects.filter(role="employee")
            for emp in emp_users:
                assigned_count = Job.objects.filter(assigned_employee=emp).count()
                completed_count = Job.objects.filter(assigned_employee=emp, repair_status="Completed").count()
                employees.append({
                    "id": emp.id,
                    "employeeId": emp.employee_profile.employee_id if hasattr(emp, "employee_profile") else "EMP",
                    "name": emp.first_name,
                    "assigned": assigned_count,
                    "completed": completed_count,
                    "suspended": emp.employee_profile.suspended if hasattr(emp, "employee_profile") else False
                })

            # 7. Customers count
            customers_count = User.objects.filter(role="customer").count()

            # 8. Recent Timeline Activity
            recent_activities = []
            activities = RepairTimeline.objects.all().order_by("-created_at")[:10]
            for act in activities:
                recent_activities.append({
                    "id": act.id,
                    "jobSheetNo": act.job.job_sheet_no,
                    "status": act.status,
                    "notes": act.notes,
                    "updatedBy": act.updated_by.first_name if act.updated_by else "System",
                    "createdAt": act.created_at.isoformat()
                })

            return Response({
                "role": "owner",
                "todayRepairs": today_repairs,
                "pendingRepairs": pending,
                "inProgressRepairs": in_progress,
                "completedRepairs": completed,
                "deliveredRepairs": delivered,
                "revenue": float(total_revenue),
                "weeklySales": weekly_sales,
                "monthlySales": monthly_sales,
                "employees": employees,
                "customersCount": customers_count,
                "recentActivities": recent_activities
            }, status=status.HTTP_200_OK)

        elif user.role == "employee":
            # Employee specific stats
            my_assigned = Job.objects.filter(assigned_employee=user).count()
            my_pending = Job.objects.filter(assigned_employee=user, repair_status="Pending").count()
            my_in_progress = Job.objects.filter(assigned_employee=user, repair_status="In Progress").count()
            my_completed = Job.objects.filter(assigned_employee=user, repair_status="Completed").count()
            my_delivered = Job.objects.filter(assigned_employee=user, delivery_status="Delivered").count()

            # Recent jobs assigned to employee
            recent_jobs = []
            jobs = Job.objects.filter(assigned_employee=user).order_by("-created_at")[:10]
            for job in jobs:
                recent_jobs.append({
                    "id": str(job.id),
                    "jobSheetNo": job.job_sheet_no,
                    "brand": job.brand,
                    "model": job.model,
                    "fault": job.fault,
                    "amount": float(job.amount),
                    "repairStatus": job.repair_status,
                    "deliveryStatus": job.delivery_status,
                    "createdAt": job.created_at.isoformat()
                })

            return Response({
                "role": "employee",
                "assignedRepairs": my_assigned,
                "pendingRepairs": my_pending,
                "inProgressRepairs": my_in_progress,
                "completedRepairs": my_completed,
                "deliveredRepairs": my_delivered,
                "recentJobs": recent_jobs
            }, status=status.HTTP_200_OK)

        elif user.role == "customer":
            # Customer specific stats
            my_jobs = Job.objects.filter(customer=user)
            my_jobs_count = my_jobs.count()
            my_pending = my_jobs.exclude(delivery_status="Delivered").count()
            my_delivered = my_jobs.filter(delivery_status="Delivered").count()
            total_spent = my_jobs.filter(delivery_status="Delivered").aggregate(total=Sum("amount"))["total"] or 0.0

            recent_jobs = []
            for job in my_jobs.order_by("-created_at"):
                recent_jobs.append({
                    "id": str(job.id),
                    "jobSheetNo": job.job_sheet_no,
                    "brand": job.brand,
                    "model": job.model,
                    "fault": job.fault,
                    "amount": float(job.amount),
                    "repairStatus": job.repair_status,
                    "deliveryStatus": job.delivery_status,
                    "createdAt": job.created_at.isoformat()
                })

            return Response({
                "role": "customer",
                "totalRepairs": my_jobs_count,
                "pendingRepairs": my_pending,
                "deliveredRepairs": my_delivered,
                "totalSpent": float(total_spent),
                "jobs": recent_jobs
            }, status=status.HTTP_200_OK)

        return Response({"error": "Role not recognized"}, status=status.HTTP_400_BAD_REQUEST)
