if (!window.smoothe && typeof Smoothe === 'undefined') {

    class Smoothe {        
        constructor() {
            console.log("SMOOTHE CONSTRUCTOR")
            this.parser = new DOMParser();
            document.addEventListener('DOMContentLoaded', () => this.smoothe_tags());
            window.addEventListener('popstate', () => this.smoothe_navigate());
        }
        
        smoothe_tags() {
            console.log("SMOOTHE_TAGS")
            this.smoothe_a();
            this.smoothe_form();
        }
        
        smoothe_navigate(event) {
            console.log("SMOOTHE_NAVIGATE")
            this.get(window.location.href);
        }

        smoothe_a() {
            const anchors = document.querySelectorAll('a');
            anchors.forEach(anchor => {
                anchor.addEventListener('click', event => {
                    event.preventDefault();
        
                    this.get(anchor.getAttribute("href"));            
                    history.pushState(null, '', anchor.getAttribute("href"));
                });
            });
        }
    
        smoothe_form() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', event => {
                    event.preventDefault();
        
                    this.send(form);
                });
            });
        }    

        async get(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                const contentType = response.headers.get('content-type');
                if (contentType.includes('application/json')) {
                    return await response.json();

                } else if (contentType.includes('text/html')) {
                    const html = await response.text();                    
                    this.swap(html);
                    this.smoothe_tags();
                }
                
            } catch(error) {
                console.error(error);
            }
        }

        async send(form) {
            try {
                const formData = new FormData(form);            

                const action = form.getAttribute("action");
                const method = form.getAttribute("method").toUpperCase();

                if (!['POST','PUT','PATCH','DELETE'].includes(method)) {
                    throw new Error('Method not allowed');
                }
                
                const response = await fetch(action, {
                    method: method,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData),
                });            

                if (!response.ok) {
                    throw new Error();
                }

                if (response.redirected) {
                    history.pushState(null, '', response.url);
                    this.get(response.url)

                } else {
                    const html = await response.text();
                    this.swap(html);
                    this.smoothe_tags();
                }

            } catch(error) {
                    console.error(error);
            }
        }


        swap(html) {
            console.log("SWAP");
            const dom = this.parser.parseFromString(html, 'text/html');           

            document.title = dom.title;
            document.body.innerHTML = dom.body.innerHTML;

            this.reset();
            this.js(dom);
            this.css(dom);
        }
        
        reset() {
            const oldBodyTags = document.querySelectorAll('script[smoothe], style[smoothe]');
            const oldHeadTags = document.head.querySelectorAll('script[smoothe]');
            oldBodyTags.forEach(oldTag => {
                oldTag.remove();
            });
            oldHeadTags.forEach(oldTag => {
                oldTag.remove();
            });            
        }

        js(dom) {
            const scriptTags = dom.querySelectorAll('script:not([src])');
            scriptTags.forEach(scriptTag => {
                const script = document.createElement('script');
                script.setAttribute("smoothe", "");
                script.textContent = scriptTag.textContent;
                document.body.appendChild(script);
            });

            const scriptSrcTags = dom.querySelectorAll('script[src]');
            scriptSrcTags.forEach(scriptSrcTag => {
                const url = scriptSrcTag.src;
                fetch(url)
                    .then(response => response.text())
                    .then(content => {
                        const script = document.createElement('script');
                        script.setAttribute("smoothe", "");
                        script.innerHTML = content;
                        document.head.appendChild(script);
                    });
            });
        }    

        css(dom) {
            const styleTags = dom.querySelectorAll('style');
            styleTags.forEach(styleTag => {
                const style = document.createElement('style');
                style.setAttribute("smoothe", "");
                style.textContent = styleTag.textContent;
                document.body.appendChild(style);
            });
                
            const linkTags = dom.querySelectorAll('link[rel="stylesheet"]');
            linkTags.forEach(linkTag => {
                const url = linkTag.href;
                fetch(url)
                    .then(response => response.text())
                    .then(content => {
                        const style = document.createElement('style');
                        style.setAttribute("smoothe", "");
                        style.innerHTML = content;
                        document.head.appendChild(style);
                    });
            });
        }

        loaded() {
            const domContentLoadedEvent = new Event('DOMContentLoaded', {
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(domContentLoadedEvent);
        }   
    }

    window.smoothe = new Smoothe();

}