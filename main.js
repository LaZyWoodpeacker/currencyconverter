class CurrencyBaseSelect {
    constructor(cls = "currency_base", curselected = 'USD') {
        this.topCurencyBases = ["RUB", "USD", "GBP", "EUR"];
        this.currencyBases = ["BYR", "HKD", "IDR", "ILS", "DKK", "INR", "CHF", "MXN", "CZK", "KRW", "AUD", "HUF", "SEK"];
        this.cls = cls;

        this.div = document.createElement('div');
        this.div.classList.add(cls);

        this.top = this.topCurencyBases.map(e => {
            return this.div.appendChild(this.makeBtn(e));
        })

        this.div.appendChild(this.makeSelect());

        this.selected = curselected;
    }

    get selected() {
        return this.div.dataset.selected;
    }

    set selected(value) {
        this.selectedraw = value;
        this.onChange(value);
    }

    set selectedraw(value) {
        this.div.dataset.selected = value;
        this.top.forEach(e => {
            if (e.dataset.id === value) {
                e.classList.add(this.cls + '--selected')
            } else {
                e.classList.remove(this.cls + '--selected')
            }
        })
        if (this.currencyBases.findIndex(e => e === value) > -1) {
            this.select.classList.add(this.cls + '--selected')
        } else {
            this.select.classList.remove(this.cls + '--selected')
        }
    }

    onChange() { console.log('On change ' + this.selected) }

    makeBtn(baseName, cls = "__btn") {
        const ctrl = this;
        const btn = document.createElement('button');
        btn.classList.add(this.cls + cls);
        btn.innerText = baseName;
        btn.dataset.id = baseName;
        btn.addEventListener('click', function () {
            ctrl.selected = this.dataset.id;
        });
        return btn;
    }

    makeSelect(cls = "__select") {
        this.select = document.createElement('select');
        this.select.classList.add(this.cls + cls);
        this.currencyBases.forEach(baseName => {
            const option = document.createElement('option');
            option.classList.add(this.cls + cls + '-option');
            option.innerText = baseName;
            option.dataset.id = baseName;
            this.select.appendChild(option);
        })
        this.select.addEventListener('change', () => {
            this.selected = this.select.value;
        })
        return this.select;
    }
}

class CurrencyBlock {
    static id = -1;
    constructor(header, topem = '.converter', cls = "currency_block") {
        this.id = ++CurrencyBlock.id;
        this.div = document.createElement('div');
        document.querySelector(topem).appendChild(this.div);
        this.div.classList.add(cls);

        this.head = document.createElement('h3');
        this.head.innerText = header;
        this.head.classList.add(cls + '__header');
        this.div.appendChild(this.head)

        this.currencyBaseSelect = new CurrencyBaseSelect();
        this.div.appendChild(this.currencyBaseSelect.div);

        this.input_block = document.createElement('div');
        this.input_block.classList.add(cls + '__input-block');
        this.div.appendChild(this.input_block)

        this.input = document.createElement('input');
        this.input.type = "number";
        this.input.classList.add(cls + '__input');
        this.input.addEventListener('keyup', e => { e.stopPropagation(); this.switchNum(this.input.value) });
        this.input.addEventListener('change', e => { e.stopPropagation(); this.switchNum(this.input.value) });
        this.input_block.appendChild(this.input)

        this.text = document.createElement('div');
        this.text.classList.add(cls + '__text');
        this.input_block.appendChild(this.text)
    }

    switchNum(num) { console.log('On change ' + num) }

    set subSubscribe(value) {
        this.text.innerText = value;
    }

    get subSubscribe() {
        return this.text.innerText;
    }

    get num() {
        return parseFloat(this.input.value);
    }

    set num(value) {
        this.changeNum(value);
    }

    changeNum(num) {
        if (num > 0) {
            this.input.value = parseFloat(num);
        } else {
            this.input.value = 1;
        }
    }
}

class CurrencyConverter {
    constructor() {
        this.baseFrom = '';
        this.baseTo = '';
        this.main = 1;
        this.basis = 1;
    }

