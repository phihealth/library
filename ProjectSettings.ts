// Dependencies - Project
import { StructureSettingsInterface } from './libraries/structure/StructureSettings';

// ProjectSettings
export const ProjectSettings: StructureSettingsInterface = {
    identifier: 'library',
    title: 'Library',
    ownerDisplayName: 'Phi, Inc.',
    tagline: 'A universal library of infinite wisdom.',
    description: 'A universal library of infinite wisdom.',
    url: 'https://www.phi.health/',
    apis: {
        base: {
            url: 'https://api.phi.health/graphql', // This needs to be an absolute url, as relative urls cannot be used in SSR
        },
    },
    modules: {
        accounts: false,
        engagement: false,
        support: false,
        posts: false,
        commerce: false,
    },
    theme: {
        defaultClassName: 'light',
    },
    assets: {
        url: 'https://assets.phi.health/',
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
