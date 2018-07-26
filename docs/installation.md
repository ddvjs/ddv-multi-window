# Installation

## Direct Download / CDN

[https://unpkg.com/ddv-multi-window/dist/ddv-multi-window.js](https://unpkg.com/ddv-multi-window/dist/ddv-multi-window.js)

<!--email_off-->
[Unpkg.com](https://unpkg.com) provides npm-based CDN links. The above link will always point to the latest release on npm. You can also use a specific version/tag via URLs like `https://unpkg.com/ddv-multi-window@2.0.0/dist/ddv-multi-window.js`.
<!--/email_off-->

Include `ddv-multi-window` after Vue and it will install itself automatically:

``` html
<script src="/path/to/vue.js"></script>
<script src="/path/to/ddv-multi-window.js"></script>
```

## npm

``` bash
npm install ddv-multi-window
```

When used with a module system, you must explicitly install the router via `Vue.use()`:

``` js
import Vue from 'vue'
import DdvMultiWindow from 'ddv-multi-window'

Vue.use(DdvMultiWindow)
```

You don't need to do this when using global script tags.

## Dev Build

You will have to clone directly from GitHub and build `ddv-multi-window` yourself if
you want to use the latest dev build.

``` bash
git clone https://github.com/vuejs/ddv-multi-window.git node_modules/ddv-multi-window
cd node_modules/ddv-multi-window
npm install
npm run build
```
