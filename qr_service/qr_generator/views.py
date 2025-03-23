# Django views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import qrcode
import os
from django.conf import settings
import uuid

@csrf_exempt
def generate_qr(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            event_id = data.get('eventId')
            user_id = data.get('userId')
            user_name = data.get('userName')
            
            # Create a unique identifier for this registration
            registration_id = str(uuid.uuid4())
            
            # Create QR code data
            qr_data = {
                'eventId': event_id,
                'userId': user_id,
                'userName': user_name,
                'registrationId': registration_id
            }
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)
            
            # Create QR code image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save image to media folder
            qr_folder = os.path.join(settings.MEDIA_ROOT, 'qrcodes')
            os.makedirs(qr_folder, exist_ok=True)
            
            filename = f"{event_id}_{user_id}_{registration_id}.png"
            file_path = os.path.join(qr_folder, filename)
            img.save(file_path)
            
            # Generate URL for QR code
            qr_url = f"{settings.MEDIA_URL}qrcodes/{filename}"
            
            # Store QR code info in database
            # (create a model for this if needed)
            
            return JsonResponse({'success': True, 'qrCodeUrl': qr_url})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

@csrf_exempt
def get_qr(request, event_id, user_id):
    try:
        # Find the QR code in your database or file system
        qr_folder = os.path.join(settings.MEDIA_ROOT, 'qrcodes')
        
        # This is a simplification - you might want to query your database
        # to find the exact file name with the registration_id
        for filename in os.listdir(qr_folder):
            if filename.startswith(f"{event_id}_{user_id}_"):
                qr_url = f"{settings.MEDIA_URL}qrcodes/{filename}"
                return JsonResponse({'success': True, 'qrCodeUrl': qr_url})
        
        return JsonResponse({'success': False, 'error': 'QR code not found'}, status=404)
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)