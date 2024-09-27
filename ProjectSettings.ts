// Dependencies - Project
import { StructureSettingsInterface } from './libraries/structure/StructureSettings';

// ProjectSettings
export const ProjectSettings: StructureSettingsInterface = {
    identifier: 'yourProject',
    title: 'Your Title',
    ownerDisplayName: 'Your Company, Inc.',
    tagline: 'Your tagline',
    description: 'Your description of the project.',
    url: 'https://www.PROJECT_DOMAIN.TLD/',
    apis: {
        base: {
            url: 'https://api.PROJECT_DOMAIN.TLD/graphql', // This needs to be an absolute url, as relative urls cannot be used in SSR
        },
    },
    modules: {
        accounts: true,
        engagement: true,
        support: true,
        posts: true,
        commerce: true,
    },
    theme: {
        defaultClassName: 'light',
    },
    assets: {
        url: 'https://assets.PROJECT_DOMAIN.TLD/',
        favicon: {
            light: {
                location: '/images/icons/favicons/favicon-light.png',
            },
            dark: {
                location: '/images/icons/favicons/favicon-dark.png',
            },
        },
        logo: {
            light: {
                location: '/images/logos/logo-light.png',
            },
            dark: {
                location: '/images/logos/logo-dark.png',
            },
            width: 102,
            height: 37,
        },
    },
    sourceCodeRepositories: {
        structure: {
            url: 'https://github.com/system-inc/structure-next/',
        },
        project: {
            url: 'https://github.com/YOUR_PROJECT_REPOSITORY',
        },
    },
    platforms: {
        x: {
            title: 'X',
            url: 'https://x.com/YOUR_USERNAME',
            type: 'social',
        },
    },
};

// Export - Default
export default ProjectSettings;
