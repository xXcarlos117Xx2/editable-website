// https://microsoft.github.io/monaco-editor/
window.require.config({
    paths: {
        vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs",
    },
});

const htmlDefault = `<section class="contenedor">
  <div class="cuadro rojo">Cuadro ROJO</div>
  <div class="cuadro verde">Cuadro VERDE</div>
  <div class="cuadro azul">Cuadro AZUL</div>
</section>
`

const cssDefault = `body {
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
  color: #222;
  text-align: center;
  padding: 40px;
}

.cuadro {
  display: inline-block;
  border: 3px solid currentColor;
  border-radius: 10px;
  padding: 20px 40px;
  margin: 10px;
  font-weight: bold;
  background: white;
}

.rojo { color: #e53935; }
.verde { color: #43a047; }
.azul { color: #1e88e5; }
`

const jsDefault = `document.querySelectorAll('.cuadro').forEach(cuadro => {
  cuadro.addEventListener('click', () => {
    alert('Has hecho clic en ' + cuadro.textContent);
  });
});
`

const iframe = document.getElementById("preview")

function render() {
    const html = htmlEditor.getValue()
    const css = cssEditor.getValue()
    const js = jsEditor.getValue()
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8">
  <style>${css}</style></head><body>${html}
  <script>${js}<\/script></body></html>`
}

let htmlEditor, cssEditor, jsEditor;

window.require(["vs/editor/editor.main"], function () {
    htmlEditor = monaco.editor.create(document.getElementById("html-editor"), {
        value: htmlDefault,
        language: "html",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
    });

    cssEditor = monaco.editor.create(document.getElementById("css-editor"), {
        value: cssDefault,
        language: "css",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
    });

    jsEditor = monaco.editor.create(document.getElementById("js-editor"), {
        value: jsDefault,
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
    });

    const schedule = debounce(render, 400);
    [htmlEditor, cssEditor, jsEditor].forEach((ed) =>
        ed.onDidChangeModelContent(schedule)
    );

    render();
});

// https://www.freecodecamp.org/espanol/news/curso-debounce-javascript-como-hacer-que-tu-js-espere/
function debounce(fn, ms) {
    let t;
    return (...a) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...a), ms);
    };
}

document.querySelectorAll(".resizer-x").forEach((resizer) => {
    resizer.addEventListener("mousedown", (e) => {
        e.preventDefault();

        const left = resizer.parentElement
        const right = left.nextElementSibling
        const startX = e.clientX
        const startLeft = left.getBoundingClientRect().width
        const startRight = right.getBoundingClientRect().width

        document.body.style.userSelect = "none"
        document.body.style.cursor = "col-resize"

        function move(ev) {
            ev.preventDefault()
            const dx = ev.clientX - startX
            left.style.flex = `0 0 ${startLeft + dx}px`
            right.style.flex = `0 0 ${startRight - dx}px`
            htmlEditor?.layout()
            cssEditor?.layout()
            jsEditor?.layout()
        }

        function up() {
            document.body.style.userSelect = ""
            document.body.style.cursor = ""
            window.removeEventListener("mousemove", move)
            window.removeEventListener("mouseup", up)
        }

        window.addEventListener("mousemove", move, { passive: false })
        window.addEventListener("mouseup", up, { passive: false, once: true })
    });
});

const yResizer = document.querySelector(".resizer-y")
const preview = document.getElementById("preview")
const editorRow = document.querySelector(".editor-row")

yResizer.addEventListener("mousedown", (e) => {
    e.preventDefault()

    const startY = e.clientY;
    const startPreview = preview.getBoundingClientRect().height
    const startEditors = editorRow.getBoundingClientRect().height
    const total = startPreview + startEditors

    preview.style.pointerEvents = "none"
    document.body.classList.add("dragging-y")
    document.body.style.userSelect = "none"
    document.body.style.cursor = "row-resize"

    function move(ev) {
        ev.preventDefault()
        const dy = ev.clientY - startY
        let newPrev = startPreview + dy
        newPrev = Math.max(80, Math.min(total - 100, newPrev))
        const newEdit = total - newPrev

        preview.style.flex = `0 0 ${newPrev}px`
        editorRow.style.flex = `0 0 ${newEdit}px`

        htmlEditor?.layout()
        cssEditor?.layout()
        jsEditor?.layout()
    }

    function up() {
        // Restaurar interacción
        preview.style.pointerEvents = "auto"
        document.body.classList.remove("dragging-y")
        document.body.style.userSelect = ""
        document.body.style.cursor = ""

        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
    }

    window.addEventListener("mousemove", move, { passive: false })
    window.addEventListener("mouseup", up, { passive: false, once: true })
});
