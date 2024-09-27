# structure-next-template

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`c3`](https://developers.cloudflare.com/pages/get-started/c3). This project uses Tailwind CSS for styling.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

-   [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)
-   Node.js v20.11.1

## Setting Up Your Development Environment

1. **Fork the Repository**

    First, fork the `structure-next-template` repository using GitHub.

2. **Clone the Repository to Your Local Machine Using `git`**

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

3. **Install Dependencies with `NPM`**

    Navigate into the project’s directory and install the necessary dependencies.

    ```bash
    npm i
    ```

4. **Update ProjectSettings.ts**

    `ProjectSettings.ts` is used to configure all of your project settings. Update the file with your project-specific information.

5. **Update the Assets Hostname in `next.config.mjs`**

    The project assumes you will be using a service like Cloudflare R2 to store images. Next.JS needs to be configured to not to optimize images from that host.

6. **(If Using Base API) Update Your package.json Scripts and System hosts File**

    **Update Your package.json Scripts**

    By default, the development server will run on port 7878 over regular `HTTP`, not `HTTPs`. If you are using the Base API, it will require `HTTP Only` cookies in order for the account system to work. These cookies are secure and are not accessible via JavaScript. These cookies will only be sent by web browsers with `HTTPS` connections. So, `HTTPS` needs to be enabled in your development environment.

    Replace the dev script in your package.json:

    ```
    // Default
    "dev": "next dev --port 7878",

    // Update to:
    "dev": "next dev --experimental-https --port 7878 --hostname localhost.PROJECT_DOMAIN.TLD",
    ```

    Where `PROJECT_DOMAIN.TLD` is the domain where you will host your project.

    **Update Your System hosts File**

    In order to access your `HTTPS` web server hosted on `localhost.PROJECT_DOMAIN.TLD`, you will need to update your system hosts file:

    ```bash
    sudo nano /etc/hosts
    ```

    Add this line:

    `127.0.0.1       localhost.PROJECT_DOMAIN.TLD`

    Now `localhost.PROJECT_DOMAIN.TLD` will point to your local machine.

7. **Start the Development Server**

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
