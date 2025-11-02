from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, NewInspection, Inspection

# Custom User Admin - Complete fields
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'user_name', 'employee_id', 'branch_name', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'branch_name', 'date_joined')
    search_fields = ('email', 'user_name', 'employee_id', 'branch_name', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': (
            'user_name', 'first_name', 'last_name', 
            'employee_id', 'branch_name'
        )}),
        ('Role & Permissions', {'fields': (
            'role', 'is_active', 'is_staff', 'is_superuser', 
            'groups', 'user_permissions'
        )}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'user_name', 'password1', 'password2', 
                'employee_id', 'branch_name', 'role', 'is_staff', 'is_active'
            ),
        }),
    )

# New Inspection Admin - Complete fields
class NewInspectionAdmin(admin.ModelAdmin):
    list_display = ('project', 'client_name', 'industry_name', 'assigned_inspector', 'branch_name', 'status', 'created_at')
    list_filter = ('status', 'branch_name', 'created_at', 'assigned_inspector')
    search_fields = ('project', 'client_name', 'industry_name', 'phone_number', 'branch_name')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 20
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'project', 'client_name', 'industry_name', 'phone_number',
                'assigned_inspector', 'branch_name', 'status'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# Inspection Admin - ALL FIELDS INCLUDED
class InspectionAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'industry_name', 'inspector', 'branch_name', 'status', 'created_at', 'get_location_summary')
    list_filter = ('status', 'branch_name', 'created_at', 'inspector')
    search_fields = ('client_name', 'industry_name', 'phone_number', 'group_name', 'owner_name')
    readonly_fields = ('created_at', 'updated_at', 'get_location_summary', 'get_first_location', 'get_last_location')
    list_per_page = 20
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('inspector', 'branch_name', 'status')
        }),
        ('Location Tracking', {
            'fields': (
                'location_points', 'location_start_time', 'location_end_time', 
                'total_location_points', 'get_location_summary', 'get_first_location', 'get_last_location'
            )
        }),
        ('Section A: Company Client Information', {
            'fields': (
                'client_name', 'group_name', 'industry_name', 'nature_of_business',
                'legal_status', 'date_of_establishment', 'office_address', 
                'showroom_address', 'factory_address', 'phone_number',
                'account_number', 'account_id', 'tin_number', 'date_of_opening',
                'vat_reg_number', 'first_investment_date', 'sector_code',
                'trade_license', 'economic_purpose_code', 'investment_category'
            ),
            'classes': ('collapse',)
        }),
        ('Section B: Owner Information', {
            'fields': (
                'owner_name', 'owner_age', 'father_name', 'mother_name', 
                'spouse_name', 'academic_qualification', 'children_info',
                'business_successor', 'residential_address', 'permanent_address'
            ),
            'classes': ('collapse',)
        }),
        ('Section C: Partners/Directors', {
            'fields': ('partners_directors',),
            'classes': ('collapse',)
        }),
        ('Section D: Purpose', {
            'fields': (
                'purpose_investment', 'purpose_bank_guarantee', 'period_investment'
            ),
            'classes': ('collapse',)
        }),
        ('Section E: Proposed Facilities', {
            'fields': (
                'facility_type', 'existing_limit', 'applied_limit', 'recommended_limit',
                'bank_percentage', 'client_percentage'
            ),
            'classes': ('collapse',)
        }),
        ('Section F: Present Outstanding', {
            'fields': (
                'outstanding_type', 'limit_amount', 'net_outstanding', 'gross_outstanding'
            ),
            'classes': ('collapse',)
        }),
        ('Section G: Business Analysis', {
            'fields': (
                'market_situation', 'client_position', 'competitors', 'business_reputation',
                'production_type', 'product_name', 'production_capacity', 'actual_production',
                'profitability_observation'
            ),
            'classes': ('collapse',)
        }),
        ('Labor Force', {
            'fields': (
                'male_officer', 'female_officer', 'skilled_officer', 'unskilled_officer',
                'male_worker', 'female_worker', 'skilled_worker', 'unskilled_worker'
            ),
            'classes': ('collapse',)
        }),
        ('Key Employees', {
            'fields': ('key_employees',),
            'classes': ('collapse',)
        }),
        ('Section H: Property & Assets', {
            'fields': (
                'cash_balance', 'stock_trade_finished', 'stock_trade_financial',
                'accounts_receivable', 'advance_deposit', 'other_current_assets',
                'land_building', 'plant_machinery', 'other_assets', 'ibbl_investment',
                'other_banks_investment', 'borrowing_sources', 'accounts_payable',
                'other_current_liabilities', 'long_term_liabilities', 
                'other_non_current_liabilities', 'paid_up_capital', 'retained_earning',
                'resources'
            ),
            'classes': ('collapse',)
        }),
        ('Section I: Working Capital Assessment', {
            'fields': ('working_capital_items',),
            'classes': ('collapse',)
        }),
        ('Section J: Godown Particulars', {
            'fields': (
                'godown_location', 'godown_capacity', 'godown_space', 'godown_nature',
                'godown_owner', 'distance_from_branch', 'items_to_store',
                'warehouse_license', 'godown_guard', 'damp_proof', 'easy_access',
                'letter_disclaimer', 'insurance_policy', 'godown_hired'
            ),
            'classes': ('collapse',)
        }),
        ('Section K: Checklist', {
            'fields': ('checklist_items',),
            'classes': ('collapse',)
        }),
        ('Section L: Site Photos & Video', {
            'fields': ('site_photos', 'site_video'),
            'classes': ('collapse',)
        }),
        ('Section M: Documents Upload', {
            'fields': ('uploaded_documents',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_location_summary(self, obj):
        return obj.get_location_summary()
    get_location_summary.short_description = 'Location Summary'
    
    def get_first_location(self, obj):
        first_loc = obj.get_first_location()
        if first_loc:
            return f"Lat: {first_loc['latitude']}, Lng: {first_loc['longitude']}, Time: {first_loc['timestamp']}"
        return "No location data"
    get_first_location.short_description = 'First Location'
    
    def get_last_location(self, obj):
        last_loc = obj.get_last_location()
        if last_loc:
            return f"Lat: {last_loc['latitude']}, Lng: {last_loc['longitude']}, Time: {last_loc['timestamp']}"
        return "No location data"
    get_last_location.short_description = 'Last Location'

# Register models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(NewInspection, NewInspectionAdmin)
admin.site.register(Inspection, InspectionAdmin)