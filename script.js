const display = document.getElementById('display');
const preview = document.getElementById('preview');
let justCalculated = false;


function toRad(deg) {
    return deg * Math.PI / 180;
}

function formatNumber(value) {
    if (value === '' || isNaN(value)) return value;

    let num = Number(value);
    let parts = num.toFixed(4).replace(/\.?0+$/, '').split('.');

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
}


function appendFunc(func) {
    if(func === 'sin') func = 'sinDeg';
    if(func === 'cos') func = 'cosDeg';
    if(func === 'tan') func = 'tanDeg';
    display.value += func + '(';
    showPreview();
}

function appendChar(char) {
    const operators = ['+', '-', '*', '/'];

    if (justCalculated) {
        if (!isNaN(char) || char === '.' || char === ',') {
            display.value = char;
        } else if (operators.includes(char)) {
            display.value += char;
        }
        justCalculated = false;
        showPreview();
        return;
    }

    display.value += char;
    showPreview();
}



function appendPercent() {
    let exp = display.value;

    let numberMatch = exp.match(/(\d+\.?\d*)$/);
    if (!numberMatch) return;
    let number = numberMatch[1]; 
    let beforeNumber = exp.slice(0, exp.length - number.length);

    let operatorMatch = beforeNumber.match(/([+\-×÷])\s*$/);

    if (!operatorMatch) {
        display.value = beforeNumber + number + '%';
    } else {
        display.value = beforeNumber + number + '%';
    }

    showPreview();
}

function normalize(expr) {
    let exp = expr
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

    exp = exp.replace(/(\d+)([+\-*/])(\d+)%/g, (match, num1, operator, num2) => {
        return `${num1}${operator}(${num1}*${num2}/100)`;
    });

    exp = exp.replace(/(\d+)%/g, '($1/100)');

    return exp;
}

function sinDeg(x) { return Math.sin(x * Math.PI / 180); }
function cosDeg(x) { return Math.cos(x * Math.PI / 180); }
function tanDeg(x) { return Math.tan(x * Math.PI / 180); }

function showPreview() {
    try {
        let exp = normalize(display.value);

        if (/[+\-*/.(]$/.test(exp)) {
            preview.innerText = '';
            return;
        }

        let result = eval(exp);

        if (typeof result === "number") {
            result = parseFloat(result.toFixed(4));
        }

        preview.innerText = "= " + formatNumber(result);

    } catch {
        preview.innerText = '';
    }
}


function clearDisplay() {
    display.value = '';
    preview.innerText = '0';
    justCalculated = false;
}

function deleteChar() {
    display.value = display.value.slice(0, -1);
    justCalculated = false;
    showPreview();
}

function calculate() {
    try {
        const exp = normalize(display.value);
        let result = eval(exp);

        if (typeof result === "number") {
            result = parseFloat(result.toFixed(4));
        }

        addHistory(display.value + ' = ' + formatNumber(result));
        display.value = formatNumber(result);
        justCalculated = true;

    } catch {
        display.value = 'error';
    }
}

function addHistory(text) {
    const list = document.getElementById('history-list');
    const li = document.createElement('li');
    li.textContent = text;

    li.onclick = () => {
        display.value = text.split('=')[0].trim();
        showPreview();
    };

    list.prepend(li);
    if (list.children.length > 5) list.removeChild(list.lastChild);
}

function clearHistory() {
    document.getElementById('history-list').innerHTML = '';
}

document.addEventListener('keydown', function(event) {
    const key = event.key;

    if ((key >= '0' && key <= '9') || key === '.') {
        appendChar(key);
    }
    else if (
    (key === '+' || key === '-' || key === '*' || key === '/') &&
    !justCalculated
    ) {
    appendChar(key);
    }

    else if (key === 'Enter') {
        calculate();
    }
    else if (key === 'Backspace') {
        deleteChar();
    }
    else if (key === 'Escape') {
        clearDisplay();
    }

});