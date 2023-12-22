document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
    const imagePreview = document.getElementById('imagePreview');
    const loadingPopup = document.getElementById('loadingPopup');
    const downloadSection = document.getElementById('downloadSection');
    const downloadBtn = document.getElementById('downloadBtn');
    const outputImage = document.getElementById('outputImage');
    const loadingProgress = document.getElementById('loadingProgressValue');
    const progressBar = document.getElementById('loadingProgressBar');

    imageInput.addEventListener('change', function () {
        const file = imageInput.files[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            imagePreview.src = objectURL;
            imagePreview.style.display = 'block';
            outputImage.style.display = 'none';
            downloadSection.style.display = 'none';
        }
    });

    removeBackgroundBtn.addEventListener('click', function () {
        const apiKey = 'DSUCekq2FjnAmJWgeH4pTuDv';

        if (!imageInput.files || imageInput.files.length === 0) {
            alert('Please select an image.');
            return;
        }

        const formData = new FormData();
        formData.append('image_file', imageInput.files[0]);

        loadingPopup.style.display = 'flex';
        loadingProgress.innerText = '0';

        fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey,
                },
                body: formData,
            })
            .then(response => {
                if (response.ok) {
                    const total = response.headers.get('content-length');
                    let loaded = 0;

                    const reader = response.body.getReader();

                    return new ReadableStream({
                        start(controller) {
                            function push() {
                                reader.read().then(({ done, value }) => {
                                    if (done) {
                                        controller.close();
                                        return;
                                    }

                                    loaded += value.byteLength;
                                    const progress = Math.round((loaded / total) * 100);
                                    loadingProgress.innerText = progress;
                                    progressBar.style.width = `${progress}%`;

                                    controller.enqueue(value);
                                    push();
                                });
                            }

                            push();
                        },
                    });
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            })
            .then(stream => new Response(stream))
            .then(response => response.blob())
            .then(blob => {
                loadingPopup.style.display = 'none';

                const objectURL = URL.createObjectURL(blob);
                outputImage.src = objectURL;
                outputImage.style.display = 'block';
                imagePreview.style.display = 'none';
                downloadSection.style.display = 'block';

                Swal.fire({
                    icon: 'success',
                    title: 'Background Removed!',
                    showConfirmButton: false,
                    timer: 2000,
                });
            })
            .catch(error => {
                loadingPopup.style.display = 'none';
                console.error('Error:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'An error occurred. Please try again.',
                });
            });
    });

    downloadBtn.addEventListener('click', function () {
        const a = document.createElement('a');
        a.href = outputImage.src;
        a.download = 'output_image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
