import 'dotenv/config';

export async function load() {
	return {
		gateway: {
            url: process.env.GATEWAY_URL,
        },
        keycloak: {
            url: process.env.KEYCLOAK_URL,
            realm: process.env.KEYCLOAK_REALM,
            clientId: process.env.KEYCLOAK_CLIENT_ID,
        }
	};
}