import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

INSTALLED_APPS = [
    # ...existing apps
    'qr_generator',
]

# Add media settings
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'