    async getPair(okFunc = console.log) {
        const resp = await fetch(`https://api.ratesapi.io/api/latest?base=${this.baseFrom}&symbols=${this.baseTo}`);
        if (resp.status === 200) {
            const data = await resp.json();
            okFunc(this.basis, data.rates[this.baseTo]);
            this.basis = data.rates[this.baseTo];
        } else {
            return Promise.reject('WTF?');
        }
        return resp;
    }

    get left() {
        return this.main;
    }

    get right() {
        return (this.main * this.basis).toFixed(4);
    }

    get leftText() {
        return `1 ${this.baseFrom} = ${(1 * this.basis).toFixed(4)} ${this.baseTo}`
    }

    get rightText() {
        return `1 ${this.baseTo} = ${(1 / this.basis).toFixed(4)} ${this.baseFrom}`
    }
}

class Loader {
    constructor(topem = 'body', cls = "loader") {
        this.cls = cls;
        this.div = document.createElement('div');
        this.p = document.createElement('p');
        this.div.classList.add(cls);
        this.p.classList.add(cls + '__message');
        this.div.appendChild(this.p);
        document.querySelector(topem).appendChild(this.div);
    }
    show(text = 'loading') {
        this.text = text;
        this.div.classList.add(this.cls + '--show');
    }
    hide() {
        this.div.classList.remove(this.cls + '--show');
    }
    set text(value) {
        this.p.innerText = value;
    }
    message(text, timeout = 1000) {
        this.show();
        this.text = text;
        setTimeout(e => {
            loader.hide()
        }, timeout);
    }
}

const makeSwitchBtn = (topem = '.converter', cls = "switch_btn") => {
    const div = document.createElement('div');
    div.classList.add(cls);
    const img = document.createElement('img');
    img.src = "sbt.svg";
    div.appendChild(img);
    document.querySelector(topem).appendChild(div);
    return div;
}

const loader = new Loader();
loader.show()
const converter = new CurrencyConverter();
const leftBlock = new CurrencyBlock('У меня есть');
const switchBtn = makeSwitchBtn();
const rightBlock = new CurrencyBlock('Хочу приобрести');
rightBlock.currencyBaseSelect.selected = 'RUB';
converter.baseFrom = leftBlock.currencyBaseSelect.selected;
converter.baseTo = rightBlock.currencyBaseSelect.selected;


const draw = () => {
    leftBlock.num = converter.left;
    rightBlock.num = converter.right;
    leftBlock.subSubscribe = converter.leftText;
    rightBlock.subSubscribe = converter.rightText;
}

const switcher = function (num) {
    if (this.id) {
        converter.main = (num / converter.basis).toFixed(4);
    } else {
        converter.main = num;
    }
    draw();
}

leftBlock.switchNum = switcher;
rightBlock.switchNum = switcher;

leftBlock.currencyBaseSelect.onChange = function () {
    loader.show('Loading');
    converter.baseFrom = this.selected;
    converter.getPair((ob, nb) => {
        converter.main = (ob / nb * converter.main).toFixed(4);
        loader.hide();
    }).then(draw).catch(e => {
        loader.message('Api совсем плохой');
    });
}

rightBlock.currencyBaseSelect.onChange = function () {
    loader.show('Loading');
    converter.baseTo = this.selected;
    converter.getPair(() => {
        loader.hide();
    }).then(draw).catch(e => {
        loader.message('Api совсем плохой');
    });
}

switchBtn.addEventListener('click', e => {
    const tmpSel = leftBlock.currencyBaseSelect.selected;
    leftBlock.currencyBaseSelect.selectedraw = rightBlock.currencyBaseSelect.selected;
    rightBlock.currencyBaseSelect.selectedraw = tmpSel;
    converter.baseFrom = leftBlock.currencyBaseSelect.selected;
    converter.baseTo = rightBlock.currencyBaseSelect.selected;
    converter.main = converter.main * converter.basis;
    converter.basis = 1 / converter.basis;
    draw();
})


converter.getPair(() => {
    loader.hide();
}).then(draw).catch(e => {
    loader.message('Api совсем плохой');
});