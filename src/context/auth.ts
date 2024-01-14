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
            .then((logged) => {
                authenticated.set(logged);
                loading.set(false);
                return logged;
            })
            .then(async (logged) => {
                if (logged && keycloakInstance !== undefined) {
                    await keycloakInstance.loadUserProfile();
                    profile.set(keycloakInstance?.profile);
                }
            })
            .catch((e) => {
                console.error('unable to initialize keycloak', e);
            })
            .finally(() => {
                loading.set(false);
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
