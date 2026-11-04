import random
import uuid
import re
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from authentication.models import OtpRecord
from employees.models import EmployeeProfile
from customers.models import CustomerProfile
from jobs.models import Job, ShopProfile
from repairs.models import RepairTimeline
from invoices.models import Invoice
from notifications.models import Notification
from customers.models import Message

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds the database with initial AMW demo data"

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing data...")
        Invoice.objects.all().delete()
        RepairTimeline.objects.all().delete()
        Job.objects.all().delete()
        Message.objects.all().delete()
        Notification.objects.all().delete()
        EmployeeProfile.objects.all().delete()
        CustomerProfile.objects.all().delete()
        OtpRecord.objects.all().delete()
        ShopProfile.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Seeding data...")

        # 1. Create Owner User
        owner = User.objects.create(
            username="owner",
            first_name="Amit (Owner)",
            mobile="9999999999",
            email="owner@amw.com",
            role="owner"
        )
        owner.set_password("owner123")
        owner.save()
        self.stdout.write("Created owner account: owner / owner123")

        # 2. Create Employees
        employees_data = [
            {"id": "EMP001", "name": "Rohit Sharma", "address": "Sector 14, Delhi", "mobile": "9876543210", "email": "rohit@amw.com", "joining_date": "2023-04-12", "salary": 22000, "employee_role": "Senior Technician"},
            {"id": "EMP002", "name": "Priya Verma", "address": "MG Road, Pune", "mobile": "9988776655", "email": "priya@amw.com", "joining_date": "2024-01-08", "salary": 18000, "employee_role": "Technician"},
            {"id": "EMP003", "name": "Aman Khan", "address": "Park Street, Kolkata", "mobile": "9090909090", "email": "aman@amw.com", "joining_date": "2024-06-22", "salary": 16000, "employee_role": "Junior Technician"},
        ]

        employee_users = []
        for emp_info in employees_data:
            user = User.objects.create(
                username=emp_info["id"],
                first_name=emp_info["name"],
                mobile=emp_info["mobile"],
                email=emp_info["email"],
                role="employee"
            )
            user.set_password("emp123")
            user.save()

            EmployeeProfile.objects.create(
                user=user,
                employee_id=emp_info["id"],
                address=emp_info["address"],
                joining_date=emp_info["joining_date"],
                salary=emp_info["salary"],
                employee_role=emp_info["employee_role"]
            )
            employee_users.append(user)
            self.stdout.write(f"Created employee: {emp_info['id']} / emp123")

        # 3. Create Customers
        customers_data = [
            {"id": "CUS001", "name": "Neha Singh", "mobile": "9123456780", "email": "neha@example.com"},
            {"id": "CUS002", "name": "Rakesh Patel", "mobile": "9812345670", "email": "rakesh@example.com"},
            {"id": "CUS003", "name": "Sara Iqbal", "mobile": "9001122334", "email": "sara@example.com"},
            {"id": "CUS004", "name": "Vikram Joshi", "mobile": "9554433221", "email": "vikram@example.com"},
        ]

        customer_users = []
        for cust_info in customers_data:
            user = User.objects.create(
                username=cust_info["id"],
                first_name=cust_info["name"],
                mobile=cust_info["mobile"],
                email=cust_info["email"],
                role="customer"
            )
            user.set_password("cust123")
            user.save()

            CustomerProfile.objects.create(
                user=user,
                customer_id=cust_info["id"]
            )
            customer_users.append(user)
            self.stdout.write(f"Created customer: {cust_info['id']} / cust123 (Login using Mobile: {cust_info['mobile']})")

        # 4. Shop Profile
        shop = ShopProfile.objects.create(
            name="Amit Mobile World (AMW)",
            address="Shop 12, Main Market, Sector 5, New Delhi - 110001",
            contact="+91 98100 12345",
            email="support@amitmobileworld.in",
            gstin="07AAACA1234F1Z5"
        )
        self.stdout.write("Created Shop Profile details.")

        # 5. Create Job Sheets
        brands = ["Samsung", "Apple", "Xiaomi", "Realme", "OnePlus", "Vivo", "Oppo", "Nokia"]
        models = ["Galaxy S22", "iPhone 13", "Redmi Note 12", "Realme 11", "Nord CE 3", "V27", "F23", "G21"]
        faults = ["Screen broken", "Battery drain", "Charging port damaged", "Speaker not working", "Camera blur", "Water damage", "Software issue"]
        colors = ["Black", "White", "Blue", "Gold", "Silver"]
        types = ["Android", "iPhone", "Keypad"]

        now = timezone.now()
        jobs_created = []

        for i in range(28):
            c_user = customer_users[i % len(customer_users)]
            e_user = employee_users[i % len(employee_users)]
            days_ago = random.randint(1, 60)
            created_date = now - timedelta(days=days_ago)

            repair_status = "Pending"
            if i % 7 != 0:
                repair_status = "In Progress" if i % 3 == 0 else "Completed"
            
            delivery_status = "Pending"
            if repair_status == "Completed" and i % 2 == 0:
                delivery_status = "Delivered"

            job_sheet_no = f"AMW-{1000 + i}"
            amount = 500 + (i * 137) % 4500

            job = Job.objects.create(
                job_sheet_no=job_sheet_no,
                customer=c_user,
                brand=brands[i % len(brands)],
                model=models[i % len(models)],
                color=colors[i % len(colors)],
                mobile_type=types[i % len(types)],
                password_type="PIN",
                password_value="1234",
                fault=faults[i % len(faults)],
                description="Customer reported issue during normal use.",
                features_installed="Tempered Glass, Software Update" if i % 3 == 0 else "New Battery" if i % 3 == 1 else "",
                amount=amount,
                repair_status=repair_status,
                delivery_status=delivery_status,
                delivery_date=created_date.date() if delivery_status == "Delivered" else None,
                assigned_employee=e_user,
                completed_at=created_date if repair_status == "Completed" else None,
                last_updated_by=e_user,
                owner_approved=True if delivery_status == "Delivered" else False,
                otp_verified_at=created_date if delivery_status == "Delivered" else None,
                delivered_by=e_user if delivery_status == "Delivered" else None,
                rating_stars=((i * 7) % 5) + 1 if delivery_status == "Delivered" else None,
                rating_comment=["Great service!", "Quick and reliable.", "Friendly staff.", "Very satisfied.", "Could be faster."][i % 5] if delivery_status == "Delivered" else ""
            )
            # Override created_at to backdate
            Job.objects.filter(pk=job.pk).update(created_at=created_date, last_updated_at=created_date)
            
            # Setup timelines
            RepairTimeline.objects.create(
                job=job,
                status="Pending",
                notes="Job sheet registered.",
                updated_by=owner,
                created_at=created_date
            )
            
            if repair_status in ["In Progress", "Completed"]:
                RepairTimeline.objects.create(
                    job=job,
                    status="In Progress",
                    notes="Technician diagnostic started.",
                    updated_by=e_user,
                    created_at=created_date + timedelta(hours=2)
                )
            
            if repair_status == "Completed":
                RepairTimeline.objects.create(
                    job=job,
                    status="Completed",
                    notes="Repair completed successfully. Tested OK.",
                    updated_by=e_user,
                    created_at=created_date + timedelta(hours=5)
                )

            if delivery_status == "Delivered":
                RepairTimeline.objects.create(
                    job=job,
                    status="Delivered",
                    notes=f"Device delivered to customer via OTP verification. Logged by {e_user.first_name}.",
                    updated_by=e_user,
                    created_at=created_date + timedelta(days=1)
                )

                # Create Invoice for delivered job
                Invoice.objects.create(
                    invoice_no=f"INV-{created_date.year}-{1000 + i}",
                    job=job,
                    payment_method="UPI" if i % 2 == 0 else "Cash",
                    payment_status="Paid",
                    gst_rate=18.00,
                    notes="Thank you for your business!"
                )
                Invoice.objects.filter(job=job).update(invoice_date=created_date.date())

            jobs_created.append(job)

        self.stdout.write(f"Seeded {len(jobs_created)} job sheets and timeline events.")

        # 6. Messages
        messages_data = [
            {"customer": customer_users[0], "sent_by": customer_users[0], "role": "customer", "subject": "Display repair warranty", "body": "Does the replaced screen on my iPhone 13 have any warranty?"},
            {"customer": customer_users[0], "sent_by": owner, "role": "owner", "subject": "Display repair warranty", "body": "Hello Neha, yes, all screen replacements come with a 3-month warranty against touch defects. Let us know if you face any issues!"},
            {"customer": customer_users[1], "sent_by": customer_users[1], "role": "customer", "subject": "Charging issue", "body": "Charging port replaced yesterday, but fast charging is not working today. Can I bring it back?"},
        ]

        for msg in messages_data:
            Message.objects.create(
                customer=msg["customer"],
                subject=msg["subject"],
                body=msg["body"],
                sent_by=msg["sent_by"],
                sent_by_role=msg["role"]
            )
        self.stdout.write("Seeded mock support tickets/messages.")

        # 7. Notifications
        Notification.objects.create(
            type="job_added",
            title="New Job Registered",
            message="Job AMW-1027 has been registered.",
            actor_name="Amit (Owner)",
            actor_role="owner",
            job_sheet_no="AMW-1027"
        )
        Notification.objects.create(
            type="repair_completed",
            title="Repair Completed",
            message="Job AMW-1026 status changed to Completed.",
            actor_name="Rohit Sharma",
            actor_role="employee",
            job_sheet_no="AMW-1026"
        )
        self.stdout.write("Seeded notifications.")

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
