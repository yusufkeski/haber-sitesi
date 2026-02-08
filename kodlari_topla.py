import os

# Çıktı dosyasının adı
output_file = "tum_proje_kodlari.txt"

# Taranmayacak Klasörler (Gereksiz kalabalık yapmasın)
ignore_dirs = {
    'node_modules', '.git', '.angular', '.vscode', '.idea', 
    'dist', 'build', 'coverage', '__pycache__'
}

# Taranmayacak Dosyalar
ignore_files = {
    'package-lock.json', 'yarn.lock', 'kodlari_topla.py', 
    'output.txt', 'tum_proje_kodlari.txt', '.DS_Store'
}

# Taranmayacak Uzantılar (Resimler vs. text olarak okunmaz)
ignore_extensions = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', 
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.mp3'
}

def is_ignored(path):
    # Yolun herhangi bir parçasında yasaklı klasör var mı?
    parts = path.split(os.sep)
    for part in parts:
        if part in ignore_dirs:
            return True
    return False

def merge_project_files():
    current_dir = os.getcwd()
    print(f"Tarama başlıyor: {current_dir}")
    
    with open(output_file, "w", encoding="utf-8") as outfile:
        for root, dirs, files in os.walk(current_dir):
            # Yasaklı klasörleri yerinde filtrele (walk içine girmesin)
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, current_dir)
                _, ext = os.path.splitext(file)

                # Filtreleme Kontrolleri
                if file in ignore_files:
                    continue
                if ext.lower() in ignore_extensions:
                    continue
                
                # Dosya içeriğini yaz
                try:
                    outfile.write(f"\n{'='*60}\n")
                    outfile.write(f"DOSYA YOLU: {rel_path}\n")
                    outfile.write(f"{'='*60}\n")
                    
                    with open(file_path, "r", encoding="utf-8", errors='ignore') as infile:
                        content = infile.read()
                        if not content.strip():
                            outfile.write("[DOSYA BOŞ]\n")
                        else:
                            outfile.write(content + "\n")
                            
                    print(f"Eklendi: {rel_path}")
                    
                except Exception as e:
                    print(f"HATA ({rel_path}): {e}")

    print(f"\n✅ İşlem Tamamlandı! '{output_file}' dosyası oluşturuldu.")

if __name__ == "__main__":
    merge_project_files()