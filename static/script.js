document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitBtn');
    const inputText = document.getElementById('inputText');
    const outputResult = document.getElementById('outputResult');
    
    submitBtn.addEventListener('click', function() {
        const text = inputText.value;
        
        if (!text.trim()) {
            outputResult.innerHTML = '请输入文本内容';
            return;
        }
        
        fetch('/highlight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        })
        .then(response => response.json())
        .then(data => {
            outputResult.innerHTML = data.result || '处理完成';
        })
        .catch(error => {
            console.error('Error:', error);
            outputResult.innerHTML = '处理出错，请重试';
        });
    });
});