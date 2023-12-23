
export default function set_images() {
    console.log("set_images");
    document.getElementById('image-upload').addEventListener('change', function (event) {
        const imagePreviewContainer = document.getElementById('image-preview');
        imagePreviewContainer.innerHTML = '';

        const files = event.target.files;
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px'; // Setzen Sie die gewünschte Größe
                img.style.height = 'auto';
                img.style.margin = '10px';
                imagePreviewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}