export interface BunHttpConfig {
    appName: string;
    port: number;
    environment: string;
}

export const BUN_HTTP_CONFIG = Symbol("BUN_HTTP_CONFIG");
