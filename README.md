# structure-next-template

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`c3`](https://developers.cloudflare.com/pages/get-started/c3). This project uses Tailwind CSS for styling.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

-   [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)
-   Node.js v20.11.1

## Setting Up Your Development Environment

1. **Fork the repository**

    First, fork this repository using GitHub.

2. **Clone the repository to your local machine using git**

    ```bash
    git clone YOUR_FORK
    ```

    Then, initialize the Structure submodule:

    ```bash
    cd YOUR_FORK
    git submodule update --init --recursive
    cd libraries/structure
    git checkout main
    cd ../../
    ```

3. **Install dependencies**

    Navigate into the project’s directory and install the necessary dependencies.

    ```bash
    npm i
    ```

4. **Update Your hosts File**

    Because we are using `HTTP Only` cookies, we need to use the `HTTPS` protocol when developing. This allows the cookies from `*.PROJECT_DOMAIN.TLD` to be sent in the headers of requests from the web browser. You'll need to update your development machine's hosts file and create a record for `localhost.PROJECT_DOMAIN`.

    ```bash
    sudo nano /etc/hosts
    ```

    Add this line:

    `127.0.0.1       localhost.PROJECT_DOMAIN.TLD`

    Now `localhost.PROJECT_DOMAIN.TLD` will point to your local machine.

5. **Start the development server**

    Start the development server using:

    ```bash
    npm run dev
    ```

    You will be prompted to generate keys necessary to enable `HTTPS` for local development. After the server is running, open [https://localhost.PROJECT_DOMAIN.TLD:7878](https://localhost.PROJECT_DOMAIN.TLD:7878) with your browser.

    You can now view the website in your web browser. Please note that any changes you make in your local codebase will automatically be reflected on your local server.

## GraphQL API Code Sharing

To synchronize your GraphQL types with the Base API, use:

```bash
npm run api
```

This command expects the `api` git repository to be in the `api` folder in the same directory as your `website` git repository.

## Cloudflare Integration

Besides the `npm run dev` script mentioned above `c3` has added a few extra scripts that allow you to integrate the application with the [Cloudflare Pages](https://pages.cloudflare.com/) environment, these are:

-   `pages:build` to build the application for Pages using the [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) CLI
-   `preview` to locally preview your Pages application using the [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI
-   `deploy` to deploy your Pages application using the [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI

> **Note:** While the `npm run dev` script is optimal for local development you should use `npm run preview` on your application as well (periodically or before deployments) in order to make sure that it can properly work in the Pages environment (for more details see the [`@cloudflare/next-on-pages` recommended workflow](https://github.com/cloudflare/next-on-pages/blob/05b6256/internal-packages/next-dev/README.md#recommended-workflow))

## Routing in Next.js

In this project, we are utilizing Next.js `App Router`. The `App Router` determines routing based on the structure of the `/app` directory.

## Styling with Tailwind CSS

This project uses Tailwind CSS, a utility-first CSS framework, for styling. The configuration file for Tailwind CSS is `tailwind.config.js`. As part of the development process, you may need to customize this file according to your feature needs.

## More Resources

The following resources may help you familiarize yourself with the technologies used in this project:

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
-   [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)

Happy coding!
