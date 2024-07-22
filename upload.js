function bytesToSize(bytes) {
    const sizes = ['Bytes', 'kb', 'mb', 'gb', 'tb']
    if (!bytes) {
        return '0 Byte'
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)
    if (classes.length) {
        node.classList.add(...classes)
    }

    if (content) {
        node.textContent = content
    }
    return node
}

function noop() {}

export function upload(selector, options = {}) {
    let files = []
    const onUpload = options.onUpload ?? noop
    const input = document.querySelector(selector)
    const preview = element('div', ['preview'])
    const openBtn = element('button', ['btn'], 'Open')
    const upload = element('button', ['btn', 'primary'], 'Upload')
    upload.style.display = 'none'

    if (options.multi) {
        input.setAttribute('multiple', true)
    }

    if (options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','))
    }

    input.insertAdjacentElement('afterend', preview)
    input.insertAdjacentElement('afterend', upload)
    input.insertAdjacentElement('afterend', openBtn)

    const triggerInput = () => input.click()

    const changeHandler = e => {
        if (!e.target.files.length) {
            return
        }

        files = Array.from(e.target.files)
        preview.innerHTML = ''
        upload.style.display = 'inline'

        files.forEach(file => {
            if (!file.type.match('image')) {
                return
            }

            const reader = new FileReader()

            reader.onload = ev => {
                const src = ev.target.result

                preview.insertAdjacentHTML(
                    'afterbegin',
                    `
                    <div class="preview-image"> 
                    <div class="preview-remove" data-name="${
                        file.name
                    }">&times; </div>
                        <img src="${src}" alt="${file.name}"/>
                    <div class="preview-info">
                    <span> ${file.name}</span>
                    ${bytesToSize(file.size)}
                    </div>

                        
                    </div>
                    `
                )
            }

            reader.readAsDataURL(file)
        })
    }

    const removeHandler = ev => {
        if (!ev.target.dataset.name) {
            return
        }
        const { name } = ev.target.dataset
        files = files.filter(file => file.name !== name)

        if (!files.length) {
            upload.style.display = 'none'
        }

        const block = preview
            .querySelector(`[data-name="${name}"]`)
            .closest('.preview-image')

        block.classList.add('removing')
        setTimeout(() => block.remove(), 500)
    }

    const clearPreview = el => {
        el.style.opacity = 1
        el.innerHTML = `<div class="preview-info-progress"> </div>`
    }

    const uploadHandler = () => {
        preview
            .querySelectorAll('.preview-remove')
            .forEach(el => el.remove)

        const previewInfo = preview.querySelectorAll('.preview-info')
        previewInfo.forEach(clearPreview)

        onUpload(files, previewInfo)
    }

    openBtn.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    preview.addEventListener('click', removeHandler)
    upload.addEventListener('click', uploadHandler)
}
