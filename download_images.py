import os
import requests

# Set the target directory
asset_dir = "C:/Users/lloop/OneDrive/Documentos/BIOS/img/"

# Create the directory if it doesn't exist
if not os.path.exists(asset_dir):
    os.makedirs(asset_dir)

# Define the image mapping (file name: Unsplash public domain URL)
images_to_download = {
    "hero-bg.jpg": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2800&auto=format&fit=crop",
    "service-card-lab.jpg": "https://images.unsplash.com/photo-1614934902194-47c0c16b1f2b?q=80&w=1200&auto=format&fit=crop",
    "service-card-cardio.jpg": "https://images.unsplash.com/photo-1603398937375-d144579c9441?q=80&w=1200&auto=format&fit=crop",
    "service-card-xray.jpg": "https://images.unsplash.com/photo-1563297753-ff513076c5b9?q=80&w=1200&auto=format&fit=crop",
    "service-card-gyn.jpg": "https://images.unsplash.com/photo-1596237077677-494b8e23b2b8?q=80&w=1200&auto=format&fit=crop",
    "vision-mision-bg.jpg": "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=1800&auto=format&fit=crop",
    "units-calendar.jpg": "https://images.unsplash.com/photo-1610484742616-65be7f67756f?q=80&w=1200&auto=format&fit=crop"
}

print("Beginning secure asset download...")
headers = {'User-Agent': 'Mozilla/5.0'}

for filename, url in images_to_download.items():
    filepath = os.path.join(asset_dir, filename)
    if os.path.exists(filepath):
        print(f"Skipping {filename}, already exists.")
        continue

    try:
        response = requests.get(url, headers=headers, stream=True)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Successfully downloaded {filename}")
        else:
            print(f"Failed to download {filename}. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")

print("Secure asset deployment complete. Ready for web build.")
