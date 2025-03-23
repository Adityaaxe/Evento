# In qr_service/qr_generator/models.py
from django.db import models

class QRCode(models.Model):
    event_id = models.CharField(max_length=50)
    user_id = models.CharField(max_length=50)
    image = models.ImageField(upload_to='qr_codes/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"QR for Event: {self.event_id}, User: {self.user_id}"