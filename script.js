const { ipcRenderer } = require('electron');


document.getElementById('downloadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('videoUrl').value;
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '';
    const loadingDiv = document.createElement('div');

    document.getElementById('loader').style.display = 'flex';
    lucide.createIcons();
    resultDiv.appendChild(loadingDiv);

    try {
        const { filePath, error } = await ipcRenderer.invoke('download-video', url);

        if (error) {
            loadingDiv.innerText = error;
            document.getElementById('loader').style.display = 'none';
        } else {
            loadingDiv.innerHTML = `<a href="${filePath}" class="open" target="_blank">Открыть видео</a>`;
            document.getElementById('loader').style.display = 'none';
        }
    } catch (err) {
        console.error('Ошибка при скачивании:', err);
        loadingDiv.innerText = 'Произошла ошибка при скачивании видео';
    }
});
