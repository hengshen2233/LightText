document.addEventListener('DOMContentLoaded', function() {
    const addRuleBtn = document.getElementById('addRuleBtn');
    const rulesGrid = document.getElementById('rulesGrid');
    const backBtn = document.getElementById('backBtn');
    
    const DEFAULT_RULES = [
        { text: '红色', color: '#ff0000' },
        { text: '蓝色', color: '#0000ff' },
        { text: '白色', color: '#808080' },
        { text: '黄色', color: '#ffff00' },
        { text: '绿色', color: '#00ff00' },
        { text: '紫色', color: '#800080' },
        { text: '橙色', color: '#ff8c00' },
        { text: '粉色', color: '#ff69b4' },
        { text: '青色', color: '#00ffff' },
        { text: '黑色', color: '#000000' },
        { text: '灰色', color: '#808080' },
        { text: '棕色', color: '#a0522d' }
    ];
    
    function setupColorSync(picker, input) {
        picker.addEventListener('input', function() {
            input.value = picker.value;
        });
        
        input.addEventListener('input', function() {
            const color = input.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                picker.value = color;
            }
        });
    }
    
    function loadRules() {
        fetch('/api/rules')
            .then(response => response.json())
            .then(data => {
                rulesGrid.innerHTML = '';
                if (data.length > 0) {
                    data.forEach(rule => {
                        addRuleItem(rule.text, rule.color);
                    });
                } else {
                    DEFAULT_RULES.forEach(rule => {
                        addRuleItem(rule.text, rule.color);
                    });
                }
            })
            .catch(error => {
                console.error('加载规则失败:', error);
                DEFAULT_RULES.forEach(rule => {
                    addRuleItem(rule.text, rule.color);
                });
            });
    }
    
    function saveRules() {
        const rules = [];
        const ruleItems = document.querySelectorAll('.rule-item');
        ruleItems.forEach(item => {
            const textInput = item.querySelector('.text-input');
            const colorInput = item.querySelector('.color-input');
            rules.push({
                text: textInput.value,
                color: colorInput.value || '#ff0000'
            });
        });
        
        fetch('/api/rules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rules)
        })
        .then(response => response.json())
        .then(data => {
            console.log('规则保存成功');
        })
        .catch(error => {
            console.error('保存规则失败:', error);
        });
    }
    
    function addRuleItem(text = '', color = '#ff0000') {
        const newRuleItem = document.createElement('div');
        newRuleItem.className = 'rule-item';
        newRuleItem.innerHTML = `
            <textarea class="text-input" placeholder="文本">${text}</textarea>
            <div class="color-picker-wrapper">
                <input type="color" class="color-picker" value="${color}">
                <input type="text" class="color-input" placeholder="#xxxxxx" value="${color}">
            </div>
            <button class="delete-btn" title="删除规则">✕</button>
        `;
        
        rulesGrid.appendChild(newRuleItem);
        
        const picker = newRuleItem.querySelector('.color-picker');
        const input = newRuleItem.querySelector('.color-input');
        setupColorSync(picker, input);
        
        const deleteBtn = newRuleItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            newRuleItem.remove();
        });
    }
    
    addRuleBtn.addEventListener('click', function() {
        addRuleItem();
    });
    
    document.getElementById('saveBtn').addEventListener('click', function() {
        saveRules();
    });
    
    backBtn.addEventListener('click', function() {
        const hasBlackColor = checkForBlackColor();
        if (hasBlackColor) {
            if (confirm('检测到规则中包含黑色（#000000），黑色无法有效高亮文本，建议更换其他颜色。是否继续返回？')) {
                saveRules();
                setTimeout(() => {
                    window.location.href = '/';
                }, 100);
            }
        } else {
            saveRules();
            setTimeout(() => {
                window.location.href = '/';
            }, 100);
        }
    });
    
    function checkForBlackColor() {
        const colorInputs = document.querySelectorAll('.color-input');
        for (const input of colorInputs) {
            if (input.value.toLowerCase() === '#000000') {
                return true;
            }
        }
        return false;
    }
    
    loadRules();
});