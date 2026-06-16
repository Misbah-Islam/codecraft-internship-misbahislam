let display = document.getElementById('display');

function append(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function backspace() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = 'Error';
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    let key = event.key;
    
    if (!isNaN(key) || ['+', '-', '*', '/', '.', '%'].includes(key)) {
        append(key);
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});