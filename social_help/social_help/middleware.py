import base64
from django.http import HttpResponse
from django.conf import settings

class AdminLoginProtectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        
        # Target paths like /admin, /admin/, /admin/login, /admin/login/, /dashboard, /dashboard/
        is_admin_path = path.rstrip('/') == '/admin' or path.startswith('/admin/')
        is_dashboard_path = path.rstrip('/') == '/dashboard' or path.startswith('/dashboard/')
        
        if is_admin_path or is_dashboard_path:
            # If the user is already authenticated via Django session, bypass Basic Auth check
            if hasattr(request, 'user') and request.user and request.user.is_authenticated:
                return self.get_response(request)
                
            # 1. Check IP Allowlist if configured
            allowed_ips = getattr(settings, 'ALLOWED_ADMIN_IPS', None)
            if allowed_ips:
                client_ip = self.get_client_ip(request)
                if client_ip in allowed_ips:
                    return self.get_response(request)
            
            # 2. Check Basic Auth credentials
            auth_username = getattr(settings, 'ADMIN_BASIC_AUTH_USERNAME', None)
            auth_password = getattr(settings, 'ADMIN_BASIC_AUTH_PASSWORD', None)
            
            if auth_username and auth_password:
                auth_header = request.META.get('HTTP_AUTHORIZATION')
                if auth_header:
                    try:
                        auth_type, auth_credentials = auth_header.split(' ', 1)
                        if auth_type.lower() == 'basic':
                            decoded_credentials = base64.b64decode(auth_credentials).decode('utf-8')
                            username, password = decoded_credentials.split(':', 1)
                            if username == auth_username and password == auth_password:
                                return self.get_response(request)
                    except Exception:
                        pass
                
                # Require credentials (401 Unauthorized)
                response = HttpResponse('Unauthorized: Access restricted', status=401)
                response['WWW-Authenticate'] = 'Basic realm="Restricted Area"'
                return response
            
            # 3. Default fallback if in production and not configured (deny access)
            if not getattr(settings, 'DEBUG', False):
                return HttpResponse('Forbidden: Access is not allowed publicly.', status=403)
                
        return self.get_response(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
