from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings

class CustomUser(AbstractUser):
    ROLE_SUPER = 'admin'
    ROLE_BRANCH = 'branch_admin'
    ROLE_INSPECTOR = 'inspector'
    ROLE_CHOICES = [
        (ROLE_SUPER, 'Admin'),
        (ROLE_BRANCH, 'Branch Admin'),
        (ROLE_INSPECTOR, 'Inspector'),
    ]

    user_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    employee_id = models.CharField(max_length=100, blank=True, null=True)
    branch_name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default=ROLE_INSPECTOR)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def save(self, *args, **kwargs):
        self.username = self.user_name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"
class NewInspection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    project = models.CharField(max_length=255)
    client_name = models.CharField(max_length=255)
    industry_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    assigned_inspector = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'inspector'}
    )
    branch_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project} - {self.client_name} ({self.status})"

    class Meta:
        ordering = ['-created_at']


class Inspection(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    # Inspector Information
    inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='inspections'
    )
    
    branch_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Location Tracking Data
    location_points = models.JSONField(default=list, blank=True, null=True)
    location_start_time = models.DateTimeField(blank=True, null=True)
    location_end_time = models.DateTimeField(blank=True, null=True)
    total_location_points = models.IntegerField(default=0)
    
    # Section A: Company's Client's Information
    client_name = models.CharField(max_length=255, blank=True, null=True)
    group_name = models.CharField(max_length=255, blank=True, null=True)
    industry_name = models.CharField(max_length=255, blank=True, null=True)
    nature_of_business = models.TextField(blank=True, null=True)
    legal_status = models.CharField(max_length=100, blank=True, null=True)
    date_of_establishment = models.CharField(max_length=100, blank=True, null=True)
    office_address = models.TextField(blank=True, null=True)
    showroom_address = models.TextField(blank=True, null=True)
    factory_address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    account_number = models.CharField(max_length=100, blank=True, null=True)
    account_id = models.CharField(max_length=100, blank=True, null=True)
    tin_number = models.CharField(max_length=100, blank=True, null=True)
    date_of_opening = models.CharField(max_length=100, blank=True, null=True)
    vat_reg_number = models.CharField(max_length=100, blank=True, null=True)
    first_investment_date = models.CharField(max_length=100, blank=True, null=True)
    sector_code = models.CharField(max_length=100, blank=True, null=True)
    trade_license = models.TextField(blank=True, null=True)
    economic_purpose_code = models.CharField(max_length=100, blank=True, null=True)
    investment_category = models.CharField(max_length=100, blank=True, null=True)
    
    # Section B: Owner Information
    owner_name = models.TextField(blank=True, null=True)
    owner_age = models.CharField(max_length=50, blank=True, null=True)
    father_name = models.CharField(max_length=255, blank=True, null=True)
    mother_name = models.CharField(max_length=255, blank=True, null=True)
    spouse_name = models.CharField(max_length=255, blank=True, null=True)
    academic_qualification = models.TextField(blank=True, null=True)
    children_info = models.TextField(blank=True, null=True)
    business_successor = models.TextField(blank=True, null=True)
    residential_address = models.TextField(blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True)
    
    # Section C: Partners/Directors
    partners_directors = models.JSONField(default=list, blank=True, null=True)
    
    # Section D: Purpose
    purpose_investment = models.TextField(blank=True, null=True)
    purpose_bank_guarantee = models.TextField(blank=True, null=True)
    period_investment = models.CharField(max_length=100, blank=True, null=True)
    
    # Section E: Proposed Facilities
    facility_type = models.CharField(max_length=100, blank=True, null=True)
    existing_limit = models.CharField(max_length=100, blank=True, null=True)
    applied_limit = models.CharField(max_length=100, blank=True, null=True)
    recommended_limit = models.CharField(max_length=100, blank=True, null=True)
    bank_percentage = models.CharField(max_length=50, blank=True, null=True)
    client_percentage = models.CharField(max_length=50, blank=True, null=True)
    
    # Section F: Present Outstanding
    outstanding_type = models.CharField(max_length=100, blank=True, null=True)
    limit_amount = models.CharField(max_length=100, blank=True, null=True)
    net_outstanding = models.CharField(max_length=100, blank=True, null=True)
    gross_outstanding = models.CharField(max_length=100, blank=True, null=True)
    
    # Section G: Business Analysis
    market_situation = models.CharField(max_length=100, blank=True, null=True)
    client_position = models.CharField(max_length=100, blank=True, null=True)
    competitors = models.JSONField(default=list, blank=True, null=True)
    business_reputation = models.CharField(max_length=100, blank=True, null=True)
    production_type = models.CharField(max_length=100, blank=True, null=True)
    product_name = models.CharField(max_length=255, blank=True, null=True)
    production_capacity = models.CharField(max_length=100, blank=True, null=True)
    actual_production = models.CharField(max_length=100, blank=True, null=True)
    profitability_observation = models.TextField(blank=True, null=True)
    
    # Labor Force
    male_officer = models.CharField(max_length=50, blank=True, null=True)
    female_officer = models.CharField(max_length=50, blank=True, null=True)
    skilled_officer = models.CharField(max_length=50, blank=True, null=True)
    unskilled_officer = models.CharField(max_length=50, blank=True, null=True)
    male_worker = models.CharField(max_length=50, blank=True, null=True)
    female_worker = models.CharField(max_length=50, blank=True, null=True)
    skilled_worker = models.CharField(max_length=50, blank=True, null=True)
    unskilled_worker = models.CharField(max_length=50, blank=True, null=True)
    
    # Key Employees
    key_employees = models.JSONField(default=list, blank=True, null=True)
    
    # Section H: Property & Assets
    cash_balance = models.CharField(max_length=100, blank=True, null=True)
    stock_trade_finished = models.CharField(max_length=100, blank=True, null=True)
    stock_trade_financial = models.CharField(max_length=100, blank=True, null=True)
    accounts_receivable = models.CharField(max_length=100, blank=True, null=True)
    advance_deposit = models.CharField(max_length=100, blank=True, null=True)
    other_current_assets = models.CharField(max_length=100, blank=True, null=True)
    land_building = models.CharField(max_length=100, blank=True, null=True)
    plant_machinery = models.CharField(max_length=100, blank=True, null=True)
    other_assets = models.CharField(max_length=100, blank=True, null=True)
    ibbl_investment = models.CharField(max_length=100, blank=True, null=True)
    other_banks_investment = models.CharField(max_length=100, blank=True, null=True)
    borrowing_sources = models.CharField(max_length=100, blank=True, null=True)
    accounts_payable = models.CharField(max_length=100, blank=True, null=True)
    other_current_liabilities = models.CharField(max_length=100, blank=True, null=True)
    long_term_liabilities = models.CharField(max_length=100, blank=True, null=True)
    other_non_current_liabilities = models.CharField(max_length=100, blank=True, null=True)
    paid_up_capital = models.CharField(max_length=100, blank=True, null=True)
    retained_earning = models.CharField(max_length=100, blank=True, null=True)
    resources = models.CharField(max_length=100, blank=True, null=True)
    
    # Section I: Working Capital Assessment
    working_capital_items = models.JSONField(default=list, blank=True, null=True)
    
    # Section J: Godown Particulars
    godown_location = models.TextField(blank=True, null=True)
    godown_capacity = models.CharField(max_length=100, blank=True, null=True)
    godown_space = models.CharField(max_length=100, blank=True, null=True)
    godown_nature = models.CharField(max_length=100, blank=True, null=True)
    godown_owner = models.CharField(max_length=255, blank=True, null=True)
    distance_from_branch = models.CharField(max_length=100, blank=True, null=True)
    items_to_store = models.TextField(blank=True, null=True)
    warehouse_license = models.BooleanField(default=False)
    godown_guard = models.BooleanField(default=False)
    damp_proof = models.BooleanField(default=False)
    easy_access = models.BooleanField(default=False)
    letter_disclaimer = models.BooleanField(default=False)
    insurance_policy = models.BooleanField(default=False)
    godown_hired = models.BooleanField(default=False)
    
    # Section K: Checklist
    checklist_items = models.JSONField(default=dict, blank=True, null=True)
    
    # Section L: Site Photos & Video
    site_photos = models.JSONField(default=list, blank=True, null=True)
    site_video = models.JSONField(default=list, blank=True, null=True)
    
    # Section M: Documents Upload
    uploaded_documents = models.JSONField(default=list, blank=True, null=True)

    # Status and Timestamps - Use auto_now_add for proper timezone handling
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inspections'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.client_name} - {self.industry_name}"

    def get_location_summary(self):
        """Get a summary of location tracking data"""
        if not self.location_points:
            return "No location data"
        
        start_time = self.location_start_time.strftime('%Y-%m-%d %H:%M') if self.location_start_time else 'N/A'
        end_time = self.location_end_time.strftime('%Y-%m-%d %H:%M') if self.location_end_time else 'N/A'
        
        return f"{self.total_location_points} points | {start_time} to {end_time}"

    def get_first_location(self):
        """Get the first location point"""
        if self.location_points and len(self.location_points) > 0:
            first_point = self.location_points[0]
            return {
                'latitude': first_point.get('latitude'),
                'longitude': first_point.get('longitude'),
                'timestamp': first_point.get('timestamp')
            }
        return None

    def get_last_location(self):
        """Get the last location point"""
        if self.location_points and len(self.location_points) > 0:
            last_point = self.location_points[-1]
            return {
                'latitude': last_point.get('latitude'),
                'longitude': last_point.get('longitude'),
                'timestamp': last_point.get('timestamp')
            }
        return None
