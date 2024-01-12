import Keycloak from "keycloak-js";
import { writable } from "svelte/store";

export const getAuthContext = (): IAuthContext => {
    let keycloakInstance: Keycloak | undefined;
    const loading = writable(true);
    const authenticated = writable(false);

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
            .catch((e) => {
                console.error('unable to initialize keycloak', e);
            });

        keycloakInstance.onTokenExpired = () => {
            keycloakInstance?.login();
        }
        keycloakInstance.onAuthLogout = () => {
            console.log('logout!');
        }
    };

    const login = (): void => {
        keycloakInstance?.login();
    };

    const logout = (): void => {
        // if (keycloakInstance !== undefined) {
        //     const url = keycloakInstance.createLogoutUrl();
        //     document.location.href = url;
        // }
        keycloakInstance?.logout();
    };

    return {
        loading,
        authenticated,
        init,
        login,
        logout,
    }
}
