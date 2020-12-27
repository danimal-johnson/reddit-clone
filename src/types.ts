import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';

export type MyContext {
  em: EntitiyManager<any> & EntityManager<IDatabaseDriver<Connection>>
}