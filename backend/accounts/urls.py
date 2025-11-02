# accounts/urls.py
from django.urls import path, include
from . import views

from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainView, UserListCreateView,
    PasswordResetView, PasswordResetConfirmView,
    create_branch_admin, list_branch_admins,
    create_inspector, list_inspectors,
    update_user, delete_user,
    InspectionViewSet, branch_admin_stats,
    create_new_inspection, list_new_inspections,
    get_current_user  # NEW IMPORT
)

router = DefaultRouter()
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainView.as_view(), name='token_obtain'),
    path('users/', UserListCreateView.as_view(), name='users'),
    path('password_reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password_reset_confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('branch-admin/create/', create_branch_admin),
    path('branch-admin/list/', list_branch_admins),
    path('inspector/create/', create_inspector),
    path('inspector/list/', list_inspectors),
    path('user/update/<int:user_id>/', update_user),
    path('user/delete/<int:user_id>/', delete_user),
    path('inspection/stats/', views.inspection_stats, name='inspection_stats'),
    path('branch/inspection-stats/', branch_admin_stats, name='branch_admin_stats'),

    # NEW URLs ADDED for inspector dashboard
    path('inspections/stats/', views.InspectionViewSet.as_view({'get': 'stats'}), name='inspections-stats'),
    path('inspections/by_status/', views.InspectionViewSet.as_view({'get': 'by_status'}), name='inspections-by-status'),
    
    # NEW URLs for New Inspection
    path('new-inspections/create/', create_new_inspection, name='create-new-inspection'),
    path('new-inspections/list/', list_new_inspections, name='list-new-inspections'),
    
    # NEW URL for current user
    path('current-user/', get_current_user, name='current-user'),
]
