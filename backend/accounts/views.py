# views.py
from rest_framework.views import APIView
from django.http import JsonResponse
from .models import Inspection, NewInspection
from django.contrib.auth.decorators import login_required

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Inspection, NewInspection
from .serializers import InspectionSerializer, InspectionCreateSerializer, NewInspectionSerializer
from rest_framework.response import Response
from rest_framework import status, generics
from .auth_serializers import CustomTokenObtainSerializer
from .serializers import UserCreateSerializer, UserSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
from .models import CustomUser
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Count, Q


# JWT Login
class CustomTokenObtainView(APIView):
    permission_classes = []
    def post(self, request):
        ser = CustomTokenObtainSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        return Response(ser.validated_data)

# List/Create users (super admin can create branch admins/inspectors)
class UserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAuthenticated]

# Forgot password
class PasswordResetView(APIView):
    permission_classes = []
    def post(self, request):
        ser = PasswordResetSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data['email']
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'If that email exists, a reset link was sent.'})
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        send_mail(
            subject='InvestTracker Password Reset',
            message=f'Click here to reset your password:\n\n{reset_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
        return Response({'detail': 'If that email exists, a reset link was sent.'})

# Confirm password reset
class PasswordResetConfirmView(APIView):
    permission_classes = []
    def post(self, request):
        ser = PasswordResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        uid = ser.validated_data['uid']
        token = ser.validated_data['token']
        new_password = ser.validated_data['new_password']
        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=uid_decoded)
        except Exception:
            return Response({'detail':'Invalid uid'}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({'detail':'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'detail':'Password reset successful'})

# -------------------- Role-based CRUD --------------------

# Admin creates Branch Admin
@api_view(['POST'])
def create_branch_admin(request):
    data = request.data
    data['role'] = 'branch_admin'
    serializer = UserCreateSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Admin lists Branch Admins
@api_view(['GET'])
def list_branch_admins(request):
    admins = CustomUser.objects.filter(role='branch_admin')
    serializer = UserSerializer(admins, many=True)
    return Response(serializer.data)

# Branch Admin creates Inspector
@api_view(['POST'])
def create_inspector(request):
    data = request.data
    data['role'] = 'inspector'
    serializer = UserCreateSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Branch Admin lists Inspectors in his branch
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_inspectors(request):
    # logged-in user থেকে branch_name নাও
    branch_name = request.user.branch_name

    # শুধু ওই branch এর inspectors filter করো
    inspectors = CustomUser.objects.filter(role='inspector', branch_name=branch_name)
    serializer = UserSerializer(inspectors, many=True)
    return Response(serializer.data)

# Update user (Branch Admin / Admin)
@api_view(['PUT'])
def update_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error":"User not found"}, status=404)
    serializer = UserCreateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Delete user (Branch Admin / Admin)
@api_view(['DELETE'])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    user.delete()
    return Response({"message": "User deleted successfully"})

# -------------------- New Inspection Views --------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_new_inspection(request):
    """
    Create a new inspection (for branch admin/admin)
    """
    try:
        # Add debug print to see incoming data
        print("📨 Received new inspection creation request:")
        print(f"📤 Request data: {request.data}")
        print(f"👤 User: {request.user}")
        print(f"🎯 User role: {request.user.role}")

        # Check if user has permission to create inspections
        if request.user.role not in ['admin', 'branch_admin']:
            return Response(
                {"error": "You don't have permission to create inspections."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = NewInspectionSerializer(data=request.data)
        
        if serializer.is_valid():
            print("✅ Serializer is valid")
            inspection = serializer.save()
            
            # Return the created inspection data
            response_serializer = NewInspectionSerializer(inspection)
            print(f"✅ New Inspection created successfully: {inspection.id}")
            
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"🚨 Error in create_new_inspection: {str(e)}")
        return Response(
            {"error": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_new_inspections(request):
    """
    List all new inspections (for branch admin/admin and inspectors)
    """
    try:
        # Allow both admin/branch_admin AND inspectors to view
        if request.user.role not in ['admin', 'branch_admin', 'inspector']:
            return Response(
                {"error": "You don't have permission to view inspections."},
                status=status.HTTP_403_FORBIDDEN
            )

        # For branch admin, only show inspections from their branch
        if request.user.role == 'branch_admin':
            inspections = NewInspection.objects.filter(branch_name=request.user.branch_name)
        elif request.user.role == 'inspector':
            # For inspector, show only inspections assigned to them
            inspections = NewInspection.objects.filter(assigned_inspector=request.user)
        else:
            # For super admin, show all inspections
            inspections = NewInspection.objects.all()
        
        inspections = inspections.order_by('-created_at')
        serializer = NewInspectionSerializer(inspections, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"🚨 Error in list_new_inspections: {str(e)}")
        return Response(
            {"error": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# NEW: Get current user information
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current user information
    """
    try:
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Inspection ViewSet - EXISTING CODE (NO CHANGES)
class InspectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['investment_category', 'status', 'legal_status']
    
    def get_queryset(self):
        # Users can only see their own inspections
        return Inspection.objects.filter(inspector=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InspectionCreateSerializer
        return InspectionSerializer
    
    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)
    
    @action(detail=False, methods=['get'])
    def inspector_wise(self, request):
        # Get inspections grouped by inspector
        inspectors = CustomUser.objects.filter(
            inspections__isnull=False
        ).annotate(
            total_inspections=Count('inspections')
        ).values('id', 'user_name', 'email', 'total_inspections')
        
        return Response(inspectors)
    
    # NEW METHOD ADDED: Get inspection statistics for current inspector
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get inspection statistics for the logged-in inspector
        """
        user = request.user
        
        try:
            # Get total inspections for this inspector
            total = Inspection.objects.filter(inspector=user).count()
            
            # Get counts by status
            pending = Inspection.objects.filter(
                inspector=user, 
                status='Pending'
            ).count()
            
            in_progress = Inspection.objects.filter(
                inspector=user, 
                status='In Progress'
            ).count()
            
            completed = Inspection.objects.filter(
                inspector=user, 
                status='Completed'
            ).count()
            
            approved = Inspection.objects.filter(
                inspector=user, 
                status='Approved'
            ).count()
            
            rejected = Inspection.objects.filter(
                inspector=user, 
                status='Rejected'
            ).count()
            
            stats_data = {
                'total': total,
                'pending': pending,
                'in_progress': in_progress,
                'completed': completed,
                'approved': approved,
                'rejected': rejected,
            }
            
            return Response(stats_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # NEW METHOD ADDED: Get inspections by status with filtering
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """
        Get inspections filtered by status for the logged-in inspector
        """
        user = request.user
        status_param = request.query_params.get('status', 'all')
        
        try:
            queryset = Inspection.objects.filter(inspector=user)
            
            # Filter by status if provided and not 'all'
            if status_param and status_param != 'all':
                queryset = queryset.filter(status=status_param)
            
            # Order by latest first
            queryset = queryset.order_by('-created_at')
            
            # Serialize the data
            serializer = InspectionSerializer(queryset, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # NEW METHOD ADDED: Update inspection status
    @action(detail=True, methods=['patch', 'put'])
    def update_status(self, request, pk=None):
        """
        Update inspection status
        """
        try:
            inspection = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate status choice
            valid_statuses = dict(Inspection.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': f'Invalid status. Must be one of: {list(valid_statuses)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            inspection.status = new_status
            inspection.save()
            
            serializer = self.get_serializer(inspection)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Inspection.DoesNotExist:
            return Response(
                {'error': 'Inspection not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

############get number in admin dashboard

def inspection_stats(request):
    """Return inspection statistics for dashboard"""
    data = {
        "all": Inspection.objects.count(),
        "pending": Inspection.objects.filter(status="Pending").count(),
        "approved": Inspection.objects.filter(status="Approved").count(),
        "rejected": Inspection.objects.filter(status="Rejected").count(),
    }
    return JsonResponse(data)


@api_view(['GET'])
def branch_admin_stats(request):
    branch_name = request.GET.get('branch_name', '')  # read branch_name from query param
    if not branch_name:
        return Response({"error": "Branch name is required"}, status=400)
    
    inspections = Inspection.objects.filter(branch_name=branch_name)
    
    stats = {
        "all": inspections.count(),
        "pending": inspections.filter(status="Pending").count(),
        "approved": inspections.filter(status="Approved").count(),
        "rejected": inspections.filter(status="Rejected").count(),
    }
    return Response(stats)
