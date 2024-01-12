import Keycloak from "keycloak-js";
import { writable } from "svelte/store";

export const getAuthContext = (): IAuthContext => {
    let keycloakInstance: Keycloak | undefined;
    const loading = writable(true);
    const authenticated = writable(false);
    const profile = writable<KeycloakProfile | undefined>(undefined);

    const init = (config: KeycloakConfig): void => {
        keycloakInstance = new Keycloak(config);
        keycloakInstance
            .init({
                onLoad: 'check-sso'
            })
            .then((result) => {
                authenticated.set(result);
                loading.set(false);
            })
            .then(keycloakInstance.loadUserProfile)
            .then(() => {
                profile.set(keycloakInstance?.profile);
            })
            .catch((e) => {
                console.error('unable to initialize keycloak', e);
            });

        keycloakInstance.onTokenExpired = () => {
            keycloakInstance?.login();
        }
    };

    const login = (): void => {
        keycloakInstance?.login();
    };

    const logout = (): void => {
        keycloakInstance?.logout();
    };

    const manageProfile = (): void => {
        keycloakInstance?.accountManagement();
    }

    return {
        loading,
        authenticated,
        profile,
        init,
        login,
        logout,
        manageProfile,
    }
}
