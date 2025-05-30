/**
 * SOLVERTANK - Maurício Garcia - July 2023
 * Script for the code editor
 * Based on ACE (https://ace.c9.io/)
 */


// Main editor class ----------------------------------------------------------------------------------------------------------------------------------------

class Editor {

    constructor(id) {
        this.id = id;
        this.editor = ace.edit(`editor-${id}`);
        this.container = document.getElementById(`editor-${id}`);
    }

    load() {
        this.editor.setTheme(`ace/theme/monokai`);
        this.editor.session.setMode(`ace/mode/${this.id}`);
        this.editor.setOptions({fontSize: '14pt'});
        this.editor.setValue(localStorage.getItem(`editor_${this.id}`) || '', -1); // Load from local storage
        this.refresh();
        this.container.addEventListener('keyup', () => this.refresh()); // Refresh on every keyup
        this.title();
    }

    get() {
        return this.editor.getValue();
    }

    refresh() {
        const iframe = document.getElementById('iframe').contentWindow.document;
        iframe.open();
        iframe.writeln(
            editor_html.get() +
            '<style>' + editor_css.get() + '</style>' +
            '<script>' + editor_javascript.get() + '</script>'
        )
        iframe.close();
    }

    title() {
        const title = document.getElementById(`editor-${this.id}-title`);
        title.innerHTML = '<div class="editor-title-caption">' +
            this.id.toUpperCase() + '</div>' +
            '<div class="editor-title-buttons">' +
            '<div class="editor-title-button editor-title-button-expand" id="editor-' + this.id + '-button-expand"><i class="fa fa-expand"></i></div>' +
            '<div class="editor-title-button editor-title-button-collapse" id="editor-' + this.id + '-button-collapse" style="display:none"><i class="fa fa-compress"></i></div>' +
            '</div>';
        const button_expand = document.getElementById(`editor-${this.id}-button-expand`);
        button_expand.addEventListener('click', () => this.expand(1));
        const button_collapse = document.getElementById(`editor-${this.id}-button-collapse`);
        button_collapse.addEventListener('click', () => this.expand(0));
    }

    expand(op) {
        const editor = document.getElementById(`editor-${this.id}`);
        const editor_title = document.getElementById(`editor-${this.id}-title`);
        const button_expand = document.getElementById(`editor-${this.id}-button-expand`);
        const button_collapse = document.getElementById(`editor-${this.id}-button-collapse`);
        if (op == 1) {
            button_expand.style.display = 'none';
            button_collapse.style.display = 'block';
            document.querySelectorAll('.editor').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.editor-title').forEach(el => el.style.display = 'none');
            editor_title.style.display = 'flex';
            editor.style.display = 'block';
            editor.style.height = 'calc(100% - 55px)';
        } else {
            button_expand.style.display = 'block';
            button_collapse.style.display = 'none';
            document.querySelectorAll('.editor').forEach(el => {
                el.style.display = 'block';
                el.style.height = '28%';
            });
            document.querySelectorAll('.editor-title').forEach(el => {
                el.style.display = 'flex';
            });
        }

    }

}

// Instantiate editors
const editor_html = new Editor('html');
const editor_css = new Editor('css');
const editor_javascript = new Editor('javascript');



// Toolbox  -----------------------------------------------------------------------------------------------------------------------------------------------
const toolbox = {

    toolbox_button_examples: document.getElementById('toolbox-button-examples'),
    toolbox_button_upload: document.getElementById('toolbox-button-upload'),
    toolbox_button_download: document.getElementById('toolbox-button-download'),
    toolbox_button_save: document.getElementById('toolbox-button-save'),
    toolbox_button_clean: document.getElementById('toolbox-button-clean'),

    load() {
        this.toolbox_button_examples.addEventListener('click', () => this.examples());
        this.toolbox_button_upload.addEventListener('click', () => this.upload());
        this.toolbox_button_download.addEventListener('click', () => this.download());
        this.toolbox_button_save.addEventListener('click', () => this.save());
        this.toolbox_button_clean.addEventListener('click', () => this.clean());
    },

    storageSave() {
        localStorage.setItem('editor_html', editor_html.get());
        localStorage.setItem('editor_css', editor_css.get());
        localStorage.setItem('editor_javascript', editor_javascript.get());
    },


    save() {
        this.storageSave();
        location.reload();
    },

    download() {
        const blob = new Blob([editor_html.get() + '\n<style>\n' + editor_css.get() + '\n</style>\n\n<script>\n' + editor_javascript.get() + '\n</script>'], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "index.html");
    },

    upload() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
        fileInput.addEventListener('change', event => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = e => {
                const contents = e.target.result;
                const html = contents.split('<style>')[0];
                const css = contents.split('<style>')[1].split('</style>')[0];
                const javascript = contents.split('<script>')[1].split('</script>')[0];
                editor_html.editor.setValue(html, -1);
                editor_css.editor.setValue(css, -1);
                editor_javascript.editor.setValue(javascript, -1);
                this.save();
            };
            reader.readAsText(file);
        });

    },

    modalClose() {
        document.getElementById('modal').close();
        const element2 = document.getElementById('modal-close');
        const clonedElement2 = element2.cloneNode(true);  // Clone the element without listeners
        element2.replaceWith(clonedElement2);  // Replace original with the cloned one
    },

    examples() {
        let tx = '';
        tx += '<div class="example-item" id="example-item-start">Start</div>';
        tx += '<div class="example-item" id="example-item-car">Car</div>';
        tx += '<div class="example-item" id="example-item-carplus">Car Plus</div>';
        document.getElementById('modal-title').innerHTML = 'Examples';
        document.getElementById('modal-body').innerHTML = tx;
        document.getElementById('modal-body').contentEditable = false;
        document.getElementById('modal').showModal();
        document.getElementById('modal').scrollTop = 0;
        document.getElementById('modal-close').addEventListener('click', () => this.modalClose());

        document.querySelectorAll('.example-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.id.split('-')[2];
                fetch(`examples/${id}/index.html`)
                    .then(response => response.text())
                    .then(data => {
                        console.log(data);
                        const html = data.split('<style>')[0];
                        const css = data.split('<style>')[1].split('</style>')[0];
                        const javascript = data.split('<script>')[1].split('</script>')[0];
                        editor_html.editor.setValue(html, -1);
                        editor_css.editor.setValue(css, -1);
                        editor_javascript.editor.setValue(javascript, -1);
                        this.modalClose();
                        this.save();
                    })
                    .catch(error => {
                        console.error(error)
                        alert('Error loading example'),
                            this.modalClose();
                    });
            });
        });
    },

    clean() {
        if (!confirm('Are you sure you want to clean the code and local storage?')) return;
        editor_html.editor.setValue('', -1);
        editor_css.editor.setValue('', -1);
        editor_javascript.editor.setValue('', -1);
        this.save();
    },


}

// Load objects
document.addEventListener('DOMContentLoaded', () => {
    
    const appName = "SolverPlay";
    const lang = Z.languageBrowser() 
    Z.termsShow(appName, lang, res => {
        if (res === false) {
            Z.termsError(lang);
            return;
        }
    });
    Z.recordAccess(appName)


    editor_html.load();
    editor_css.load();
    editor_javascript.load();
    toolbox.load();
});

