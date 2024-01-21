import { getContext } from "svelte";
import { get, writable } from "svelte/store";

interface GetEntityContextParams {
    entity: string;
    service?: string;
}

export function getEntityContext<T extends Model>(params: GetEntityContextParams): IEntityContext<T> {
    const websocket = getContext<IWebSocketContext>('websocket');
    
    const service = params.service || `${params.entity}_service`
    const entities = writable<T[]>([]);

    websocket.listen(`${params.entity}_created`, (message) => {
        const value = message.data as T;
        entities.set([
            ...get(entities),
            value
        ]);
    });

    websocket.listen(`${params.entity}_updated`, (message) => {
        const value = message.data as T;
        entities.set([
            ...get(entities).filter((entity) => entity.id !== value.id),
            value
        ]);
    });

    websocket.listen(`${params.entity}_deleted`, (message) => {
        const value = message.data as T;
        entities.set(get(entities).filter((entity) => entity.id !== value.id));
    });

    async function query(filters: QueryFilter[], config?: QueryFunctionConfig): Promise<T[]> {
        const response = await websocket.sendAndWait({
            service,
            method: 'query',
            data: {
                filters,
            }
        });

        const value = response.result as QueryRead<T>;
        const items = value.items;

        if (config?.save) {
            entities.set(items);
        }

        return items;
    }

    async function retrieve(id: string): Promise<T | undefined> {
        const response = await websocket.sendAndWait({
            service,
            method: 'retrieve',
            data: {
                entity_id: id
            }
        });

        if (!response.success) {
            console.error(response.error);
            return undefined;
        }

        const value = response.result as T;
        return value;
    }

    async function create(entity: T): Promise<T | undefined> {
        const response = await websocket.sendAndWait({
            service,
            method: 'create',
            data: {
                payload: {
                    ...entity
                }
            }
        })

        if (!response.success) {
            console.error(response.error);
            return undefined;
        }

        const value = response.result as T;
        return value;
    }

    async function update(id: string, entity: T): Promise<T | undefined> {
        const response = await websocket.sendAndWait({
            service,
            method: 'update',
            data: {
                entity_id: id,
                payload: {
                    ...entity
                }
            }
        })
        
        if (!response.success) {
            console.error(response.error);
            return undefined;
        }

        const value = response.result as T;
        return value;
    }

    async function remove(id: string): Promise<void> {
        const response = await websocket.sendAndWait({
            service,
            method: 'delete',
            data: {
                entity_id: id,
            }
        })
        
        if (!response.success) {
            console.error(response.error);
        }
    }

    return {
        entities,
        query,
        retrieve,
        create,
        update,
        remove,
    }
}
