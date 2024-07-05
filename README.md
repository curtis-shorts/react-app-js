# Globus Data Portal

This project is a React implementation of Globus' [JavaScript API](https://globus.github.io/globus-sdk-javascript/index.html) which does simple file transfers between two endpoints. The primary contribution of this code is a library which packages the API in an easy to call client-stub server interface and returns the response and data JSON.

The source code for the project this is based on:
  * The [Globus JS SDK](https://github.com/globus/globus-sdk-javascript) and it's [documentation](https://globus.github.io/globus-sdk-javascript/index.html)
  * A [basic example](https://github.com/globus/globus-sdk-javascript/blob/main/examples/basic/index.html) provided with the Globus JS API
  * A static data portal [example](https://github.com/globus/static-data-portal) and [template](https://github.com/globus/template-data-portal)

# Register your own client with Globus
NOTE: The following was taken straight from the [static data portal template](https://github.com/globus/template-data-portal).
Register an application on Globus – https://app.globus.org/settings/developers
  * You'll be creating an OAuth public client; This option is presented as _"Register a thick client or script that will be installed and run by users on their devices"_.
  * Update the **Redirects** to include your GitHub Pages URL + `/authenticate`, i.e., `https://globus.github.io/template-data-portal/authenticate`, `https://{username}.github.io/{repository}/authenticate`
    * If you have [configured your GitHub Pages to use a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), this will be `https://{domain}/authenticate`
    * It is important to note that Globus Auth **requires HTTPS**.
  * Optional: Specify the **Privacy Policy URL** and **Terms & Conditions URL** to the portal-provided routes, i.e. `https://globus.github.io/example-data-portal/privacy-policy`
