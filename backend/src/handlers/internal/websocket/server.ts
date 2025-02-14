import { server as WsServer, connection, request } from 'websocket';
import { accountRepository } from '@db/repositories/accountRepository';
import { IAccount } from '@db/models/account';
import { Server } from 'http';
import { logger } from '@app/utils/logger';

interface StoredConnection extends connection {
  serverId: string;
  timestamp: number;
}

interface AuthenticatedRequest extends request {
  account?: IAccount;
}

class WebSocketManager {
  private wsServer: WsServer;
  private connections: Map<string, StoredConnection>;
  private serverId: string;
  private readonly REDIS_WS_PREFIX = 'ws:connection:';
  private readonly CONNECTION_TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor(server: Server) {
    this.serverId = `server:${Math.random().toString(36).substring(2, 15)}`;
    this.connections = new Map();

    this.wsServer = new WsServer({
      httpServer: server,
      autoAcceptConnections: false,
    });

    this.setupEventHandlers();
    this.startConnectionCleanup();
  }

  private async storeConnection(
    accountId: string,
    connection: connection
  ): Promise<void> {
    (connection as StoredConnection).serverId = this.serverId;
    (connection as StoredConnection).timestamp = Date.now();

    // Store connection data in memory
    this.connections.set(accountId, connection as StoredConnection);

    logger.info(`Stored WebSocket connection for user ${accountId} in memory`);
  }

  private async removeConnection(accountId: string): Promise<void> {
    // Remove connection data from memory
    this.connections.delete(accountId);
    logger.info(
      `Removed WebSocket connection for user ${accountId} from memory`
    );
  }

  private async authenticateRequest(
    request: AuthenticatedRequest
  ): Promise<boolean> {
    try {
      const accountId = this.getAccountId(request);
      if (!accountId) {
        logger.warn('No accountId provided');
        return false;
      }

      const account = await accountRepository.findAccountById(accountId);
      if (!account) {
        logger.warn(`No user found for accountId ${accountId}`);
        return false;
      }

      request.account = account;
      return true;
    } catch (error) {
      logger.error(error, 'Authentication error:');
      return false;
    }
  }

  private getAccountId(request: any): string | null {
    const url = new URL(
      request.httpRequest.url,
      `http://${request.httpRequest.headers.host}`
    );
    const queryAccountId = url.searchParams.get('accountId');
    if (queryAccountId) return queryAccountId;

    const accountIdHeader = request.httpRequest.headers['accountId'];
    if (accountIdHeader) {
      return accountIdHeader;
    }

    return null;
  }

  private async getConnectionServerId(
    accountId: string
  ): Promise<string | null> {
    const connectionData = this.connections.get(accountId);
    return connectionData ? connectionData.serverId : null;
  }

  private startConnectionCleanup(): void {
    setInterval(
      async () => {
        const now = Date.now();
        for (const [accountId, connectionData] of this.connections.entries()) {
          if (now - connectionData.timestamp > this.CONNECTION_TTL * 1000) {
            this.connections.delete(accountId);
            logger.info(`Cleaned up stale connection for user ${accountId}`);
          }
        }
      },
      60 * 60 * 1000
    ); // Run every hour
  }

  private setupEventHandlers(): void {
    this.wsServer.on('request', async (request: AuthenticatedRequest) => {
      try {
        const isAuthenticated = await this.authenticateRequest(request);
        if (!isAuthenticated) {
          request.reject(401, 'Unauthorized');
          logger.warn('Rejected unauthorized WebSocket connection attempt');
          return;
        }

        const accountId = request.account!.id;
        const connection = request.accept('striga-ws-protocol', request.origin);
        await this.storeConnection(accountId, connection);

        logger.info(`WebSocket connection established for user: ${accountId}`);

        connection.on('close', async () => {
          this.connections.delete(accountId);
          await this.removeConnection(accountId);
          logger.info(`WebSocket connection closed for user: ${accountId}`);
        });

        connection.on('ping', (_, b) => {
          connection.pong(b);
        });
      } catch (error) {
        logger.error(error, 'WebSocket error:');
      }
    });
  }

  public async sendAccountUpdate(
    wallet: IAccount,
    action?: string
  ): Promise<void> {
    try {
      const serverId = await this.getConnectionServerId(wallet.accountId);

      if (serverId === this.serverId) {
        const connection = this.connections.get(wallet.accountId);
        if (connection) {
          connection.sendUTF(
            JSON.stringify({
              type: 'ACCOUNT_UPDATE',
              action,
              data: {
                wallet,
              },
            })
          );

          await this.storeConnection(wallet.accountId, connection);
          logger.info(
            `Wallet update sent to user ${wallet.accountId}: ${wallet.balance}`
          );
        }
      }
    } catch (error) {
      logger.error('Error sending account update:', {
        error,
        id: wallet.accountId,
      });

      return;
    }
  }

  public async getActiveConnections(): Promise<string[]> {
    return Array.from(this.connections.keys());
  }
}

export let wsManager: WebSocketManager;

export const initializeWebSocket = (server: Server): void => {
  wsManager = new WebSocketManager(server);
  logger.info('WebSocket server initialized');
};
