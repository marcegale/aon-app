
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Lead
 * 
 */
export type Lead = $Result.DefaultSelection<Prisma.$LeadPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model rrhh_processes
 * 
 */
export type rrhh_processes = $Result.DefaultSelection<Prisma.$rrhh_processesPayload>
/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model TenantMembership
 * 
 */
export type TenantMembership = $Result.DefaultSelection<Prisma.$TenantMembershipPayload>
/**
 * Model TenantDocument
 * 
 */
export type TenantDocument = $Result.DefaultSelection<Prisma.$TenantDocumentPayload>
/**
 * Model TenantAnalysis
 * 
 */
export type TenantAnalysis = $Result.DefaultSelection<Prisma.$TenantAnalysisPayload>
/**
 * Model RecruitingSearch
 * 
 */
export type RecruitingSearch = $Result.DefaultSelection<Prisma.$RecruitingSearchPayload>
/**
 * Model RecruitingCompanyProfile
 * 
 */
export type RecruitingCompanyProfile = $Result.DefaultSelection<Prisma.$RecruitingCompanyProfilePayload>
/**
 * Model RecruitingAttachment
 * 
 */
export type RecruitingAttachment = $Result.DefaultSelection<Prisma.$RecruitingAttachmentPayload>
/**
 * Model RecruitingCandidate
 * 
 */
export type RecruitingCandidate = $Result.DefaultSelection<Prisma.$RecruitingCandidatePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const MembershipRole: {
  owner: 'owner',
  admin: 'admin',
  member: 'member'
};

export type MembershipRole = (typeof MembershipRole)[keyof typeof MembershipRole]


export const UserStatus: {
  active: 'active',
  invited: 'invited',
  suspended: 'suspended'
};

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

}

export type MembershipRole = $Enums.MembershipRole

export const MembershipRole: typeof $Enums.MembershipRole

export type UserStatus = $Enums.UserStatus

export const UserStatus: typeof $Enums.UserStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Leads
 * const leads = await prisma.lead.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Leads
   * const leads = await prisma.lead.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.lead`: Exposes CRUD operations for the **Lead** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Leads
    * const leads = await prisma.lead.findMany()
    * ```
    */
  get lead(): Prisma.LeadDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.rrhh_processes`: Exposes CRUD operations for the **rrhh_processes** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rrhh_processes
    * const rrhh_processes = await prisma.rrhh_processes.findMany()
    * ```
    */
  get rrhh_processes(): Prisma.rrhh_processesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantMembership`: Exposes CRUD operations for the **TenantMembership** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantMemberships
    * const tenantMemberships = await prisma.tenantMembership.findMany()
    * ```
    */
  get tenantMembership(): Prisma.TenantMembershipDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantDocument`: Exposes CRUD operations for the **TenantDocument** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantDocuments
    * const tenantDocuments = await prisma.tenantDocument.findMany()
    * ```
    */
  get tenantDocument(): Prisma.TenantDocumentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantAnalysis`: Exposes CRUD operations for the **TenantAnalysis** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantAnalyses
    * const tenantAnalyses = await prisma.tenantAnalysis.findMany()
    * ```
    */
  get tenantAnalysis(): Prisma.TenantAnalysisDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recruitingSearch`: Exposes CRUD operations for the **RecruitingSearch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecruitingSearches
    * const recruitingSearches = await prisma.recruitingSearch.findMany()
    * ```
    */
  get recruitingSearch(): Prisma.RecruitingSearchDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recruitingCompanyProfile`: Exposes CRUD operations for the **RecruitingCompanyProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecruitingCompanyProfiles
    * const recruitingCompanyProfiles = await prisma.recruitingCompanyProfile.findMany()
    * ```
    */
  get recruitingCompanyProfile(): Prisma.RecruitingCompanyProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recruitingAttachment`: Exposes CRUD operations for the **RecruitingAttachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecruitingAttachments
    * const recruitingAttachments = await prisma.recruitingAttachment.findMany()
    * ```
    */
  get recruitingAttachment(): Prisma.RecruitingAttachmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recruitingCandidate`: Exposes CRUD operations for the **RecruitingCandidate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecruitingCandidates
    * const recruitingCandidates = await prisma.recruitingCandidate.findMany()
    * ```
    */
  get recruitingCandidate(): Prisma.RecruitingCandidateDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.6.0
   * Query Engine version: 75cbdc1eb7150937890ad5465d861175c6624711
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Lead: 'Lead',
    User: 'User',
    rrhh_processes: 'rrhh_processes',
    Tenant: 'Tenant',
    TenantMembership: 'TenantMembership',
    TenantDocument: 'TenantDocument',
    TenantAnalysis: 'TenantAnalysis',
    RecruitingSearch: 'RecruitingSearch',
    RecruitingCompanyProfile: 'RecruitingCompanyProfile',
    RecruitingAttachment: 'RecruitingAttachment',
    RecruitingCandidate: 'RecruitingCandidate'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "lead" | "user" | "rrhh_processes" | "tenant" | "tenantMembership" | "tenantDocument" | "tenantAnalysis" | "recruitingSearch" | "recruitingCompanyProfile" | "recruitingAttachment" | "recruitingCandidate"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Lead: {
        payload: Prisma.$LeadPayload<ExtArgs>
        fields: Prisma.LeadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          findFirst: {
            args: Prisma.LeadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          findMany: {
            args: Prisma.LeadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          create: {
            args: Prisma.LeadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          createMany: {
            args: Prisma.LeadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LeadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          delete: {
            args: Prisma.LeadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          update: {
            args: Prisma.LeadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          deleteMany: {
            args: Prisma.LeadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LeadUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          upsert: {
            args: Prisma.LeadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          aggregate: {
            args: Prisma.LeadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLead>
          }
          groupBy: {
            args: Prisma.LeadGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeadGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeadCountArgs<ExtArgs>
            result: $Utils.Optional<LeadCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      rrhh_processes: {
        payload: Prisma.$rrhh_processesPayload<ExtArgs>
        fields: Prisma.rrhh_processesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.rrhh_processesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.rrhh_processesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>
          }
          findFirst: {
            args: Prisma.rrhh_processesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.rrhh_processesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>
          }
          findMany: {
            args: Prisma.rrhh_processesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>[]
          }
          create: {
            args: Prisma.rrhh_processesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>
          }
          createMany: {
            args: Prisma.rrhh_processesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.rrhh_processesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>[]
          }
          delete: {
            args: Prisma.rrhh_processesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>
          }
          update: {
            args: Prisma.rrhh_processesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>
          }
          deleteMany: {
            args: Prisma.rrhh_processesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.rrhh_processesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.rrhh_processesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>[]
          }
          upsert: {
            args: Prisma.rrhh_processesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rrhh_processesPayload>
          }
          aggregate: {
            args: Prisma.Rrhh_processesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRrhh_processes>
          }
          groupBy: {
            args: Prisma.rrhh_processesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Rrhh_processesGroupByOutputType>[]
          }
          count: {
            args: Prisma.rrhh_processesCountArgs<ExtArgs>
            result: $Utils.Optional<Rrhh_processesCountAggregateOutputType> | number
          }
        }
      }
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      TenantMembership: {
        payload: Prisma.$TenantMembershipPayload<ExtArgs>
        fields: Prisma.TenantMembershipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantMembershipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantMembershipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>
          }
          findFirst: {
            args: Prisma.TenantMembershipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantMembershipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>
          }
          findMany: {
            args: Prisma.TenantMembershipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>[]
          }
          create: {
            args: Prisma.TenantMembershipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>
          }
          createMany: {
            args: Prisma.TenantMembershipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantMembershipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>[]
          }
          delete: {
            args: Prisma.TenantMembershipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>
          }
          update: {
            args: Prisma.TenantMembershipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>
          }
          deleteMany: {
            args: Prisma.TenantMembershipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantMembershipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantMembershipUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>[]
          }
          upsert: {
            args: Prisma.TenantMembershipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantMembershipPayload>
          }
          aggregate: {
            args: Prisma.TenantMembershipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantMembership>
          }
          groupBy: {
            args: Prisma.TenantMembershipGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantMembershipGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantMembershipCountArgs<ExtArgs>
            result: $Utils.Optional<TenantMembershipCountAggregateOutputType> | number
          }
        }
      }
      TenantDocument: {
        payload: Prisma.$TenantDocumentPayload<ExtArgs>
        fields: Prisma.TenantDocumentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantDocumentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantDocumentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>
          }
          findFirst: {
            args: Prisma.TenantDocumentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantDocumentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>
          }
          findMany: {
            args: Prisma.TenantDocumentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>[]
          }
          create: {
            args: Prisma.TenantDocumentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>
          }
          createMany: {
            args: Prisma.TenantDocumentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantDocumentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>[]
          }
          delete: {
            args: Prisma.TenantDocumentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>
          }
          update: {
            args: Prisma.TenantDocumentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>
          }
          deleteMany: {
            args: Prisma.TenantDocumentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantDocumentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantDocumentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>[]
          }
          upsert: {
            args: Prisma.TenantDocumentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantDocumentPayload>
          }
          aggregate: {
            args: Prisma.TenantDocumentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantDocument>
          }
          groupBy: {
            args: Prisma.TenantDocumentGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantDocumentGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantDocumentCountArgs<ExtArgs>
            result: $Utils.Optional<TenantDocumentCountAggregateOutputType> | number
          }
        }
      }
      TenantAnalysis: {
        payload: Prisma.$TenantAnalysisPayload<ExtArgs>
        fields: Prisma.TenantAnalysisFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantAnalysisFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantAnalysisFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>
          }
          findFirst: {
            args: Prisma.TenantAnalysisFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantAnalysisFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>
          }
          findMany: {
            args: Prisma.TenantAnalysisFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>[]
          }
          create: {
            args: Prisma.TenantAnalysisCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>
          }
          createMany: {
            args: Prisma.TenantAnalysisCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantAnalysisCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>[]
          }
          delete: {
            args: Prisma.TenantAnalysisDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>
          }
          update: {
            args: Prisma.TenantAnalysisUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>
          }
          deleteMany: {
            args: Prisma.TenantAnalysisDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantAnalysisUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantAnalysisUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>[]
          }
          upsert: {
            args: Prisma.TenantAnalysisUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAnalysisPayload>
          }
          aggregate: {
            args: Prisma.TenantAnalysisAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantAnalysis>
          }
          groupBy: {
            args: Prisma.TenantAnalysisGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantAnalysisGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantAnalysisCountArgs<ExtArgs>
            result: $Utils.Optional<TenantAnalysisCountAggregateOutputType> | number
          }
        }
      }
      RecruitingSearch: {
        payload: Prisma.$RecruitingSearchPayload<ExtArgs>
        fields: Prisma.RecruitingSearchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecruitingSearchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecruitingSearchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>
          }
          findFirst: {
            args: Prisma.RecruitingSearchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecruitingSearchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>
          }
          findMany: {
            args: Prisma.RecruitingSearchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>[]
          }
          create: {
            args: Prisma.RecruitingSearchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>
          }
          createMany: {
            args: Prisma.RecruitingSearchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecruitingSearchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>[]
          }
          delete: {
            args: Prisma.RecruitingSearchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>
          }
          update: {
            args: Prisma.RecruitingSearchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>
          }
          deleteMany: {
            args: Prisma.RecruitingSearchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecruitingSearchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecruitingSearchUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>[]
          }
          upsert: {
            args: Prisma.RecruitingSearchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingSearchPayload>
          }
          aggregate: {
            args: Prisma.RecruitingSearchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecruitingSearch>
          }
          groupBy: {
            args: Prisma.RecruitingSearchGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecruitingSearchGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecruitingSearchCountArgs<ExtArgs>
            result: $Utils.Optional<RecruitingSearchCountAggregateOutputType> | number
          }
        }
      }
      RecruitingCompanyProfile: {
        payload: Prisma.$RecruitingCompanyProfilePayload<ExtArgs>
        fields: Prisma.RecruitingCompanyProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecruitingCompanyProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecruitingCompanyProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>
          }
          findFirst: {
            args: Prisma.RecruitingCompanyProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecruitingCompanyProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>
          }
          findMany: {
            args: Prisma.RecruitingCompanyProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>[]
          }
          create: {
            args: Prisma.RecruitingCompanyProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>
          }
          createMany: {
            args: Prisma.RecruitingCompanyProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecruitingCompanyProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>[]
          }
          delete: {
            args: Prisma.RecruitingCompanyProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>
          }
          update: {
            args: Prisma.RecruitingCompanyProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>
          }
          deleteMany: {
            args: Prisma.RecruitingCompanyProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecruitingCompanyProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecruitingCompanyProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>[]
          }
          upsert: {
            args: Prisma.RecruitingCompanyProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCompanyProfilePayload>
          }
          aggregate: {
            args: Prisma.RecruitingCompanyProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecruitingCompanyProfile>
          }
          groupBy: {
            args: Prisma.RecruitingCompanyProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecruitingCompanyProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecruitingCompanyProfileCountArgs<ExtArgs>
            result: $Utils.Optional<RecruitingCompanyProfileCountAggregateOutputType> | number
          }
        }
      }
      RecruitingAttachment: {
        payload: Prisma.$RecruitingAttachmentPayload<ExtArgs>
        fields: Prisma.RecruitingAttachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecruitingAttachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecruitingAttachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>
          }
          findFirst: {
            args: Prisma.RecruitingAttachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecruitingAttachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>
          }
          findMany: {
            args: Prisma.RecruitingAttachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>[]
          }
          create: {
            args: Prisma.RecruitingAttachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>
          }
          createMany: {
            args: Prisma.RecruitingAttachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecruitingAttachmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>[]
          }
          delete: {
            args: Prisma.RecruitingAttachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>
          }
          update: {
            args: Prisma.RecruitingAttachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>
          }
          deleteMany: {
            args: Prisma.RecruitingAttachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecruitingAttachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecruitingAttachmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>[]
          }
          upsert: {
            args: Prisma.RecruitingAttachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingAttachmentPayload>
          }
          aggregate: {
            args: Prisma.RecruitingAttachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecruitingAttachment>
          }
          groupBy: {
            args: Prisma.RecruitingAttachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecruitingAttachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecruitingAttachmentCountArgs<ExtArgs>
            result: $Utils.Optional<RecruitingAttachmentCountAggregateOutputType> | number
          }
        }
      }
      RecruitingCandidate: {
        payload: Prisma.$RecruitingCandidatePayload<ExtArgs>
        fields: Prisma.RecruitingCandidateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecruitingCandidateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecruitingCandidateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>
          }
          findFirst: {
            args: Prisma.RecruitingCandidateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecruitingCandidateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>
          }
          findMany: {
            args: Prisma.RecruitingCandidateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>[]
          }
          create: {
            args: Prisma.RecruitingCandidateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>
          }
          createMany: {
            args: Prisma.RecruitingCandidateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecruitingCandidateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>[]
          }
          delete: {
            args: Prisma.RecruitingCandidateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>
          }
          update: {
            args: Prisma.RecruitingCandidateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>
          }
          deleteMany: {
            args: Prisma.RecruitingCandidateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecruitingCandidateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecruitingCandidateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>[]
          }
          upsert: {
            args: Prisma.RecruitingCandidateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecruitingCandidatePayload>
          }
          aggregate: {
            args: Prisma.RecruitingCandidateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecruitingCandidate>
          }
          groupBy: {
            args: Prisma.RecruitingCandidateGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecruitingCandidateGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecruitingCandidateCountArgs<ExtArgs>
            result: $Utils.Optional<RecruitingCandidateCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    lead?: LeadOmit
    user?: UserOmit
    rrhh_processes?: rrhh_processesOmit
    tenant?: TenantOmit
    tenantMembership?: TenantMembershipOmit
    tenantDocument?: TenantDocumentOmit
    tenantAnalysis?: TenantAnalysisOmit
    recruitingSearch?: RecruitingSearchOmit
    recruitingCompanyProfile?: RecruitingCompanyProfileOmit
    recruitingAttachment?: RecruitingAttachmentOmit
    recruitingCandidate?: RecruitingCandidateOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    memberships: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | UserCountOutputTypeCountMembershipsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantMembershipWhereInput
  }


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    documents: number
    analyses: number
    memberships: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documents?: boolean | TenantCountOutputTypeCountDocumentsArgs
    analyses?: boolean | TenantCountOutputTypeCountAnalysesArgs
    memberships?: boolean | TenantCountOutputTypeCountMembershipsArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountDocumentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantDocumentWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountAnalysesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantAnalysisWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantMembershipWhereInput
  }


  /**
   * Count Type RecruitingSearchCountOutputType
   */

  export type RecruitingSearchCountOutputType = {
    attachments: number
    candidates: number
  }

  export type RecruitingSearchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attachments?: boolean | RecruitingSearchCountOutputTypeCountAttachmentsArgs
    candidates?: boolean | RecruitingSearchCountOutputTypeCountCandidatesArgs
  }

  // Custom InputTypes
  /**
   * RecruitingSearchCountOutputType without action
   */
  export type RecruitingSearchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearchCountOutputType
     */
    select?: RecruitingSearchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RecruitingSearchCountOutputType without action
   */
  export type RecruitingSearchCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecruitingAttachmentWhereInput
  }

  /**
   * RecruitingSearchCountOutputType without action
   */
  export type RecruitingSearchCountOutputTypeCountCandidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecruitingCandidateWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Lead
   */

  export type AggregateLead = {
    _count: LeadCountAggregateOutputType | null
    _avg: LeadAvgAggregateOutputType | null
    _sum: LeadSumAggregateOutputType | null
    _min: LeadMinAggregateOutputType | null
    _max: LeadMaxAggregateOutputType | null
  }

  export type LeadAvgAggregateOutputType = {
    leadScore: number | null
  }

  export type LeadSumAggregateOutputType = {
    leadScore: number | null
  }

  export type LeadMinAggregateOutputType = {
    id: string | null
    nombre: string | null
    empresa: string | null
    email: string | null
    rubro: string | null
    empleados: string | null
    codigoPais: string | null
    telefono: string | null
    telefonoCompleto: string | null
    facturacionAnual: string | null
    problema: string | null
    objetivo: string | null
    diagnostico: string | null
    diagnosticoResumen: string | null
    leadScore: number | null
    leadLevel: string | null
    emailStatus: string | null
    emailError: string | null
    aceptaTerminos: boolean | null
    fechaAceptacion: Date | null
    humanVerified: boolean | null
    isUnlocked: boolean | null
    unlockedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    estadoComercial: string | null
    notasInternas: string | null
  }

  export type LeadMaxAggregateOutputType = {
    id: string | null
    nombre: string | null
    empresa: string | null
    email: string | null
    rubro: string | null
    empleados: string | null
    codigoPais: string | null
    telefono: string | null
    telefonoCompleto: string | null
    facturacionAnual: string | null
    problema: string | null
    objetivo: string | null
    diagnostico: string | null
    diagnosticoResumen: string | null
    leadScore: number | null
    leadLevel: string | null
    emailStatus: string | null
    emailError: string | null
    aceptaTerminos: boolean | null
    fechaAceptacion: Date | null
    humanVerified: boolean | null
    isUnlocked: boolean | null
    unlockedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    estadoComercial: string | null
    notasInternas: string | null
  }

  export type LeadCountAggregateOutputType = {
    id: number
    nombre: number
    empresa: number
    email: number
    rubro: number
    empleados: number
    codigoPais: number
    telefono: number
    telefonoCompleto: number
    facturacionAnual: number
    problema: number
    objetivo: number
    diagnostico: number
    diagnosticoResumen: number
    leadScore: number
    leadLevel: number
    emailStatus: number
    emailError: number
    aceptaTerminos: number
    fechaAceptacion: number
    humanVerified: number
    isUnlocked: number
    unlockedAt: number
    createdAt: number
    updatedAt: number
    estadoComercial: number
    notasInternas: number
    _all: number
  }


  export type LeadAvgAggregateInputType = {
    leadScore?: true
  }

  export type LeadSumAggregateInputType = {
    leadScore?: true
  }

  export type LeadMinAggregateInputType = {
    id?: true
    nombre?: true
    empresa?: true
    email?: true
    rubro?: true
    empleados?: true
    codigoPais?: true
    telefono?: true
    telefonoCompleto?: true
    facturacionAnual?: true
    problema?: true
    objetivo?: true
    diagnostico?: true
    diagnosticoResumen?: true
    leadScore?: true
    leadLevel?: true
    emailStatus?: true
    emailError?: true
    aceptaTerminos?: true
    fechaAceptacion?: true
    humanVerified?: true
    isUnlocked?: true
    unlockedAt?: true
    createdAt?: true
    updatedAt?: true
    estadoComercial?: true
    notasInternas?: true
  }

  export type LeadMaxAggregateInputType = {
    id?: true
    nombre?: true
    empresa?: true
    email?: true
    rubro?: true
    empleados?: true
    codigoPais?: true
    telefono?: true
    telefonoCompleto?: true
    facturacionAnual?: true
    problema?: true
    objetivo?: true
    diagnostico?: true
    diagnosticoResumen?: true
    leadScore?: true
    leadLevel?: true
    emailStatus?: true
    emailError?: true
    aceptaTerminos?: true
    fechaAceptacion?: true
    humanVerified?: true
    isUnlocked?: true
    unlockedAt?: true
    createdAt?: true
    updatedAt?: true
    estadoComercial?: true
    notasInternas?: true
  }

  export type LeadCountAggregateInputType = {
    id?: true
    nombre?: true
    empresa?: true
    email?: true
    rubro?: true
    empleados?: true
    codigoPais?: true
    telefono?: true
    telefonoCompleto?: true
    facturacionAnual?: true
    problema?: true
    objetivo?: true
    diagnostico?: true
    diagnosticoResumen?: true
    leadScore?: true
    leadLevel?: true
    emailStatus?: true
    emailError?: true
    aceptaTerminos?: true
    fechaAceptacion?: true
    humanVerified?: true
    isUnlocked?: true
    unlockedAt?: true
    createdAt?: true
    updatedAt?: true
    estadoComercial?: true
    notasInternas?: true
    _all?: true
  }

  export type LeadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lead to aggregate.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Leads
    **/
    _count?: true | LeadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeadMaxAggregateInputType
  }

  export type GetLeadAggregateType<T extends LeadAggregateArgs> = {
        [P in keyof T & keyof AggregateLead]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLead[P]>
      : GetScalarType<T[P], AggregateLead[P]>
  }




  export type LeadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeadWhereInput
    orderBy?: LeadOrderByWithAggregationInput | LeadOrderByWithAggregationInput[]
    by: LeadScalarFieldEnum[] | LeadScalarFieldEnum
    having?: LeadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeadCountAggregateInputType | true
    _avg?: LeadAvgAggregateInputType
    _sum?: LeadSumAggregateInputType
    _min?: LeadMinAggregateInputType
    _max?: LeadMaxAggregateInputType
  }

  export type LeadGroupByOutputType = {
    id: string
    nombre: string | null
    empresa: string | null
    email: string | null
    rubro: string | null
    empleados: string | null
    codigoPais: string | null
    telefono: string | null
    telefonoCompleto: string | null
    facturacionAnual: string | null
    problema: string
    objetivo: string
    diagnostico: string
    diagnosticoResumen: string | null
    leadScore: number
    leadLevel: string
    emailStatus: string | null
    emailError: string | null
    aceptaTerminos: boolean
    fechaAceptacion: Date | null
    humanVerified: boolean
    isUnlocked: boolean
    unlockedAt: Date | null
    createdAt: Date
    updatedAt: Date
    estadoComercial: string
    notasInternas: string | null
    _count: LeadCountAggregateOutputType | null
    _avg: LeadAvgAggregateOutputType | null
    _sum: LeadSumAggregateOutputType | null
    _min: LeadMinAggregateOutputType | null
    _max: LeadMaxAggregateOutputType | null
  }

  type GetLeadGroupByPayload<T extends LeadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeadGroupByOutputType[P]>
            : GetScalarType<T[P], LeadGroupByOutputType[P]>
        }
      >
    >


  export type LeadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    empresa?: boolean
    email?: boolean
    rubro?: boolean
    empleados?: boolean
    codigoPais?: boolean
    telefono?: boolean
    telefonoCompleto?: boolean
    facturacionAnual?: boolean
    problema?: boolean
    objetivo?: boolean
    diagnostico?: boolean
    diagnosticoResumen?: boolean
    leadScore?: boolean
    leadLevel?: boolean
    emailStatus?: boolean
    emailError?: boolean
    aceptaTerminos?: boolean
    fechaAceptacion?: boolean
    humanVerified?: boolean
    isUnlocked?: boolean
    unlockedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    estadoComercial?: boolean
    notasInternas?: boolean
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    empresa?: boolean
    email?: boolean
    rubro?: boolean
    empleados?: boolean
    codigoPais?: boolean
    telefono?: boolean
    telefonoCompleto?: boolean
    facturacionAnual?: boolean
    problema?: boolean
    objetivo?: boolean
    diagnostico?: boolean
    diagnosticoResumen?: boolean
    leadScore?: boolean
    leadLevel?: boolean
    emailStatus?: boolean
    emailError?: boolean
    aceptaTerminos?: boolean
    fechaAceptacion?: boolean
    humanVerified?: boolean
    isUnlocked?: boolean
    unlockedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    estadoComercial?: boolean
    notasInternas?: boolean
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    empresa?: boolean
    email?: boolean
    rubro?: boolean
    empleados?: boolean
    codigoPais?: boolean
    telefono?: boolean
    telefonoCompleto?: boolean
    facturacionAnual?: boolean
    problema?: boolean
    objetivo?: boolean
    diagnostico?: boolean
    diagnosticoResumen?: boolean
    leadScore?: boolean
    leadLevel?: boolean
    emailStatus?: boolean
    emailError?: boolean
    aceptaTerminos?: boolean
    fechaAceptacion?: boolean
    humanVerified?: boolean
    isUnlocked?: boolean
    unlockedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    estadoComercial?: boolean
    notasInternas?: boolean
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectScalar = {
    id?: boolean
    nombre?: boolean
    empresa?: boolean
    email?: boolean
    rubro?: boolean
    empleados?: boolean
    codigoPais?: boolean
    telefono?: boolean
    telefonoCompleto?: boolean
    facturacionAnual?: boolean
    problema?: boolean
    objetivo?: boolean
    diagnostico?: boolean
    diagnosticoResumen?: boolean
    leadScore?: boolean
    leadLevel?: boolean
    emailStatus?: boolean
    emailError?: boolean
    aceptaTerminos?: boolean
    fechaAceptacion?: boolean
    humanVerified?: boolean
    isUnlocked?: boolean
    unlockedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    estadoComercial?: boolean
    notasInternas?: boolean
  }

  export type LeadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombre" | "empresa" | "email" | "rubro" | "empleados" | "codigoPais" | "telefono" | "telefonoCompleto" | "facturacionAnual" | "problema" | "objetivo" | "diagnostico" | "diagnosticoResumen" | "leadScore" | "leadLevel" | "emailStatus" | "emailError" | "aceptaTerminos" | "fechaAceptacion" | "humanVerified" | "isUnlocked" | "unlockedAt" | "createdAt" | "updatedAt" | "estadoComercial" | "notasInternas", ExtArgs["result"]["lead"]>

  export type $LeadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Lead"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nombre: string | null
      empresa: string | null
      email: string | null
      rubro: string | null
      empleados: string | null
      codigoPais: string | null
      telefono: string | null
      telefonoCompleto: string | null
      facturacionAnual: string | null
      problema: string
      objetivo: string
      diagnostico: string
      diagnosticoResumen: string | null
      leadScore: number
      leadLevel: string
      emailStatus: string | null
      emailError: string | null
      aceptaTerminos: boolean
      fechaAceptacion: Date | null
      humanVerified: boolean
      isUnlocked: boolean
      unlockedAt: Date | null
      createdAt: Date
      updatedAt: Date
      estadoComercial: string
      notasInternas: string | null
    }, ExtArgs["result"]["lead"]>
    composites: {}
  }

  type LeadGetPayload<S extends boolean | null | undefined | LeadDefaultArgs> = $Result.GetResult<Prisma.$LeadPayload, S>

  type LeadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LeadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LeadCountAggregateInputType | true
    }

  export interface LeadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Lead'], meta: { name: 'Lead' } }
    /**
     * Find zero or one Lead that matches the filter.
     * @param {LeadFindUniqueArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeadFindUniqueArgs>(args: SelectSubset<T, LeadFindUniqueArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Lead that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LeadFindUniqueOrThrowArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeadFindUniqueOrThrowArgs>(args: SelectSubset<T, LeadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lead that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindFirstArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeadFindFirstArgs>(args?: SelectSubset<T, LeadFindFirstArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lead that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindFirstOrThrowArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeadFindFirstOrThrowArgs>(args?: SelectSubset<T, LeadFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Leads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leads
     * const leads = await prisma.lead.findMany()
     * 
     * // Get first 10 Leads
     * const leads = await prisma.lead.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leadWithIdOnly = await prisma.lead.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeadFindManyArgs>(args?: SelectSubset<T, LeadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Lead.
     * @param {LeadCreateArgs} args - Arguments to create a Lead.
     * @example
     * // Create one Lead
     * const Lead = await prisma.lead.create({
     *   data: {
     *     // ... data to create a Lead
     *   }
     * })
     * 
     */
    create<T extends LeadCreateArgs>(args: SelectSubset<T, LeadCreateArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Leads.
     * @param {LeadCreateManyArgs} args - Arguments to create many Leads.
     * @example
     * // Create many Leads
     * const lead = await prisma.lead.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeadCreateManyArgs>(args?: SelectSubset<T, LeadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Leads and returns the data saved in the database.
     * @param {LeadCreateManyAndReturnArgs} args - Arguments to create many Leads.
     * @example
     * // Create many Leads
     * const lead = await prisma.lead.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Leads and only return the `id`
     * const leadWithIdOnly = await prisma.lead.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LeadCreateManyAndReturnArgs>(args?: SelectSubset<T, LeadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Lead.
     * @param {LeadDeleteArgs} args - Arguments to delete one Lead.
     * @example
     * // Delete one Lead
     * const Lead = await prisma.lead.delete({
     *   where: {
     *     // ... filter to delete one Lead
     *   }
     * })
     * 
     */
    delete<T extends LeadDeleteArgs>(args: SelectSubset<T, LeadDeleteArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Lead.
     * @param {LeadUpdateArgs} args - Arguments to update one Lead.
     * @example
     * // Update one Lead
     * const lead = await prisma.lead.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeadUpdateArgs>(args: SelectSubset<T, LeadUpdateArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Leads.
     * @param {LeadDeleteManyArgs} args - Arguments to filter Leads to delete.
     * @example
     * // Delete a few Leads
     * const { count } = await prisma.lead.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeadDeleteManyArgs>(args?: SelectSubset<T, LeadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leads
     * const lead = await prisma.lead.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeadUpdateManyArgs>(args: SelectSubset<T, LeadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leads and returns the data updated in the database.
     * @param {LeadUpdateManyAndReturnArgs} args - Arguments to update many Leads.
     * @example
     * // Update many Leads
     * const lead = await prisma.lead.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Leads and only return the `id`
     * const leadWithIdOnly = await prisma.lead.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LeadUpdateManyAndReturnArgs>(args: SelectSubset<T, LeadUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Lead.
     * @param {LeadUpsertArgs} args - Arguments to update or create a Lead.
     * @example
     * // Update or create a Lead
     * const lead = await prisma.lead.upsert({
     *   create: {
     *     // ... data to create a Lead
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lead we want to update
     *   }
     * })
     */
    upsert<T extends LeadUpsertArgs>(args: SelectSubset<T, LeadUpsertArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Leads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadCountArgs} args - Arguments to filter Leads to count.
     * @example
     * // Count the number of Leads
     * const count = await prisma.lead.count({
     *   where: {
     *     // ... the filter for the Leads we want to count
     *   }
     * })
    **/
    count<T extends LeadCountArgs>(
      args?: Subset<T, LeadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeadAggregateArgs>(args: Subset<T, LeadAggregateArgs>): Prisma.PrismaPromise<GetLeadAggregateType<T>>

    /**
     * Group by Lead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LeadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeadGroupByArgs['orderBy'] }
        : { orderBy?: LeadGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LeadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Lead model
   */
  readonly fields: LeadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Lead.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Lead model
   */
  interface LeadFieldRefs {
    readonly id: FieldRef<"Lead", 'String'>
    readonly nombre: FieldRef<"Lead", 'String'>
    readonly empresa: FieldRef<"Lead", 'String'>
    readonly email: FieldRef<"Lead", 'String'>
    readonly rubro: FieldRef<"Lead", 'String'>
    readonly empleados: FieldRef<"Lead", 'String'>
    readonly codigoPais: FieldRef<"Lead", 'String'>
    readonly telefono: FieldRef<"Lead", 'String'>
    readonly telefonoCompleto: FieldRef<"Lead", 'String'>
    readonly facturacionAnual: FieldRef<"Lead", 'String'>
    readonly problema: FieldRef<"Lead", 'String'>
    readonly objetivo: FieldRef<"Lead", 'String'>
    readonly diagnostico: FieldRef<"Lead", 'String'>
    readonly diagnosticoResumen: FieldRef<"Lead", 'String'>
    readonly leadScore: FieldRef<"Lead", 'Int'>
    readonly leadLevel: FieldRef<"Lead", 'String'>
    readonly emailStatus: FieldRef<"Lead", 'String'>
    readonly emailError: FieldRef<"Lead", 'String'>
    readonly aceptaTerminos: FieldRef<"Lead", 'Boolean'>
    readonly fechaAceptacion: FieldRef<"Lead", 'DateTime'>
    readonly humanVerified: FieldRef<"Lead", 'Boolean'>
    readonly isUnlocked: FieldRef<"Lead", 'Boolean'>
    readonly unlockedAt: FieldRef<"Lead", 'DateTime'>
    readonly createdAt: FieldRef<"Lead", 'DateTime'>
    readonly updatedAt: FieldRef<"Lead", 'DateTime'>
    readonly estadoComercial: FieldRef<"Lead", 'String'>
    readonly notasInternas: FieldRef<"Lead", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Lead findUnique
   */
  export type LeadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead findUniqueOrThrow
   */
  export type LeadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead findFirst
   */
  export type LeadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leads.
     */
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead findFirstOrThrow
   */
  export type LeadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leads.
     */
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead findMany
   */
  export type LeadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Filter, which Leads to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leads.
     */
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead create
   */
  export type LeadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data needed to create a Lead.
     */
    data: XOR<LeadCreateInput, LeadUncheckedCreateInput>
  }

  /**
   * Lead createMany
   */
  export type LeadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Leads.
     */
    data: LeadCreateManyInput | LeadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Lead createManyAndReturn
   */
  export type LeadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data used to create many Leads.
     */
    data: LeadCreateManyInput | LeadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Lead update
   */
  export type LeadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data needed to update a Lead.
     */
    data: XOR<LeadUpdateInput, LeadUncheckedUpdateInput>
    /**
     * Choose, which Lead to update.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead updateMany
   */
  export type LeadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Leads.
     */
    data: XOR<LeadUpdateManyMutationInput, LeadUncheckedUpdateManyInput>
    /**
     * Filter which Leads to update
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to update.
     */
    limit?: number
  }

  /**
   * Lead updateManyAndReturn
   */
  export type LeadUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data used to update Leads.
     */
    data: XOR<LeadUpdateManyMutationInput, LeadUncheckedUpdateManyInput>
    /**
     * Filter which Leads to update
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to update.
     */
    limit?: number
  }

  /**
   * Lead upsert
   */
  export type LeadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The filter to search for the Lead to update in case it exists.
     */
    where: LeadWhereUniqueInput
    /**
     * In case the Lead found by the `where` argument doesn't exist, create a new Lead with this data.
     */
    create: XOR<LeadCreateInput, LeadUncheckedCreateInput>
    /**
     * In case the Lead was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeadUpdateInput, LeadUncheckedUpdateInput>
  }

  /**
   * Lead delete
   */
  export type LeadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Filter which Lead to delete.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead deleteMany
   */
  export type LeadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Leads to delete
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to delete.
     */
    limit?: number
  }

  /**
   * Lead without action
   */
  export type LeadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    fullName: string | null
    passwordHash: string | null
    status: $Enums.UserStatus | null
    emailVerifiedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    fullName: string | null
    passwordHash: string | null
    status: $Enums.UserStatus | null
    emailVerifiedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    fullName: number
    passwordHash: number
    status: number
    emailVerifiedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    passwordHash?: true
    status?: true
    emailVerifiedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    passwordHash?: true
    status?: true
    emailVerifiedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    passwordHash?: true
    status?: true
    emailVerifiedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    fullName: string | null
    passwordHash: string | null
    status: $Enums.UserStatus
    emailVerifiedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    status?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    status?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    status?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    fullName?: boolean
    passwordHash?: boolean
    status?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "fullName" | "passwordHash" | "status" | "emailVerifiedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      memberships: Prisma.$TenantMembershipPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      fullName: string | null
      passwordHash: string | null
      status: $Enums.UserStatus
      emailVerifiedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memberships<T extends User$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, User$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly status: FieldRef<"User", 'UserStatus'>
    readonly emailVerifiedAt: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.memberships
   */
  export type User$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    where?: TenantMembershipWhereInput
    orderBy?: TenantMembershipOrderByWithRelationInput | TenantMembershipOrderByWithRelationInput[]
    cursor?: TenantMembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantMembershipScalarFieldEnum | TenantMembershipScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model rrhh_processes
   */

  export type AggregateRrhh_processes = {
    _count: Rrhh_processesCountAggregateOutputType | null
    _min: Rrhh_processesMinAggregateOutputType | null
    _max: Rrhh_processesMaxAggregateOutputType | null
  }

  export type Rrhh_processesMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    user_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Rrhh_processesMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    user_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Rrhh_processesCountAggregateOutputType = {
    id: number
    tenant_id: number
    user_id: number
    input: number
    output: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Rrhh_processesMinAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    created_at?: true
    updated_at?: true
  }

  export type Rrhh_processesMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    created_at?: true
    updated_at?: true
  }

  export type Rrhh_processesCountAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    input?: true
    output?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Rrhh_processesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which rrhh_processes to aggregate.
     */
    where?: rrhh_processesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rrhh_processes to fetch.
     */
    orderBy?: rrhh_processesOrderByWithRelationInput | rrhh_processesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: rrhh_processesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rrhh_processes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rrhh_processes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned rrhh_processes
    **/
    _count?: true | Rrhh_processesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Rrhh_processesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Rrhh_processesMaxAggregateInputType
  }

  export type GetRrhh_processesAggregateType<T extends Rrhh_processesAggregateArgs> = {
        [P in keyof T & keyof AggregateRrhh_processes]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRrhh_processes[P]>
      : GetScalarType<T[P], AggregateRrhh_processes[P]>
  }




  export type rrhh_processesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: rrhh_processesWhereInput
    orderBy?: rrhh_processesOrderByWithAggregationInput | rrhh_processesOrderByWithAggregationInput[]
    by: Rrhh_processesScalarFieldEnum[] | Rrhh_processesScalarFieldEnum
    having?: rrhh_processesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Rrhh_processesCountAggregateInputType | true
    _min?: Rrhh_processesMinAggregateInputType
    _max?: Rrhh_processesMaxAggregateInputType
  }

  export type Rrhh_processesGroupByOutputType = {
    id: string
    tenant_id: string
    user_id: string
    input: JsonValue
    output: JsonValue | null
    created_at: Date
    updated_at: Date
    _count: Rrhh_processesCountAggregateOutputType | null
    _min: Rrhh_processesMinAggregateOutputType | null
    _max: Rrhh_processesMaxAggregateOutputType | null
  }

  type GetRrhh_processesGroupByPayload<T extends rrhh_processesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Rrhh_processesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Rrhh_processesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Rrhh_processesGroupByOutputType[P]>
            : GetScalarType<T[P], Rrhh_processesGroupByOutputType[P]>
        }
      >
    >


  export type rrhh_processesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    input?: boolean
    output?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["rrhh_processes"]>

  export type rrhh_processesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    input?: boolean
    output?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["rrhh_processes"]>

  export type rrhh_processesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    input?: boolean
    output?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["rrhh_processes"]>

  export type rrhh_processesSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    input?: boolean
    output?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type rrhh_processesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenant_id" | "user_id" | "input" | "output" | "created_at" | "updated_at", ExtArgs["result"]["rrhh_processes"]>

  export type $rrhh_processesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "rrhh_processes"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      user_id: string
      input: Prisma.JsonValue
      output: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["rrhh_processes"]>
    composites: {}
  }

  type rrhh_processesGetPayload<S extends boolean | null | undefined | rrhh_processesDefaultArgs> = $Result.GetResult<Prisma.$rrhh_processesPayload, S>

  type rrhh_processesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<rrhh_processesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Rrhh_processesCountAggregateInputType | true
    }

  export interface rrhh_processesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['rrhh_processes'], meta: { name: 'rrhh_processes' } }
    /**
     * Find zero or one Rrhh_processes that matches the filter.
     * @param {rrhh_processesFindUniqueArgs} args - Arguments to find a Rrhh_processes
     * @example
     * // Get one Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends rrhh_processesFindUniqueArgs>(args: SelectSubset<T, rrhh_processesFindUniqueArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Rrhh_processes that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {rrhh_processesFindUniqueOrThrowArgs} args - Arguments to find a Rrhh_processes
     * @example
     * // Get one Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends rrhh_processesFindUniqueOrThrowArgs>(args: SelectSubset<T, rrhh_processesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rrhh_processes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rrhh_processesFindFirstArgs} args - Arguments to find a Rrhh_processes
     * @example
     * // Get one Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends rrhh_processesFindFirstArgs>(args?: SelectSubset<T, rrhh_processesFindFirstArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rrhh_processes that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rrhh_processesFindFirstOrThrowArgs} args - Arguments to find a Rrhh_processes
     * @example
     * // Get one Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends rrhh_processesFindFirstOrThrowArgs>(args?: SelectSubset<T, rrhh_processesFindFirstOrThrowArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rrhh_processes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rrhh_processesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.findMany()
     * 
     * // Get first 10 Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rrhh_processesWithIdOnly = await prisma.rrhh_processes.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends rrhh_processesFindManyArgs>(args?: SelectSubset<T, rrhh_processesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Rrhh_processes.
     * @param {rrhh_processesCreateArgs} args - Arguments to create a Rrhh_processes.
     * @example
     * // Create one Rrhh_processes
     * const Rrhh_processes = await prisma.rrhh_processes.create({
     *   data: {
     *     // ... data to create a Rrhh_processes
     *   }
     * })
     * 
     */
    create<T extends rrhh_processesCreateArgs>(args: SelectSubset<T, rrhh_processesCreateArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rrhh_processes.
     * @param {rrhh_processesCreateManyArgs} args - Arguments to create many Rrhh_processes.
     * @example
     * // Create many Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends rrhh_processesCreateManyArgs>(args?: SelectSubset<T, rrhh_processesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rrhh_processes and returns the data saved in the database.
     * @param {rrhh_processesCreateManyAndReturnArgs} args - Arguments to create many Rrhh_processes.
     * @example
     * // Create many Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rrhh_processes and only return the `id`
     * const rrhh_processesWithIdOnly = await prisma.rrhh_processes.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends rrhh_processesCreateManyAndReturnArgs>(args?: SelectSubset<T, rrhh_processesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Rrhh_processes.
     * @param {rrhh_processesDeleteArgs} args - Arguments to delete one Rrhh_processes.
     * @example
     * // Delete one Rrhh_processes
     * const Rrhh_processes = await prisma.rrhh_processes.delete({
     *   where: {
     *     // ... filter to delete one Rrhh_processes
     *   }
     * })
     * 
     */
    delete<T extends rrhh_processesDeleteArgs>(args: SelectSubset<T, rrhh_processesDeleteArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Rrhh_processes.
     * @param {rrhh_processesUpdateArgs} args - Arguments to update one Rrhh_processes.
     * @example
     * // Update one Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends rrhh_processesUpdateArgs>(args: SelectSubset<T, rrhh_processesUpdateArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rrhh_processes.
     * @param {rrhh_processesDeleteManyArgs} args - Arguments to filter Rrhh_processes to delete.
     * @example
     * // Delete a few Rrhh_processes
     * const { count } = await prisma.rrhh_processes.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends rrhh_processesDeleteManyArgs>(args?: SelectSubset<T, rrhh_processesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rrhh_processes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rrhh_processesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends rrhh_processesUpdateManyArgs>(args: SelectSubset<T, rrhh_processesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rrhh_processes and returns the data updated in the database.
     * @param {rrhh_processesUpdateManyAndReturnArgs} args - Arguments to update many Rrhh_processes.
     * @example
     * // Update many Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rrhh_processes and only return the `id`
     * const rrhh_processesWithIdOnly = await prisma.rrhh_processes.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends rrhh_processesUpdateManyAndReturnArgs>(args: SelectSubset<T, rrhh_processesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Rrhh_processes.
     * @param {rrhh_processesUpsertArgs} args - Arguments to update or create a Rrhh_processes.
     * @example
     * // Update or create a Rrhh_processes
     * const rrhh_processes = await prisma.rrhh_processes.upsert({
     *   create: {
     *     // ... data to create a Rrhh_processes
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Rrhh_processes we want to update
     *   }
     * })
     */
    upsert<T extends rrhh_processesUpsertArgs>(args: SelectSubset<T, rrhh_processesUpsertArgs<ExtArgs>>): Prisma__rrhh_processesClient<$Result.GetResult<Prisma.$rrhh_processesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rrhh_processes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rrhh_processesCountArgs} args - Arguments to filter Rrhh_processes to count.
     * @example
     * // Count the number of Rrhh_processes
     * const count = await prisma.rrhh_processes.count({
     *   where: {
     *     // ... the filter for the Rrhh_processes we want to count
     *   }
     * })
    **/
    count<T extends rrhh_processesCountArgs>(
      args?: Subset<T, rrhh_processesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Rrhh_processesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Rrhh_processes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Rrhh_processesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Rrhh_processesAggregateArgs>(args: Subset<T, Rrhh_processesAggregateArgs>): Prisma.PrismaPromise<GetRrhh_processesAggregateType<T>>

    /**
     * Group by Rrhh_processes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rrhh_processesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends rrhh_processesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: rrhh_processesGroupByArgs['orderBy'] }
        : { orderBy?: rrhh_processesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, rrhh_processesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRrhh_processesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the rrhh_processes model
   */
  readonly fields: rrhh_processesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for rrhh_processes.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__rrhh_processesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the rrhh_processes model
   */
  interface rrhh_processesFieldRefs {
    readonly id: FieldRef<"rrhh_processes", 'String'>
    readonly tenant_id: FieldRef<"rrhh_processes", 'String'>
    readonly user_id: FieldRef<"rrhh_processes", 'String'>
    readonly input: FieldRef<"rrhh_processes", 'Json'>
    readonly output: FieldRef<"rrhh_processes", 'Json'>
    readonly created_at: FieldRef<"rrhh_processes", 'DateTime'>
    readonly updated_at: FieldRef<"rrhh_processes", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * rrhh_processes findUnique
   */
  export type rrhh_processesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * Filter, which rrhh_processes to fetch.
     */
    where: rrhh_processesWhereUniqueInput
  }

  /**
   * rrhh_processes findUniqueOrThrow
   */
  export type rrhh_processesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * Filter, which rrhh_processes to fetch.
     */
    where: rrhh_processesWhereUniqueInput
  }

  /**
   * rrhh_processes findFirst
   */
  export type rrhh_processesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * Filter, which rrhh_processes to fetch.
     */
    where?: rrhh_processesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rrhh_processes to fetch.
     */
    orderBy?: rrhh_processesOrderByWithRelationInput | rrhh_processesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for rrhh_processes.
     */
    cursor?: rrhh_processesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rrhh_processes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rrhh_processes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of rrhh_processes.
     */
    distinct?: Rrhh_processesScalarFieldEnum | Rrhh_processesScalarFieldEnum[]
  }

  /**
   * rrhh_processes findFirstOrThrow
   */
  export type rrhh_processesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * Filter, which rrhh_processes to fetch.
     */
    where?: rrhh_processesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rrhh_processes to fetch.
     */
    orderBy?: rrhh_processesOrderByWithRelationInput | rrhh_processesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for rrhh_processes.
     */
    cursor?: rrhh_processesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rrhh_processes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rrhh_processes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of rrhh_processes.
     */
    distinct?: Rrhh_processesScalarFieldEnum | Rrhh_processesScalarFieldEnum[]
  }

  /**
   * rrhh_processes findMany
   */
  export type rrhh_processesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * Filter, which rrhh_processes to fetch.
     */
    where?: rrhh_processesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rrhh_processes to fetch.
     */
    orderBy?: rrhh_processesOrderByWithRelationInput | rrhh_processesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing rrhh_processes.
     */
    cursor?: rrhh_processesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rrhh_processes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rrhh_processes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of rrhh_processes.
     */
    distinct?: Rrhh_processesScalarFieldEnum | Rrhh_processesScalarFieldEnum[]
  }

  /**
   * rrhh_processes create
   */
  export type rrhh_processesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * The data needed to create a rrhh_processes.
     */
    data: XOR<rrhh_processesCreateInput, rrhh_processesUncheckedCreateInput>
  }

  /**
   * rrhh_processes createMany
   */
  export type rrhh_processesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many rrhh_processes.
     */
    data: rrhh_processesCreateManyInput | rrhh_processesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * rrhh_processes createManyAndReturn
   */
  export type rrhh_processesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * The data used to create many rrhh_processes.
     */
    data: rrhh_processesCreateManyInput | rrhh_processesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * rrhh_processes update
   */
  export type rrhh_processesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * The data needed to update a rrhh_processes.
     */
    data: XOR<rrhh_processesUpdateInput, rrhh_processesUncheckedUpdateInput>
    /**
     * Choose, which rrhh_processes to update.
     */
    where: rrhh_processesWhereUniqueInput
  }

  /**
   * rrhh_processes updateMany
   */
  export type rrhh_processesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update rrhh_processes.
     */
    data: XOR<rrhh_processesUpdateManyMutationInput, rrhh_processesUncheckedUpdateManyInput>
    /**
     * Filter which rrhh_processes to update
     */
    where?: rrhh_processesWhereInput
    /**
     * Limit how many rrhh_processes to update.
     */
    limit?: number
  }

  /**
   * rrhh_processes updateManyAndReturn
   */
  export type rrhh_processesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * The data used to update rrhh_processes.
     */
    data: XOR<rrhh_processesUpdateManyMutationInput, rrhh_processesUncheckedUpdateManyInput>
    /**
     * Filter which rrhh_processes to update
     */
    where?: rrhh_processesWhereInput
    /**
     * Limit how many rrhh_processes to update.
     */
    limit?: number
  }

  /**
   * rrhh_processes upsert
   */
  export type rrhh_processesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * The filter to search for the rrhh_processes to update in case it exists.
     */
    where: rrhh_processesWhereUniqueInput
    /**
     * In case the rrhh_processes found by the `where` argument doesn't exist, create a new rrhh_processes with this data.
     */
    create: XOR<rrhh_processesCreateInput, rrhh_processesUncheckedCreateInput>
    /**
     * In case the rrhh_processes was found with the provided `where` argument, update it with this data.
     */
    update: XOR<rrhh_processesUpdateInput, rrhh_processesUncheckedUpdateInput>
  }

  /**
   * rrhh_processes delete
   */
  export type rrhh_processesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
    /**
     * Filter which rrhh_processes to delete.
     */
    where: rrhh_processesWhereUniqueInput
  }

  /**
   * rrhh_processes deleteMany
   */
  export type rrhh_processesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which rrhh_processes to delete
     */
    where?: rrhh_processesWhereInput
    /**
     * Limit how many rrhh_processes to delete.
     */
    limit?: number
  }

  /**
   * rrhh_processes without action
   */
  export type rrhh_processesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the rrhh_processes
     */
    select?: rrhh_processesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the rrhh_processes
     */
    omit?: rrhh_processesOmit<ExtArgs> | null
  }


  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    slug: number
    name: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    slug: string
    name: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    documents?: boolean | Tenant$documentsArgs<ExtArgs>
    analyses?: boolean | Tenant$analysesArgs<ExtArgs>
    memberships?: boolean | Tenant$membershipsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    slug?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "name" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documents?: boolean | Tenant$documentsArgs<ExtArgs>
    analyses?: boolean | Tenant$analysesArgs<ExtArgs>
    memberships?: boolean | Tenant$membershipsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      documents: Prisma.$TenantDocumentPayload<ExtArgs>[]
      analyses: Prisma.$TenantAnalysisPayload<ExtArgs>[]
      memberships: Prisma.$TenantMembershipPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slug: string
      name: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    documents<T extends Tenant$documentsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$documentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    analyses<T extends Tenant$analysesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$analysesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    memberships<T extends Tenant$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly status: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.documents
   */
  export type Tenant$documentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    where?: TenantDocumentWhereInput
    orderBy?: TenantDocumentOrderByWithRelationInput | TenantDocumentOrderByWithRelationInput[]
    cursor?: TenantDocumentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantDocumentScalarFieldEnum | TenantDocumentScalarFieldEnum[]
  }

  /**
   * Tenant.analyses
   */
  export type Tenant$analysesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    where?: TenantAnalysisWhereInput
    orderBy?: TenantAnalysisOrderByWithRelationInput | TenantAnalysisOrderByWithRelationInput[]
    cursor?: TenantAnalysisWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantAnalysisScalarFieldEnum | TenantAnalysisScalarFieldEnum[]
  }

  /**
   * Tenant.memberships
   */
  export type Tenant$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    where?: TenantMembershipWhereInput
    orderBy?: TenantMembershipOrderByWithRelationInput | TenantMembershipOrderByWithRelationInput[]
    cursor?: TenantMembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantMembershipScalarFieldEnum | TenantMembershipScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model TenantMembership
   */

  export type AggregateTenantMembership = {
    _count: TenantMembershipCountAggregateOutputType | null
    _min: TenantMembershipMinAggregateOutputType | null
    _max: TenantMembershipMaxAggregateOutputType | null
  }

  export type TenantMembershipMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    role: $Enums.MembershipRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMembershipMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    role: $Enums.MembershipRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMembershipCountAggregateOutputType = {
    id: number
    tenantId: number
    userId: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMembershipMinAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMembershipMaxAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMembershipCountAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantMembershipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantMembership to aggregate.
     */
    where?: TenantMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantMemberships to fetch.
     */
    orderBy?: TenantMembershipOrderByWithRelationInput | TenantMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantMemberships
    **/
    _count?: true | TenantMembershipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMembershipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMembershipMaxAggregateInputType
  }

  export type GetTenantMembershipAggregateType<T extends TenantMembershipAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantMembership]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantMembership[P]>
      : GetScalarType<T[P], AggregateTenantMembership[P]>
  }




  export type TenantMembershipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantMembershipWhereInput
    orderBy?: TenantMembershipOrderByWithAggregationInput | TenantMembershipOrderByWithAggregationInput[]
    by: TenantMembershipScalarFieldEnum[] | TenantMembershipScalarFieldEnum
    having?: TenantMembershipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantMembershipCountAggregateInputType | true
    _min?: TenantMembershipMinAggregateInputType
    _max?: TenantMembershipMaxAggregateInputType
  }

  export type TenantMembershipGroupByOutputType = {
    id: string
    tenantId: string
    userId: string
    role: $Enums.MembershipRole
    createdAt: Date
    updatedAt: Date
    _count: TenantMembershipCountAggregateOutputType | null
    _min: TenantMembershipMinAggregateOutputType | null
    _max: TenantMembershipMaxAggregateOutputType | null
  }

  type GetTenantMembershipGroupByPayload<T extends TenantMembershipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantMembershipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantMembershipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantMembershipGroupByOutputType[P]>
            : GetScalarType<T[P], TenantMembershipGroupByOutputType[P]>
        }
      >
    >


  export type TenantMembershipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantMembership"]>

  export type TenantMembershipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantMembership"]>

  export type TenantMembershipSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantMembership"]>

  export type TenantMembershipSelectScalar = {
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantMembershipOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "userId" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantMembership"]>
  export type TenantMembershipInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TenantMembershipIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TenantMembershipIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $TenantMembershipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantMembership"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      userId: string
      role: $Enums.MembershipRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantMembership"]>
    composites: {}
  }

  type TenantMembershipGetPayload<S extends boolean | null | undefined | TenantMembershipDefaultArgs> = $Result.GetResult<Prisma.$TenantMembershipPayload, S>

  type TenantMembershipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantMembershipFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantMembershipCountAggregateInputType | true
    }

  export interface TenantMembershipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantMembership'], meta: { name: 'TenantMembership' } }
    /**
     * Find zero or one TenantMembership that matches the filter.
     * @param {TenantMembershipFindUniqueArgs} args - Arguments to find a TenantMembership
     * @example
     * // Get one TenantMembership
     * const tenantMembership = await prisma.tenantMembership.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantMembershipFindUniqueArgs>(args: SelectSubset<T, TenantMembershipFindUniqueArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantMembership that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantMembershipFindUniqueOrThrowArgs} args - Arguments to find a TenantMembership
     * @example
     * // Get one TenantMembership
     * const tenantMembership = await prisma.tenantMembership.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantMembershipFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantMembershipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantMembership that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantMembershipFindFirstArgs} args - Arguments to find a TenantMembership
     * @example
     * // Get one TenantMembership
     * const tenantMembership = await prisma.tenantMembership.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantMembershipFindFirstArgs>(args?: SelectSubset<T, TenantMembershipFindFirstArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantMembership that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantMembershipFindFirstOrThrowArgs} args - Arguments to find a TenantMembership
     * @example
     * // Get one TenantMembership
     * const tenantMembership = await prisma.tenantMembership.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantMembershipFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantMembershipFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantMemberships that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantMembershipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantMemberships
     * const tenantMemberships = await prisma.tenantMembership.findMany()
     * 
     * // Get first 10 TenantMemberships
     * const tenantMemberships = await prisma.tenantMembership.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantMembershipWithIdOnly = await prisma.tenantMembership.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantMembershipFindManyArgs>(args?: SelectSubset<T, TenantMembershipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantMembership.
     * @param {TenantMembershipCreateArgs} args - Arguments to create a TenantMembership.
     * @example
     * // Create one TenantMembership
     * const TenantMembership = await prisma.tenantMembership.create({
     *   data: {
     *     // ... data to create a TenantMembership
     *   }
     * })
     * 
     */
    create<T extends TenantMembershipCreateArgs>(args: SelectSubset<T, TenantMembershipCreateArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantMemberships.
     * @param {TenantMembershipCreateManyArgs} args - Arguments to create many TenantMemberships.
     * @example
     * // Create many TenantMemberships
     * const tenantMembership = await prisma.tenantMembership.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantMembershipCreateManyArgs>(args?: SelectSubset<T, TenantMembershipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantMemberships and returns the data saved in the database.
     * @param {TenantMembershipCreateManyAndReturnArgs} args - Arguments to create many TenantMemberships.
     * @example
     * // Create many TenantMemberships
     * const tenantMembership = await prisma.tenantMembership.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantMemberships and only return the `id`
     * const tenantMembershipWithIdOnly = await prisma.tenantMembership.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantMembershipCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantMembershipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantMembership.
     * @param {TenantMembershipDeleteArgs} args - Arguments to delete one TenantMembership.
     * @example
     * // Delete one TenantMembership
     * const TenantMembership = await prisma.tenantMembership.delete({
     *   where: {
     *     // ... filter to delete one TenantMembership
     *   }
     * })
     * 
     */
    delete<T extends TenantMembershipDeleteArgs>(args: SelectSubset<T, TenantMembershipDeleteArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantMembership.
     * @param {TenantMembershipUpdateArgs} args - Arguments to update one TenantMembership.
     * @example
     * // Update one TenantMembership
     * const tenantMembership = await prisma.tenantMembership.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantMembershipUpdateArgs>(args: SelectSubset<T, TenantMembershipUpdateArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantMemberships.
     * @param {TenantMembershipDeleteManyArgs} args - Arguments to filter TenantMemberships to delete.
     * @example
     * // Delete a few TenantMemberships
     * const { count } = await prisma.tenantMembership.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantMembershipDeleteManyArgs>(args?: SelectSubset<T, TenantMembershipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantMemberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantMembershipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantMemberships
     * const tenantMembership = await prisma.tenantMembership.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantMembershipUpdateManyArgs>(args: SelectSubset<T, TenantMembershipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantMemberships and returns the data updated in the database.
     * @param {TenantMembershipUpdateManyAndReturnArgs} args - Arguments to update many TenantMemberships.
     * @example
     * // Update many TenantMemberships
     * const tenantMembership = await prisma.tenantMembership.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantMemberships and only return the `id`
     * const tenantMembershipWithIdOnly = await prisma.tenantMembership.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantMembershipUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantMembershipUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantMembership.
     * @param {TenantMembershipUpsertArgs} args - Arguments to update or create a TenantMembership.
     * @example
     * // Update or create a TenantMembership
     * const tenantMembership = await prisma.tenantMembership.upsert({
     *   create: {
     *     // ... data to create a TenantMembership
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantMembership we want to update
     *   }
     * })
     */
    upsert<T extends TenantMembershipUpsertArgs>(args: SelectSubset<T, TenantMembershipUpsertArgs<ExtArgs>>): Prisma__TenantMembershipClient<$Result.GetResult<Prisma.$TenantMembershipPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantMemberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantMembershipCountArgs} args - Arguments to filter TenantMemberships to count.
     * @example
     * // Count the number of TenantMemberships
     * const count = await prisma.tenantMembership.count({
     *   where: {
     *     // ... the filter for the TenantMemberships we want to count
     *   }
     * })
    **/
    count<T extends TenantMembershipCountArgs>(
      args?: Subset<T, TenantMembershipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantMembershipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantMembership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantMembershipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantMembershipAggregateArgs>(args: Subset<T, TenantMembershipAggregateArgs>): Prisma.PrismaPromise<GetTenantMembershipAggregateType<T>>

    /**
     * Group by TenantMembership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantMembershipGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantMembershipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantMembershipGroupByArgs['orderBy'] }
        : { orderBy?: TenantMembershipGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantMembershipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantMembershipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantMembership model
   */
  readonly fields: TenantMembershipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantMembership.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantMembershipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantMembership model
   */
  interface TenantMembershipFieldRefs {
    readonly id: FieldRef<"TenantMembership", 'String'>
    readonly tenantId: FieldRef<"TenantMembership", 'String'>
    readonly userId: FieldRef<"TenantMembership", 'String'>
    readonly role: FieldRef<"TenantMembership", 'MembershipRole'>
    readonly createdAt: FieldRef<"TenantMembership", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantMembership", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantMembership findUnique
   */
  export type TenantMembershipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * Filter, which TenantMembership to fetch.
     */
    where: TenantMembershipWhereUniqueInput
  }

  /**
   * TenantMembership findUniqueOrThrow
   */
  export type TenantMembershipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * Filter, which TenantMembership to fetch.
     */
    where: TenantMembershipWhereUniqueInput
  }

  /**
   * TenantMembership findFirst
   */
  export type TenantMembershipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * Filter, which TenantMembership to fetch.
     */
    where?: TenantMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantMemberships to fetch.
     */
    orderBy?: TenantMembershipOrderByWithRelationInput | TenantMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantMemberships.
     */
    cursor?: TenantMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantMemberships.
     */
    distinct?: TenantMembershipScalarFieldEnum | TenantMembershipScalarFieldEnum[]
  }

  /**
   * TenantMembership findFirstOrThrow
   */
  export type TenantMembershipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * Filter, which TenantMembership to fetch.
     */
    where?: TenantMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantMemberships to fetch.
     */
    orderBy?: TenantMembershipOrderByWithRelationInput | TenantMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantMemberships.
     */
    cursor?: TenantMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantMemberships.
     */
    distinct?: TenantMembershipScalarFieldEnum | TenantMembershipScalarFieldEnum[]
  }

  /**
   * TenantMembership findMany
   */
  export type TenantMembershipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * Filter, which TenantMemberships to fetch.
     */
    where?: TenantMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantMemberships to fetch.
     */
    orderBy?: TenantMembershipOrderByWithRelationInput | TenantMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantMemberships.
     */
    cursor?: TenantMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantMemberships.
     */
    distinct?: TenantMembershipScalarFieldEnum | TenantMembershipScalarFieldEnum[]
  }

  /**
   * TenantMembership create
   */
  export type TenantMembershipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantMembership.
     */
    data: XOR<TenantMembershipCreateInput, TenantMembershipUncheckedCreateInput>
  }

  /**
   * TenantMembership createMany
   */
  export type TenantMembershipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantMemberships.
     */
    data: TenantMembershipCreateManyInput | TenantMembershipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantMembership createManyAndReturn
   */
  export type TenantMembershipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * The data used to create many TenantMemberships.
     */
    data: TenantMembershipCreateManyInput | TenantMembershipCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantMembership update
   */
  export type TenantMembershipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantMembership.
     */
    data: XOR<TenantMembershipUpdateInput, TenantMembershipUncheckedUpdateInput>
    /**
     * Choose, which TenantMembership to update.
     */
    where: TenantMembershipWhereUniqueInput
  }

  /**
   * TenantMembership updateMany
   */
  export type TenantMembershipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantMemberships.
     */
    data: XOR<TenantMembershipUpdateManyMutationInput, TenantMembershipUncheckedUpdateManyInput>
    /**
     * Filter which TenantMemberships to update
     */
    where?: TenantMembershipWhereInput
    /**
     * Limit how many TenantMemberships to update.
     */
    limit?: number
  }

  /**
   * TenantMembership updateManyAndReturn
   */
  export type TenantMembershipUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * The data used to update TenantMemberships.
     */
    data: XOR<TenantMembershipUpdateManyMutationInput, TenantMembershipUncheckedUpdateManyInput>
    /**
     * Filter which TenantMemberships to update
     */
    where?: TenantMembershipWhereInput
    /**
     * Limit how many TenantMemberships to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantMembership upsert
   */
  export type TenantMembershipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantMembership to update in case it exists.
     */
    where: TenantMembershipWhereUniqueInput
    /**
     * In case the TenantMembership found by the `where` argument doesn't exist, create a new TenantMembership with this data.
     */
    create: XOR<TenantMembershipCreateInput, TenantMembershipUncheckedCreateInput>
    /**
     * In case the TenantMembership was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantMembershipUpdateInput, TenantMembershipUncheckedUpdateInput>
  }

  /**
   * TenantMembership delete
   */
  export type TenantMembershipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
    /**
     * Filter which TenantMembership to delete.
     */
    where: TenantMembershipWhereUniqueInput
  }

  /**
   * TenantMembership deleteMany
   */
  export type TenantMembershipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantMemberships to delete
     */
    where?: TenantMembershipWhereInput
    /**
     * Limit how many TenantMemberships to delete.
     */
    limit?: number
  }

  /**
   * TenantMembership without action
   */
  export type TenantMembershipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantMembership
     */
    select?: TenantMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantMembership
     */
    omit?: TenantMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantMembershipInclude<ExtArgs> | null
  }


  /**
   * Model TenantDocument
   */

  export type AggregateTenantDocument = {
    _count: TenantDocumentCountAggregateOutputType | null
    _min: TenantDocumentMinAggregateOutputType | null
    _max: TenantDocumentMaxAggregateOutputType | null
  }

  export type TenantDocumentMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    category: string | null
    title: string | null
    description: string | null
    status: string | null
    source: string | null
    fileUrl: string | null
    fileName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantDocumentMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    category: string | null
    title: string | null
    description: string | null
    status: string | null
    source: string | null
    fileUrl: string | null
    fileName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantDocumentCountAggregateOutputType = {
    id: number
    tenantId: number
    category: number
    title: number
    description: number
    status: number
    source: number
    fileUrl: number
    fileName: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantDocumentMinAggregateInputType = {
    id?: true
    tenantId?: true
    category?: true
    title?: true
    description?: true
    status?: true
    source?: true
    fileUrl?: true
    fileName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantDocumentMaxAggregateInputType = {
    id?: true
    tenantId?: true
    category?: true
    title?: true
    description?: true
    status?: true
    source?: true
    fileUrl?: true
    fileName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantDocumentCountAggregateInputType = {
    id?: true
    tenantId?: true
    category?: true
    title?: true
    description?: true
    status?: true
    source?: true
    fileUrl?: true
    fileName?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantDocumentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantDocument to aggregate.
     */
    where?: TenantDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantDocuments to fetch.
     */
    orderBy?: TenantDocumentOrderByWithRelationInput | TenantDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantDocuments
    **/
    _count?: true | TenantDocumentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantDocumentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantDocumentMaxAggregateInputType
  }

  export type GetTenantDocumentAggregateType<T extends TenantDocumentAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantDocument]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantDocument[P]>
      : GetScalarType<T[P], AggregateTenantDocument[P]>
  }




  export type TenantDocumentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantDocumentWhereInput
    orderBy?: TenantDocumentOrderByWithAggregationInput | TenantDocumentOrderByWithAggregationInput[]
    by: TenantDocumentScalarFieldEnum[] | TenantDocumentScalarFieldEnum
    having?: TenantDocumentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantDocumentCountAggregateInputType | true
    _min?: TenantDocumentMinAggregateInputType
    _max?: TenantDocumentMaxAggregateInputType
  }

  export type TenantDocumentGroupByOutputType = {
    id: string
    tenantId: string
    category: string
    title: string
    description: string
    status: string
    source: string
    fileUrl: string | null
    fileName: string | null
    createdAt: Date
    updatedAt: Date
    _count: TenantDocumentCountAggregateOutputType | null
    _min: TenantDocumentMinAggregateOutputType | null
    _max: TenantDocumentMaxAggregateOutputType | null
  }

  type GetTenantDocumentGroupByPayload<T extends TenantDocumentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantDocumentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantDocumentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantDocumentGroupByOutputType[P]>
            : GetScalarType<T[P], TenantDocumentGroupByOutputType[P]>
        }
      >
    >


  export type TenantDocumentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    category?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    source?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantDocument"]>

  export type TenantDocumentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    category?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    source?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantDocument"]>

  export type TenantDocumentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    category?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    source?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantDocument"]>

  export type TenantDocumentSelectScalar = {
    id?: boolean
    tenantId?: boolean
    category?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    source?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantDocumentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "category" | "title" | "description" | "status" | "source" | "fileUrl" | "fileName" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantDocument"]>
  export type TenantDocumentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantDocumentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantDocumentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantDocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantDocument"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      category: string
      title: string
      description: string
      status: string
      source: string
      fileUrl: string | null
      fileName: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantDocument"]>
    composites: {}
  }

  type TenantDocumentGetPayload<S extends boolean | null | undefined | TenantDocumentDefaultArgs> = $Result.GetResult<Prisma.$TenantDocumentPayload, S>

  type TenantDocumentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantDocumentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantDocumentCountAggregateInputType | true
    }

  export interface TenantDocumentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantDocument'], meta: { name: 'TenantDocument' } }
    /**
     * Find zero or one TenantDocument that matches the filter.
     * @param {TenantDocumentFindUniqueArgs} args - Arguments to find a TenantDocument
     * @example
     * // Get one TenantDocument
     * const tenantDocument = await prisma.tenantDocument.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantDocumentFindUniqueArgs>(args: SelectSubset<T, TenantDocumentFindUniqueArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantDocument that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantDocumentFindUniqueOrThrowArgs} args - Arguments to find a TenantDocument
     * @example
     * // Get one TenantDocument
     * const tenantDocument = await prisma.tenantDocument.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantDocumentFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantDocumentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantDocument that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantDocumentFindFirstArgs} args - Arguments to find a TenantDocument
     * @example
     * // Get one TenantDocument
     * const tenantDocument = await prisma.tenantDocument.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantDocumentFindFirstArgs>(args?: SelectSubset<T, TenantDocumentFindFirstArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantDocument that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantDocumentFindFirstOrThrowArgs} args - Arguments to find a TenantDocument
     * @example
     * // Get one TenantDocument
     * const tenantDocument = await prisma.tenantDocument.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantDocumentFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantDocumentFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantDocuments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantDocumentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantDocuments
     * const tenantDocuments = await prisma.tenantDocument.findMany()
     * 
     * // Get first 10 TenantDocuments
     * const tenantDocuments = await prisma.tenantDocument.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantDocumentWithIdOnly = await prisma.tenantDocument.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantDocumentFindManyArgs>(args?: SelectSubset<T, TenantDocumentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantDocument.
     * @param {TenantDocumentCreateArgs} args - Arguments to create a TenantDocument.
     * @example
     * // Create one TenantDocument
     * const TenantDocument = await prisma.tenantDocument.create({
     *   data: {
     *     // ... data to create a TenantDocument
     *   }
     * })
     * 
     */
    create<T extends TenantDocumentCreateArgs>(args: SelectSubset<T, TenantDocumentCreateArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantDocuments.
     * @param {TenantDocumentCreateManyArgs} args - Arguments to create many TenantDocuments.
     * @example
     * // Create many TenantDocuments
     * const tenantDocument = await prisma.tenantDocument.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantDocumentCreateManyArgs>(args?: SelectSubset<T, TenantDocumentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantDocuments and returns the data saved in the database.
     * @param {TenantDocumentCreateManyAndReturnArgs} args - Arguments to create many TenantDocuments.
     * @example
     * // Create many TenantDocuments
     * const tenantDocument = await prisma.tenantDocument.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantDocuments and only return the `id`
     * const tenantDocumentWithIdOnly = await prisma.tenantDocument.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantDocumentCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantDocumentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantDocument.
     * @param {TenantDocumentDeleteArgs} args - Arguments to delete one TenantDocument.
     * @example
     * // Delete one TenantDocument
     * const TenantDocument = await prisma.tenantDocument.delete({
     *   where: {
     *     // ... filter to delete one TenantDocument
     *   }
     * })
     * 
     */
    delete<T extends TenantDocumentDeleteArgs>(args: SelectSubset<T, TenantDocumentDeleteArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantDocument.
     * @param {TenantDocumentUpdateArgs} args - Arguments to update one TenantDocument.
     * @example
     * // Update one TenantDocument
     * const tenantDocument = await prisma.tenantDocument.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantDocumentUpdateArgs>(args: SelectSubset<T, TenantDocumentUpdateArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantDocuments.
     * @param {TenantDocumentDeleteManyArgs} args - Arguments to filter TenantDocuments to delete.
     * @example
     * // Delete a few TenantDocuments
     * const { count } = await prisma.tenantDocument.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDocumentDeleteManyArgs>(args?: SelectSubset<T, TenantDocumentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantDocumentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantDocuments
     * const tenantDocument = await prisma.tenantDocument.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantDocumentUpdateManyArgs>(args: SelectSubset<T, TenantDocumentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantDocuments and returns the data updated in the database.
     * @param {TenantDocumentUpdateManyAndReturnArgs} args - Arguments to update many TenantDocuments.
     * @example
     * // Update many TenantDocuments
     * const tenantDocument = await prisma.tenantDocument.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantDocuments and only return the `id`
     * const tenantDocumentWithIdOnly = await prisma.tenantDocument.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantDocumentUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantDocumentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantDocument.
     * @param {TenantDocumentUpsertArgs} args - Arguments to update or create a TenantDocument.
     * @example
     * // Update or create a TenantDocument
     * const tenantDocument = await prisma.tenantDocument.upsert({
     *   create: {
     *     // ... data to create a TenantDocument
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantDocument we want to update
     *   }
     * })
     */
    upsert<T extends TenantDocumentUpsertArgs>(args: SelectSubset<T, TenantDocumentUpsertArgs<ExtArgs>>): Prisma__TenantDocumentClient<$Result.GetResult<Prisma.$TenantDocumentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantDocumentCountArgs} args - Arguments to filter TenantDocuments to count.
     * @example
     * // Count the number of TenantDocuments
     * const count = await prisma.tenantDocument.count({
     *   where: {
     *     // ... the filter for the TenantDocuments we want to count
     *   }
     * })
    **/
    count<T extends TenantDocumentCountArgs>(
      args?: Subset<T, TenantDocumentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantDocumentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantDocumentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantDocumentAggregateArgs>(args: Subset<T, TenantDocumentAggregateArgs>): Prisma.PrismaPromise<GetTenantDocumentAggregateType<T>>

    /**
     * Group by TenantDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantDocumentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantDocumentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantDocumentGroupByArgs['orderBy'] }
        : { orderBy?: TenantDocumentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantDocumentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantDocumentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantDocument model
   */
  readonly fields: TenantDocumentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantDocument.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantDocumentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantDocument model
   */
  interface TenantDocumentFieldRefs {
    readonly id: FieldRef<"TenantDocument", 'String'>
    readonly tenantId: FieldRef<"TenantDocument", 'String'>
    readonly category: FieldRef<"TenantDocument", 'String'>
    readonly title: FieldRef<"TenantDocument", 'String'>
    readonly description: FieldRef<"TenantDocument", 'String'>
    readonly status: FieldRef<"TenantDocument", 'String'>
    readonly source: FieldRef<"TenantDocument", 'String'>
    readonly fileUrl: FieldRef<"TenantDocument", 'String'>
    readonly fileName: FieldRef<"TenantDocument", 'String'>
    readonly createdAt: FieldRef<"TenantDocument", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantDocument", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantDocument findUnique
   */
  export type TenantDocumentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * Filter, which TenantDocument to fetch.
     */
    where: TenantDocumentWhereUniqueInput
  }

  /**
   * TenantDocument findUniqueOrThrow
   */
  export type TenantDocumentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * Filter, which TenantDocument to fetch.
     */
    where: TenantDocumentWhereUniqueInput
  }

  /**
   * TenantDocument findFirst
   */
  export type TenantDocumentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * Filter, which TenantDocument to fetch.
     */
    where?: TenantDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantDocuments to fetch.
     */
    orderBy?: TenantDocumentOrderByWithRelationInput | TenantDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantDocuments.
     */
    cursor?: TenantDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantDocuments.
     */
    distinct?: TenantDocumentScalarFieldEnum | TenantDocumentScalarFieldEnum[]
  }

  /**
   * TenantDocument findFirstOrThrow
   */
  export type TenantDocumentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * Filter, which TenantDocument to fetch.
     */
    where?: TenantDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantDocuments to fetch.
     */
    orderBy?: TenantDocumentOrderByWithRelationInput | TenantDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantDocuments.
     */
    cursor?: TenantDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantDocuments.
     */
    distinct?: TenantDocumentScalarFieldEnum | TenantDocumentScalarFieldEnum[]
  }

  /**
   * TenantDocument findMany
   */
  export type TenantDocumentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * Filter, which TenantDocuments to fetch.
     */
    where?: TenantDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantDocuments to fetch.
     */
    orderBy?: TenantDocumentOrderByWithRelationInput | TenantDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantDocuments.
     */
    cursor?: TenantDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantDocuments.
     */
    distinct?: TenantDocumentScalarFieldEnum | TenantDocumentScalarFieldEnum[]
  }

  /**
   * TenantDocument create
   */
  export type TenantDocumentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantDocument.
     */
    data: XOR<TenantDocumentCreateInput, TenantDocumentUncheckedCreateInput>
  }

  /**
   * TenantDocument createMany
   */
  export type TenantDocumentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantDocuments.
     */
    data: TenantDocumentCreateManyInput | TenantDocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantDocument createManyAndReturn
   */
  export type TenantDocumentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * The data used to create many TenantDocuments.
     */
    data: TenantDocumentCreateManyInput | TenantDocumentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantDocument update
   */
  export type TenantDocumentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantDocument.
     */
    data: XOR<TenantDocumentUpdateInput, TenantDocumentUncheckedUpdateInput>
    /**
     * Choose, which TenantDocument to update.
     */
    where: TenantDocumentWhereUniqueInput
  }

  /**
   * TenantDocument updateMany
   */
  export type TenantDocumentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantDocuments.
     */
    data: XOR<TenantDocumentUpdateManyMutationInput, TenantDocumentUncheckedUpdateManyInput>
    /**
     * Filter which TenantDocuments to update
     */
    where?: TenantDocumentWhereInput
    /**
     * Limit how many TenantDocuments to update.
     */
    limit?: number
  }

  /**
   * TenantDocument updateManyAndReturn
   */
  export type TenantDocumentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * The data used to update TenantDocuments.
     */
    data: XOR<TenantDocumentUpdateManyMutationInput, TenantDocumentUncheckedUpdateManyInput>
    /**
     * Filter which TenantDocuments to update
     */
    where?: TenantDocumentWhereInput
    /**
     * Limit how many TenantDocuments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantDocument upsert
   */
  export type TenantDocumentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantDocument to update in case it exists.
     */
    where: TenantDocumentWhereUniqueInput
    /**
     * In case the TenantDocument found by the `where` argument doesn't exist, create a new TenantDocument with this data.
     */
    create: XOR<TenantDocumentCreateInput, TenantDocumentUncheckedCreateInput>
    /**
     * In case the TenantDocument was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantDocumentUpdateInput, TenantDocumentUncheckedUpdateInput>
  }

  /**
   * TenantDocument delete
   */
  export type TenantDocumentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
    /**
     * Filter which TenantDocument to delete.
     */
    where: TenantDocumentWhereUniqueInput
  }

  /**
   * TenantDocument deleteMany
   */
  export type TenantDocumentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantDocuments to delete
     */
    where?: TenantDocumentWhereInput
    /**
     * Limit how many TenantDocuments to delete.
     */
    limit?: number
  }

  /**
   * TenantDocument without action
   */
  export type TenantDocumentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantDocument
     */
    select?: TenantDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantDocument
     */
    omit?: TenantDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantDocumentInclude<ExtArgs> | null
  }


  /**
   * Model TenantAnalysis
   */

  export type AggregateTenantAnalysis = {
    _count: TenantAnalysisCountAggregateOutputType | null
    _avg: TenantAnalysisAvgAggregateOutputType | null
    _sum: TenantAnalysisSumAggregateOutputType | null
    _min: TenantAnalysisMinAggregateOutputType | null
    _max: TenantAnalysisMaxAggregateOutputType | null
  }

  export type TenantAnalysisAvgAggregateOutputType = {
    globalScore: number | null
  }

  export type TenantAnalysisSumAggregateOutputType = {
    globalScore: number | null
  }

  export type TenantAnalysisMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    mode: string | null
    summary: string | null
    priority: string | null
    globalScore: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantAnalysisMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    mode: string | null
    summary: string | null
    priority: string | null
    globalScore: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantAnalysisCountAggregateOutputType = {
    id: number
    tenantId: number
    mode: number
    summary: number
    risks: number
    opportunities: number
    priority: number
    globalScore: number
    createdAt: number
    updatedAt: number
    rawData: number
    _all: number
  }


  export type TenantAnalysisAvgAggregateInputType = {
    globalScore?: true
  }

  export type TenantAnalysisSumAggregateInputType = {
    globalScore?: true
  }

  export type TenantAnalysisMinAggregateInputType = {
    id?: true
    tenantId?: true
    mode?: true
    summary?: true
    priority?: true
    globalScore?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantAnalysisMaxAggregateInputType = {
    id?: true
    tenantId?: true
    mode?: true
    summary?: true
    priority?: true
    globalScore?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantAnalysisCountAggregateInputType = {
    id?: true
    tenantId?: true
    mode?: true
    summary?: true
    risks?: true
    opportunities?: true
    priority?: true
    globalScore?: true
    createdAt?: true
    updatedAt?: true
    rawData?: true
    _all?: true
  }

  export type TenantAnalysisAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantAnalysis to aggregate.
     */
    where?: TenantAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAnalyses to fetch.
     */
    orderBy?: TenantAnalysisOrderByWithRelationInput | TenantAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantAnalyses
    **/
    _count?: true | TenantAnalysisCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantAnalysisAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantAnalysisSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantAnalysisMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantAnalysisMaxAggregateInputType
  }

  export type GetTenantAnalysisAggregateType<T extends TenantAnalysisAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantAnalysis]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantAnalysis[P]>
      : GetScalarType<T[P], AggregateTenantAnalysis[P]>
  }




  export type TenantAnalysisGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantAnalysisWhereInput
    orderBy?: TenantAnalysisOrderByWithAggregationInput | TenantAnalysisOrderByWithAggregationInput[]
    by: TenantAnalysisScalarFieldEnum[] | TenantAnalysisScalarFieldEnum
    having?: TenantAnalysisScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantAnalysisCountAggregateInputType | true
    _avg?: TenantAnalysisAvgAggregateInputType
    _sum?: TenantAnalysisSumAggregateInputType
    _min?: TenantAnalysisMinAggregateInputType
    _max?: TenantAnalysisMaxAggregateInputType
  }

  export type TenantAnalysisGroupByOutputType = {
    id: string
    tenantId: string
    mode: string
    summary: string
    risks: string[]
    opportunities: string[]
    priority: string | null
    globalScore: number
    createdAt: Date
    updatedAt: Date
    rawData: JsonValue | null
    _count: TenantAnalysisCountAggregateOutputType | null
    _avg: TenantAnalysisAvgAggregateOutputType | null
    _sum: TenantAnalysisSumAggregateOutputType | null
    _min: TenantAnalysisMinAggregateOutputType | null
    _max: TenantAnalysisMaxAggregateOutputType | null
  }

  type GetTenantAnalysisGroupByPayload<T extends TenantAnalysisGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantAnalysisGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantAnalysisGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantAnalysisGroupByOutputType[P]>
            : GetScalarType<T[P], TenantAnalysisGroupByOutputType[P]>
        }
      >
    >


  export type TenantAnalysisSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    mode?: boolean
    summary?: boolean
    risks?: boolean
    opportunities?: boolean
    priority?: boolean
    globalScore?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rawData?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantAnalysis"]>

  export type TenantAnalysisSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    mode?: boolean
    summary?: boolean
    risks?: boolean
    opportunities?: boolean
    priority?: boolean
    globalScore?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rawData?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantAnalysis"]>

  export type TenantAnalysisSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    mode?: boolean
    summary?: boolean
    risks?: boolean
    opportunities?: boolean
    priority?: boolean
    globalScore?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rawData?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantAnalysis"]>

  export type TenantAnalysisSelectScalar = {
    id?: boolean
    tenantId?: boolean
    mode?: boolean
    summary?: boolean
    risks?: boolean
    opportunities?: boolean
    priority?: boolean
    globalScore?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rawData?: boolean
  }

  export type TenantAnalysisOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "mode" | "summary" | "risks" | "opportunities" | "priority" | "globalScore" | "createdAt" | "updatedAt" | "rawData", ExtArgs["result"]["tenantAnalysis"]>
  export type TenantAnalysisInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantAnalysisIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantAnalysisIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantAnalysisPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantAnalysis"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      mode: string
      summary: string
      risks: string[]
      opportunities: string[]
      priority: string | null
      globalScore: number
      createdAt: Date
      updatedAt: Date
      rawData: Prisma.JsonValue | null
    }, ExtArgs["result"]["tenantAnalysis"]>
    composites: {}
  }

  type TenantAnalysisGetPayload<S extends boolean | null | undefined | TenantAnalysisDefaultArgs> = $Result.GetResult<Prisma.$TenantAnalysisPayload, S>

  type TenantAnalysisCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantAnalysisFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantAnalysisCountAggregateInputType | true
    }

  export interface TenantAnalysisDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantAnalysis'], meta: { name: 'TenantAnalysis' } }
    /**
     * Find zero or one TenantAnalysis that matches the filter.
     * @param {TenantAnalysisFindUniqueArgs} args - Arguments to find a TenantAnalysis
     * @example
     * // Get one TenantAnalysis
     * const tenantAnalysis = await prisma.tenantAnalysis.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantAnalysisFindUniqueArgs>(args: SelectSubset<T, TenantAnalysisFindUniqueArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantAnalysis that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantAnalysisFindUniqueOrThrowArgs} args - Arguments to find a TenantAnalysis
     * @example
     * // Get one TenantAnalysis
     * const tenantAnalysis = await prisma.tenantAnalysis.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantAnalysisFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantAnalysisFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantAnalysis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAnalysisFindFirstArgs} args - Arguments to find a TenantAnalysis
     * @example
     * // Get one TenantAnalysis
     * const tenantAnalysis = await prisma.tenantAnalysis.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantAnalysisFindFirstArgs>(args?: SelectSubset<T, TenantAnalysisFindFirstArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantAnalysis that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAnalysisFindFirstOrThrowArgs} args - Arguments to find a TenantAnalysis
     * @example
     * // Get one TenantAnalysis
     * const tenantAnalysis = await prisma.tenantAnalysis.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantAnalysisFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantAnalysisFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantAnalyses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAnalysisFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantAnalyses
     * const tenantAnalyses = await prisma.tenantAnalysis.findMany()
     * 
     * // Get first 10 TenantAnalyses
     * const tenantAnalyses = await prisma.tenantAnalysis.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantAnalysisWithIdOnly = await prisma.tenantAnalysis.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantAnalysisFindManyArgs>(args?: SelectSubset<T, TenantAnalysisFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantAnalysis.
     * @param {TenantAnalysisCreateArgs} args - Arguments to create a TenantAnalysis.
     * @example
     * // Create one TenantAnalysis
     * const TenantAnalysis = await prisma.tenantAnalysis.create({
     *   data: {
     *     // ... data to create a TenantAnalysis
     *   }
     * })
     * 
     */
    create<T extends TenantAnalysisCreateArgs>(args: SelectSubset<T, TenantAnalysisCreateArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantAnalyses.
     * @param {TenantAnalysisCreateManyArgs} args - Arguments to create many TenantAnalyses.
     * @example
     * // Create many TenantAnalyses
     * const tenantAnalysis = await prisma.tenantAnalysis.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantAnalysisCreateManyArgs>(args?: SelectSubset<T, TenantAnalysisCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantAnalyses and returns the data saved in the database.
     * @param {TenantAnalysisCreateManyAndReturnArgs} args - Arguments to create many TenantAnalyses.
     * @example
     * // Create many TenantAnalyses
     * const tenantAnalysis = await prisma.tenantAnalysis.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantAnalyses and only return the `id`
     * const tenantAnalysisWithIdOnly = await prisma.tenantAnalysis.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantAnalysisCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantAnalysisCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantAnalysis.
     * @param {TenantAnalysisDeleteArgs} args - Arguments to delete one TenantAnalysis.
     * @example
     * // Delete one TenantAnalysis
     * const TenantAnalysis = await prisma.tenantAnalysis.delete({
     *   where: {
     *     // ... filter to delete one TenantAnalysis
     *   }
     * })
     * 
     */
    delete<T extends TenantAnalysisDeleteArgs>(args: SelectSubset<T, TenantAnalysisDeleteArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantAnalysis.
     * @param {TenantAnalysisUpdateArgs} args - Arguments to update one TenantAnalysis.
     * @example
     * // Update one TenantAnalysis
     * const tenantAnalysis = await prisma.tenantAnalysis.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantAnalysisUpdateArgs>(args: SelectSubset<T, TenantAnalysisUpdateArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantAnalyses.
     * @param {TenantAnalysisDeleteManyArgs} args - Arguments to filter TenantAnalyses to delete.
     * @example
     * // Delete a few TenantAnalyses
     * const { count } = await prisma.tenantAnalysis.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantAnalysisDeleteManyArgs>(args?: SelectSubset<T, TenantAnalysisDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAnalysisUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantAnalyses
     * const tenantAnalysis = await prisma.tenantAnalysis.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantAnalysisUpdateManyArgs>(args: SelectSubset<T, TenantAnalysisUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantAnalyses and returns the data updated in the database.
     * @param {TenantAnalysisUpdateManyAndReturnArgs} args - Arguments to update many TenantAnalyses.
     * @example
     * // Update many TenantAnalyses
     * const tenantAnalysis = await prisma.tenantAnalysis.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantAnalyses and only return the `id`
     * const tenantAnalysisWithIdOnly = await prisma.tenantAnalysis.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantAnalysisUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantAnalysisUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantAnalysis.
     * @param {TenantAnalysisUpsertArgs} args - Arguments to update or create a TenantAnalysis.
     * @example
     * // Update or create a TenantAnalysis
     * const tenantAnalysis = await prisma.tenantAnalysis.upsert({
     *   create: {
     *     // ... data to create a TenantAnalysis
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantAnalysis we want to update
     *   }
     * })
     */
    upsert<T extends TenantAnalysisUpsertArgs>(args: SelectSubset<T, TenantAnalysisUpsertArgs<ExtArgs>>): Prisma__TenantAnalysisClient<$Result.GetResult<Prisma.$TenantAnalysisPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAnalysisCountArgs} args - Arguments to filter TenantAnalyses to count.
     * @example
     * // Count the number of TenantAnalyses
     * const count = await prisma.tenantAnalysis.count({
     *   where: {
     *     // ... the filter for the TenantAnalyses we want to count
     *   }
     * })
    **/
    count<T extends TenantAnalysisCountArgs>(
      args?: Subset<T, TenantAnalysisCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantAnalysisCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAnalysisAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAnalysisAggregateArgs>(args: Subset<T, TenantAnalysisAggregateArgs>): Prisma.PrismaPromise<GetTenantAnalysisAggregateType<T>>

    /**
     * Group by TenantAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAnalysisGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantAnalysisGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantAnalysisGroupByArgs['orderBy'] }
        : { orderBy?: TenantAnalysisGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantAnalysisGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantAnalysisGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantAnalysis model
   */
  readonly fields: TenantAnalysisFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantAnalysis.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantAnalysisClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantAnalysis model
   */
  interface TenantAnalysisFieldRefs {
    readonly id: FieldRef<"TenantAnalysis", 'String'>
    readonly tenantId: FieldRef<"TenantAnalysis", 'String'>
    readonly mode: FieldRef<"TenantAnalysis", 'String'>
    readonly summary: FieldRef<"TenantAnalysis", 'String'>
    readonly risks: FieldRef<"TenantAnalysis", 'String[]'>
    readonly opportunities: FieldRef<"TenantAnalysis", 'String[]'>
    readonly priority: FieldRef<"TenantAnalysis", 'String'>
    readonly globalScore: FieldRef<"TenantAnalysis", 'Int'>
    readonly createdAt: FieldRef<"TenantAnalysis", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantAnalysis", 'DateTime'>
    readonly rawData: FieldRef<"TenantAnalysis", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * TenantAnalysis findUnique
   */
  export type TenantAnalysisFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which TenantAnalysis to fetch.
     */
    where: TenantAnalysisWhereUniqueInput
  }

  /**
   * TenantAnalysis findUniqueOrThrow
   */
  export type TenantAnalysisFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which TenantAnalysis to fetch.
     */
    where: TenantAnalysisWhereUniqueInput
  }

  /**
   * TenantAnalysis findFirst
   */
  export type TenantAnalysisFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which TenantAnalysis to fetch.
     */
    where?: TenantAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAnalyses to fetch.
     */
    orderBy?: TenantAnalysisOrderByWithRelationInput | TenantAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantAnalyses.
     */
    cursor?: TenantAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantAnalyses.
     */
    distinct?: TenantAnalysisScalarFieldEnum | TenantAnalysisScalarFieldEnum[]
  }

  /**
   * TenantAnalysis findFirstOrThrow
   */
  export type TenantAnalysisFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which TenantAnalysis to fetch.
     */
    where?: TenantAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAnalyses to fetch.
     */
    orderBy?: TenantAnalysisOrderByWithRelationInput | TenantAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantAnalyses.
     */
    cursor?: TenantAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantAnalyses.
     */
    distinct?: TenantAnalysisScalarFieldEnum | TenantAnalysisScalarFieldEnum[]
  }

  /**
   * TenantAnalysis findMany
   */
  export type TenantAnalysisFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which TenantAnalyses to fetch.
     */
    where?: TenantAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAnalyses to fetch.
     */
    orderBy?: TenantAnalysisOrderByWithRelationInput | TenantAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantAnalyses.
     */
    cursor?: TenantAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantAnalyses.
     */
    distinct?: TenantAnalysisScalarFieldEnum | TenantAnalysisScalarFieldEnum[]
  }

  /**
   * TenantAnalysis create
   */
  export type TenantAnalysisCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantAnalysis.
     */
    data: XOR<TenantAnalysisCreateInput, TenantAnalysisUncheckedCreateInput>
  }

  /**
   * TenantAnalysis createMany
   */
  export type TenantAnalysisCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantAnalyses.
     */
    data: TenantAnalysisCreateManyInput | TenantAnalysisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantAnalysis createManyAndReturn
   */
  export type TenantAnalysisCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * The data used to create many TenantAnalyses.
     */
    data: TenantAnalysisCreateManyInput | TenantAnalysisCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantAnalysis update
   */
  export type TenantAnalysisUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantAnalysis.
     */
    data: XOR<TenantAnalysisUpdateInput, TenantAnalysisUncheckedUpdateInput>
    /**
     * Choose, which TenantAnalysis to update.
     */
    where: TenantAnalysisWhereUniqueInput
  }

  /**
   * TenantAnalysis updateMany
   */
  export type TenantAnalysisUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantAnalyses.
     */
    data: XOR<TenantAnalysisUpdateManyMutationInput, TenantAnalysisUncheckedUpdateManyInput>
    /**
     * Filter which TenantAnalyses to update
     */
    where?: TenantAnalysisWhereInput
    /**
     * Limit how many TenantAnalyses to update.
     */
    limit?: number
  }

  /**
   * TenantAnalysis updateManyAndReturn
   */
  export type TenantAnalysisUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * The data used to update TenantAnalyses.
     */
    data: XOR<TenantAnalysisUpdateManyMutationInput, TenantAnalysisUncheckedUpdateManyInput>
    /**
     * Filter which TenantAnalyses to update
     */
    where?: TenantAnalysisWhereInput
    /**
     * Limit how many TenantAnalyses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantAnalysis upsert
   */
  export type TenantAnalysisUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantAnalysis to update in case it exists.
     */
    where: TenantAnalysisWhereUniqueInput
    /**
     * In case the TenantAnalysis found by the `where` argument doesn't exist, create a new TenantAnalysis with this data.
     */
    create: XOR<TenantAnalysisCreateInput, TenantAnalysisUncheckedCreateInput>
    /**
     * In case the TenantAnalysis was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantAnalysisUpdateInput, TenantAnalysisUncheckedUpdateInput>
  }

  /**
   * TenantAnalysis delete
   */
  export type TenantAnalysisDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
    /**
     * Filter which TenantAnalysis to delete.
     */
    where: TenantAnalysisWhereUniqueInput
  }

  /**
   * TenantAnalysis deleteMany
   */
  export type TenantAnalysisDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantAnalyses to delete
     */
    where?: TenantAnalysisWhereInput
    /**
     * Limit how many TenantAnalyses to delete.
     */
    limit?: number
  }

  /**
   * TenantAnalysis without action
   */
  export type TenantAnalysisDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAnalysis
     */
    select?: TenantAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAnalysis
     */
    omit?: TenantAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAnalysisInclude<ExtArgs> | null
  }


  /**
   * Model RecruitingSearch
   */

  export type AggregateRecruitingSearch = {
    _count: RecruitingSearchCountAggregateOutputType | null
    _min: RecruitingSearchMinAggregateOutputType | null
    _max: RecruitingSearchMaxAggregateOutputType | null
  }

  export type RecruitingSearchMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    createdById: string | null
    refCode: string | null
    title: string | null
    requestText: string | null
    status: string | null
    monitoringStatus: string | null
    area: string | null
    seniority: string | null
    modality: string | null
    location: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecruitingSearchMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    createdById: string | null
    refCode: string | null
    title: string | null
    requestText: string | null
    status: string | null
    monitoringStatus: string | null
    area: string | null
    seniority: string | null
    modality: string | null
    location: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecruitingSearchCountAggregateOutputType = {
    id: number
    tenantId: number
    createdById: number
    refCode: number
    title: number
    requestText: number
    status: number
    monitoringStatus: number
    area: number
    seniority: number
    modality: number
    location: number
    jobProfileOutput: number
    idealCandidateOutput: number
    scoringCriteriaOutput: number
    publicationCopiesOutput: number
    aiGenerationLog: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RecruitingSearchMinAggregateInputType = {
    id?: true
    tenantId?: true
    createdById?: true
    refCode?: true
    title?: true
    requestText?: true
    status?: true
    monitoringStatus?: true
    area?: true
    seniority?: true
    modality?: true
    location?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecruitingSearchMaxAggregateInputType = {
    id?: true
    tenantId?: true
    createdById?: true
    refCode?: true
    title?: true
    requestText?: true
    status?: true
    monitoringStatus?: true
    area?: true
    seniority?: true
    modality?: true
    location?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecruitingSearchCountAggregateInputType = {
    id?: true
    tenantId?: true
    createdById?: true
    refCode?: true
    title?: true
    requestText?: true
    status?: true
    monitoringStatus?: true
    area?: true
    seniority?: true
    modality?: true
    location?: true
    jobProfileOutput?: true
    idealCandidateOutput?: true
    scoringCriteriaOutput?: true
    publicationCopiesOutput?: true
    aiGenerationLog?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RecruitingSearchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingSearch to aggregate.
     */
    where?: RecruitingSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingSearches to fetch.
     */
    orderBy?: RecruitingSearchOrderByWithRelationInput | RecruitingSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecruitingSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingSearches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecruitingSearches
    **/
    _count?: true | RecruitingSearchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecruitingSearchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecruitingSearchMaxAggregateInputType
  }

  export type GetRecruitingSearchAggregateType<T extends RecruitingSearchAggregateArgs> = {
        [P in keyof T & keyof AggregateRecruitingSearch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecruitingSearch[P]>
      : GetScalarType<T[P], AggregateRecruitingSearch[P]>
  }




  export type RecruitingSearchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecruitingSearchWhereInput
    orderBy?: RecruitingSearchOrderByWithAggregationInput | RecruitingSearchOrderByWithAggregationInput[]
    by: RecruitingSearchScalarFieldEnum[] | RecruitingSearchScalarFieldEnum
    having?: RecruitingSearchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecruitingSearchCountAggregateInputType | true
    _min?: RecruitingSearchMinAggregateInputType
    _max?: RecruitingSearchMaxAggregateInputType
  }

  export type RecruitingSearchGroupByOutputType = {
    id: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status: string
    monitoringStatus: string | null
    area: string | null
    seniority: string | null
    modality: string | null
    location: string | null
    jobProfileOutput: JsonValue | null
    idealCandidateOutput: JsonValue | null
    scoringCriteriaOutput: JsonValue | null
    publicationCopiesOutput: JsonValue | null
    aiGenerationLog: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: RecruitingSearchCountAggregateOutputType | null
    _min: RecruitingSearchMinAggregateOutputType | null
    _max: RecruitingSearchMaxAggregateOutputType | null
  }

  type GetRecruitingSearchGroupByPayload<T extends RecruitingSearchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecruitingSearchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecruitingSearchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecruitingSearchGroupByOutputType[P]>
            : GetScalarType<T[P], RecruitingSearchGroupByOutputType[P]>
        }
      >
    >


  export type RecruitingSearchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    createdById?: boolean
    refCode?: boolean
    title?: boolean
    requestText?: boolean
    status?: boolean
    monitoringStatus?: boolean
    area?: boolean
    seniority?: boolean
    modality?: boolean
    location?: boolean
    jobProfileOutput?: boolean
    idealCandidateOutput?: boolean
    scoringCriteriaOutput?: boolean
    publicationCopiesOutput?: boolean
    aiGenerationLog?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    companyProfile?: boolean | RecruitingSearch$companyProfileArgs<ExtArgs>
    attachments?: boolean | RecruitingSearch$attachmentsArgs<ExtArgs>
    candidates?: boolean | RecruitingSearch$candidatesArgs<ExtArgs>
    _count?: boolean | RecruitingSearchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingSearch"]>

  export type RecruitingSearchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    createdById?: boolean
    refCode?: boolean
    title?: boolean
    requestText?: boolean
    status?: boolean
    monitoringStatus?: boolean
    area?: boolean
    seniority?: boolean
    modality?: boolean
    location?: boolean
    jobProfileOutput?: boolean
    idealCandidateOutput?: boolean
    scoringCriteriaOutput?: boolean
    publicationCopiesOutput?: boolean
    aiGenerationLog?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["recruitingSearch"]>

  export type RecruitingSearchSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    createdById?: boolean
    refCode?: boolean
    title?: boolean
    requestText?: boolean
    status?: boolean
    monitoringStatus?: boolean
    area?: boolean
    seniority?: boolean
    modality?: boolean
    location?: boolean
    jobProfileOutput?: boolean
    idealCandidateOutput?: boolean
    scoringCriteriaOutput?: boolean
    publicationCopiesOutput?: boolean
    aiGenerationLog?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["recruitingSearch"]>

  export type RecruitingSearchSelectScalar = {
    id?: boolean
    tenantId?: boolean
    createdById?: boolean
    refCode?: boolean
    title?: boolean
    requestText?: boolean
    status?: boolean
    monitoringStatus?: boolean
    area?: boolean
    seniority?: boolean
    modality?: boolean
    location?: boolean
    jobProfileOutput?: boolean
    idealCandidateOutput?: boolean
    scoringCriteriaOutput?: boolean
    publicationCopiesOutput?: boolean
    aiGenerationLog?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RecruitingSearchOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "createdById" | "refCode" | "title" | "requestText" | "status" | "monitoringStatus" | "area" | "seniority" | "modality" | "location" | "jobProfileOutput" | "idealCandidateOutput" | "scoringCriteriaOutput" | "publicationCopiesOutput" | "aiGenerationLog" | "createdAt" | "updatedAt", ExtArgs["result"]["recruitingSearch"]>
  export type RecruitingSearchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    companyProfile?: boolean | RecruitingSearch$companyProfileArgs<ExtArgs>
    attachments?: boolean | RecruitingSearch$attachmentsArgs<ExtArgs>
    candidates?: boolean | RecruitingSearch$candidatesArgs<ExtArgs>
    _count?: boolean | RecruitingSearchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RecruitingSearchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RecruitingSearchIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RecruitingSearchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecruitingSearch"
    objects: {
      companyProfile: Prisma.$RecruitingCompanyProfilePayload<ExtArgs> | null
      attachments: Prisma.$RecruitingAttachmentPayload<ExtArgs>[]
      candidates: Prisma.$RecruitingCandidatePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      createdById: string
      refCode: string
      title: string
      requestText: string
      status: string
      monitoringStatus: string | null
      area: string | null
      seniority: string | null
      modality: string | null
      location: string | null
      jobProfileOutput: Prisma.JsonValue | null
      idealCandidateOutput: Prisma.JsonValue | null
      scoringCriteriaOutput: Prisma.JsonValue | null
      publicationCopiesOutput: Prisma.JsonValue | null
      aiGenerationLog: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["recruitingSearch"]>
    composites: {}
  }

  type RecruitingSearchGetPayload<S extends boolean | null | undefined | RecruitingSearchDefaultArgs> = $Result.GetResult<Prisma.$RecruitingSearchPayload, S>

  type RecruitingSearchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecruitingSearchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecruitingSearchCountAggregateInputType | true
    }

  export interface RecruitingSearchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecruitingSearch'], meta: { name: 'RecruitingSearch' } }
    /**
     * Find zero or one RecruitingSearch that matches the filter.
     * @param {RecruitingSearchFindUniqueArgs} args - Arguments to find a RecruitingSearch
     * @example
     * // Get one RecruitingSearch
     * const recruitingSearch = await prisma.recruitingSearch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecruitingSearchFindUniqueArgs>(args: SelectSubset<T, RecruitingSearchFindUniqueArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecruitingSearch that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecruitingSearchFindUniqueOrThrowArgs} args - Arguments to find a RecruitingSearch
     * @example
     * // Get one RecruitingSearch
     * const recruitingSearch = await prisma.recruitingSearch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecruitingSearchFindUniqueOrThrowArgs>(args: SelectSubset<T, RecruitingSearchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingSearch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingSearchFindFirstArgs} args - Arguments to find a RecruitingSearch
     * @example
     * // Get one RecruitingSearch
     * const recruitingSearch = await prisma.recruitingSearch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecruitingSearchFindFirstArgs>(args?: SelectSubset<T, RecruitingSearchFindFirstArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingSearch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingSearchFindFirstOrThrowArgs} args - Arguments to find a RecruitingSearch
     * @example
     * // Get one RecruitingSearch
     * const recruitingSearch = await prisma.recruitingSearch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecruitingSearchFindFirstOrThrowArgs>(args?: SelectSubset<T, RecruitingSearchFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecruitingSearches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingSearchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecruitingSearches
     * const recruitingSearches = await prisma.recruitingSearch.findMany()
     * 
     * // Get first 10 RecruitingSearches
     * const recruitingSearches = await prisma.recruitingSearch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recruitingSearchWithIdOnly = await prisma.recruitingSearch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecruitingSearchFindManyArgs>(args?: SelectSubset<T, RecruitingSearchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecruitingSearch.
     * @param {RecruitingSearchCreateArgs} args - Arguments to create a RecruitingSearch.
     * @example
     * // Create one RecruitingSearch
     * const RecruitingSearch = await prisma.recruitingSearch.create({
     *   data: {
     *     // ... data to create a RecruitingSearch
     *   }
     * })
     * 
     */
    create<T extends RecruitingSearchCreateArgs>(args: SelectSubset<T, RecruitingSearchCreateArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecruitingSearches.
     * @param {RecruitingSearchCreateManyArgs} args - Arguments to create many RecruitingSearches.
     * @example
     * // Create many RecruitingSearches
     * const recruitingSearch = await prisma.recruitingSearch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecruitingSearchCreateManyArgs>(args?: SelectSubset<T, RecruitingSearchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecruitingSearches and returns the data saved in the database.
     * @param {RecruitingSearchCreateManyAndReturnArgs} args - Arguments to create many RecruitingSearches.
     * @example
     * // Create many RecruitingSearches
     * const recruitingSearch = await prisma.recruitingSearch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecruitingSearches and only return the `id`
     * const recruitingSearchWithIdOnly = await prisma.recruitingSearch.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecruitingSearchCreateManyAndReturnArgs>(args?: SelectSubset<T, RecruitingSearchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecruitingSearch.
     * @param {RecruitingSearchDeleteArgs} args - Arguments to delete one RecruitingSearch.
     * @example
     * // Delete one RecruitingSearch
     * const RecruitingSearch = await prisma.recruitingSearch.delete({
     *   where: {
     *     // ... filter to delete one RecruitingSearch
     *   }
     * })
     * 
     */
    delete<T extends RecruitingSearchDeleteArgs>(args: SelectSubset<T, RecruitingSearchDeleteArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecruitingSearch.
     * @param {RecruitingSearchUpdateArgs} args - Arguments to update one RecruitingSearch.
     * @example
     * // Update one RecruitingSearch
     * const recruitingSearch = await prisma.recruitingSearch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecruitingSearchUpdateArgs>(args: SelectSubset<T, RecruitingSearchUpdateArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecruitingSearches.
     * @param {RecruitingSearchDeleteManyArgs} args - Arguments to filter RecruitingSearches to delete.
     * @example
     * // Delete a few RecruitingSearches
     * const { count } = await prisma.recruitingSearch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecruitingSearchDeleteManyArgs>(args?: SelectSubset<T, RecruitingSearchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingSearches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingSearchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecruitingSearches
     * const recruitingSearch = await prisma.recruitingSearch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecruitingSearchUpdateManyArgs>(args: SelectSubset<T, RecruitingSearchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingSearches and returns the data updated in the database.
     * @param {RecruitingSearchUpdateManyAndReturnArgs} args - Arguments to update many RecruitingSearches.
     * @example
     * // Update many RecruitingSearches
     * const recruitingSearch = await prisma.recruitingSearch.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecruitingSearches and only return the `id`
     * const recruitingSearchWithIdOnly = await prisma.recruitingSearch.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecruitingSearchUpdateManyAndReturnArgs>(args: SelectSubset<T, RecruitingSearchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecruitingSearch.
     * @param {RecruitingSearchUpsertArgs} args - Arguments to update or create a RecruitingSearch.
     * @example
     * // Update or create a RecruitingSearch
     * const recruitingSearch = await prisma.recruitingSearch.upsert({
     *   create: {
     *     // ... data to create a RecruitingSearch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecruitingSearch we want to update
     *   }
     * })
     */
    upsert<T extends RecruitingSearchUpsertArgs>(args: SelectSubset<T, RecruitingSearchUpsertArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecruitingSearches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingSearchCountArgs} args - Arguments to filter RecruitingSearches to count.
     * @example
     * // Count the number of RecruitingSearches
     * const count = await prisma.recruitingSearch.count({
     *   where: {
     *     // ... the filter for the RecruitingSearches we want to count
     *   }
     * })
    **/
    count<T extends RecruitingSearchCountArgs>(
      args?: Subset<T, RecruitingSearchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecruitingSearchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecruitingSearch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingSearchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecruitingSearchAggregateArgs>(args: Subset<T, RecruitingSearchAggregateArgs>): Prisma.PrismaPromise<GetRecruitingSearchAggregateType<T>>

    /**
     * Group by RecruitingSearch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingSearchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecruitingSearchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecruitingSearchGroupByArgs['orderBy'] }
        : { orderBy?: RecruitingSearchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecruitingSearchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecruitingSearchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecruitingSearch model
   */
  readonly fields: RecruitingSearchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecruitingSearch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecruitingSearchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    companyProfile<T extends RecruitingSearch$companyProfileArgs<ExtArgs> = {}>(args?: Subset<T, RecruitingSearch$companyProfileArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    attachments<T extends RecruitingSearch$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, RecruitingSearch$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    candidates<T extends RecruitingSearch$candidatesArgs<ExtArgs> = {}>(args?: Subset<T, RecruitingSearch$candidatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RecruitingSearch model
   */
  interface RecruitingSearchFieldRefs {
    readonly id: FieldRef<"RecruitingSearch", 'String'>
    readonly tenantId: FieldRef<"RecruitingSearch", 'String'>
    readonly createdById: FieldRef<"RecruitingSearch", 'String'>
    readonly refCode: FieldRef<"RecruitingSearch", 'String'>
    readonly title: FieldRef<"RecruitingSearch", 'String'>
    readonly requestText: FieldRef<"RecruitingSearch", 'String'>
    readonly status: FieldRef<"RecruitingSearch", 'String'>
    readonly monitoringStatus: FieldRef<"RecruitingSearch", 'String'>
    readonly area: FieldRef<"RecruitingSearch", 'String'>
    readonly seniority: FieldRef<"RecruitingSearch", 'String'>
    readonly modality: FieldRef<"RecruitingSearch", 'String'>
    readonly location: FieldRef<"RecruitingSearch", 'String'>
    readonly jobProfileOutput: FieldRef<"RecruitingSearch", 'Json'>
    readonly idealCandidateOutput: FieldRef<"RecruitingSearch", 'Json'>
    readonly scoringCriteriaOutput: FieldRef<"RecruitingSearch", 'Json'>
    readonly publicationCopiesOutput: FieldRef<"RecruitingSearch", 'Json'>
    readonly aiGenerationLog: FieldRef<"RecruitingSearch", 'Json'>
    readonly createdAt: FieldRef<"RecruitingSearch", 'DateTime'>
    readonly updatedAt: FieldRef<"RecruitingSearch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RecruitingSearch findUnique
   */
  export type RecruitingSearchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingSearch to fetch.
     */
    where: RecruitingSearchWhereUniqueInput
  }

  /**
   * RecruitingSearch findUniqueOrThrow
   */
  export type RecruitingSearchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingSearch to fetch.
     */
    where: RecruitingSearchWhereUniqueInput
  }

  /**
   * RecruitingSearch findFirst
   */
  export type RecruitingSearchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingSearch to fetch.
     */
    where?: RecruitingSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingSearches to fetch.
     */
    orderBy?: RecruitingSearchOrderByWithRelationInput | RecruitingSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingSearches.
     */
    cursor?: RecruitingSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingSearches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingSearches.
     */
    distinct?: RecruitingSearchScalarFieldEnum | RecruitingSearchScalarFieldEnum[]
  }

  /**
   * RecruitingSearch findFirstOrThrow
   */
  export type RecruitingSearchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingSearch to fetch.
     */
    where?: RecruitingSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingSearches to fetch.
     */
    orderBy?: RecruitingSearchOrderByWithRelationInput | RecruitingSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingSearches.
     */
    cursor?: RecruitingSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingSearches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingSearches.
     */
    distinct?: RecruitingSearchScalarFieldEnum | RecruitingSearchScalarFieldEnum[]
  }

  /**
   * RecruitingSearch findMany
   */
  export type RecruitingSearchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingSearches to fetch.
     */
    where?: RecruitingSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingSearches to fetch.
     */
    orderBy?: RecruitingSearchOrderByWithRelationInput | RecruitingSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecruitingSearches.
     */
    cursor?: RecruitingSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingSearches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingSearches.
     */
    distinct?: RecruitingSearchScalarFieldEnum | RecruitingSearchScalarFieldEnum[]
  }

  /**
   * RecruitingSearch create
   */
  export type RecruitingSearchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * The data needed to create a RecruitingSearch.
     */
    data: XOR<RecruitingSearchCreateInput, RecruitingSearchUncheckedCreateInput>
  }

  /**
   * RecruitingSearch createMany
   */
  export type RecruitingSearchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecruitingSearches.
     */
    data: RecruitingSearchCreateManyInput | RecruitingSearchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecruitingSearch createManyAndReturn
   */
  export type RecruitingSearchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * The data used to create many RecruitingSearches.
     */
    data: RecruitingSearchCreateManyInput | RecruitingSearchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecruitingSearch update
   */
  export type RecruitingSearchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * The data needed to update a RecruitingSearch.
     */
    data: XOR<RecruitingSearchUpdateInput, RecruitingSearchUncheckedUpdateInput>
    /**
     * Choose, which RecruitingSearch to update.
     */
    where: RecruitingSearchWhereUniqueInput
  }

  /**
   * RecruitingSearch updateMany
   */
  export type RecruitingSearchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecruitingSearches.
     */
    data: XOR<RecruitingSearchUpdateManyMutationInput, RecruitingSearchUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingSearches to update
     */
    where?: RecruitingSearchWhereInput
    /**
     * Limit how many RecruitingSearches to update.
     */
    limit?: number
  }

  /**
   * RecruitingSearch updateManyAndReturn
   */
  export type RecruitingSearchUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * The data used to update RecruitingSearches.
     */
    data: XOR<RecruitingSearchUpdateManyMutationInput, RecruitingSearchUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingSearches to update
     */
    where?: RecruitingSearchWhereInput
    /**
     * Limit how many RecruitingSearches to update.
     */
    limit?: number
  }

  /**
   * RecruitingSearch upsert
   */
  export type RecruitingSearchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * The filter to search for the RecruitingSearch to update in case it exists.
     */
    where: RecruitingSearchWhereUniqueInput
    /**
     * In case the RecruitingSearch found by the `where` argument doesn't exist, create a new RecruitingSearch with this data.
     */
    create: XOR<RecruitingSearchCreateInput, RecruitingSearchUncheckedCreateInput>
    /**
     * In case the RecruitingSearch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecruitingSearchUpdateInput, RecruitingSearchUncheckedUpdateInput>
  }

  /**
   * RecruitingSearch delete
   */
  export type RecruitingSearchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
    /**
     * Filter which RecruitingSearch to delete.
     */
    where: RecruitingSearchWhereUniqueInput
  }

  /**
   * RecruitingSearch deleteMany
   */
  export type RecruitingSearchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingSearches to delete
     */
    where?: RecruitingSearchWhereInput
    /**
     * Limit how many RecruitingSearches to delete.
     */
    limit?: number
  }

  /**
   * RecruitingSearch.companyProfile
   */
  export type RecruitingSearch$companyProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    where?: RecruitingCompanyProfileWhereInput
  }

  /**
   * RecruitingSearch.attachments
   */
  export type RecruitingSearch$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    where?: RecruitingAttachmentWhereInput
    orderBy?: RecruitingAttachmentOrderByWithRelationInput | RecruitingAttachmentOrderByWithRelationInput[]
    cursor?: RecruitingAttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecruitingAttachmentScalarFieldEnum | RecruitingAttachmentScalarFieldEnum[]
  }

  /**
   * RecruitingSearch.candidates
   */
  export type RecruitingSearch$candidatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    where?: RecruitingCandidateWhereInput
    orderBy?: RecruitingCandidateOrderByWithRelationInput | RecruitingCandidateOrderByWithRelationInput[]
    cursor?: RecruitingCandidateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecruitingCandidateScalarFieldEnum | RecruitingCandidateScalarFieldEnum[]
  }

  /**
   * RecruitingSearch without action
   */
  export type RecruitingSearchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingSearch
     */
    select?: RecruitingSearchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingSearch
     */
    omit?: RecruitingSearchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingSearchInclude<ExtArgs> | null
  }


  /**
   * Model RecruitingCompanyProfile
   */

  export type AggregateRecruitingCompanyProfile = {
    _count: RecruitingCompanyProfileCountAggregateOutputType | null
    _min: RecruitingCompanyProfileMinAggregateOutputType | null
    _max: RecruitingCompanyProfileMaxAggregateOutputType | null
  }

  export type RecruitingCompanyProfileMinAggregateOutputType = {
    id: string | null
    searchId: string | null
    razonSocial: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecruitingCompanyProfileMaxAggregateOutputType = {
    id: string | null
    searchId: string | null
    razonSocial: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecruitingCompanyProfileCountAggregateOutputType = {
    id: number
    searchId: number
    razonSocial: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RecruitingCompanyProfileMinAggregateInputType = {
    id?: true
    searchId?: true
    razonSocial?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecruitingCompanyProfileMaxAggregateInputType = {
    id?: true
    searchId?: true
    razonSocial?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecruitingCompanyProfileCountAggregateInputType = {
    id?: true
    searchId?: true
    razonSocial?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RecruitingCompanyProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingCompanyProfile to aggregate.
     */
    where?: RecruitingCompanyProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCompanyProfiles to fetch.
     */
    orderBy?: RecruitingCompanyProfileOrderByWithRelationInput | RecruitingCompanyProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecruitingCompanyProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCompanyProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCompanyProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecruitingCompanyProfiles
    **/
    _count?: true | RecruitingCompanyProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecruitingCompanyProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecruitingCompanyProfileMaxAggregateInputType
  }

  export type GetRecruitingCompanyProfileAggregateType<T extends RecruitingCompanyProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateRecruitingCompanyProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecruitingCompanyProfile[P]>
      : GetScalarType<T[P], AggregateRecruitingCompanyProfile[P]>
  }




  export type RecruitingCompanyProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecruitingCompanyProfileWhereInput
    orderBy?: RecruitingCompanyProfileOrderByWithAggregationInput | RecruitingCompanyProfileOrderByWithAggregationInput[]
    by: RecruitingCompanyProfileScalarFieldEnum[] | RecruitingCompanyProfileScalarFieldEnum
    having?: RecruitingCompanyProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecruitingCompanyProfileCountAggregateInputType | true
    _min?: RecruitingCompanyProfileMinAggregateInputType
    _max?: RecruitingCompanyProfileMaxAggregateInputType
  }

  export type RecruitingCompanyProfileGroupByOutputType = {
    id: string
    searchId: string
    razonSocial: string | null
    createdAt: Date
    updatedAt: Date
    _count: RecruitingCompanyProfileCountAggregateOutputType | null
    _min: RecruitingCompanyProfileMinAggregateOutputType | null
    _max: RecruitingCompanyProfileMaxAggregateOutputType | null
  }

  type GetRecruitingCompanyProfileGroupByPayload<T extends RecruitingCompanyProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecruitingCompanyProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecruitingCompanyProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecruitingCompanyProfileGroupByOutputType[P]>
            : GetScalarType<T[P], RecruitingCompanyProfileGroupByOutputType[P]>
        }
      >
    >


  export type RecruitingCompanyProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    razonSocial?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingCompanyProfile"]>

  export type RecruitingCompanyProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    razonSocial?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingCompanyProfile"]>

  export type RecruitingCompanyProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    razonSocial?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingCompanyProfile"]>

  export type RecruitingCompanyProfileSelectScalar = {
    id?: boolean
    searchId?: boolean
    razonSocial?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RecruitingCompanyProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "searchId" | "razonSocial" | "createdAt" | "updatedAt", ExtArgs["result"]["recruitingCompanyProfile"]>
  export type RecruitingCompanyProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }
  export type RecruitingCompanyProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }
  export type RecruitingCompanyProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }

  export type $RecruitingCompanyProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecruitingCompanyProfile"
    objects: {
      search: Prisma.$RecruitingSearchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      searchId: string
      razonSocial: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["recruitingCompanyProfile"]>
    composites: {}
  }

  type RecruitingCompanyProfileGetPayload<S extends boolean | null | undefined | RecruitingCompanyProfileDefaultArgs> = $Result.GetResult<Prisma.$RecruitingCompanyProfilePayload, S>

  type RecruitingCompanyProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecruitingCompanyProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecruitingCompanyProfileCountAggregateInputType | true
    }

  export interface RecruitingCompanyProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecruitingCompanyProfile'], meta: { name: 'RecruitingCompanyProfile' } }
    /**
     * Find zero or one RecruitingCompanyProfile that matches the filter.
     * @param {RecruitingCompanyProfileFindUniqueArgs} args - Arguments to find a RecruitingCompanyProfile
     * @example
     * // Get one RecruitingCompanyProfile
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecruitingCompanyProfileFindUniqueArgs>(args: SelectSubset<T, RecruitingCompanyProfileFindUniqueArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecruitingCompanyProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecruitingCompanyProfileFindUniqueOrThrowArgs} args - Arguments to find a RecruitingCompanyProfile
     * @example
     * // Get one RecruitingCompanyProfile
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecruitingCompanyProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, RecruitingCompanyProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingCompanyProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCompanyProfileFindFirstArgs} args - Arguments to find a RecruitingCompanyProfile
     * @example
     * // Get one RecruitingCompanyProfile
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecruitingCompanyProfileFindFirstArgs>(args?: SelectSubset<T, RecruitingCompanyProfileFindFirstArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingCompanyProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCompanyProfileFindFirstOrThrowArgs} args - Arguments to find a RecruitingCompanyProfile
     * @example
     * // Get one RecruitingCompanyProfile
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecruitingCompanyProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, RecruitingCompanyProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecruitingCompanyProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCompanyProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecruitingCompanyProfiles
     * const recruitingCompanyProfiles = await prisma.recruitingCompanyProfile.findMany()
     * 
     * // Get first 10 RecruitingCompanyProfiles
     * const recruitingCompanyProfiles = await prisma.recruitingCompanyProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recruitingCompanyProfileWithIdOnly = await prisma.recruitingCompanyProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecruitingCompanyProfileFindManyArgs>(args?: SelectSubset<T, RecruitingCompanyProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecruitingCompanyProfile.
     * @param {RecruitingCompanyProfileCreateArgs} args - Arguments to create a RecruitingCompanyProfile.
     * @example
     * // Create one RecruitingCompanyProfile
     * const RecruitingCompanyProfile = await prisma.recruitingCompanyProfile.create({
     *   data: {
     *     // ... data to create a RecruitingCompanyProfile
     *   }
     * })
     * 
     */
    create<T extends RecruitingCompanyProfileCreateArgs>(args: SelectSubset<T, RecruitingCompanyProfileCreateArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecruitingCompanyProfiles.
     * @param {RecruitingCompanyProfileCreateManyArgs} args - Arguments to create many RecruitingCompanyProfiles.
     * @example
     * // Create many RecruitingCompanyProfiles
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecruitingCompanyProfileCreateManyArgs>(args?: SelectSubset<T, RecruitingCompanyProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecruitingCompanyProfiles and returns the data saved in the database.
     * @param {RecruitingCompanyProfileCreateManyAndReturnArgs} args - Arguments to create many RecruitingCompanyProfiles.
     * @example
     * // Create many RecruitingCompanyProfiles
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecruitingCompanyProfiles and only return the `id`
     * const recruitingCompanyProfileWithIdOnly = await prisma.recruitingCompanyProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecruitingCompanyProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, RecruitingCompanyProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecruitingCompanyProfile.
     * @param {RecruitingCompanyProfileDeleteArgs} args - Arguments to delete one RecruitingCompanyProfile.
     * @example
     * // Delete one RecruitingCompanyProfile
     * const RecruitingCompanyProfile = await prisma.recruitingCompanyProfile.delete({
     *   where: {
     *     // ... filter to delete one RecruitingCompanyProfile
     *   }
     * })
     * 
     */
    delete<T extends RecruitingCompanyProfileDeleteArgs>(args: SelectSubset<T, RecruitingCompanyProfileDeleteArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecruitingCompanyProfile.
     * @param {RecruitingCompanyProfileUpdateArgs} args - Arguments to update one RecruitingCompanyProfile.
     * @example
     * // Update one RecruitingCompanyProfile
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecruitingCompanyProfileUpdateArgs>(args: SelectSubset<T, RecruitingCompanyProfileUpdateArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecruitingCompanyProfiles.
     * @param {RecruitingCompanyProfileDeleteManyArgs} args - Arguments to filter RecruitingCompanyProfiles to delete.
     * @example
     * // Delete a few RecruitingCompanyProfiles
     * const { count } = await prisma.recruitingCompanyProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecruitingCompanyProfileDeleteManyArgs>(args?: SelectSubset<T, RecruitingCompanyProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingCompanyProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCompanyProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecruitingCompanyProfiles
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecruitingCompanyProfileUpdateManyArgs>(args: SelectSubset<T, RecruitingCompanyProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingCompanyProfiles and returns the data updated in the database.
     * @param {RecruitingCompanyProfileUpdateManyAndReturnArgs} args - Arguments to update many RecruitingCompanyProfiles.
     * @example
     * // Update many RecruitingCompanyProfiles
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecruitingCompanyProfiles and only return the `id`
     * const recruitingCompanyProfileWithIdOnly = await prisma.recruitingCompanyProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecruitingCompanyProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, RecruitingCompanyProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecruitingCompanyProfile.
     * @param {RecruitingCompanyProfileUpsertArgs} args - Arguments to update or create a RecruitingCompanyProfile.
     * @example
     * // Update or create a RecruitingCompanyProfile
     * const recruitingCompanyProfile = await prisma.recruitingCompanyProfile.upsert({
     *   create: {
     *     // ... data to create a RecruitingCompanyProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecruitingCompanyProfile we want to update
     *   }
     * })
     */
    upsert<T extends RecruitingCompanyProfileUpsertArgs>(args: SelectSubset<T, RecruitingCompanyProfileUpsertArgs<ExtArgs>>): Prisma__RecruitingCompanyProfileClient<$Result.GetResult<Prisma.$RecruitingCompanyProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecruitingCompanyProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCompanyProfileCountArgs} args - Arguments to filter RecruitingCompanyProfiles to count.
     * @example
     * // Count the number of RecruitingCompanyProfiles
     * const count = await prisma.recruitingCompanyProfile.count({
     *   where: {
     *     // ... the filter for the RecruitingCompanyProfiles we want to count
     *   }
     * })
    **/
    count<T extends RecruitingCompanyProfileCountArgs>(
      args?: Subset<T, RecruitingCompanyProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecruitingCompanyProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecruitingCompanyProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCompanyProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecruitingCompanyProfileAggregateArgs>(args: Subset<T, RecruitingCompanyProfileAggregateArgs>): Prisma.PrismaPromise<GetRecruitingCompanyProfileAggregateType<T>>

    /**
     * Group by RecruitingCompanyProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCompanyProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecruitingCompanyProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecruitingCompanyProfileGroupByArgs['orderBy'] }
        : { orderBy?: RecruitingCompanyProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecruitingCompanyProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecruitingCompanyProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecruitingCompanyProfile model
   */
  readonly fields: RecruitingCompanyProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecruitingCompanyProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecruitingCompanyProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    search<T extends RecruitingSearchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecruitingSearchDefaultArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RecruitingCompanyProfile model
   */
  interface RecruitingCompanyProfileFieldRefs {
    readonly id: FieldRef<"RecruitingCompanyProfile", 'String'>
    readonly searchId: FieldRef<"RecruitingCompanyProfile", 'String'>
    readonly razonSocial: FieldRef<"RecruitingCompanyProfile", 'String'>
    readonly createdAt: FieldRef<"RecruitingCompanyProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"RecruitingCompanyProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RecruitingCompanyProfile findUnique
   */
  export type RecruitingCompanyProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCompanyProfile to fetch.
     */
    where: RecruitingCompanyProfileWhereUniqueInput
  }

  /**
   * RecruitingCompanyProfile findUniqueOrThrow
   */
  export type RecruitingCompanyProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCompanyProfile to fetch.
     */
    where: RecruitingCompanyProfileWhereUniqueInput
  }

  /**
   * RecruitingCompanyProfile findFirst
   */
  export type RecruitingCompanyProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCompanyProfile to fetch.
     */
    where?: RecruitingCompanyProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCompanyProfiles to fetch.
     */
    orderBy?: RecruitingCompanyProfileOrderByWithRelationInput | RecruitingCompanyProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingCompanyProfiles.
     */
    cursor?: RecruitingCompanyProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCompanyProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCompanyProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingCompanyProfiles.
     */
    distinct?: RecruitingCompanyProfileScalarFieldEnum | RecruitingCompanyProfileScalarFieldEnum[]
  }

  /**
   * RecruitingCompanyProfile findFirstOrThrow
   */
  export type RecruitingCompanyProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCompanyProfile to fetch.
     */
    where?: RecruitingCompanyProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCompanyProfiles to fetch.
     */
    orderBy?: RecruitingCompanyProfileOrderByWithRelationInput | RecruitingCompanyProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingCompanyProfiles.
     */
    cursor?: RecruitingCompanyProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCompanyProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCompanyProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingCompanyProfiles.
     */
    distinct?: RecruitingCompanyProfileScalarFieldEnum | RecruitingCompanyProfileScalarFieldEnum[]
  }

  /**
   * RecruitingCompanyProfile findMany
   */
  export type RecruitingCompanyProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCompanyProfiles to fetch.
     */
    where?: RecruitingCompanyProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCompanyProfiles to fetch.
     */
    orderBy?: RecruitingCompanyProfileOrderByWithRelationInput | RecruitingCompanyProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecruitingCompanyProfiles.
     */
    cursor?: RecruitingCompanyProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCompanyProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCompanyProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingCompanyProfiles.
     */
    distinct?: RecruitingCompanyProfileScalarFieldEnum | RecruitingCompanyProfileScalarFieldEnum[]
  }

  /**
   * RecruitingCompanyProfile create
   */
  export type RecruitingCompanyProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a RecruitingCompanyProfile.
     */
    data: XOR<RecruitingCompanyProfileCreateInput, RecruitingCompanyProfileUncheckedCreateInput>
  }

  /**
   * RecruitingCompanyProfile createMany
   */
  export type RecruitingCompanyProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecruitingCompanyProfiles.
     */
    data: RecruitingCompanyProfileCreateManyInput | RecruitingCompanyProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecruitingCompanyProfile createManyAndReturn
   */
  export type RecruitingCompanyProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * The data used to create many RecruitingCompanyProfiles.
     */
    data: RecruitingCompanyProfileCreateManyInput | RecruitingCompanyProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecruitingCompanyProfile update
   */
  export type RecruitingCompanyProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a RecruitingCompanyProfile.
     */
    data: XOR<RecruitingCompanyProfileUpdateInput, RecruitingCompanyProfileUncheckedUpdateInput>
    /**
     * Choose, which RecruitingCompanyProfile to update.
     */
    where: RecruitingCompanyProfileWhereUniqueInput
  }

  /**
   * RecruitingCompanyProfile updateMany
   */
  export type RecruitingCompanyProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecruitingCompanyProfiles.
     */
    data: XOR<RecruitingCompanyProfileUpdateManyMutationInput, RecruitingCompanyProfileUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingCompanyProfiles to update
     */
    where?: RecruitingCompanyProfileWhereInput
    /**
     * Limit how many RecruitingCompanyProfiles to update.
     */
    limit?: number
  }

  /**
   * RecruitingCompanyProfile updateManyAndReturn
   */
  export type RecruitingCompanyProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * The data used to update RecruitingCompanyProfiles.
     */
    data: XOR<RecruitingCompanyProfileUpdateManyMutationInput, RecruitingCompanyProfileUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingCompanyProfiles to update
     */
    where?: RecruitingCompanyProfileWhereInput
    /**
     * Limit how many RecruitingCompanyProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecruitingCompanyProfile upsert
   */
  export type RecruitingCompanyProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the RecruitingCompanyProfile to update in case it exists.
     */
    where: RecruitingCompanyProfileWhereUniqueInput
    /**
     * In case the RecruitingCompanyProfile found by the `where` argument doesn't exist, create a new RecruitingCompanyProfile with this data.
     */
    create: XOR<RecruitingCompanyProfileCreateInput, RecruitingCompanyProfileUncheckedCreateInput>
    /**
     * In case the RecruitingCompanyProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecruitingCompanyProfileUpdateInput, RecruitingCompanyProfileUncheckedUpdateInput>
  }

  /**
   * RecruitingCompanyProfile delete
   */
  export type RecruitingCompanyProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
    /**
     * Filter which RecruitingCompanyProfile to delete.
     */
    where: RecruitingCompanyProfileWhereUniqueInput
  }

  /**
   * RecruitingCompanyProfile deleteMany
   */
  export type RecruitingCompanyProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingCompanyProfiles to delete
     */
    where?: RecruitingCompanyProfileWhereInput
    /**
     * Limit how many RecruitingCompanyProfiles to delete.
     */
    limit?: number
  }

  /**
   * RecruitingCompanyProfile without action
   */
  export type RecruitingCompanyProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCompanyProfile
     */
    select?: RecruitingCompanyProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCompanyProfile
     */
    omit?: RecruitingCompanyProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCompanyProfileInclude<ExtArgs> | null
  }


  /**
   * Model RecruitingAttachment
   */

  export type AggregateRecruitingAttachment = {
    _count: RecruitingAttachmentCountAggregateOutputType | null
    _min: RecruitingAttachmentMinAggregateOutputType | null
    _max: RecruitingAttachmentMaxAggregateOutputType | null
  }

  export type RecruitingAttachmentMinAggregateOutputType = {
    id: string | null
    searchId: string | null
    createdAt: Date | null
  }

  export type RecruitingAttachmentMaxAggregateOutputType = {
    id: string | null
    searchId: string | null
    createdAt: Date | null
  }

  export type RecruitingAttachmentCountAggregateOutputType = {
    id: number
    searchId: number
    createdAt: number
    _all: number
  }


  export type RecruitingAttachmentMinAggregateInputType = {
    id?: true
    searchId?: true
    createdAt?: true
  }

  export type RecruitingAttachmentMaxAggregateInputType = {
    id?: true
    searchId?: true
    createdAt?: true
  }

  export type RecruitingAttachmentCountAggregateInputType = {
    id?: true
    searchId?: true
    createdAt?: true
    _all?: true
  }

  export type RecruitingAttachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingAttachment to aggregate.
     */
    where?: RecruitingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingAttachments to fetch.
     */
    orderBy?: RecruitingAttachmentOrderByWithRelationInput | RecruitingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecruitingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecruitingAttachments
    **/
    _count?: true | RecruitingAttachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecruitingAttachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecruitingAttachmentMaxAggregateInputType
  }

  export type GetRecruitingAttachmentAggregateType<T extends RecruitingAttachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateRecruitingAttachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecruitingAttachment[P]>
      : GetScalarType<T[P], AggregateRecruitingAttachment[P]>
  }




  export type RecruitingAttachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecruitingAttachmentWhereInput
    orderBy?: RecruitingAttachmentOrderByWithAggregationInput | RecruitingAttachmentOrderByWithAggregationInput[]
    by: RecruitingAttachmentScalarFieldEnum[] | RecruitingAttachmentScalarFieldEnum
    having?: RecruitingAttachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecruitingAttachmentCountAggregateInputType | true
    _min?: RecruitingAttachmentMinAggregateInputType
    _max?: RecruitingAttachmentMaxAggregateInputType
  }

  export type RecruitingAttachmentGroupByOutputType = {
    id: string
    searchId: string
    createdAt: Date
    _count: RecruitingAttachmentCountAggregateOutputType | null
    _min: RecruitingAttachmentMinAggregateOutputType | null
    _max: RecruitingAttachmentMaxAggregateOutputType | null
  }

  type GetRecruitingAttachmentGroupByPayload<T extends RecruitingAttachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecruitingAttachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecruitingAttachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecruitingAttachmentGroupByOutputType[P]>
            : GetScalarType<T[P], RecruitingAttachmentGroupByOutputType[P]>
        }
      >
    >


  export type RecruitingAttachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    createdAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingAttachment"]>

  export type RecruitingAttachmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    createdAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingAttachment"]>

  export type RecruitingAttachmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    createdAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingAttachment"]>

  export type RecruitingAttachmentSelectScalar = {
    id?: boolean
    searchId?: boolean
    createdAt?: boolean
  }

  export type RecruitingAttachmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "searchId" | "createdAt", ExtArgs["result"]["recruitingAttachment"]>
  export type RecruitingAttachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }
  export type RecruitingAttachmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }
  export type RecruitingAttachmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }

  export type $RecruitingAttachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecruitingAttachment"
    objects: {
      search: Prisma.$RecruitingSearchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      searchId: string
      createdAt: Date
    }, ExtArgs["result"]["recruitingAttachment"]>
    composites: {}
  }

  type RecruitingAttachmentGetPayload<S extends boolean | null | undefined | RecruitingAttachmentDefaultArgs> = $Result.GetResult<Prisma.$RecruitingAttachmentPayload, S>

  type RecruitingAttachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecruitingAttachmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecruitingAttachmentCountAggregateInputType | true
    }

  export interface RecruitingAttachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecruitingAttachment'], meta: { name: 'RecruitingAttachment' } }
    /**
     * Find zero or one RecruitingAttachment that matches the filter.
     * @param {RecruitingAttachmentFindUniqueArgs} args - Arguments to find a RecruitingAttachment
     * @example
     * // Get one RecruitingAttachment
     * const recruitingAttachment = await prisma.recruitingAttachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecruitingAttachmentFindUniqueArgs>(args: SelectSubset<T, RecruitingAttachmentFindUniqueArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecruitingAttachment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecruitingAttachmentFindUniqueOrThrowArgs} args - Arguments to find a RecruitingAttachment
     * @example
     * // Get one RecruitingAttachment
     * const recruitingAttachment = await prisma.recruitingAttachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecruitingAttachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, RecruitingAttachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingAttachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingAttachmentFindFirstArgs} args - Arguments to find a RecruitingAttachment
     * @example
     * // Get one RecruitingAttachment
     * const recruitingAttachment = await prisma.recruitingAttachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecruitingAttachmentFindFirstArgs>(args?: SelectSubset<T, RecruitingAttachmentFindFirstArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingAttachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingAttachmentFindFirstOrThrowArgs} args - Arguments to find a RecruitingAttachment
     * @example
     * // Get one RecruitingAttachment
     * const recruitingAttachment = await prisma.recruitingAttachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecruitingAttachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, RecruitingAttachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecruitingAttachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingAttachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecruitingAttachments
     * const recruitingAttachments = await prisma.recruitingAttachment.findMany()
     * 
     * // Get first 10 RecruitingAttachments
     * const recruitingAttachments = await prisma.recruitingAttachment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recruitingAttachmentWithIdOnly = await prisma.recruitingAttachment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecruitingAttachmentFindManyArgs>(args?: SelectSubset<T, RecruitingAttachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecruitingAttachment.
     * @param {RecruitingAttachmentCreateArgs} args - Arguments to create a RecruitingAttachment.
     * @example
     * // Create one RecruitingAttachment
     * const RecruitingAttachment = await prisma.recruitingAttachment.create({
     *   data: {
     *     // ... data to create a RecruitingAttachment
     *   }
     * })
     * 
     */
    create<T extends RecruitingAttachmentCreateArgs>(args: SelectSubset<T, RecruitingAttachmentCreateArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecruitingAttachments.
     * @param {RecruitingAttachmentCreateManyArgs} args - Arguments to create many RecruitingAttachments.
     * @example
     * // Create many RecruitingAttachments
     * const recruitingAttachment = await prisma.recruitingAttachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecruitingAttachmentCreateManyArgs>(args?: SelectSubset<T, RecruitingAttachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecruitingAttachments and returns the data saved in the database.
     * @param {RecruitingAttachmentCreateManyAndReturnArgs} args - Arguments to create many RecruitingAttachments.
     * @example
     * // Create many RecruitingAttachments
     * const recruitingAttachment = await prisma.recruitingAttachment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecruitingAttachments and only return the `id`
     * const recruitingAttachmentWithIdOnly = await prisma.recruitingAttachment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecruitingAttachmentCreateManyAndReturnArgs>(args?: SelectSubset<T, RecruitingAttachmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecruitingAttachment.
     * @param {RecruitingAttachmentDeleteArgs} args - Arguments to delete one RecruitingAttachment.
     * @example
     * // Delete one RecruitingAttachment
     * const RecruitingAttachment = await prisma.recruitingAttachment.delete({
     *   where: {
     *     // ... filter to delete one RecruitingAttachment
     *   }
     * })
     * 
     */
    delete<T extends RecruitingAttachmentDeleteArgs>(args: SelectSubset<T, RecruitingAttachmentDeleteArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecruitingAttachment.
     * @param {RecruitingAttachmentUpdateArgs} args - Arguments to update one RecruitingAttachment.
     * @example
     * // Update one RecruitingAttachment
     * const recruitingAttachment = await prisma.recruitingAttachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecruitingAttachmentUpdateArgs>(args: SelectSubset<T, RecruitingAttachmentUpdateArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecruitingAttachments.
     * @param {RecruitingAttachmentDeleteManyArgs} args - Arguments to filter RecruitingAttachments to delete.
     * @example
     * // Delete a few RecruitingAttachments
     * const { count } = await prisma.recruitingAttachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecruitingAttachmentDeleteManyArgs>(args?: SelectSubset<T, RecruitingAttachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingAttachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecruitingAttachments
     * const recruitingAttachment = await prisma.recruitingAttachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecruitingAttachmentUpdateManyArgs>(args: SelectSubset<T, RecruitingAttachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingAttachments and returns the data updated in the database.
     * @param {RecruitingAttachmentUpdateManyAndReturnArgs} args - Arguments to update many RecruitingAttachments.
     * @example
     * // Update many RecruitingAttachments
     * const recruitingAttachment = await prisma.recruitingAttachment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecruitingAttachments and only return the `id`
     * const recruitingAttachmentWithIdOnly = await prisma.recruitingAttachment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecruitingAttachmentUpdateManyAndReturnArgs>(args: SelectSubset<T, RecruitingAttachmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecruitingAttachment.
     * @param {RecruitingAttachmentUpsertArgs} args - Arguments to update or create a RecruitingAttachment.
     * @example
     * // Update or create a RecruitingAttachment
     * const recruitingAttachment = await prisma.recruitingAttachment.upsert({
     *   create: {
     *     // ... data to create a RecruitingAttachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecruitingAttachment we want to update
     *   }
     * })
     */
    upsert<T extends RecruitingAttachmentUpsertArgs>(args: SelectSubset<T, RecruitingAttachmentUpsertArgs<ExtArgs>>): Prisma__RecruitingAttachmentClient<$Result.GetResult<Prisma.$RecruitingAttachmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecruitingAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingAttachmentCountArgs} args - Arguments to filter RecruitingAttachments to count.
     * @example
     * // Count the number of RecruitingAttachments
     * const count = await prisma.recruitingAttachment.count({
     *   where: {
     *     // ... the filter for the RecruitingAttachments we want to count
     *   }
     * })
    **/
    count<T extends RecruitingAttachmentCountArgs>(
      args?: Subset<T, RecruitingAttachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecruitingAttachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecruitingAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingAttachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecruitingAttachmentAggregateArgs>(args: Subset<T, RecruitingAttachmentAggregateArgs>): Prisma.PrismaPromise<GetRecruitingAttachmentAggregateType<T>>

    /**
     * Group by RecruitingAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingAttachmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecruitingAttachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecruitingAttachmentGroupByArgs['orderBy'] }
        : { orderBy?: RecruitingAttachmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecruitingAttachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecruitingAttachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecruitingAttachment model
   */
  readonly fields: RecruitingAttachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecruitingAttachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecruitingAttachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    search<T extends RecruitingSearchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecruitingSearchDefaultArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RecruitingAttachment model
   */
  interface RecruitingAttachmentFieldRefs {
    readonly id: FieldRef<"RecruitingAttachment", 'String'>
    readonly searchId: FieldRef<"RecruitingAttachment", 'String'>
    readonly createdAt: FieldRef<"RecruitingAttachment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RecruitingAttachment findUnique
   */
  export type RecruitingAttachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingAttachment to fetch.
     */
    where: RecruitingAttachmentWhereUniqueInput
  }

  /**
   * RecruitingAttachment findUniqueOrThrow
   */
  export type RecruitingAttachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingAttachment to fetch.
     */
    where: RecruitingAttachmentWhereUniqueInput
  }

  /**
   * RecruitingAttachment findFirst
   */
  export type RecruitingAttachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingAttachment to fetch.
     */
    where?: RecruitingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingAttachments to fetch.
     */
    orderBy?: RecruitingAttachmentOrderByWithRelationInput | RecruitingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingAttachments.
     */
    cursor?: RecruitingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingAttachments.
     */
    distinct?: RecruitingAttachmentScalarFieldEnum | RecruitingAttachmentScalarFieldEnum[]
  }

  /**
   * RecruitingAttachment findFirstOrThrow
   */
  export type RecruitingAttachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingAttachment to fetch.
     */
    where?: RecruitingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingAttachments to fetch.
     */
    orderBy?: RecruitingAttachmentOrderByWithRelationInput | RecruitingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingAttachments.
     */
    cursor?: RecruitingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingAttachments.
     */
    distinct?: RecruitingAttachmentScalarFieldEnum | RecruitingAttachmentScalarFieldEnum[]
  }

  /**
   * RecruitingAttachment findMany
   */
  export type RecruitingAttachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingAttachments to fetch.
     */
    where?: RecruitingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingAttachments to fetch.
     */
    orderBy?: RecruitingAttachmentOrderByWithRelationInput | RecruitingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecruitingAttachments.
     */
    cursor?: RecruitingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingAttachments.
     */
    distinct?: RecruitingAttachmentScalarFieldEnum | RecruitingAttachmentScalarFieldEnum[]
  }

  /**
   * RecruitingAttachment create
   */
  export type RecruitingAttachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a RecruitingAttachment.
     */
    data: XOR<RecruitingAttachmentCreateInput, RecruitingAttachmentUncheckedCreateInput>
  }

  /**
   * RecruitingAttachment createMany
   */
  export type RecruitingAttachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecruitingAttachments.
     */
    data: RecruitingAttachmentCreateManyInput | RecruitingAttachmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecruitingAttachment createManyAndReturn
   */
  export type RecruitingAttachmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * The data used to create many RecruitingAttachments.
     */
    data: RecruitingAttachmentCreateManyInput | RecruitingAttachmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecruitingAttachment update
   */
  export type RecruitingAttachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a RecruitingAttachment.
     */
    data: XOR<RecruitingAttachmentUpdateInput, RecruitingAttachmentUncheckedUpdateInput>
    /**
     * Choose, which RecruitingAttachment to update.
     */
    where: RecruitingAttachmentWhereUniqueInput
  }

  /**
   * RecruitingAttachment updateMany
   */
  export type RecruitingAttachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecruitingAttachments.
     */
    data: XOR<RecruitingAttachmentUpdateManyMutationInput, RecruitingAttachmentUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingAttachments to update
     */
    where?: RecruitingAttachmentWhereInput
    /**
     * Limit how many RecruitingAttachments to update.
     */
    limit?: number
  }

  /**
   * RecruitingAttachment updateManyAndReturn
   */
  export type RecruitingAttachmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * The data used to update RecruitingAttachments.
     */
    data: XOR<RecruitingAttachmentUpdateManyMutationInput, RecruitingAttachmentUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingAttachments to update
     */
    where?: RecruitingAttachmentWhereInput
    /**
     * Limit how many RecruitingAttachments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecruitingAttachment upsert
   */
  export type RecruitingAttachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the RecruitingAttachment to update in case it exists.
     */
    where: RecruitingAttachmentWhereUniqueInput
    /**
     * In case the RecruitingAttachment found by the `where` argument doesn't exist, create a new RecruitingAttachment with this data.
     */
    create: XOR<RecruitingAttachmentCreateInput, RecruitingAttachmentUncheckedCreateInput>
    /**
     * In case the RecruitingAttachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecruitingAttachmentUpdateInput, RecruitingAttachmentUncheckedUpdateInput>
  }

  /**
   * RecruitingAttachment delete
   */
  export type RecruitingAttachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
    /**
     * Filter which RecruitingAttachment to delete.
     */
    where: RecruitingAttachmentWhereUniqueInput
  }

  /**
   * RecruitingAttachment deleteMany
   */
  export type RecruitingAttachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingAttachments to delete
     */
    where?: RecruitingAttachmentWhereInput
    /**
     * Limit how many RecruitingAttachments to delete.
     */
    limit?: number
  }

  /**
   * RecruitingAttachment without action
   */
  export type RecruitingAttachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingAttachment
     */
    select?: RecruitingAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingAttachment
     */
    omit?: RecruitingAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingAttachmentInclude<ExtArgs> | null
  }


  /**
   * Model RecruitingCandidate
   */

  export type AggregateRecruitingCandidate = {
    _count: RecruitingCandidateCountAggregateOutputType | null
    _min: RecruitingCandidateMinAggregateOutputType | null
    _max: RecruitingCandidateMaxAggregateOutputType | null
  }

  export type RecruitingCandidateMinAggregateOutputType = {
    id: string | null
    searchId: string | null
    candidateCode: string | null
    fullName: string | null
    email: string | null
    receivedAt: Date | null
  }

  export type RecruitingCandidateMaxAggregateOutputType = {
    id: string | null
    searchId: string | null
    candidateCode: string | null
    fullName: string | null
    email: string | null
    receivedAt: Date | null
  }

  export type RecruitingCandidateCountAggregateOutputType = {
    id: number
    searchId: number
    candidateCode: number
    fullName: number
    email: number
    receivedAt: number
    _all: number
  }


  export type RecruitingCandidateMinAggregateInputType = {
    id?: true
    searchId?: true
    candidateCode?: true
    fullName?: true
    email?: true
    receivedAt?: true
  }

  export type RecruitingCandidateMaxAggregateInputType = {
    id?: true
    searchId?: true
    candidateCode?: true
    fullName?: true
    email?: true
    receivedAt?: true
  }

  export type RecruitingCandidateCountAggregateInputType = {
    id?: true
    searchId?: true
    candidateCode?: true
    fullName?: true
    email?: true
    receivedAt?: true
    _all?: true
  }

  export type RecruitingCandidateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingCandidate to aggregate.
     */
    where?: RecruitingCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCandidates to fetch.
     */
    orderBy?: RecruitingCandidateOrderByWithRelationInput | RecruitingCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecruitingCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecruitingCandidates
    **/
    _count?: true | RecruitingCandidateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecruitingCandidateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecruitingCandidateMaxAggregateInputType
  }

  export type GetRecruitingCandidateAggregateType<T extends RecruitingCandidateAggregateArgs> = {
        [P in keyof T & keyof AggregateRecruitingCandidate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecruitingCandidate[P]>
      : GetScalarType<T[P], AggregateRecruitingCandidate[P]>
  }




  export type RecruitingCandidateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecruitingCandidateWhereInput
    orderBy?: RecruitingCandidateOrderByWithAggregationInput | RecruitingCandidateOrderByWithAggregationInput[]
    by: RecruitingCandidateScalarFieldEnum[] | RecruitingCandidateScalarFieldEnum
    having?: RecruitingCandidateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecruitingCandidateCountAggregateInputType | true
    _min?: RecruitingCandidateMinAggregateInputType
    _max?: RecruitingCandidateMaxAggregateInputType
  }

  export type RecruitingCandidateGroupByOutputType = {
    id: string
    searchId: string
    candidateCode: string | null
    fullName: string | null
    email: string | null
    receivedAt: Date
    _count: RecruitingCandidateCountAggregateOutputType | null
    _min: RecruitingCandidateMinAggregateOutputType | null
    _max: RecruitingCandidateMaxAggregateOutputType | null
  }

  type GetRecruitingCandidateGroupByPayload<T extends RecruitingCandidateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecruitingCandidateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecruitingCandidateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecruitingCandidateGroupByOutputType[P]>
            : GetScalarType<T[P], RecruitingCandidateGroupByOutputType[P]>
        }
      >
    >


  export type RecruitingCandidateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    candidateCode?: boolean
    fullName?: boolean
    email?: boolean
    receivedAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingCandidate"]>

  export type RecruitingCandidateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    candidateCode?: boolean
    fullName?: boolean
    email?: boolean
    receivedAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingCandidate"]>

  export type RecruitingCandidateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    searchId?: boolean
    candidateCode?: boolean
    fullName?: boolean
    email?: boolean
    receivedAt?: boolean
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recruitingCandidate"]>

  export type RecruitingCandidateSelectScalar = {
    id?: boolean
    searchId?: boolean
    candidateCode?: boolean
    fullName?: boolean
    email?: boolean
    receivedAt?: boolean
  }

  export type RecruitingCandidateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "searchId" | "candidateCode" | "fullName" | "email" | "receivedAt", ExtArgs["result"]["recruitingCandidate"]>
  export type RecruitingCandidateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }
  export type RecruitingCandidateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }
  export type RecruitingCandidateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    search?: boolean | RecruitingSearchDefaultArgs<ExtArgs>
  }

  export type $RecruitingCandidatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecruitingCandidate"
    objects: {
      search: Prisma.$RecruitingSearchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      searchId: string
      candidateCode: string | null
      fullName: string | null
      email: string | null
      receivedAt: Date
    }, ExtArgs["result"]["recruitingCandidate"]>
    composites: {}
  }

  type RecruitingCandidateGetPayload<S extends boolean | null | undefined | RecruitingCandidateDefaultArgs> = $Result.GetResult<Prisma.$RecruitingCandidatePayload, S>

  type RecruitingCandidateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecruitingCandidateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecruitingCandidateCountAggregateInputType | true
    }

  export interface RecruitingCandidateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecruitingCandidate'], meta: { name: 'RecruitingCandidate' } }
    /**
     * Find zero or one RecruitingCandidate that matches the filter.
     * @param {RecruitingCandidateFindUniqueArgs} args - Arguments to find a RecruitingCandidate
     * @example
     * // Get one RecruitingCandidate
     * const recruitingCandidate = await prisma.recruitingCandidate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecruitingCandidateFindUniqueArgs>(args: SelectSubset<T, RecruitingCandidateFindUniqueArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecruitingCandidate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecruitingCandidateFindUniqueOrThrowArgs} args - Arguments to find a RecruitingCandidate
     * @example
     * // Get one RecruitingCandidate
     * const recruitingCandidate = await prisma.recruitingCandidate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecruitingCandidateFindUniqueOrThrowArgs>(args: SelectSubset<T, RecruitingCandidateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingCandidate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCandidateFindFirstArgs} args - Arguments to find a RecruitingCandidate
     * @example
     * // Get one RecruitingCandidate
     * const recruitingCandidate = await prisma.recruitingCandidate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecruitingCandidateFindFirstArgs>(args?: SelectSubset<T, RecruitingCandidateFindFirstArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecruitingCandidate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCandidateFindFirstOrThrowArgs} args - Arguments to find a RecruitingCandidate
     * @example
     * // Get one RecruitingCandidate
     * const recruitingCandidate = await prisma.recruitingCandidate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecruitingCandidateFindFirstOrThrowArgs>(args?: SelectSubset<T, RecruitingCandidateFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecruitingCandidates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCandidateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecruitingCandidates
     * const recruitingCandidates = await prisma.recruitingCandidate.findMany()
     * 
     * // Get first 10 RecruitingCandidates
     * const recruitingCandidates = await prisma.recruitingCandidate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recruitingCandidateWithIdOnly = await prisma.recruitingCandidate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecruitingCandidateFindManyArgs>(args?: SelectSubset<T, RecruitingCandidateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecruitingCandidate.
     * @param {RecruitingCandidateCreateArgs} args - Arguments to create a RecruitingCandidate.
     * @example
     * // Create one RecruitingCandidate
     * const RecruitingCandidate = await prisma.recruitingCandidate.create({
     *   data: {
     *     // ... data to create a RecruitingCandidate
     *   }
     * })
     * 
     */
    create<T extends RecruitingCandidateCreateArgs>(args: SelectSubset<T, RecruitingCandidateCreateArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecruitingCandidates.
     * @param {RecruitingCandidateCreateManyArgs} args - Arguments to create many RecruitingCandidates.
     * @example
     * // Create many RecruitingCandidates
     * const recruitingCandidate = await prisma.recruitingCandidate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecruitingCandidateCreateManyArgs>(args?: SelectSubset<T, RecruitingCandidateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecruitingCandidates and returns the data saved in the database.
     * @param {RecruitingCandidateCreateManyAndReturnArgs} args - Arguments to create many RecruitingCandidates.
     * @example
     * // Create many RecruitingCandidates
     * const recruitingCandidate = await prisma.recruitingCandidate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecruitingCandidates and only return the `id`
     * const recruitingCandidateWithIdOnly = await prisma.recruitingCandidate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecruitingCandidateCreateManyAndReturnArgs>(args?: SelectSubset<T, RecruitingCandidateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecruitingCandidate.
     * @param {RecruitingCandidateDeleteArgs} args - Arguments to delete one RecruitingCandidate.
     * @example
     * // Delete one RecruitingCandidate
     * const RecruitingCandidate = await prisma.recruitingCandidate.delete({
     *   where: {
     *     // ... filter to delete one RecruitingCandidate
     *   }
     * })
     * 
     */
    delete<T extends RecruitingCandidateDeleteArgs>(args: SelectSubset<T, RecruitingCandidateDeleteArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecruitingCandidate.
     * @param {RecruitingCandidateUpdateArgs} args - Arguments to update one RecruitingCandidate.
     * @example
     * // Update one RecruitingCandidate
     * const recruitingCandidate = await prisma.recruitingCandidate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecruitingCandidateUpdateArgs>(args: SelectSubset<T, RecruitingCandidateUpdateArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecruitingCandidates.
     * @param {RecruitingCandidateDeleteManyArgs} args - Arguments to filter RecruitingCandidates to delete.
     * @example
     * // Delete a few RecruitingCandidates
     * const { count } = await prisma.recruitingCandidate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecruitingCandidateDeleteManyArgs>(args?: SelectSubset<T, RecruitingCandidateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingCandidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCandidateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecruitingCandidates
     * const recruitingCandidate = await prisma.recruitingCandidate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecruitingCandidateUpdateManyArgs>(args: SelectSubset<T, RecruitingCandidateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecruitingCandidates and returns the data updated in the database.
     * @param {RecruitingCandidateUpdateManyAndReturnArgs} args - Arguments to update many RecruitingCandidates.
     * @example
     * // Update many RecruitingCandidates
     * const recruitingCandidate = await prisma.recruitingCandidate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecruitingCandidates and only return the `id`
     * const recruitingCandidateWithIdOnly = await prisma.recruitingCandidate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecruitingCandidateUpdateManyAndReturnArgs>(args: SelectSubset<T, RecruitingCandidateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecruitingCandidate.
     * @param {RecruitingCandidateUpsertArgs} args - Arguments to update or create a RecruitingCandidate.
     * @example
     * // Update or create a RecruitingCandidate
     * const recruitingCandidate = await prisma.recruitingCandidate.upsert({
     *   create: {
     *     // ... data to create a RecruitingCandidate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecruitingCandidate we want to update
     *   }
     * })
     */
    upsert<T extends RecruitingCandidateUpsertArgs>(args: SelectSubset<T, RecruitingCandidateUpsertArgs<ExtArgs>>): Prisma__RecruitingCandidateClient<$Result.GetResult<Prisma.$RecruitingCandidatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecruitingCandidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCandidateCountArgs} args - Arguments to filter RecruitingCandidates to count.
     * @example
     * // Count the number of RecruitingCandidates
     * const count = await prisma.recruitingCandidate.count({
     *   where: {
     *     // ... the filter for the RecruitingCandidates we want to count
     *   }
     * })
    **/
    count<T extends RecruitingCandidateCountArgs>(
      args?: Subset<T, RecruitingCandidateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecruitingCandidateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecruitingCandidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCandidateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecruitingCandidateAggregateArgs>(args: Subset<T, RecruitingCandidateAggregateArgs>): Prisma.PrismaPromise<GetRecruitingCandidateAggregateType<T>>

    /**
     * Group by RecruitingCandidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecruitingCandidateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecruitingCandidateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecruitingCandidateGroupByArgs['orderBy'] }
        : { orderBy?: RecruitingCandidateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecruitingCandidateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecruitingCandidateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecruitingCandidate model
   */
  readonly fields: RecruitingCandidateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecruitingCandidate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecruitingCandidateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    search<T extends RecruitingSearchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecruitingSearchDefaultArgs<ExtArgs>>): Prisma__RecruitingSearchClient<$Result.GetResult<Prisma.$RecruitingSearchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RecruitingCandidate model
   */
  interface RecruitingCandidateFieldRefs {
    readonly id: FieldRef<"RecruitingCandidate", 'String'>
    readonly searchId: FieldRef<"RecruitingCandidate", 'String'>
    readonly candidateCode: FieldRef<"RecruitingCandidate", 'String'>
    readonly fullName: FieldRef<"RecruitingCandidate", 'String'>
    readonly email: FieldRef<"RecruitingCandidate", 'String'>
    readonly receivedAt: FieldRef<"RecruitingCandidate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RecruitingCandidate findUnique
   */
  export type RecruitingCandidateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCandidate to fetch.
     */
    where: RecruitingCandidateWhereUniqueInput
  }

  /**
   * RecruitingCandidate findUniqueOrThrow
   */
  export type RecruitingCandidateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCandidate to fetch.
     */
    where: RecruitingCandidateWhereUniqueInput
  }

  /**
   * RecruitingCandidate findFirst
   */
  export type RecruitingCandidateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCandidate to fetch.
     */
    where?: RecruitingCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCandidates to fetch.
     */
    orderBy?: RecruitingCandidateOrderByWithRelationInput | RecruitingCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingCandidates.
     */
    cursor?: RecruitingCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingCandidates.
     */
    distinct?: RecruitingCandidateScalarFieldEnum | RecruitingCandidateScalarFieldEnum[]
  }

  /**
   * RecruitingCandidate findFirstOrThrow
   */
  export type RecruitingCandidateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCandidate to fetch.
     */
    where?: RecruitingCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCandidates to fetch.
     */
    orderBy?: RecruitingCandidateOrderByWithRelationInput | RecruitingCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecruitingCandidates.
     */
    cursor?: RecruitingCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingCandidates.
     */
    distinct?: RecruitingCandidateScalarFieldEnum | RecruitingCandidateScalarFieldEnum[]
  }

  /**
   * RecruitingCandidate findMany
   */
  export type RecruitingCandidateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * Filter, which RecruitingCandidates to fetch.
     */
    where?: RecruitingCandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecruitingCandidates to fetch.
     */
    orderBy?: RecruitingCandidateOrderByWithRelationInput | RecruitingCandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecruitingCandidates.
     */
    cursor?: RecruitingCandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecruitingCandidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecruitingCandidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecruitingCandidates.
     */
    distinct?: RecruitingCandidateScalarFieldEnum | RecruitingCandidateScalarFieldEnum[]
  }

  /**
   * RecruitingCandidate create
   */
  export type RecruitingCandidateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * The data needed to create a RecruitingCandidate.
     */
    data: XOR<RecruitingCandidateCreateInput, RecruitingCandidateUncheckedCreateInput>
  }

  /**
   * RecruitingCandidate createMany
   */
  export type RecruitingCandidateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecruitingCandidates.
     */
    data: RecruitingCandidateCreateManyInput | RecruitingCandidateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecruitingCandidate createManyAndReturn
   */
  export type RecruitingCandidateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * The data used to create many RecruitingCandidates.
     */
    data: RecruitingCandidateCreateManyInput | RecruitingCandidateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecruitingCandidate update
   */
  export type RecruitingCandidateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * The data needed to update a RecruitingCandidate.
     */
    data: XOR<RecruitingCandidateUpdateInput, RecruitingCandidateUncheckedUpdateInput>
    /**
     * Choose, which RecruitingCandidate to update.
     */
    where: RecruitingCandidateWhereUniqueInput
  }

  /**
   * RecruitingCandidate updateMany
   */
  export type RecruitingCandidateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecruitingCandidates.
     */
    data: XOR<RecruitingCandidateUpdateManyMutationInput, RecruitingCandidateUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingCandidates to update
     */
    where?: RecruitingCandidateWhereInput
    /**
     * Limit how many RecruitingCandidates to update.
     */
    limit?: number
  }

  /**
   * RecruitingCandidate updateManyAndReturn
   */
  export type RecruitingCandidateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * The data used to update RecruitingCandidates.
     */
    data: XOR<RecruitingCandidateUpdateManyMutationInput, RecruitingCandidateUncheckedUpdateManyInput>
    /**
     * Filter which RecruitingCandidates to update
     */
    where?: RecruitingCandidateWhereInput
    /**
     * Limit how many RecruitingCandidates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecruitingCandidate upsert
   */
  export type RecruitingCandidateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * The filter to search for the RecruitingCandidate to update in case it exists.
     */
    where: RecruitingCandidateWhereUniqueInput
    /**
     * In case the RecruitingCandidate found by the `where` argument doesn't exist, create a new RecruitingCandidate with this data.
     */
    create: XOR<RecruitingCandidateCreateInput, RecruitingCandidateUncheckedCreateInput>
    /**
     * In case the RecruitingCandidate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecruitingCandidateUpdateInput, RecruitingCandidateUncheckedUpdateInput>
  }

  /**
   * RecruitingCandidate delete
   */
  export type RecruitingCandidateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
    /**
     * Filter which RecruitingCandidate to delete.
     */
    where: RecruitingCandidateWhereUniqueInput
  }

  /**
   * RecruitingCandidate deleteMany
   */
  export type RecruitingCandidateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecruitingCandidates to delete
     */
    where?: RecruitingCandidateWhereInput
    /**
     * Limit how many RecruitingCandidates to delete.
     */
    limit?: number
  }

  /**
   * RecruitingCandidate without action
   */
  export type RecruitingCandidateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecruitingCandidate
     */
    select?: RecruitingCandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecruitingCandidate
     */
    omit?: RecruitingCandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecruitingCandidateInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const LeadScalarFieldEnum: {
    id: 'id',
    nombre: 'nombre',
    empresa: 'empresa',
    email: 'email',
    rubro: 'rubro',
    empleados: 'empleados',
    codigoPais: 'codigoPais',
    telefono: 'telefono',
    telefonoCompleto: 'telefonoCompleto',
    facturacionAnual: 'facturacionAnual',
    problema: 'problema',
    objetivo: 'objetivo',
    diagnostico: 'diagnostico',
    diagnosticoResumen: 'diagnosticoResumen',
    leadScore: 'leadScore',
    leadLevel: 'leadLevel',
    emailStatus: 'emailStatus',
    emailError: 'emailError',
    aceptaTerminos: 'aceptaTerminos',
    fechaAceptacion: 'fechaAceptacion',
    humanVerified: 'humanVerified',
    isUnlocked: 'isUnlocked',
    unlockedAt: 'unlockedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    estadoComercial: 'estadoComercial',
    notasInternas: 'notasInternas'
  };

  export type LeadScalarFieldEnum = (typeof LeadScalarFieldEnum)[keyof typeof LeadScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    fullName: 'fullName',
    passwordHash: 'passwordHash',
    status: 'status',
    emailVerifiedAt: 'emailVerifiedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const Rrhh_processesScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    user_id: 'user_id',
    input: 'input',
    output: 'output',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Rrhh_processesScalarFieldEnum = (typeof Rrhh_processesScalarFieldEnum)[keyof typeof Rrhh_processesScalarFieldEnum]


  export const TenantScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    name: 'name',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const TenantMembershipScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantMembershipScalarFieldEnum = (typeof TenantMembershipScalarFieldEnum)[keyof typeof TenantMembershipScalarFieldEnum]


  export const TenantDocumentScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    category: 'category',
    title: 'title',
    description: 'description',
    status: 'status',
    source: 'source',
    fileUrl: 'fileUrl',
    fileName: 'fileName',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantDocumentScalarFieldEnum = (typeof TenantDocumentScalarFieldEnum)[keyof typeof TenantDocumentScalarFieldEnum]


  export const TenantAnalysisScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    mode: 'mode',
    summary: 'summary',
    risks: 'risks',
    opportunities: 'opportunities',
    priority: 'priority',
    globalScore: 'globalScore',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    rawData: 'rawData'
  };

  export type TenantAnalysisScalarFieldEnum = (typeof TenantAnalysisScalarFieldEnum)[keyof typeof TenantAnalysisScalarFieldEnum]


  export const RecruitingSearchScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    createdById: 'createdById',
    refCode: 'refCode',
    title: 'title',
    requestText: 'requestText',
    status: 'status',
    monitoringStatus: 'monitoringStatus',
    area: 'area',
    seniority: 'seniority',
    modality: 'modality',
    location: 'location',
    jobProfileOutput: 'jobProfileOutput',
    idealCandidateOutput: 'idealCandidateOutput',
    scoringCriteriaOutput: 'scoringCriteriaOutput',
    publicationCopiesOutput: 'publicationCopiesOutput',
    aiGenerationLog: 'aiGenerationLog',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RecruitingSearchScalarFieldEnum = (typeof RecruitingSearchScalarFieldEnum)[keyof typeof RecruitingSearchScalarFieldEnum]


  export const RecruitingCompanyProfileScalarFieldEnum: {
    id: 'id',
    searchId: 'searchId',
    razonSocial: 'razonSocial',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RecruitingCompanyProfileScalarFieldEnum = (typeof RecruitingCompanyProfileScalarFieldEnum)[keyof typeof RecruitingCompanyProfileScalarFieldEnum]


  export const RecruitingAttachmentScalarFieldEnum: {
    id: 'id',
    searchId: 'searchId',
    createdAt: 'createdAt'
  };

  export type RecruitingAttachmentScalarFieldEnum = (typeof RecruitingAttachmentScalarFieldEnum)[keyof typeof RecruitingAttachmentScalarFieldEnum]


  export const RecruitingCandidateScalarFieldEnum: {
    id: 'id',
    searchId: 'searchId',
    candidateCode: 'candidateCode',
    fullName: 'fullName',
    email: 'email',
    receivedAt: 'receivedAt'
  };

  export type RecruitingCandidateScalarFieldEnum = (typeof RecruitingCandidateScalarFieldEnum)[keyof typeof RecruitingCandidateScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'UserStatus'
   */
  export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>
    


  /**
   * Reference to a field of type 'UserStatus[]'
   */
  export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'MembershipRole'
   */
  export type EnumMembershipRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MembershipRole'>
    


  /**
   * Reference to a field of type 'MembershipRole[]'
   */
  export type ListEnumMembershipRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MembershipRole[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type LeadWhereInput = {
    AND?: LeadWhereInput | LeadWhereInput[]
    OR?: LeadWhereInput[]
    NOT?: LeadWhereInput | LeadWhereInput[]
    id?: StringFilter<"Lead"> | string
    nombre?: StringNullableFilter<"Lead"> | string | null
    empresa?: StringNullableFilter<"Lead"> | string | null
    email?: StringNullableFilter<"Lead"> | string | null
    rubro?: StringNullableFilter<"Lead"> | string | null
    empleados?: StringNullableFilter<"Lead"> | string | null
    codigoPais?: StringNullableFilter<"Lead"> | string | null
    telefono?: StringNullableFilter<"Lead"> | string | null
    telefonoCompleto?: StringNullableFilter<"Lead"> | string | null
    facturacionAnual?: StringNullableFilter<"Lead"> | string | null
    problema?: StringFilter<"Lead"> | string
    objetivo?: StringFilter<"Lead"> | string
    diagnostico?: StringFilter<"Lead"> | string
    diagnosticoResumen?: StringNullableFilter<"Lead"> | string | null
    leadScore?: IntFilter<"Lead"> | number
    leadLevel?: StringFilter<"Lead"> | string
    emailStatus?: StringNullableFilter<"Lead"> | string | null
    emailError?: StringNullableFilter<"Lead"> | string | null
    aceptaTerminos?: BoolFilter<"Lead"> | boolean
    fechaAceptacion?: DateTimeNullableFilter<"Lead"> | Date | string | null
    humanVerified?: BoolFilter<"Lead"> | boolean
    isUnlocked?: BoolFilter<"Lead"> | boolean
    unlockedAt?: DateTimeNullableFilter<"Lead"> | Date | string | null
    createdAt?: DateTimeFilter<"Lead"> | Date | string
    updatedAt?: DateTimeFilter<"Lead"> | Date | string
    estadoComercial?: StringFilter<"Lead"> | string
    notasInternas?: StringNullableFilter<"Lead"> | string | null
  }

  export type LeadOrderByWithRelationInput = {
    id?: SortOrder
    nombre?: SortOrderInput | SortOrder
    empresa?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    rubro?: SortOrderInput | SortOrder
    empleados?: SortOrderInput | SortOrder
    codigoPais?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    telefonoCompleto?: SortOrderInput | SortOrder
    facturacionAnual?: SortOrderInput | SortOrder
    problema?: SortOrder
    objetivo?: SortOrder
    diagnostico?: SortOrder
    diagnosticoResumen?: SortOrderInput | SortOrder
    leadScore?: SortOrder
    leadLevel?: SortOrder
    emailStatus?: SortOrderInput | SortOrder
    emailError?: SortOrderInput | SortOrder
    aceptaTerminos?: SortOrder
    fechaAceptacion?: SortOrderInput | SortOrder
    humanVerified?: SortOrder
    isUnlocked?: SortOrder
    unlockedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    estadoComercial?: SortOrder
    notasInternas?: SortOrderInput | SortOrder
  }

  export type LeadWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LeadWhereInput | LeadWhereInput[]
    OR?: LeadWhereInput[]
    NOT?: LeadWhereInput | LeadWhereInput[]
    nombre?: StringNullableFilter<"Lead"> | string | null
    empresa?: StringNullableFilter<"Lead"> | string | null
    email?: StringNullableFilter<"Lead"> | string | null
    rubro?: StringNullableFilter<"Lead"> | string | null
    empleados?: StringNullableFilter<"Lead"> | string | null
    codigoPais?: StringNullableFilter<"Lead"> | string | null
    telefono?: StringNullableFilter<"Lead"> | string | null
    telefonoCompleto?: StringNullableFilter<"Lead"> | string | null
    facturacionAnual?: StringNullableFilter<"Lead"> | string | null
    problema?: StringFilter<"Lead"> | string
    objetivo?: StringFilter<"Lead"> | string
    diagnostico?: StringFilter<"Lead"> | string
    diagnosticoResumen?: StringNullableFilter<"Lead"> | string | null
    leadScore?: IntFilter<"Lead"> | number
    leadLevel?: StringFilter<"Lead"> | string
    emailStatus?: StringNullableFilter<"Lead"> | string | null
    emailError?: StringNullableFilter<"Lead"> | string | null
    aceptaTerminos?: BoolFilter<"Lead"> | boolean
    fechaAceptacion?: DateTimeNullableFilter<"Lead"> | Date | string | null
    humanVerified?: BoolFilter<"Lead"> | boolean
    isUnlocked?: BoolFilter<"Lead"> | boolean
    unlockedAt?: DateTimeNullableFilter<"Lead"> | Date | string | null
    createdAt?: DateTimeFilter<"Lead"> | Date | string
    updatedAt?: DateTimeFilter<"Lead"> | Date | string
    estadoComercial?: StringFilter<"Lead"> | string
    notasInternas?: StringNullableFilter<"Lead"> | string | null
  }, "id">

  export type LeadOrderByWithAggregationInput = {
    id?: SortOrder
    nombre?: SortOrderInput | SortOrder
    empresa?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    rubro?: SortOrderInput | SortOrder
    empleados?: SortOrderInput | SortOrder
    codigoPais?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    telefonoCompleto?: SortOrderInput | SortOrder
    facturacionAnual?: SortOrderInput | SortOrder
    problema?: SortOrder
    objetivo?: SortOrder
    diagnostico?: SortOrder
    diagnosticoResumen?: SortOrderInput | SortOrder
    leadScore?: SortOrder
    leadLevel?: SortOrder
    emailStatus?: SortOrderInput | SortOrder
    emailError?: SortOrderInput | SortOrder
    aceptaTerminos?: SortOrder
    fechaAceptacion?: SortOrderInput | SortOrder
    humanVerified?: SortOrder
    isUnlocked?: SortOrder
    unlockedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    estadoComercial?: SortOrder
    notasInternas?: SortOrderInput | SortOrder
    _count?: LeadCountOrderByAggregateInput
    _avg?: LeadAvgOrderByAggregateInput
    _max?: LeadMaxOrderByAggregateInput
    _min?: LeadMinOrderByAggregateInput
    _sum?: LeadSumOrderByAggregateInput
  }

  export type LeadScalarWhereWithAggregatesInput = {
    AND?: LeadScalarWhereWithAggregatesInput | LeadScalarWhereWithAggregatesInput[]
    OR?: LeadScalarWhereWithAggregatesInput[]
    NOT?: LeadScalarWhereWithAggregatesInput | LeadScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Lead"> | string
    nombre?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    empresa?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    email?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    rubro?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    empleados?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    codigoPais?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    telefono?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    telefonoCompleto?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    facturacionAnual?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    problema?: StringWithAggregatesFilter<"Lead"> | string
    objetivo?: StringWithAggregatesFilter<"Lead"> | string
    diagnostico?: StringWithAggregatesFilter<"Lead"> | string
    diagnosticoResumen?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    leadScore?: IntWithAggregatesFilter<"Lead"> | number
    leadLevel?: StringWithAggregatesFilter<"Lead"> | string
    emailStatus?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    emailError?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    aceptaTerminos?: BoolWithAggregatesFilter<"Lead"> | boolean
    fechaAceptacion?: DateTimeNullableWithAggregatesFilter<"Lead"> | Date | string | null
    humanVerified?: BoolWithAggregatesFilter<"Lead"> | boolean
    isUnlocked?: BoolWithAggregatesFilter<"Lead"> | boolean
    unlockedAt?: DateTimeNullableWithAggregatesFilter<"Lead"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Lead"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Lead"> | Date | string
    estadoComercial?: StringWithAggregatesFilter<"Lead"> | string
    notasInternas?: StringNullableWithAggregatesFilter<"Lead"> | string | null
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    fullName?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringNullableFilter<"User"> | string | null
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    emailVerifiedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    memberships?: TenantMembershipListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrderInput | SortOrder
    passwordHash?: SortOrderInput | SortOrder
    status?: SortOrder
    emailVerifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    memberships?: TenantMembershipOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    fullName?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringNullableFilter<"User"> | string | null
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    emailVerifiedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    memberships?: TenantMembershipListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrderInput | SortOrder
    passwordHash?: SortOrderInput | SortOrder
    status?: SortOrder
    emailVerifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    fullName?: StringNullableWithAggregatesFilter<"User"> | string | null
    passwordHash?: StringNullableWithAggregatesFilter<"User"> | string | null
    status?: EnumUserStatusWithAggregatesFilter<"User"> | $Enums.UserStatus
    emailVerifiedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type rrhh_processesWhereInput = {
    AND?: rrhh_processesWhereInput | rrhh_processesWhereInput[]
    OR?: rrhh_processesWhereInput[]
    NOT?: rrhh_processesWhereInput | rrhh_processesWhereInput[]
    id?: StringFilter<"rrhh_processes"> | string
    tenant_id?: StringFilter<"rrhh_processes"> | string
    user_id?: StringFilter<"rrhh_processes"> | string
    input?: JsonFilter<"rrhh_processes">
    output?: JsonNullableFilter<"rrhh_processes">
    created_at?: DateTimeFilter<"rrhh_processes"> | Date | string
    updated_at?: DateTimeFilter<"rrhh_processes"> | Date | string
  }

  export type rrhh_processesOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    input?: SortOrder
    output?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type rrhh_processesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: rrhh_processesWhereInput | rrhh_processesWhereInput[]
    OR?: rrhh_processesWhereInput[]
    NOT?: rrhh_processesWhereInput | rrhh_processesWhereInput[]
    tenant_id?: StringFilter<"rrhh_processes"> | string
    user_id?: StringFilter<"rrhh_processes"> | string
    input?: JsonFilter<"rrhh_processes">
    output?: JsonNullableFilter<"rrhh_processes">
    created_at?: DateTimeFilter<"rrhh_processes"> | Date | string
    updated_at?: DateTimeFilter<"rrhh_processes"> | Date | string
  }, "id">

  export type rrhh_processesOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    input?: SortOrder
    output?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: rrhh_processesCountOrderByAggregateInput
    _max?: rrhh_processesMaxOrderByAggregateInput
    _min?: rrhh_processesMinOrderByAggregateInput
  }

  export type rrhh_processesScalarWhereWithAggregatesInput = {
    AND?: rrhh_processesScalarWhereWithAggregatesInput | rrhh_processesScalarWhereWithAggregatesInput[]
    OR?: rrhh_processesScalarWhereWithAggregatesInput[]
    NOT?: rrhh_processesScalarWhereWithAggregatesInput | rrhh_processesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"rrhh_processes"> | string
    tenant_id?: StringWithAggregatesFilter<"rrhh_processes"> | string
    user_id?: StringWithAggregatesFilter<"rrhh_processes"> | string
    input?: JsonWithAggregatesFilter<"rrhh_processes">
    output?: JsonNullableWithAggregatesFilter<"rrhh_processes">
    created_at?: DateTimeWithAggregatesFilter<"rrhh_processes"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"rrhh_processes"> | Date | string
  }

  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    status?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    documents?: TenantDocumentListRelationFilter
    analyses?: TenantAnalysisListRelationFilter
    memberships?: TenantMembershipListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    documents?: TenantDocumentOrderByRelationAggregateInput
    analyses?: TenantAnalysisOrderByRelationAggregateInput
    memberships?: TenantMembershipOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    status?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    documents?: TenantDocumentListRelationFilter
    analyses?: TenantAnalysisListRelationFilter
    memberships?: TenantMembershipListRelationFilter
  }, "id" | "slug">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    status?: StringWithAggregatesFilter<"Tenant"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type TenantMembershipWhereInput = {
    AND?: TenantMembershipWhereInput | TenantMembershipWhereInput[]
    OR?: TenantMembershipWhereInput[]
    NOT?: TenantMembershipWhereInput | TenantMembershipWhereInput[]
    id?: StringFilter<"TenantMembership"> | string
    tenantId?: StringFilter<"TenantMembership"> | string
    userId?: StringFilter<"TenantMembership"> | string
    role?: EnumMembershipRoleFilter<"TenantMembership"> | $Enums.MembershipRole
    createdAt?: DateTimeFilter<"TenantMembership"> | Date | string
    updatedAt?: DateTimeFilter<"TenantMembership"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type TenantMembershipOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type TenantMembershipWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_userId?: TenantMembershipTenantIdUserIdCompoundUniqueInput
    AND?: TenantMembershipWhereInput | TenantMembershipWhereInput[]
    OR?: TenantMembershipWhereInput[]
    NOT?: TenantMembershipWhereInput | TenantMembershipWhereInput[]
    tenantId?: StringFilter<"TenantMembership"> | string
    userId?: StringFilter<"TenantMembership"> | string
    role?: EnumMembershipRoleFilter<"TenantMembership"> | $Enums.MembershipRole
    createdAt?: DateTimeFilter<"TenantMembership"> | Date | string
    updatedAt?: DateTimeFilter<"TenantMembership"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "tenantId_userId">

  export type TenantMembershipOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantMembershipCountOrderByAggregateInput
    _max?: TenantMembershipMaxOrderByAggregateInput
    _min?: TenantMembershipMinOrderByAggregateInput
  }

  export type TenantMembershipScalarWhereWithAggregatesInput = {
    AND?: TenantMembershipScalarWhereWithAggregatesInput | TenantMembershipScalarWhereWithAggregatesInput[]
    OR?: TenantMembershipScalarWhereWithAggregatesInput[]
    NOT?: TenantMembershipScalarWhereWithAggregatesInput | TenantMembershipScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantMembership"> | string
    tenantId?: StringWithAggregatesFilter<"TenantMembership"> | string
    userId?: StringWithAggregatesFilter<"TenantMembership"> | string
    role?: EnumMembershipRoleWithAggregatesFilter<"TenantMembership"> | $Enums.MembershipRole
    createdAt?: DateTimeWithAggregatesFilter<"TenantMembership"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantMembership"> | Date | string
  }

  export type TenantDocumentWhereInput = {
    AND?: TenantDocumentWhereInput | TenantDocumentWhereInput[]
    OR?: TenantDocumentWhereInput[]
    NOT?: TenantDocumentWhereInput | TenantDocumentWhereInput[]
    id?: StringFilter<"TenantDocument"> | string
    tenantId?: StringFilter<"TenantDocument"> | string
    category?: StringFilter<"TenantDocument"> | string
    title?: StringFilter<"TenantDocument"> | string
    description?: StringFilter<"TenantDocument"> | string
    status?: StringFilter<"TenantDocument"> | string
    source?: StringFilter<"TenantDocument"> | string
    fileUrl?: StringNullableFilter<"TenantDocument"> | string | null
    fileName?: StringNullableFilter<"TenantDocument"> | string | null
    createdAt?: DateTimeFilter<"TenantDocument"> | Date | string
    updatedAt?: DateTimeFilter<"TenantDocument"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantDocumentOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    source?: SortOrder
    fileUrl?: SortOrderInput | SortOrder
    fileName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantDocumentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantDocumentWhereInput | TenantDocumentWhereInput[]
    OR?: TenantDocumentWhereInput[]
    NOT?: TenantDocumentWhereInput | TenantDocumentWhereInput[]
    tenantId?: StringFilter<"TenantDocument"> | string
    category?: StringFilter<"TenantDocument"> | string
    title?: StringFilter<"TenantDocument"> | string
    description?: StringFilter<"TenantDocument"> | string
    status?: StringFilter<"TenantDocument"> | string
    source?: StringFilter<"TenantDocument"> | string
    fileUrl?: StringNullableFilter<"TenantDocument"> | string | null
    fileName?: StringNullableFilter<"TenantDocument"> | string | null
    createdAt?: DateTimeFilter<"TenantDocument"> | Date | string
    updatedAt?: DateTimeFilter<"TenantDocument"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id">

  export type TenantDocumentOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    source?: SortOrder
    fileUrl?: SortOrderInput | SortOrder
    fileName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantDocumentCountOrderByAggregateInput
    _max?: TenantDocumentMaxOrderByAggregateInput
    _min?: TenantDocumentMinOrderByAggregateInput
  }

  export type TenantDocumentScalarWhereWithAggregatesInput = {
    AND?: TenantDocumentScalarWhereWithAggregatesInput | TenantDocumentScalarWhereWithAggregatesInput[]
    OR?: TenantDocumentScalarWhereWithAggregatesInput[]
    NOT?: TenantDocumentScalarWhereWithAggregatesInput | TenantDocumentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantDocument"> | string
    tenantId?: StringWithAggregatesFilter<"TenantDocument"> | string
    category?: StringWithAggregatesFilter<"TenantDocument"> | string
    title?: StringWithAggregatesFilter<"TenantDocument"> | string
    description?: StringWithAggregatesFilter<"TenantDocument"> | string
    status?: StringWithAggregatesFilter<"TenantDocument"> | string
    source?: StringWithAggregatesFilter<"TenantDocument"> | string
    fileUrl?: StringNullableWithAggregatesFilter<"TenantDocument"> | string | null
    fileName?: StringNullableWithAggregatesFilter<"TenantDocument"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TenantDocument"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantDocument"> | Date | string
  }

  export type TenantAnalysisWhereInput = {
    AND?: TenantAnalysisWhereInput | TenantAnalysisWhereInput[]
    OR?: TenantAnalysisWhereInput[]
    NOT?: TenantAnalysisWhereInput | TenantAnalysisWhereInput[]
    id?: StringFilter<"TenantAnalysis"> | string
    tenantId?: StringFilter<"TenantAnalysis"> | string
    mode?: StringFilter<"TenantAnalysis"> | string
    summary?: StringFilter<"TenantAnalysis"> | string
    risks?: StringNullableListFilter<"TenantAnalysis">
    opportunities?: StringNullableListFilter<"TenantAnalysis">
    priority?: StringNullableFilter<"TenantAnalysis"> | string | null
    globalScore?: IntFilter<"TenantAnalysis"> | number
    createdAt?: DateTimeFilter<"TenantAnalysis"> | Date | string
    updatedAt?: DateTimeFilter<"TenantAnalysis"> | Date | string
    rawData?: JsonNullableFilter<"TenantAnalysis">
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantAnalysisOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    mode?: SortOrder
    summary?: SortOrder
    risks?: SortOrder
    opportunities?: SortOrder
    priority?: SortOrderInput | SortOrder
    globalScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rawData?: SortOrderInput | SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantAnalysisWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantAnalysisWhereInput | TenantAnalysisWhereInput[]
    OR?: TenantAnalysisWhereInput[]
    NOT?: TenantAnalysisWhereInput | TenantAnalysisWhereInput[]
    tenantId?: StringFilter<"TenantAnalysis"> | string
    mode?: StringFilter<"TenantAnalysis"> | string
    summary?: StringFilter<"TenantAnalysis"> | string
    risks?: StringNullableListFilter<"TenantAnalysis">
    opportunities?: StringNullableListFilter<"TenantAnalysis">
    priority?: StringNullableFilter<"TenantAnalysis"> | string | null
    globalScore?: IntFilter<"TenantAnalysis"> | number
    createdAt?: DateTimeFilter<"TenantAnalysis"> | Date | string
    updatedAt?: DateTimeFilter<"TenantAnalysis"> | Date | string
    rawData?: JsonNullableFilter<"TenantAnalysis">
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id">

  export type TenantAnalysisOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    mode?: SortOrder
    summary?: SortOrder
    risks?: SortOrder
    opportunities?: SortOrder
    priority?: SortOrderInput | SortOrder
    globalScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rawData?: SortOrderInput | SortOrder
    _count?: TenantAnalysisCountOrderByAggregateInput
    _avg?: TenantAnalysisAvgOrderByAggregateInput
    _max?: TenantAnalysisMaxOrderByAggregateInput
    _min?: TenantAnalysisMinOrderByAggregateInput
    _sum?: TenantAnalysisSumOrderByAggregateInput
  }

  export type TenantAnalysisScalarWhereWithAggregatesInput = {
    AND?: TenantAnalysisScalarWhereWithAggregatesInput | TenantAnalysisScalarWhereWithAggregatesInput[]
    OR?: TenantAnalysisScalarWhereWithAggregatesInput[]
    NOT?: TenantAnalysisScalarWhereWithAggregatesInput | TenantAnalysisScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantAnalysis"> | string
    tenantId?: StringWithAggregatesFilter<"TenantAnalysis"> | string
    mode?: StringWithAggregatesFilter<"TenantAnalysis"> | string
    summary?: StringWithAggregatesFilter<"TenantAnalysis"> | string
    risks?: StringNullableListFilter<"TenantAnalysis">
    opportunities?: StringNullableListFilter<"TenantAnalysis">
    priority?: StringNullableWithAggregatesFilter<"TenantAnalysis"> | string | null
    globalScore?: IntWithAggregatesFilter<"TenantAnalysis"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TenantAnalysis"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantAnalysis"> | Date | string
    rawData?: JsonNullableWithAggregatesFilter<"TenantAnalysis">
  }

  export type RecruitingSearchWhereInput = {
    AND?: RecruitingSearchWhereInput | RecruitingSearchWhereInput[]
    OR?: RecruitingSearchWhereInput[]
    NOT?: RecruitingSearchWhereInput | RecruitingSearchWhereInput[]
    id?: StringFilter<"RecruitingSearch"> | string
    tenantId?: StringFilter<"RecruitingSearch"> | string
    createdById?: StringFilter<"RecruitingSearch"> | string
    refCode?: StringFilter<"RecruitingSearch"> | string
    title?: StringFilter<"RecruitingSearch"> | string
    requestText?: StringFilter<"RecruitingSearch"> | string
    status?: StringFilter<"RecruitingSearch"> | string
    monitoringStatus?: StringNullableFilter<"RecruitingSearch"> | string | null
    area?: StringNullableFilter<"RecruitingSearch"> | string | null
    seniority?: StringNullableFilter<"RecruitingSearch"> | string | null
    modality?: StringNullableFilter<"RecruitingSearch"> | string | null
    location?: StringNullableFilter<"RecruitingSearch"> | string | null
    jobProfileOutput?: JsonNullableFilter<"RecruitingSearch">
    idealCandidateOutput?: JsonNullableFilter<"RecruitingSearch">
    scoringCriteriaOutput?: JsonNullableFilter<"RecruitingSearch">
    publicationCopiesOutput?: JsonNullableFilter<"RecruitingSearch">
    aiGenerationLog?: JsonNullableFilter<"RecruitingSearch">
    createdAt?: DateTimeFilter<"RecruitingSearch"> | Date | string
    updatedAt?: DateTimeFilter<"RecruitingSearch"> | Date | string
    companyProfile?: XOR<RecruitingCompanyProfileNullableScalarRelationFilter, RecruitingCompanyProfileWhereInput> | null
    attachments?: RecruitingAttachmentListRelationFilter
    candidates?: RecruitingCandidateListRelationFilter
  }

  export type RecruitingSearchOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    createdById?: SortOrder
    refCode?: SortOrder
    title?: SortOrder
    requestText?: SortOrder
    status?: SortOrder
    monitoringStatus?: SortOrderInput | SortOrder
    area?: SortOrderInput | SortOrder
    seniority?: SortOrderInput | SortOrder
    modality?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    jobProfileOutput?: SortOrderInput | SortOrder
    idealCandidateOutput?: SortOrderInput | SortOrder
    scoringCriteriaOutput?: SortOrderInput | SortOrder
    publicationCopiesOutput?: SortOrderInput | SortOrder
    aiGenerationLog?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    companyProfile?: RecruitingCompanyProfileOrderByWithRelationInput
    attachments?: RecruitingAttachmentOrderByRelationAggregateInput
    candidates?: RecruitingCandidateOrderByRelationAggregateInput
  }

  export type RecruitingSearchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    refCode?: string
    AND?: RecruitingSearchWhereInput | RecruitingSearchWhereInput[]
    OR?: RecruitingSearchWhereInput[]
    NOT?: RecruitingSearchWhereInput | RecruitingSearchWhereInput[]
    tenantId?: StringFilter<"RecruitingSearch"> | string
    createdById?: StringFilter<"RecruitingSearch"> | string
    title?: StringFilter<"RecruitingSearch"> | string
    requestText?: StringFilter<"RecruitingSearch"> | string
    status?: StringFilter<"RecruitingSearch"> | string
    monitoringStatus?: StringNullableFilter<"RecruitingSearch"> | string | null
    area?: StringNullableFilter<"RecruitingSearch"> | string | null
    seniority?: StringNullableFilter<"RecruitingSearch"> | string | null
    modality?: StringNullableFilter<"RecruitingSearch"> | string | null
    location?: StringNullableFilter<"RecruitingSearch"> | string | null
    jobProfileOutput?: JsonNullableFilter<"RecruitingSearch">
    idealCandidateOutput?: JsonNullableFilter<"RecruitingSearch">
    scoringCriteriaOutput?: JsonNullableFilter<"RecruitingSearch">
    publicationCopiesOutput?: JsonNullableFilter<"RecruitingSearch">
    aiGenerationLog?: JsonNullableFilter<"RecruitingSearch">
    createdAt?: DateTimeFilter<"RecruitingSearch"> | Date | string
    updatedAt?: DateTimeFilter<"RecruitingSearch"> | Date | string
    companyProfile?: XOR<RecruitingCompanyProfileNullableScalarRelationFilter, RecruitingCompanyProfileWhereInput> | null
    attachments?: RecruitingAttachmentListRelationFilter
    candidates?: RecruitingCandidateListRelationFilter
  }, "id" | "refCode">

  export type RecruitingSearchOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    createdById?: SortOrder
    refCode?: SortOrder
    title?: SortOrder
    requestText?: SortOrder
    status?: SortOrder
    monitoringStatus?: SortOrderInput | SortOrder
    area?: SortOrderInput | SortOrder
    seniority?: SortOrderInput | SortOrder
    modality?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    jobProfileOutput?: SortOrderInput | SortOrder
    idealCandidateOutput?: SortOrderInput | SortOrder
    scoringCriteriaOutput?: SortOrderInput | SortOrder
    publicationCopiesOutput?: SortOrderInput | SortOrder
    aiGenerationLog?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RecruitingSearchCountOrderByAggregateInput
    _max?: RecruitingSearchMaxOrderByAggregateInput
    _min?: RecruitingSearchMinOrderByAggregateInput
  }

  export type RecruitingSearchScalarWhereWithAggregatesInput = {
    AND?: RecruitingSearchScalarWhereWithAggregatesInput | RecruitingSearchScalarWhereWithAggregatesInput[]
    OR?: RecruitingSearchScalarWhereWithAggregatesInput[]
    NOT?: RecruitingSearchScalarWhereWithAggregatesInput | RecruitingSearchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RecruitingSearch"> | string
    tenantId?: StringWithAggregatesFilter<"RecruitingSearch"> | string
    createdById?: StringWithAggregatesFilter<"RecruitingSearch"> | string
    refCode?: StringWithAggregatesFilter<"RecruitingSearch"> | string
    title?: StringWithAggregatesFilter<"RecruitingSearch"> | string
    requestText?: StringWithAggregatesFilter<"RecruitingSearch"> | string
    status?: StringWithAggregatesFilter<"RecruitingSearch"> | string
    monitoringStatus?: StringNullableWithAggregatesFilter<"RecruitingSearch"> | string | null
    area?: StringNullableWithAggregatesFilter<"RecruitingSearch"> | string | null
    seniority?: StringNullableWithAggregatesFilter<"RecruitingSearch"> | string | null
    modality?: StringNullableWithAggregatesFilter<"RecruitingSearch"> | string | null
    location?: StringNullableWithAggregatesFilter<"RecruitingSearch"> | string | null
    jobProfileOutput?: JsonNullableWithAggregatesFilter<"RecruitingSearch">
    idealCandidateOutput?: JsonNullableWithAggregatesFilter<"RecruitingSearch">
    scoringCriteriaOutput?: JsonNullableWithAggregatesFilter<"RecruitingSearch">
    publicationCopiesOutput?: JsonNullableWithAggregatesFilter<"RecruitingSearch">
    aiGenerationLog?: JsonNullableWithAggregatesFilter<"RecruitingSearch">
    createdAt?: DateTimeWithAggregatesFilter<"RecruitingSearch"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RecruitingSearch"> | Date | string
  }

  export type RecruitingCompanyProfileWhereInput = {
    AND?: RecruitingCompanyProfileWhereInput | RecruitingCompanyProfileWhereInput[]
    OR?: RecruitingCompanyProfileWhereInput[]
    NOT?: RecruitingCompanyProfileWhereInput | RecruitingCompanyProfileWhereInput[]
    id?: StringFilter<"RecruitingCompanyProfile"> | string
    searchId?: StringFilter<"RecruitingCompanyProfile"> | string
    razonSocial?: StringNullableFilter<"RecruitingCompanyProfile"> | string | null
    createdAt?: DateTimeFilter<"RecruitingCompanyProfile"> | Date | string
    updatedAt?: DateTimeFilter<"RecruitingCompanyProfile"> | Date | string
    search?: XOR<RecruitingSearchScalarRelationFilter, RecruitingSearchWhereInput>
  }

  export type RecruitingCompanyProfileOrderByWithRelationInput = {
    id?: SortOrder
    searchId?: SortOrder
    razonSocial?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    search?: RecruitingSearchOrderByWithRelationInput
  }

  export type RecruitingCompanyProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    searchId?: string
    AND?: RecruitingCompanyProfileWhereInput | RecruitingCompanyProfileWhereInput[]
    OR?: RecruitingCompanyProfileWhereInput[]
    NOT?: RecruitingCompanyProfileWhereInput | RecruitingCompanyProfileWhereInput[]
    razonSocial?: StringNullableFilter<"RecruitingCompanyProfile"> | string | null
    createdAt?: DateTimeFilter<"RecruitingCompanyProfile"> | Date | string
    updatedAt?: DateTimeFilter<"RecruitingCompanyProfile"> | Date | string
    search?: XOR<RecruitingSearchScalarRelationFilter, RecruitingSearchWhereInput>
  }, "id" | "searchId">

  export type RecruitingCompanyProfileOrderByWithAggregationInput = {
    id?: SortOrder
    searchId?: SortOrder
    razonSocial?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RecruitingCompanyProfileCountOrderByAggregateInput
    _max?: RecruitingCompanyProfileMaxOrderByAggregateInput
    _min?: RecruitingCompanyProfileMinOrderByAggregateInput
  }

  export type RecruitingCompanyProfileScalarWhereWithAggregatesInput = {
    AND?: RecruitingCompanyProfileScalarWhereWithAggregatesInput | RecruitingCompanyProfileScalarWhereWithAggregatesInput[]
    OR?: RecruitingCompanyProfileScalarWhereWithAggregatesInput[]
    NOT?: RecruitingCompanyProfileScalarWhereWithAggregatesInput | RecruitingCompanyProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RecruitingCompanyProfile"> | string
    searchId?: StringWithAggregatesFilter<"RecruitingCompanyProfile"> | string
    razonSocial?: StringNullableWithAggregatesFilter<"RecruitingCompanyProfile"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"RecruitingCompanyProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RecruitingCompanyProfile"> | Date | string
  }

  export type RecruitingAttachmentWhereInput = {
    AND?: RecruitingAttachmentWhereInput | RecruitingAttachmentWhereInput[]
    OR?: RecruitingAttachmentWhereInput[]
    NOT?: RecruitingAttachmentWhereInput | RecruitingAttachmentWhereInput[]
    id?: StringFilter<"RecruitingAttachment"> | string
    searchId?: StringFilter<"RecruitingAttachment"> | string
    createdAt?: DateTimeFilter<"RecruitingAttachment"> | Date | string
    search?: XOR<RecruitingSearchScalarRelationFilter, RecruitingSearchWhereInput>
  }

  export type RecruitingAttachmentOrderByWithRelationInput = {
    id?: SortOrder
    searchId?: SortOrder
    createdAt?: SortOrder
    search?: RecruitingSearchOrderByWithRelationInput
  }

  export type RecruitingAttachmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RecruitingAttachmentWhereInput | RecruitingAttachmentWhereInput[]
    OR?: RecruitingAttachmentWhereInput[]
    NOT?: RecruitingAttachmentWhereInput | RecruitingAttachmentWhereInput[]
    searchId?: StringFilter<"RecruitingAttachment"> | string
    createdAt?: DateTimeFilter<"RecruitingAttachment"> | Date | string
    search?: XOR<RecruitingSearchScalarRelationFilter, RecruitingSearchWhereInput>
  }, "id">

  export type RecruitingAttachmentOrderByWithAggregationInput = {
    id?: SortOrder
    searchId?: SortOrder
    createdAt?: SortOrder
    _count?: RecruitingAttachmentCountOrderByAggregateInput
    _max?: RecruitingAttachmentMaxOrderByAggregateInput
    _min?: RecruitingAttachmentMinOrderByAggregateInput
  }

  export type RecruitingAttachmentScalarWhereWithAggregatesInput = {
    AND?: RecruitingAttachmentScalarWhereWithAggregatesInput | RecruitingAttachmentScalarWhereWithAggregatesInput[]
    OR?: RecruitingAttachmentScalarWhereWithAggregatesInput[]
    NOT?: RecruitingAttachmentScalarWhereWithAggregatesInput | RecruitingAttachmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RecruitingAttachment"> | string
    searchId?: StringWithAggregatesFilter<"RecruitingAttachment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RecruitingAttachment"> | Date | string
  }

  export type RecruitingCandidateWhereInput = {
    AND?: RecruitingCandidateWhereInput | RecruitingCandidateWhereInput[]
    OR?: RecruitingCandidateWhereInput[]
    NOT?: RecruitingCandidateWhereInput | RecruitingCandidateWhereInput[]
    id?: StringFilter<"RecruitingCandidate"> | string
    searchId?: StringFilter<"RecruitingCandidate"> | string
    candidateCode?: StringNullableFilter<"RecruitingCandidate"> | string | null
    fullName?: StringNullableFilter<"RecruitingCandidate"> | string | null
    email?: StringNullableFilter<"RecruitingCandidate"> | string | null
    receivedAt?: DateTimeFilter<"RecruitingCandidate"> | Date | string
    search?: XOR<RecruitingSearchScalarRelationFilter, RecruitingSearchWhereInput>
  }

  export type RecruitingCandidateOrderByWithRelationInput = {
    id?: SortOrder
    searchId?: SortOrder
    candidateCode?: SortOrderInput | SortOrder
    fullName?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    receivedAt?: SortOrder
    search?: RecruitingSearchOrderByWithRelationInput
  }

  export type RecruitingCandidateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RecruitingCandidateWhereInput | RecruitingCandidateWhereInput[]
    OR?: RecruitingCandidateWhereInput[]
    NOT?: RecruitingCandidateWhereInput | RecruitingCandidateWhereInput[]
    searchId?: StringFilter<"RecruitingCandidate"> | string
    candidateCode?: StringNullableFilter<"RecruitingCandidate"> | string | null
    fullName?: StringNullableFilter<"RecruitingCandidate"> | string | null
    email?: StringNullableFilter<"RecruitingCandidate"> | string | null
    receivedAt?: DateTimeFilter<"RecruitingCandidate"> | Date | string
    search?: XOR<RecruitingSearchScalarRelationFilter, RecruitingSearchWhereInput>
  }, "id">

  export type RecruitingCandidateOrderByWithAggregationInput = {
    id?: SortOrder
    searchId?: SortOrder
    candidateCode?: SortOrderInput | SortOrder
    fullName?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    receivedAt?: SortOrder
    _count?: RecruitingCandidateCountOrderByAggregateInput
    _max?: RecruitingCandidateMaxOrderByAggregateInput
    _min?: RecruitingCandidateMinOrderByAggregateInput
  }

  export type RecruitingCandidateScalarWhereWithAggregatesInput = {
    AND?: RecruitingCandidateScalarWhereWithAggregatesInput | RecruitingCandidateScalarWhereWithAggregatesInput[]
    OR?: RecruitingCandidateScalarWhereWithAggregatesInput[]
    NOT?: RecruitingCandidateScalarWhereWithAggregatesInput | RecruitingCandidateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RecruitingCandidate"> | string
    searchId?: StringWithAggregatesFilter<"RecruitingCandidate"> | string
    candidateCode?: StringNullableWithAggregatesFilter<"RecruitingCandidate"> | string | null
    fullName?: StringNullableWithAggregatesFilter<"RecruitingCandidate"> | string | null
    email?: StringNullableWithAggregatesFilter<"RecruitingCandidate"> | string | null
    receivedAt?: DateTimeWithAggregatesFilter<"RecruitingCandidate"> | Date | string
  }

  export type LeadCreateInput = {
    id?: string
    nombre?: string | null
    empresa?: string | null
    email?: string | null
    rubro?: string | null
    empleados?: string | null
    codigoPais?: string | null
    telefono?: string | null
    telefonoCompleto?: string | null
    facturacionAnual?: string | null
    problema: string
    objetivo: string
    diagnostico: string
    diagnosticoResumen?: string | null
    leadScore?: number
    leadLevel?: string
    emailStatus?: string | null
    emailError?: string | null
    aceptaTerminos?: boolean
    fechaAceptacion?: Date | string | null
    humanVerified?: boolean
    isUnlocked?: boolean
    unlockedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    estadoComercial?: string
    notasInternas?: string | null
  }

  export type LeadUncheckedCreateInput = {
    id?: string
    nombre?: string | null
    empresa?: string | null
    email?: string | null
    rubro?: string | null
    empleados?: string | null
    codigoPais?: string | null
    telefono?: string | null
    telefonoCompleto?: string | null
    facturacionAnual?: string | null
    problema: string
    objetivo: string
    diagnostico: string
    diagnosticoResumen?: string | null
    leadScore?: number
    leadLevel?: string
    emailStatus?: string | null
    emailError?: string | null
    aceptaTerminos?: boolean
    fechaAceptacion?: Date | string | null
    humanVerified?: boolean
    isUnlocked?: boolean
    unlockedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    estadoComercial?: string
    notasInternas?: string | null
  }

  export type LeadUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    rubro?: NullableStringFieldUpdateOperationsInput | string | null
    empleados?: NullableStringFieldUpdateOperationsInput | string | null
    codigoPais?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoCompleto?: NullableStringFieldUpdateOperationsInput | string | null
    facturacionAnual?: NullableStringFieldUpdateOperationsInput | string | null
    problema?: StringFieldUpdateOperationsInput | string
    objetivo?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    diagnosticoResumen?: NullableStringFieldUpdateOperationsInput | string | null
    leadScore?: IntFieldUpdateOperationsInput | number
    leadLevel?: StringFieldUpdateOperationsInput | string
    emailStatus?: NullableStringFieldUpdateOperationsInput | string | null
    emailError?: NullableStringFieldUpdateOperationsInput | string | null
    aceptaTerminos?: BoolFieldUpdateOperationsInput | boolean
    fechaAceptacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    humanVerified?: BoolFieldUpdateOperationsInput | boolean
    isUnlocked?: BoolFieldUpdateOperationsInput | boolean
    unlockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    estadoComercial?: StringFieldUpdateOperationsInput | string
    notasInternas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LeadUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    rubro?: NullableStringFieldUpdateOperationsInput | string | null
    empleados?: NullableStringFieldUpdateOperationsInput | string | null
    codigoPais?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoCompleto?: NullableStringFieldUpdateOperationsInput | string | null
    facturacionAnual?: NullableStringFieldUpdateOperationsInput | string | null
    problema?: StringFieldUpdateOperationsInput | string
    objetivo?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    diagnosticoResumen?: NullableStringFieldUpdateOperationsInput | string | null
    leadScore?: IntFieldUpdateOperationsInput | number
    leadLevel?: StringFieldUpdateOperationsInput | string
    emailStatus?: NullableStringFieldUpdateOperationsInput | string | null
    emailError?: NullableStringFieldUpdateOperationsInput | string | null
    aceptaTerminos?: BoolFieldUpdateOperationsInput | boolean
    fechaAceptacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    humanVerified?: BoolFieldUpdateOperationsInput | boolean
    isUnlocked?: BoolFieldUpdateOperationsInput | boolean
    unlockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    estadoComercial?: StringFieldUpdateOperationsInput | string
    notasInternas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LeadCreateManyInput = {
    id?: string
    nombre?: string | null
    empresa?: string | null
    email?: string | null
    rubro?: string | null
    empleados?: string | null
    codigoPais?: string | null
    telefono?: string | null
    telefonoCompleto?: string | null
    facturacionAnual?: string | null
    problema: string
    objetivo: string
    diagnostico: string
    diagnosticoResumen?: string | null
    leadScore?: number
    leadLevel?: string
    emailStatus?: string | null
    emailError?: string | null
    aceptaTerminos?: boolean
    fechaAceptacion?: Date | string | null
    humanVerified?: boolean
    isUnlocked?: boolean
    unlockedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    estadoComercial?: string
    notasInternas?: string | null
  }

  export type LeadUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    rubro?: NullableStringFieldUpdateOperationsInput | string | null
    empleados?: NullableStringFieldUpdateOperationsInput | string | null
    codigoPais?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoCompleto?: NullableStringFieldUpdateOperationsInput | string | null
    facturacionAnual?: NullableStringFieldUpdateOperationsInput | string | null
    problema?: StringFieldUpdateOperationsInput | string
    objetivo?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    diagnosticoResumen?: NullableStringFieldUpdateOperationsInput | string | null
    leadScore?: IntFieldUpdateOperationsInput | number
    leadLevel?: StringFieldUpdateOperationsInput | string
    emailStatus?: NullableStringFieldUpdateOperationsInput | string | null
    emailError?: NullableStringFieldUpdateOperationsInput | string | null
    aceptaTerminos?: BoolFieldUpdateOperationsInput | boolean
    fechaAceptacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    humanVerified?: BoolFieldUpdateOperationsInput | boolean
    isUnlocked?: BoolFieldUpdateOperationsInput | boolean
    unlockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    estadoComercial?: StringFieldUpdateOperationsInput | string
    notasInternas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LeadUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    rubro?: NullableStringFieldUpdateOperationsInput | string | null
    empleados?: NullableStringFieldUpdateOperationsInput | string | null
    codigoPais?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoCompleto?: NullableStringFieldUpdateOperationsInput | string | null
    facturacionAnual?: NullableStringFieldUpdateOperationsInput | string | null
    problema?: StringFieldUpdateOperationsInput | string
    objetivo?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    diagnosticoResumen?: NullableStringFieldUpdateOperationsInput | string | null
    leadScore?: IntFieldUpdateOperationsInput | number
    leadLevel?: StringFieldUpdateOperationsInput | string
    emailStatus?: NullableStringFieldUpdateOperationsInput | string | null
    emailError?: NullableStringFieldUpdateOperationsInput | string | null
    aceptaTerminos?: BoolFieldUpdateOperationsInput | boolean
    fechaAceptacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    humanVerified?: BoolFieldUpdateOperationsInput | boolean
    isUnlocked?: BoolFieldUpdateOperationsInput | boolean
    unlockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    estadoComercial?: StringFieldUpdateOperationsInput | string
    notasInternas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    fullName?: string | null
    passwordHash?: string | null
    status?: $Enums.UserStatus
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: TenantMembershipCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    fullName?: string | null
    passwordHash?: string | null
    status?: $Enums.UserStatus
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: TenantMembershipUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: TenantMembershipUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: TenantMembershipUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    fullName?: string | null
    passwordHash?: string | null
    status?: $Enums.UserStatus
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type rrhh_processesCreateInput = {
    id: string
    tenant_id: string
    user_id: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    created_at: Date | string
    updated_at: Date | string
  }

  export type rrhh_processesUncheckedCreateInput = {
    id: string
    tenant_id: string
    user_id: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    created_at: Date | string
    updated_at: Date | string
  }

  export type rrhh_processesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type rrhh_processesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type rrhh_processesCreateManyInput = {
    id: string
    tenant_id: string
    user_id: string
    input: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    created_at: Date | string
    updated_at: Date | string
  }

  export type rrhh_processesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type rrhh_processesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    output?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: TenantDocumentCreateNestedManyWithoutTenantInput
    analyses?: TenantAnalysisCreateNestedManyWithoutTenantInput
    memberships?: TenantMembershipCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: TenantDocumentUncheckedCreateNestedManyWithoutTenantInput
    analyses?: TenantAnalysisUncheckedCreateNestedManyWithoutTenantInput
    memberships?: TenantMembershipUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: TenantDocumentUpdateManyWithoutTenantNestedInput
    analyses?: TenantAnalysisUpdateManyWithoutTenantNestedInput
    memberships?: TenantMembershipUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: TenantDocumentUncheckedUpdateManyWithoutTenantNestedInput
    analyses?: TenantAnalysisUncheckedUpdateManyWithoutTenantNestedInput
    memberships?: TenantMembershipUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantMembershipCreateInput = {
    id?: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutMembershipsInput
    user: UserCreateNestedOneWithoutMembershipsInput
  }

  export type TenantMembershipUncheckedCreateInput = {
    id?: string
    tenantId: string
    userId: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantMembershipUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutMembershipsNestedInput
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type TenantMembershipUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantMembershipCreateManyInput = {
    id?: string
    tenantId: string
    userId: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantMembershipUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantMembershipUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantDocumentCreateInput = {
    id?: string
    category: string
    title: string
    description: string
    status: string
    source: string
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutDocumentsInput
  }

  export type TenantDocumentUncheckedCreateInput = {
    id?: string
    tenantId: string
    category: string
    title: string
    description: string
    status: string
    source: string
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantDocumentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutDocumentsNestedInput
  }

  export type TenantDocumentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantDocumentCreateManyInput = {
    id?: string
    tenantId: string
    category: string
    title: string
    description: string
    status: string
    source: string
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantDocumentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantDocumentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAnalysisCreateInput = {
    id?: string
    mode: string
    summary: string
    risks?: TenantAnalysisCreaterisksInput | string[]
    opportunities?: TenantAnalysisCreateopportunitiesInput | string[]
    priority?: string | null
    globalScore: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
    tenant: TenantCreateNestedOneWithoutAnalysesInput
  }

  export type TenantAnalysisUncheckedCreateInput = {
    id?: string
    tenantId: string
    mode: string
    summary: string
    risks?: TenantAnalysisCreaterisksInput | string[]
    opportunities?: TenantAnalysisCreateopportunitiesInput | string[]
    priority?: string | null
    globalScore: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    risks?: TenantAnalysisUpdaterisksInput | string[]
    opportunities?: TenantAnalysisUpdateopportunitiesInput | string[]
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    globalScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
    tenant?: TenantUpdateOneRequiredWithoutAnalysesNestedInput
  }

  export type TenantAnalysisUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    risks?: TenantAnalysisUpdaterisksInput | string[]
    opportunities?: TenantAnalysisUpdateopportunitiesInput | string[]
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    globalScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisCreateManyInput = {
    id?: string
    tenantId: string
    mode: string
    summary: string
    risks?: TenantAnalysisCreaterisksInput | string[]
    opportunities?: TenantAnalysisCreateopportunitiesInput | string[]
    priority?: string | null
    globalScore: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    risks?: TenantAnalysisUpdaterisksInput | string[]
    opportunities?: TenantAnalysisUpdateopportunitiesInput | string[]
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    globalScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    risks?: TenantAnalysisUpdaterisksInput | string[]
    opportunities?: TenantAnalysisUpdateopportunitiesInput | string[]
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    globalScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type RecruitingSearchCreateInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    companyProfile?: RecruitingCompanyProfileCreateNestedOneWithoutSearchInput
    attachments?: RecruitingAttachmentCreateNestedManyWithoutSearchInput
    candidates?: RecruitingCandidateCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchUncheckedCreateInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    companyProfile?: RecruitingCompanyProfileUncheckedCreateNestedOneWithoutSearchInput
    attachments?: RecruitingAttachmentUncheckedCreateNestedManyWithoutSearchInput
    candidates?: RecruitingCandidateUncheckedCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyProfile?: RecruitingCompanyProfileUpdateOneWithoutSearchNestedInput
    attachments?: RecruitingAttachmentUpdateManyWithoutSearchNestedInput
    candidates?: RecruitingCandidateUpdateManyWithoutSearchNestedInput
  }

  export type RecruitingSearchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyProfile?: RecruitingCompanyProfileUncheckedUpdateOneWithoutSearchNestedInput
    attachments?: RecruitingAttachmentUncheckedUpdateManyWithoutSearchNestedInput
    candidates?: RecruitingCandidateUncheckedUpdateManyWithoutSearchNestedInput
  }

  export type RecruitingSearchCreateManyInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecruitingSearchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingSearchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCompanyProfileCreateInput = {
    id?: string
    razonSocial?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    search: RecruitingSearchCreateNestedOneWithoutCompanyProfileInput
  }

  export type RecruitingCompanyProfileUncheckedCreateInput = {
    id?: string
    searchId: string
    razonSocial?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecruitingCompanyProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    search?: RecruitingSearchUpdateOneRequiredWithoutCompanyProfileNestedInput
  }

  export type RecruitingCompanyProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchId?: StringFieldUpdateOperationsInput | string
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCompanyProfileCreateManyInput = {
    id?: string
    searchId: string
    razonSocial?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecruitingCompanyProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCompanyProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchId?: StringFieldUpdateOperationsInput | string
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingAttachmentCreateInput = {
    id?: string
    createdAt?: Date | string
    search: RecruitingSearchCreateNestedOneWithoutAttachmentsInput
  }

  export type RecruitingAttachmentUncheckedCreateInput = {
    id?: string
    searchId: string
    createdAt?: Date | string
  }

  export type RecruitingAttachmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    search?: RecruitingSearchUpdateOneRequiredWithoutAttachmentsNestedInput
  }

  export type RecruitingAttachmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingAttachmentCreateManyInput = {
    id?: string
    searchId: string
    createdAt?: Date | string
  }

  export type RecruitingAttachmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingAttachmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCandidateCreateInput = {
    id?: string
    candidateCode?: string | null
    fullName?: string | null
    email?: string | null
    receivedAt?: Date | string
    search: RecruitingSearchCreateNestedOneWithoutCandidatesInput
  }

  export type RecruitingCandidateUncheckedCreateInput = {
    id?: string
    searchId: string
    candidateCode?: string | null
    fullName?: string | null
    email?: string | null
    receivedAt?: Date | string
  }

  export type RecruitingCandidateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    search?: RecruitingSearchUpdateOneRequiredWithoutCandidatesNestedInput
  }

  export type RecruitingCandidateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchId?: StringFieldUpdateOperationsInput | string
    candidateCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCandidateCreateManyInput = {
    id?: string
    searchId: string
    candidateCode?: string | null
    fullName?: string | null
    email?: string | null
    receivedAt?: Date | string
  }

  export type RecruitingCandidateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCandidateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchId?: StringFieldUpdateOperationsInput | string
    candidateCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type LeadCountOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    empresa?: SortOrder
    email?: SortOrder
    rubro?: SortOrder
    empleados?: SortOrder
    codigoPais?: SortOrder
    telefono?: SortOrder
    telefonoCompleto?: SortOrder
    facturacionAnual?: SortOrder
    problema?: SortOrder
    objetivo?: SortOrder
    diagnostico?: SortOrder
    diagnosticoResumen?: SortOrder
    leadScore?: SortOrder
    leadLevel?: SortOrder
    emailStatus?: SortOrder
    emailError?: SortOrder
    aceptaTerminos?: SortOrder
    fechaAceptacion?: SortOrder
    humanVerified?: SortOrder
    isUnlocked?: SortOrder
    unlockedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    estadoComercial?: SortOrder
    notasInternas?: SortOrder
  }

  export type LeadAvgOrderByAggregateInput = {
    leadScore?: SortOrder
  }

  export type LeadMaxOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    empresa?: SortOrder
    email?: SortOrder
    rubro?: SortOrder
    empleados?: SortOrder
    codigoPais?: SortOrder
    telefono?: SortOrder
    telefonoCompleto?: SortOrder
    facturacionAnual?: SortOrder
    problema?: SortOrder
    objetivo?: SortOrder
    diagnostico?: SortOrder
    diagnosticoResumen?: SortOrder
    leadScore?: SortOrder
    leadLevel?: SortOrder
    emailStatus?: SortOrder
    emailError?: SortOrder
    aceptaTerminos?: SortOrder
    fechaAceptacion?: SortOrder
    humanVerified?: SortOrder
    isUnlocked?: SortOrder
    unlockedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    estadoComercial?: SortOrder
    notasInternas?: SortOrder
  }

  export type LeadMinOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    empresa?: SortOrder
    email?: SortOrder
    rubro?: SortOrder
    empleados?: SortOrder
    codigoPais?: SortOrder
    telefono?: SortOrder
    telefonoCompleto?: SortOrder
    facturacionAnual?: SortOrder
    problema?: SortOrder
    objetivo?: SortOrder
    diagnostico?: SortOrder
    diagnosticoResumen?: SortOrder
    leadScore?: SortOrder
    leadLevel?: SortOrder
    emailStatus?: SortOrder
    emailError?: SortOrder
    aceptaTerminos?: SortOrder
    fechaAceptacion?: SortOrder
    humanVerified?: SortOrder
    isUnlocked?: SortOrder
    unlockedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    estadoComercial?: SortOrder
    notasInternas?: SortOrder
  }

  export type LeadSumOrderByAggregateInput = {
    leadScore?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type TenantMembershipListRelationFilter = {
    every?: TenantMembershipWhereInput
    some?: TenantMembershipWhereInput
    none?: TenantMembershipWhereInput
  }

  export type TenantMembershipOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    status?: SortOrder
    emailVerifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    status?: SortOrder
    emailVerifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    passwordHash?: SortOrder
    status?: SortOrder
    emailVerifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type rrhh_processesCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    input?: SortOrder
    output?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type rrhh_processesMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type rrhh_processesMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type TenantDocumentListRelationFilter = {
    every?: TenantDocumentWhereInput
    some?: TenantDocumentWhereInput
    none?: TenantDocumentWhereInput
  }

  export type TenantAnalysisListRelationFilter = {
    every?: TenantAnalysisWhereInput
    some?: TenantAnalysisWhereInput
    none?: TenantAnalysisWhereInput
  }

  export type TenantDocumentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantAnalysisOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumMembershipRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleFilter<$PrismaModel> | $Enums.MembershipRole
  }

  export type TenantScalarRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type TenantMembershipTenantIdUserIdCompoundUniqueInput = {
    tenantId: string
    userId: string
  }

  export type TenantMembershipCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMembershipMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMembershipMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumMembershipRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleWithAggregatesFilter<$PrismaModel> | $Enums.MembershipRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMembershipRoleFilter<$PrismaModel>
    _max?: NestedEnumMembershipRoleFilter<$PrismaModel>
  }

  export type TenantDocumentCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    source?: SortOrder
    fileUrl?: SortOrder
    fileName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantDocumentMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    source?: SortOrder
    fileUrl?: SortOrder
    fileName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantDocumentMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    source?: SortOrder
    fileUrl?: SortOrder
    fileName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type TenantAnalysisCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    mode?: SortOrder
    summary?: SortOrder
    risks?: SortOrder
    opportunities?: SortOrder
    priority?: SortOrder
    globalScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rawData?: SortOrder
  }

  export type TenantAnalysisAvgOrderByAggregateInput = {
    globalScore?: SortOrder
  }

  export type TenantAnalysisMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    mode?: SortOrder
    summary?: SortOrder
    priority?: SortOrder
    globalScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantAnalysisMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    mode?: SortOrder
    summary?: SortOrder
    priority?: SortOrder
    globalScore?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantAnalysisSumOrderByAggregateInput = {
    globalScore?: SortOrder
  }

  export type RecruitingCompanyProfileNullableScalarRelationFilter = {
    is?: RecruitingCompanyProfileWhereInput | null
    isNot?: RecruitingCompanyProfileWhereInput | null
  }

  export type RecruitingAttachmentListRelationFilter = {
    every?: RecruitingAttachmentWhereInput
    some?: RecruitingAttachmentWhereInput
    none?: RecruitingAttachmentWhereInput
  }

  export type RecruitingCandidateListRelationFilter = {
    every?: RecruitingCandidateWhereInput
    some?: RecruitingCandidateWhereInput
    none?: RecruitingCandidateWhereInput
  }

  export type RecruitingAttachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RecruitingCandidateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RecruitingSearchCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    createdById?: SortOrder
    refCode?: SortOrder
    title?: SortOrder
    requestText?: SortOrder
    status?: SortOrder
    monitoringStatus?: SortOrder
    area?: SortOrder
    seniority?: SortOrder
    modality?: SortOrder
    location?: SortOrder
    jobProfileOutput?: SortOrder
    idealCandidateOutput?: SortOrder
    scoringCriteriaOutput?: SortOrder
    publicationCopiesOutput?: SortOrder
    aiGenerationLog?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecruitingSearchMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    createdById?: SortOrder
    refCode?: SortOrder
    title?: SortOrder
    requestText?: SortOrder
    status?: SortOrder
    monitoringStatus?: SortOrder
    area?: SortOrder
    seniority?: SortOrder
    modality?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecruitingSearchMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    createdById?: SortOrder
    refCode?: SortOrder
    title?: SortOrder
    requestText?: SortOrder
    status?: SortOrder
    monitoringStatus?: SortOrder
    area?: SortOrder
    seniority?: SortOrder
    modality?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecruitingSearchScalarRelationFilter = {
    is?: RecruitingSearchWhereInput
    isNot?: RecruitingSearchWhereInput
  }

  export type RecruitingCompanyProfileCountOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    razonSocial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecruitingCompanyProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    razonSocial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecruitingCompanyProfileMinOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    razonSocial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecruitingAttachmentCountOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    createdAt?: SortOrder
  }

  export type RecruitingAttachmentMaxOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    createdAt?: SortOrder
  }

  export type RecruitingAttachmentMinOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    createdAt?: SortOrder
  }

  export type RecruitingCandidateCountOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    candidateCode?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    receivedAt?: SortOrder
  }

  export type RecruitingCandidateMaxOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    candidateCode?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    receivedAt?: SortOrder
  }

  export type RecruitingCandidateMinOrderByAggregateInput = {
    id?: SortOrder
    searchId?: SortOrder
    candidateCode?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    receivedAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TenantMembershipCreateNestedManyWithoutUserInput = {
    create?: XOR<TenantMembershipCreateWithoutUserInput, TenantMembershipUncheckedCreateWithoutUserInput> | TenantMembershipCreateWithoutUserInput[] | TenantMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutUserInput | TenantMembershipCreateOrConnectWithoutUserInput[]
    createMany?: TenantMembershipCreateManyUserInputEnvelope
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
  }

  export type TenantMembershipUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<TenantMembershipCreateWithoutUserInput, TenantMembershipUncheckedCreateWithoutUserInput> | TenantMembershipCreateWithoutUserInput[] | TenantMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutUserInput | TenantMembershipCreateOrConnectWithoutUserInput[]
    createMany?: TenantMembershipCreateManyUserInputEnvelope
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
  }

  export type EnumUserStatusFieldUpdateOperationsInput = {
    set?: $Enums.UserStatus
  }

  export type TenantMembershipUpdateManyWithoutUserNestedInput = {
    create?: XOR<TenantMembershipCreateWithoutUserInput, TenantMembershipUncheckedCreateWithoutUserInput> | TenantMembershipCreateWithoutUserInput[] | TenantMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutUserInput | TenantMembershipCreateOrConnectWithoutUserInput[]
    upsert?: TenantMembershipUpsertWithWhereUniqueWithoutUserInput | TenantMembershipUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TenantMembershipCreateManyUserInputEnvelope
    set?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    disconnect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    delete?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    update?: TenantMembershipUpdateWithWhereUniqueWithoutUserInput | TenantMembershipUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TenantMembershipUpdateManyWithWhereWithoutUserInput | TenantMembershipUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TenantMembershipScalarWhereInput | TenantMembershipScalarWhereInput[]
  }

  export type TenantMembershipUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<TenantMembershipCreateWithoutUserInput, TenantMembershipUncheckedCreateWithoutUserInput> | TenantMembershipCreateWithoutUserInput[] | TenantMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutUserInput | TenantMembershipCreateOrConnectWithoutUserInput[]
    upsert?: TenantMembershipUpsertWithWhereUniqueWithoutUserInput | TenantMembershipUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TenantMembershipCreateManyUserInputEnvelope
    set?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    disconnect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    delete?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    update?: TenantMembershipUpdateWithWhereUniqueWithoutUserInput | TenantMembershipUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TenantMembershipUpdateManyWithWhereWithoutUserInput | TenantMembershipUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TenantMembershipScalarWhereInput | TenantMembershipScalarWhereInput[]
  }

  export type TenantDocumentCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantDocumentCreateWithoutTenantInput, TenantDocumentUncheckedCreateWithoutTenantInput> | TenantDocumentCreateWithoutTenantInput[] | TenantDocumentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantDocumentCreateOrConnectWithoutTenantInput | TenantDocumentCreateOrConnectWithoutTenantInput[]
    createMany?: TenantDocumentCreateManyTenantInputEnvelope
    connect?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
  }

  export type TenantAnalysisCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantAnalysisCreateWithoutTenantInput, TenantAnalysisUncheckedCreateWithoutTenantInput> | TenantAnalysisCreateWithoutTenantInput[] | TenantAnalysisUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAnalysisCreateOrConnectWithoutTenantInput | TenantAnalysisCreateOrConnectWithoutTenantInput[]
    createMany?: TenantAnalysisCreateManyTenantInputEnvelope
    connect?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
  }

  export type TenantMembershipCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantMembershipCreateWithoutTenantInput, TenantMembershipUncheckedCreateWithoutTenantInput> | TenantMembershipCreateWithoutTenantInput[] | TenantMembershipUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutTenantInput | TenantMembershipCreateOrConnectWithoutTenantInput[]
    createMany?: TenantMembershipCreateManyTenantInputEnvelope
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
  }

  export type TenantDocumentUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantDocumentCreateWithoutTenantInput, TenantDocumentUncheckedCreateWithoutTenantInput> | TenantDocumentCreateWithoutTenantInput[] | TenantDocumentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantDocumentCreateOrConnectWithoutTenantInput | TenantDocumentCreateOrConnectWithoutTenantInput[]
    createMany?: TenantDocumentCreateManyTenantInputEnvelope
    connect?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
  }

  export type TenantAnalysisUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantAnalysisCreateWithoutTenantInput, TenantAnalysisUncheckedCreateWithoutTenantInput> | TenantAnalysisCreateWithoutTenantInput[] | TenantAnalysisUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAnalysisCreateOrConnectWithoutTenantInput | TenantAnalysisCreateOrConnectWithoutTenantInput[]
    createMany?: TenantAnalysisCreateManyTenantInputEnvelope
    connect?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
  }

  export type TenantMembershipUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantMembershipCreateWithoutTenantInput, TenantMembershipUncheckedCreateWithoutTenantInput> | TenantMembershipCreateWithoutTenantInput[] | TenantMembershipUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutTenantInput | TenantMembershipCreateOrConnectWithoutTenantInput[]
    createMany?: TenantMembershipCreateManyTenantInputEnvelope
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
  }

  export type TenantDocumentUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantDocumentCreateWithoutTenantInput, TenantDocumentUncheckedCreateWithoutTenantInput> | TenantDocumentCreateWithoutTenantInput[] | TenantDocumentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantDocumentCreateOrConnectWithoutTenantInput | TenantDocumentCreateOrConnectWithoutTenantInput[]
    upsert?: TenantDocumentUpsertWithWhereUniqueWithoutTenantInput | TenantDocumentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantDocumentCreateManyTenantInputEnvelope
    set?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    disconnect?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    delete?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    connect?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    update?: TenantDocumentUpdateWithWhereUniqueWithoutTenantInput | TenantDocumentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantDocumentUpdateManyWithWhereWithoutTenantInput | TenantDocumentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantDocumentScalarWhereInput | TenantDocumentScalarWhereInput[]
  }

  export type TenantAnalysisUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantAnalysisCreateWithoutTenantInput, TenantAnalysisUncheckedCreateWithoutTenantInput> | TenantAnalysisCreateWithoutTenantInput[] | TenantAnalysisUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAnalysisCreateOrConnectWithoutTenantInput | TenantAnalysisCreateOrConnectWithoutTenantInput[]
    upsert?: TenantAnalysisUpsertWithWhereUniqueWithoutTenantInput | TenantAnalysisUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantAnalysisCreateManyTenantInputEnvelope
    set?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    disconnect?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    delete?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    connect?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    update?: TenantAnalysisUpdateWithWhereUniqueWithoutTenantInput | TenantAnalysisUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantAnalysisUpdateManyWithWhereWithoutTenantInput | TenantAnalysisUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantAnalysisScalarWhereInput | TenantAnalysisScalarWhereInput[]
  }

  export type TenantMembershipUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantMembershipCreateWithoutTenantInput, TenantMembershipUncheckedCreateWithoutTenantInput> | TenantMembershipCreateWithoutTenantInput[] | TenantMembershipUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutTenantInput | TenantMembershipCreateOrConnectWithoutTenantInput[]
    upsert?: TenantMembershipUpsertWithWhereUniqueWithoutTenantInput | TenantMembershipUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantMembershipCreateManyTenantInputEnvelope
    set?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    disconnect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    delete?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    update?: TenantMembershipUpdateWithWhereUniqueWithoutTenantInput | TenantMembershipUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantMembershipUpdateManyWithWhereWithoutTenantInput | TenantMembershipUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantMembershipScalarWhereInput | TenantMembershipScalarWhereInput[]
  }

  export type TenantDocumentUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantDocumentCreateWithoutTenantInput, TenantDocumentUncheckedCreateWithoutTenantInput> | TenantDocumentCreateWithoutTenantInput[] | TenantDocumentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantDocumentCreateOrConnectWithoutTenantInput | TenantDocumentCreateOrConnectWithoutTenantInput[]
    upsert?: TenantDocumentUpsertWithWhereUniqueWithoutTenantInput | TenantDocumentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantDocumentCreateManyTenantInputEnvelope
    set?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    disconnect?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    delete?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    connect?: TenantDocumentWhereUniqueInput | TenantDocumentWhereUniqueInput[]
    update?: TenantDocumentUpdateWithWhereUniqueWithoutTenantInput | TenantDocumentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantDocumentUpdateManyWithWhereWithoutTenantInput | TenantDocumentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantDocumentScalarWhereInput | TenantDocumentScalarWhereInput[]
  }

  export type TenantAnalysisUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantAnalysisCreateWithoutTenantInput, TenantAnalysisUncheckedCreateWithoutTenantInput> | TenantAnalysisCreateWithoutTenantInput[] | TenantAnalysisUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAnalysisCreateOrConnectWithoutTenantInput | TenantAnalysisCreateOrConnectWithoutTenantInput[]
    upsert?: TenantAnalysisUpsertWithWhereUniqueWithoutTenantInput | TenantAnalysisUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantAnalysisCreateManyTenantInputEnvelope
    set?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    disconnect?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    delete?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    connect?: TenantAnalysisWhereUniqueInput | TenantAnalysisWhereUniqueInput[]
    update?: TenantAnalysisUpdateWithWhereUniqueWithoutTenantInput | TenantAnalysisUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantAnalysisUpdateManyWithWhereWithoutTenantInput | TenantAnalysisUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantAnalysisScalarWhereInput | TenantAnalysisScalarWhereInput[]
  }

  export type TenantMembershipUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantMembershipCreateWithoutTenantInput, TenantMembershipUncheckedCreateWithoutTenantInput> | TenantMembershipCreateWithoutTenantInput[] | TenantMembershipUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantMembershipCreateOrConnectWithoutTenantInput | TenantMembershipCreateOrConnectWithoutTenantInput[]
    upsert?: TenantMembershipUpsertWithWhereUniqueWithoutTenantInput | TenantMembershipUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantMembershipCreateManyTenantInputEnvelope
    set?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    disconnect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    delete?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    connect?: TenantMembershipWhereUniqueInput | TenantMembershipWhereUniqueInput[]
    update?: TenantMembershipUpdateWithWhereUniqueWithoutTenantInput | TenantMembershipUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantMembershipUpdateManyWithWhereWithoutTenantInput | TenantMembershipUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantMembershipScalarWhereInput | TenantMembershipScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<TenantCreateWithoutMembershipsInput, TenantUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutMembershipsInput
    connect?: TenantWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumMembershipRoleFieldUpdateOperationsInput = {
    set?: $Enums.MembershipRole
  }

  export type TenantUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<TenantCreateWithoutMembershipsInput, TenantUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutMembershipsInput
    upsert?: TenantUpsertWithoutMembershipsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutMembershipsInput, TenantUpdateWithoutMembershipsInput>, TenantUncheckedUpdateWithoutMembershipsInput>
  }

  export type UserUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipsInput
    upsert?: UserUpsertWithoutMembershipsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMembershipsInput, UserUpdateWithoutMembershipsInput>, UserUncheckedUpdateWithoutMembershipsInput>
  }

  export type TenantCreateNestedOneWithoutDocumentsInput = {
    create?: XOR<TenantCreateWithoutDocumentsInput, TenantUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutDocumentsInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutDocumentsNestedInput = {
    create?: XOR<TenantCreateWithoutDocumentsInput, TenantUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutDocumentsInput
    upsert?: TenantUpsertWithoutDocumentsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutDocumentsInput, TenantUpdateWithoutDocumentsInput>, TenantUncheckedUpdateWithoutDocumentsInput>
  }

  export type TenantAnalysisCreaterisksInput = {
    set: string[]
  }

  export type TenantAnalysisCreateopportunitiesInput = {
    set: string[]
  }

  export type TenantCreateNestedOneWithoutAnalysesInput = {
    create?: XOR<TenantCreateWithoutAnalysesInput, TenantUncheckedCreateWithoutAnalysesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutAnalysesInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantAnalysisUpdaterisksInput = {
    set?: string[]
    push?: string | string[]
  }

  export type TenantAnalysisUpdateopportunitiesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type TenantUpdateOneRequiredWithoutAnalysesNestedInput = {
    create?: XOR<TenantCreateWithoutAnalysesInput, TenantUncheckedCreateWithoutAnalysesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutAnalysesInput
    upsert?: TenantUpsertWithoutAnalysesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutAnalysesInput, TenantUpdateWithoutAnalysesInput>, TenantUncheckedUpdateWithoutAnalysesInput>
  }

  export type RecruitingCompanyProfileCreateNestedOneWithoutSearchInput = {
    create?: XOR<RecruitingCompanyProfileCreateWithoutSearchInput, RecruitingCompanyProfileUncheckedCreateWithoutSearchInput>
    connectOrCreate?: RecruitingCompanyProfileCreateOrConnectWithoutSearchInput
    connect?: RecruitingCompanyProfileWhereUniqueInput
  }

  export type RecruitingAttachmentCreateNestedManyWithoutSearchInput = {
    create?: XOR<RecruitingAttachmentCreateWithoutSearchInput, RecruitingAttachmentUncheckedCreateWithoutSearchInput> | RecruitingAttachmentCreateWithoutSearchInput[] | RecruitingAttachmentUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingAttachmentCreateOrConnectWithoutSearchInput | RecruitingAttachmentCreateOrConnectWithoutSearchInput[]
    createMany?: RecruitingAttachmentCreateManySearchInputEnvelope
    connect?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
  }

  export type RecruitingCandidateCreateNestedManyWithoutSearchInput = {
    create?: XOR<RecruitingCandidateCreateWithoutSearchInput, RecruitingCandidateUncheckedCreateWithoutSearchInput> | RecruitingCandidateCreateWithoutSearchInput[] | RecruitingCandidateUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingCandidateCreateOrConnectWithoutSearchInput | RecruitingCandidateCreateOrConnectWithoutSearchInput[]
    createMany?: RecruitingCandidateCreateManySearchInputEnvelope
    connect?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
  }

  export type RecruitingCompanyProfileUncheckedCreateNestedOneWithoutSearchInput = {
    create?: XOR<RecruitingCompanyProfileCreateWithoutSearchInput, RecruitingCompanyProfileUncheckedCreateWithoutSearchInput>
    connectOrCreate?: RecruitingCompanyProfileCreateOrConnectWithoutSearchInput
    connect?: RecruitingCompanyProfileWhereUniqueInput
  }

  export type RecruitingAttachmentUncheckedCreateNestedManyWithoutSearchInput = {
    create?: XOR<RecruitingAttachmentCreateWithoutSearchInput, RecruitingAttachmentUncheckedCreateWithoutSearchInput> | RecruitingAttachmentCreateWithoutSearchInput[] | RecruitingAttachmentUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingAttachmentCreateOrConnectWithoutSearchInput | RecruitingAttachmentCreateOrConnectWithoutSearchInput[]
    createMany?: RecruitingAttachmentCreateManySearchInputEnvelope
    connect?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
  }

  export type RecruitingCandidateUncheckedCreateNestedManyWithoutSearchInput = {
    create?: XOR<RecruitingCandidateCreateWithoutSearchInput, RecruitingCandidateUncheckedCreateWithoutSearchInput> | RecruitingCandidateCreateWithoutSearchInput[] | RecruitingCandidateUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingCandidateCreateOrConnectWithoutSearchInput | RecruitingCandidateCreateOrConnectWithoutSearchInput[]
    createMany?: RecruitingCandidateCreateManySearchInputEnvelope
    connect?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
  }

  export type RecruitingCompanyProfileUpdateOneWithoutSearchNestedInput = {
    create?: XOR<RecruitingCompanyProfileCreateWithoutSearchInput, RecruitingCompanyProfileUncheckedCreateWithoutSearchInput>
    connectOrCreate?: RecruitingCompanyProfileCreateOrConnectWithoutSearchInput
    upsert?: RecruitingCompanyProfileUpsertWithoutSearchInput
    disconnect?: RecruitingCompanyProfileWhereInput | boolean
    delete?: RecruitingCompanyProfileWhereInput | boolean
    connect?: RecruitingCompanyProfileWhereUniqueInput
    update?: XOR<XOR<RecruitingCompanyProfileUpdateToOneWithWhereWithoutSearchInput, RecruitingCompanyProfileUpdateWithoutSearchInput>, RecruitingCompanyProfileUncheckedUpdateWithoutSearchInput>
  }

  export type RecruitingAttachmentUpdateManyWithoutSearchNestedInput = {
    create?: XOR<RecruitingAttachmentCreateWithoutSearchInput, RecruitingAttachmentUncheckedCreateWithoutSearchInput> | RecruitingAttachmentCreateWithoutSearchInput[] | RecruitingAttachmentUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingAttachmentCreateOrConnectWithoutSearchInput | RecruitingAttachmentCreateOrConnectWithoutSearchInput[]
    upsert?: RecruitingAttachmentUpsertWithWhereUniqueWithoutSearchInput | RecruitingAttachmentUpsertWithWhereUniqueWithoutSearchInput[]
    createMany?: RecruitingAttachmentCreateManySearchInputEnvelope
    set?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    disconnect?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    delete?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    connect?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    update?: RecruitingAttachmentUpdateWithWhereUniqueWithoutSearchInput | RecruitingAttachmentUpdateWithWhereUniqueWithoutSearchInput[]
    updateMany?: RecruitingAttachmentUpdateManyWithWhereWithoutSearchInput | RecruitingAttachmentUpdateManyWithWhereWithoutSearchInput[]
    deleteMany?: RecruitingAttachmentScalarWhereInput | RecruitingAttachmentScalarWhereInput[]
  }

  export type RecruitingCandidateUpdateManyWithoutSearchNestedInput = {
    create?: XOR<RecruitingCandidateCreateWithoutSearchInput, RecruitingCandidateUncheckedCreateWithoutSearchInput> | RecruitingCandidateCreateWithoutSearchInput[] | RecruitingCandidateUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingCandidateCreateOrConnectWithoutSearchInput | RecruitingCandidateCreateOrConnectWithoutSearchInput[]
    upsert?: RecruitingCandidateUpsertWithWhereUniqueWithoutSearchInput | RecruitingCandidateUpsertWithWhereUniqueWithoutSearchInput[]
    createMany?: RecruitingCandidateCreateManySearchInputEnvelope
    set?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    disconnect?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    delete?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    connect?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    update?: RecruitingCandidateUpdateWithWhereUniqueWithoutSearchInput | RecruitingCandidateUpdateWithWhereUniqueWithoutSearchInput[]
    updateMany?: RecruitingCandidateUpdateManyWithWhereWithoutSearchInput | RecruitingCandidateUpdateManyWithWhereWithoutSearchInput[]
    deleteMany?: RecruitingCandidateScalarWhereInput | RecruitingCandidateScalarWhereInput[]
  }

  export type RecruitingCompanyProfileUncheckedUpdateOneWithoutSearchNestedInput = {
    create?: XOR<RecruitingCompanyProfileCreateWithoutSearchInput, RecruitingCompanyProfileUncheckedCreateWithoutSearchInput>
    connectOrCreate?: RecruitingCompanyProfileCreateOrConnectWithoutSearchInput
    upsert?: RecruitingCompanyProfileUpsertWithoutSearchInput
    disconnect?: RecruitingCompanyProfileWhereInput | boolean
    delete?: RecruitingCompanyProfileWhereInput | boolean
    connect?: RecruitingCompanyProfileWhereUniqueInput
    update?: XOR<XOR<RecruitingCompanyProfileUpdateToOneWithWhereWithoutSearchInput, RecruitingCompanyProfileUpdateWithoutSearchInput>, RecruitingCompanyProfileUncheckedUpdateWithoutSearchInput>
  }

  export type RecruitingAttachmentUncheckedUpdateManyWithoutSearchNestedInput = {
    create?: XOR<RecruitingAttachmentCreateWithoutSearchInput, RecruitingAttachmentUncheckedCreateWithoutSearchInput> | RecruitingAttachmentCreateWithoutSearchInput[] | RecruitingAttachmentUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingAttachmentCreateOrConnectWithoutSearchInput | RecruitingAttachmentCreateOrConnectWithoutSearchInput[]
    upsert?: RecruitingAttachmentUpsertWithWhereUniqueWithoutSearchInput | RecruitingAttachmentUpsertWithWhereUniqueWithoutSearchInput[]
    createMany?: RecruitingAttachmentCreateManySearchInputEnvelope
    set?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    disconnect?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    delete?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    connect?: RecruitingAttachmentWhereUniqueInput | RecruitingAttachmentWhereUniqueInput[]
    update?: RecruitingAttachmentUpdateWithWhereUniqueWithoutSearchInput | RecruitingAttachmentUpdateWithWhereUniqueWithoutSearchInput[]
    updateMany?: RecruitingAttachmentUpdateManyWithWhereWithoutSearchInput | RecruitingAttachmentUpdateManyWithWhereWithoutSearchInput[]
    deleteMany?: RecruitingAttachmentScalarWhereInput | RecruitingAttachmentScalarWhereInput[]
  }

  export type RecruitingCandidateUncheckedUpdateManyWithoutSearchNestedInput = {
    create?: XOR<RecruitingCandidateCreateWithoutSearchInput, RecruitingCandidateUncheckedCreateWithoutSearchInput> | RecruitingCandidateCreateWithoutSearchInput[] | RecruitingCandidateUncheckedCreateWithoutSearchInput[]
    connectOrCreate?: RecruitingCandidateCreateOrConnectWithoutSearchInput | RecruitingCandidateCreateOrConnectWithoutSearchInput[]
    upsert?: RecruitingCandidateUpsertWithWhereUniqueWithoutSearchInput | RecruitingCandidateUpsertWithWhereUniqueWithoutSearchInput[]
    createMany?: RecruitingCandidateCreateManySearchInputEnvelope
    set?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    disconnect?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    delete?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    connect?: RecruitingCandidateWhereUniqueInput | RecruitingCandidateWhereUniqueInput[]
    update?: RecruitingCandidateUpdateWithWhereUniqueWithoutSearchInput | RecruitingCandidateUpdateWithWhereUniqueWithoutSearchInput[]
    updateMany?: RecruitingCandidateUpdateManyWithWhereWithoutSearchInput | RecruitingCandidateUpdateManyWithWhereWithoutSearchInput[]
    deleteMany?: RecruitingCandidateScalarWhereInput | RecruitingCandidateScalarWhereInput[]
  }

  export type RecruitingSearchCreateNestedOneWithoutCompanyProfileInput = {
    create?: XOR<RecruitingSearchCreateWithoutCompanyProfileInput, RecruitingSearchUncheckedCreateWithoutCompanyProfileInput>
    connectOrCreate?: RecruitingSearchCreateOrConnectWithoutCompanyProfileInput
    connect?: RecruitingSearchWhereUniqueInput
  }

  export type RecruitingSearchUpdateOneRequiredWithoutCompanyProfileNestedInput = {
    create?: XOR<RecruitingSearchCreateWithoutCompanyProfileInput, RecruitingSearchUncheckedCreateWithoutCompanyProfileInput>
    connectOrCreate?: RecruitingSearchCreateOrConnectWithoutCompanyProfileInput
    upsert?: RecruitingSearchUpsertWithoutCompanyProfileInput
    connect?: RecruitingSearchWhereUniqueInput
    update?: XOR<XOR<RecruitingSearchUpdateToOneWithWhereWithoutCompanyProfileInput, RecruitingSearchUpdateWithoutCompanyProfileInput>, RecruitingSearchUncheckedUpdateWithoutCompanyProfileInput>
  }

  export type RecruitingSearchCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<RecruitingSearchCreateWithoutAttachmentsInput, RecruitingSearchUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: RecruitingSearchCreateOrConnectWithoutAttachmentsInput
    connect?: RecruitingSearchWhereUniqueInput
  }

  export type RecruitingSearchUpdateOneRequiredWithoutAttachmentsNestedInput = {
    create?: XOR<RecruitingSearchCreateWithoutAttachmentsInput, RecruitingSearchUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: RecruitingSearchCreateOrConnectWithoutAttachmentsInput
    upsert?: RecruitingSearchUpsertWithoutAttachmentsInput
    connect?: RecruitingSearchWhereUniqueInput
    update?: XOR<XOR<RecruitingSearchUpdateToOneWithWhereWithoutAttachmentsInput, RecruitingSearchUpdateWithoutAttachmentsInput>, RecruitingSearchUncheckedUpdateWithoutAttachmentsInput>
  }

  export type RecruitingSearchCreateNestedOneWithoutCandidatesInput = {
    create?: XOR<RecruitingSearchCreateWithoutCandidatesInput, RecruitingSearchUncheckedCreateWithoutCandidatesInput>
    connectOrCreate?: RecruitingSearchCreateOrConnectWithoutCandidatesInput
    connect?: RecruitingSearchWhereUniqueInput
  }

  export type RecruitingSearchUpdateOneRequiredWithoutCandidatesNestedInput = {
    create?: XOR<RecruitingSearchCreateWithoutCandidatesInput, RecruitingSearchUncheckedCreateWithoutCandidatesInput>
    connectOrCreate?: RecruitingSearchCreateOrConnectWithoutCandidatesInput
    upsert?: RecruitingSearchUpsertWithoutCandidatesInput
    connect?: RecruitingSearchWhereUniqueInput
    update?: XOR<XOR<RecruitingSearchUpdateToOneWithWhereWithoutCandidatesInput, RecruitingSearchUpdateWithoutCandidatesInput>, RecruitingSearchUncheckedUpdateWithoutCandidatesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type NestedEnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumMembershipRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleFilter<$PrismaModel> | $Enums.MembershipRole
  }

  export type NestedEnumMembershipRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleWithAggregatesFilter<$PrismaModel> | $Enums.MembershipRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMembershipRoleFilter<$PrismaModel>
    _max?: NestedEnumMembershipRoleFilter<$PrismaModel>
  }

  export type TenantMembershipCreateWithoutUserInput = {
    id?: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutMembershipsInput
  }

  export type TenantMembershipUncheckedCreateWithoutUserInput = {
    id?: string
    tenantId: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantMembershipCreateOrConnectWithoutUserInput = {
    where: TenantMembershipWhereUniqueInput
    create: XOR<TenantMembershipCreateWithoutUserInput, TenantMembershipUncheckedCreateWithoutUserInput>
  }

  export type TenantMembershipCreateManyUserInputEnvelope = {
    data: TenantMembershipCreateManyUserInput | TenantMembershipCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TenantMembershipUpsertWithWhereUniqueWithoutUserInput = {
    where: TenantMembershipWhereUniqueInput
    update: XOR<TenantMembershipUpdateWithoutUserInput, TenantMembershipUncheckedUpdateWithoutUserInput>
    create: XOR<TenantMembershipCreateWithoutUserInput, TenantMembershipUncheckedCreateWithoutUserInput>
  }

  export type TenantMembershipUpdateWithWhereUniqueWithoutUserInput = {
    where: TenantMembershipWhereUniqueInput
    data: XOR<TenantMembershipUpdateWithoutUserInput, TenantMembershipUncheckedUpdateWithoutUserInput>
  }

  export type TenantMembershipUpdateManyWithWhereWithoutUserInput = {
    where: TenantMembershipScalarWhereInput
    data: XOR<TenantMembershipUpdateManyMutationInput, TenantMembershipUncheckedUpdateManyWithoutUserInput>
  }

  export type TenantMembershipScalarWhereInput = {
    AND?: TenantMembershipScalarWhereInput | TenantMembershipScalarWhereInput[]
    OR?: TenantMembershipScalarWhereInput[]
    NOT?: TenantMembershipScalarWhereInput | TenantMembershipScalarWhereInput[]
    id?: StringFilter<"TenantMembership"> | string
    tenantId?: StringFilter<"TenantMembership"> | string
    userId?: StringFilter<"TenantMembership"> | string
    role?: EnumMembershipRoleFilter<"TenantMembership"> | $Enums.MembershipRole
    createdAt?: DateTimeFilter<"TenantMembership"> | Date | string
    updatedAt?: DateTimeFilter<"TenantMembership"> | Date | string
  }

  export type TenantDocumentCreateWithoutTenantInput = {
    id?: string
    category: string
    title: string
    description: string
    status: string
    source: string
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantDocumentUncheckedCreateWithoutTenantInput = {
    id?: string
    category: string
    title: string
    description: string
    status: string
    source: string
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantDocumentCreateOrConnectWithoutTenantInput = {
    where: TenantDocumentWhereUniqueInput
    create: XOR<TenantDocumentCreateWithoutTenantInput, TenantDocumentUncheckedCreateWithoutTenantInput>
  }

  export type TenantDocumentCreateManyTenantInputEnvelope = {
    data: TenantDocumentCreateManyTenantInput | TenantDocumentCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantAnalysisCreateWithoutTenantInput = {
    id?: string
    mode: string
    summary: string
    risks?: TenantAnalysisCreaterisksInput | string[]
    opportunities?: TenantAnalysisCreateopportunitiesInput | string[]
    priority?: string | null
    globalScore: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisUncheckedCreateWithoutTenantInput = {
    id?: string
    mode: string
    summary: string
    risks?: TenantAnalysisCreaterisksInput | string[]
    opportunities?: TenantAnalysisCreateopportunitiesInput | string[]
    priority?: string | null
    globalScore: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisCreateOrConnectWithoutTenantInput = {
    where: TenantAnalysisWhereUniqueInput
    create: XOR<TenantAnalysisCreateWithoutTenantInput, TenantAnalysisUncheckedCreateWithoutTenantInput>
  }

  export type TenantAnalysisCreateManyTenantInputEnvelope = {
    data: TenantAnalysisCreateManyTenantInput | TenantAnalysisCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantMembershipCreateWithoutTenantInput = {
    id?: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMembershipsInput
  }

  export type TenantMembershipUncheckedCreateWithoutTenantInput = {
    id?: string
    userId: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantMembershipCreateOrConnectWithoutTenantInput = {
    where: TenantMembershipWhereUniqueInput
    create: XOR<TenantMembershipCreateWithoutTenantInput, TenantMembershipUncheckedCreateWithoutTenantInput>
  }

  export type TenantMembershipCreateManyTenantInputEnvelope = {
    data: TenantMembershipCreateManyTenantInput | TenantMembershipCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantDocumentUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantDocumentWhereUniqueInput
    update: XOR<TenantDocumentUpdateWithoutTenantInput, TenantDocumentUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantDocumentCreateWithoutTenantInput, TenantDocumentUncheckedCreateWithoutTenantInput>
  }

  export type TenantDocumentUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantDocumentWhereUniqueInput
    data: XOR<TenantDocumentUpdateWithoutTenantInput, TenantDocumentUncheckedUpdateWithoutTenantInput>
  }

  export type TenantDocumentUpdateManyWithWhereWithoutTenantInput = {
    where: TenantDocumentScalarWhereInput
    data: XOR<TenantDocumentUpdateManyMutationInput, TenantDocumentUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantDocumentScalarWhereInput = {
    AND?: TenantDocumentScalarWhereInput | TenantDocumentScalarWhereInput[]
    OR?: TenantDocumentScalarWhereInput[]
    NOT?: TenantDocumentScalarWhereInput | TenantDocumentScalarWhereInput[]
    id?: StringFilter<"TenantDocument"> | string
    tenantId?: StringFilter<"TenantDocument"> | string
    category?: StringFilter<"TenantDocument"> | string
    title?: StringFilter<"TenantDocument"> | string
    description?: StringFilter<"TenantDocument"> | string
    status?: StringFilter<"TenantDocument"> | string
    source?: StringFilter<"TenantDocument"> | string
    fileUrl?: StringNullableFilter<"TenantDocument"> | string | null
    fileName?: StringNullableFilter<"TenantDocument"> | string | null
    createdAt?: DateTimeFilter<"TenantDocument"> | Date | string
    updatedAt?: DateTimeFilter<"TenantDocument"> | Date | string
  }

  export type TenantAnalysisUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantAnalysisWhereUniqueInput
    update: XOR<TenantAnalysisUpdateWithoutTenantInput, TenantAnalysisUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantAnalysisCreateWithoutTenantInput, TenantAnalysisUncheckedCreateWithoutTenantInput>
  }

  export type TenantAnalysisUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantAnalysisWhereUniqueInput
    data: XOR<TenantAnalysisUpdateWithoutTenantInput, TenantAnalysisUncheckedUpdateWithoutTenantInput>
  }

  export type TenantAnalysisUpdateManyWithWhereWithoutTenantInput = {
    where: TenantAnalysisScalarWhereInput
    data: XOR<TenantAnalysisUpdateManyMutationInput, TenantAnalysisUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantAnalysisScalarWhereInput = {
    AND?: TenantAnalysisScalarWhereInput | TenantAnalysisScalarWhereInput[]
    OR?: TenantAnalysisScalarWhereInput[]
    NOT?: TenantAnalysisScalarWhereInput | TenantAnalysisScalarWhereInput[]
    id?: StringFilter<"TenantAnalysis"> | string
    tenantId?: StringFilter<"TenantAnalysis"> | string
    mode?: StringFilter<"TenantAnalysis"> | string
    summary?: StringFilter<"TenantAnalysis"> | string
    risks?: StringNullableListFilter<"TenantAnalysis">
    opportunities?: StringNullableListFilter<"TenantAnalysis">
    priority?: StringNullableFilter<"TenantAnalysis"> | string | null
    globalScore?: IntFilter<"TenantAnalysis"> | number
    createdAt?: DateTimeFilter<"TenantAnalysis"> | Date | string
    updatedAt?: DateTimeFilter<"TenantAnalysis"> | Date | string
    rawData?: JsonNullableFilter<"TenantAnalysis">
  }

  export type TenantMembershipUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantMembershipWhereUniqueInput
    update: XOR<TenantMembershipUpdateWithoutTenantInput, TenantMembershipUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantMembershipCreateWithoutTenantInput, TenantMembershipUncheckedCreateWithoutTenantInput>
  }

  export type TenantMembershipUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantMembershipWhereUniqueInput
    data: XOR<TenantMembershipUpdateWithoutTenantInput, TenantMembershipUncheckedUpdateWithoutTenantInput>
  }

  export type TenantMembershipUpdateManyWithWhereWithoutTenantInput = {
    where: TenantMembershipScalarWhereInput
    data: XOR<TenantMembershipUpdateManyMutationInput, TenantMembershipUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantCreateWithoutMembershipsInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: TenantDocumentCreateNestedManyWithoutTenantInput
    analyses?: TenantAnalysisCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutMembershipsInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: TenantDocumentUncheckedCreateNestedManyWithoutTenantInput
    analyses?: TenantAnalysisUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutMembershipsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutMembershipsInput, TenantUncheckedCreateWithoutMembershipsInput>
  }

  export type UserCreateWithoutMembershipsInput = {
    id?: string
    email: string
    fullName?: string | null
    passwordHash?: string | null
    status?: $Enums.UserStatus
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutMembershipsInput = {
    id?: string
    email: string
    fullName?: string | null
    passwordHash?: string | null
    status?: $Enums.UserStatus
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutMembershipsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
  }

  export type TenantUpsertWithoutMembershipsInput = {
    update: XOR<TenantUpdateWithoutMembershipsInput, TenantUncheckedUpdateWithoutMembershipsInput>
    create: XOR<TenantCreateWithoutMembershipsInput, TenantUncheckedCreateWithoutMembershipsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutMembershipsInput, TenantUncheckedUpdateWithoutMembershipsInput>
  }

  export type TenantUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: TenantDocumentUpdateManyWithoutTenantNestedInput
    analyses?: TenantAnalysisUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: TenantDocumentUncheckedUpdateManyWithoutTenantNestedInput
    analyses?: TenantAnalysisUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type UserUpsertWithoutMembershipsInput = {
    update: XOR<UserUpdateWithoutMembershipsInput, UserUncheckedUpdateWithoutMembershipsInput>
    create: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMembershipsInput, UserUncheckedUpdateWithoutMembershipsInput>
  }

  export type UserUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateWithoutDocumentsInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    analyses?: TenantAnalysisCreateNestedManyWithoutTenantInput
    memberships?: TenantMembershipCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutDocumentsInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    analyses?: TenantAnalysisUncheckedCreateNestedManyWithoutTenantInput
    memberships?: TenantMembershipUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutDocumentsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutDocumentsInput, TenantUncheckedCreateWithoutDocumentsInput>
  }

  export type TenantUpsertWithoutDocumentsInput = {
    update: XOR<TenantUpdateWithoutDocumentsInput, TenantUncheckedUpdateWithoutDocumentsInput>
    create: XOR<TenantCreateWithoutDocumentsInput, TenantUncheckedCreateWithoutDocumentsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutDocumentsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutDocumentsInput, TenantUncheckedUpdateWithoutDocumentsInput>
  }

  export type TenantUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyses?: TenantAnalysisUpdateManyWithoutTenantNestedInput
    memberships?: TenantMembershipUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyses?: TenantAnalysisUncheckedUpdateManyWithoutTenantNestedInput
    memberships?: TenantMembershipUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateWithoutAnalysesInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: TenantDocumentCreateNestedManyWithoutTenantInput
    memberships?: TenantMembershipCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutAnalysesInput = {
    id?: string
    slug: string
    name: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: TenantDocumentUncheckedCreateNestedManyWithoutTenantInput
    memberships?: TenantMembershipUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutAnalysesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutAnalysesInput, TenantUncheckedCreateWithoutAnalysesInput>
  }

  export type TenantUpsertWithoutAnalysesInput = {
    update: XOR<TenantUpdateWithoutAnalysesInput, TenantUncheckedUpdateWithoutAnalysesInput>
    create: XOR<TenantCreateWithoutAnalysesInput, TenantUncheckedCreateWithoutAnalysesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutAnalysesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutAnalysesInput, TenantUncheckedUpdateWithoutAnalysesInput>
  }

  export type TenantUpdateWithoutAnalysesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: TenantDocumentUpdateManyWithoutTenantNestedInput
    memberships?: TenantMembershipUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutAnalysesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: TenantDocumentUncheckedUpdateManyWithoutTenantNestedInput
    memberships?: TenantMembershipUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type RecruitingCompanyProfileCreateWithoutSearchInput = {
    id?: string
    razonSocial?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecruitingCompanyProfileUncheckedCreateWithoutSearchInput = {
    id?: string
    razonSocial?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecruitingCompanyProfileCreateOrConnectWithoutSearchInput = {
    where: RecruitingCompanyProfileWhereUniqueInput
    create: XOR<RecruitingCompanyProfileCreateWithoutSearchInput, RecruitingCompanyProfileUncheckedCreateWithoutSearchInput>
  }

  export type RecruitingAttachmentCreateWithoutSearchInput = {
    id?: string
    createdAt?: Date | string
  }

  export type RecruitingAttachmentUncheckedCreateWithoutSearchInput = {
    id?: string
    createdAt?: Date | string
  }

  export type RecruitingAttachmentCreateOrConnectWithoutSearchInput = {
    where: RecruitingAttachmentWhereUniqueInput
    create: XOR<RecruitingAttachmentCreateWithoutSearchInput, RecruitingAttachmentUncheckedCreateWithoutSearchInput>
  }

  export type RecruitingAttachmentCreateManySearchInputEnvelope = {
    data: RecruitingAttachmentCreateManySearchInput | RecruitingAttachmentCreateManySearchInput[]
    skipDuplicates?: boolean
  }

  export type RecruitingCandidateCreateWithoutSearchInput = {
    id?: string
    candidateCode?: string | null
    fullName?: string | null
    email?: string | null
    receivedAt?: Date | string
  }

  export type RecruitingCandidateUncheckedCreateWithoutSearchInput = {
    id?: string
    candidateCode?: string | null
    fullName?: string | null
    email?: string | null
    receivedAt?: Date | string
  }

  export type RecruitingCandidateCreateOrConnectWithoutSearchInput = {
    where: RecruitingCandidateWhereUniqueInput
    create: XOR<RecruitingCandidateCreateWithoutSearchInput, RecruitingCandidateUncheckedCreateWithoutSearchInput>
  }

  export type RecruitingCandidateCreateManySearchInputEnvelope = {
    data: RecruitingCandidateCreateManySearchInput | RecruitingCandidateCreateManySearchInput[]
    skipDuplicates?: boolean
  }

  export type RecruitingCompanyProfileUpsertWithoutSearchInput = {
    update: XOR<RecruitingCompanyProfileUpdateWithoutSearchInput, RecruitingCompanyProfileUncheckedUpdateWithoutSearchInput>
    create: XOR<RecruitingCompanyProfileCreateWithoutSearchInput, RecruitingCompanyProfileUncheckedCreateWithoutSearchInput>
    where?: RecruitingCompanyProfileWhereInput
  }

  export type RecruitingCompanyProfileUpdateToOneWithWhereWithoutSearchInput = {
    where?: RecruitingCompanyProfileWhereInput
    data: XOR<RecruitingCompanyProfileUpdateWithoutSearchInput, RecruitingCompanyProfileUncheckedUpdateWithoutSearchInput>
  }

  export type RecruitingCompanyProfileUpdateWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCompanyProfileUncheckedUpdateWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingAttachmentUpsertWithWhereUniqueWithoutSearchInput = {
    where: RecruitingAttachmentWhereUniqueInput
    update: XOR<RecruitingAttachmentUpdateWithoutSearchInput, RecruitingAttachmentUncheckedUpdateWithoutSearchInput>
    create: XOR<RecruitingAttachmentCreateWithoutSearchInput, RecruitingAttachmentUncheckedCreateWithoutSearchInput>
  }

  export type RecruitingAttachmentUpdateWithWhereUniqueWithoutSearchInput = {
    where: RecruitingAttachmentWhereUniqueInput
    data: XOR<RecruitingAttachmentUpdateWithoutSearchInput, RecruitingAttachmentUncheckedUpdateWithoutSearchInput>
  }

  export type RecruitingAttachmentUpdateManyWithWhereWithoutSearchInput = {
    where: RecruitingAttachmentScalarWhereInput
    data: XOR<RecruitingAttachmentUpdateManyMutationInput, RecruitingAttachmentUncheckedUpdateManyWithoutSearchInput>
  }

  export type RecruitingAttachmentScalarWhereInput = {
    AND?: RecruitingAttachmentScalarWhereInput | RecruitingAttachmentScalarWhereInput[]
    OR?: RecruitingAttachmentScalarWhereInput[]
    NOT?: RecruitingAttachmentScalarWhereInput | RecruitingAttachmentScalarWhereInput[]
    id?: StringFilter<"RecruitingAttachment"> | string
    searchId?: StringFilter<"RecruitingAttachment"> | string
    createdAt?: DateTimeFilter<"RecruitingAttachment"> | Date | string
  }

  export type RecruitingCandidateUpsertWithWhereUniqueWithoutSearchInput = {
    where: RecruitingCandidateWhereUniqueInput
    update: XOR<RecruitingCandidateUpdateWithoutSearchInput, RecruitingCandidateUncheckedUpdateWithoutSearchInput>
    create: XOR<RecruitingCandidateCreateWithoutSearchInput, RecruitingCandidateUncheckedCreateWithoutSearchInput>
  }

  export type RecruitingCandidateUpdateWithWhereUniqueWithoutSearchInput = {
    where: RecruitingCandidateWhereUniqueInput
    data: XOR<RecruitingCandidateUpdateWithoutSearchInput, RecruitingCandidateUncheckedUpdateWithoutSearchInput>
  }

  export type RecruitingCandidateUpdateManyWithWhereWithoutSearchInput = {
    where: RecruitingCandidateScalarWhereInput
    data: XOR<RecruitingCandidateUpdateManyMutationInput, RecruitingCandidateUncheckedUpdateManyWithoutSearchInput>
  }

  export type RecruitingCandidateScalarWhereInput = {
    AND?: RecruitingCandidateScalarWhereInput | RecruitingCandidateScalarWhereInput[]
    OR?: RecruitingCandidateScalarWhereInput[]
    NOT?: RecruitingCandidateScalarWhereInput | RecruitingCandidateScalarWhereInput[]
    id?: StringFilter<"RecruitingCandidate"> | string
    searchId?: StringFilter<"RecruitingCandidate"> | string
    candidateCode?: StringNullableFilter<"RecruitingCandidate"> | string | null
    fullName?: StringNullableFilter<"RecruitingCandidate"> | string | null
    email?: StringNullableFilter<"RecruitingCandidate"> | string | null
    receivedAt?: DateTimeFilter<"RecruitingCandidate"> | Date | string
  }

  export type RecruitingSearchCreateWithoutCompanyProfileInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: RecruitingAttachmentCreateNestedManyWithoutSearchInput
    candidates?: RecruitingCandidateCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchUncheckedCreateWithoutCompanyProfileInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: RecruitingAttachmentUncheckedCreateNestedManyWithoutSearchInput
    candidates?: RecruitingCandidateUncheckedCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchCreateOrConnectWithoutCompanyProfileInput = {
    where: RecruitingSearchWhereUniqueInput
    create: XOR<RecruitingSearchCreateWithoutCompanyProfileInput, RecruitingSearchUncheckedCreateWithoutCompanyProfileInput>
  }

  export type RecruitingSearchUpsertWithoutCompanyProfileInput = {
    update: XOR<RecruitingSearchUpdateWithoutCompanyProfileInput, RecruitingSearchUncheckedUpdateWithoutCompanyProfileInput>
    create: XOR<RecruitingSearchCreateWithoutCompanyProfileInput, RecruitingSearchUncheckedCreateWithoutCompanyProfileInput>
    where?: RecruitingSearchWhereInput
  }

  export type RecruitingSearchUpdateToOneWithWhereWithoutCompanyProfileInput = {
    where?: RecruitingSearchWhereInput
    data: XOR<RecruitingSearchUpdateWithoutCompanyProfileInput, RecruitingSearchUncheckedUpdateWithoutCompanyProfileInput>
  }

  export type RecruitingSearchUpdateWithoutCompanyProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: RecruitingAttachmentUpdateManyWithoutSearchNestedInput
    candidates?: RecruitingCandidateUpdateManyWithoutSearchNestedInput
  }

  export type RecruitingSearchUncheckedUpdateWithoutCompanyProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: RecruitingAttachmentUncheckedUpdateManyWithoutSearchNestedInput
    candidates?: RecruitingCandidateUncheckedUpdateManyWithoutSearchNestedInput
  }

  export type RecruitingSearchCreateWithoutAttachmentsInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    companyProfile?: RecruitingCompanyProfileCreateNestedOneWithoutSearchInput
    candidates?: RecruitingCandidateCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchUncheckedCreateWithoutAttachmentsInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    companyProfile?: RecruitingCompanyProfileUncheckedCreateNestedOneWithoutSearchInput
    candidates?: RecruitingCandidateUncheckedCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchCreateOrConnectWithoutAttachmentsInput = {
    where: RecruitingSearchWhereUniqueInput
    create: XOR<RecruitingSearchCreateWithoutAttachmentsInput, RecruitingSearchUncheckedCreateWithoutAttachmentsInput>
  }

  export type RecruitingSearchUpsertWithoutAttachmentsInput = {
    update: XOR<RecruitingSearchUpdateWithoutAttachmentsInput, RecruitingSearchUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<RecruitingSearchCreateWithoutAttachmentsInput, RecruitingSearchUncheckedCreateWithoutAttachmentsInput>
    where?: RecruitingSearchWhereInput
  }

  export type RecruitingSearchUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: RecruitingSearchWhereInput
    data: XOR<RecruitingSearchUpdateWithoutAttachmentsInput, RecruitingSearchUncheckedUpdateWithoutAttachmentsInput>
  }

  export type RecruitingSearchUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyProfile?: RecruitingCompanyProfileUpdateOneWithoutSearchNestedInput
    candidates?: RecruitingCandidateUpdateManyWithoutSearchNestedInput
  }

  export type RecruitingSearchUncheckedUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyProfile?: RecruitingCompanyProfileUncheckedUpdateOneWithoutSearchNestedInput
    candidates?: RecruitingCandidateUncheckedUpdateManyWithoutSearchNestedInput
  }

  export type RecruitingSearchCreateWithoutCandidatesInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    companyProfile?: RecruitingCompanyProfileCreateNestedOneWithoutSearchInput
    attachments?: RecruitingAttachmentCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchUncheckedCreateWithoutCandidatesInput = {
    id?: string
    tenantId: string
    createdById: string
    refCode: string
    title: string
    requestText: string
    status?: string
    monitoringStatus?: string | null
    area?: string | null
    seniority?: string | null
    modality?: string | null
    location?: string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    companyProfile?: RecruitingCompanyProfileUncheckedCreateNestedOneWithoutSearchInput
    attachments?: RecruitingAttachmentUncheckedCreateNestedManyWithoutSearchInput
  }

  export type RecruitingSearchCreateOrConnectWithoutCandidatesInput = {
    where: RecruitingSearchWhereUniqueInput
    create: XOR<RecruitingSearchCreateWithoutCandidatesInput, RecruitingSearchUncheckedCreateWithoutCandidatesInput>
  }

  export type RecruitingSearchUpsertWithoutCandidatesInput = {
    update: XOR<RecruitingSearchUpdateWithoutCandidatesInput, RecruitingSearchUncheckedUpdateWithoutCandidatesInput>
    create: XOR<RecruitingSearchCreateWithoutCandidatesInput, RecruitingSearchUncheckedCreateWithoutCandidatesInput>
    where?: RecruitingSearchWhereInput
  }

  export type RecruitingSearchUpdateToOneWithWhereWithoutCandidatesInput = {
    where?: RecruitingSearchWhereInput
    data: XOR<RecruitingSearchUpdateWithoutCandidatesInput, RecruitingSearchUncheckedUpdateWithoutCandidatesInput>
  }

  export type RecruitingSearchUpdateWithoutCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyProfile?: RecruitingCompanyProfileUpdateOneWithoutSearchNestedInput
    attachments?: RecruitingAttachmentUpdateManyWithoutSearchNestedInput
  }

  export type RecruitingSearchUncheckedUpdateWithoutCandidatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
    refCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    requestText?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    monitoringStatus?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    modality?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobProfileOutput?: NullableJsonNullValueInput | InputJsonValue
    idealCandidateOutput?: NullableJsonNullValueInput | InputJsonValue
    scoringCriteriaOutput?: NullableJsonNullValueInput | InputJsonValue
    publicationCopiesOutput?: NullableJsonNullValueInput | InputJsonValue
    aiGenerationLog?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyProfile?: RecruitingCompanyProfileUncheckedUpdateOneWithoutSearchNestedInput
    attachments?: RecruitingAttachmentUncheckedUpdateManyWithoutSearchNestedInput
  }

  export type TenantMembershipCreateManyUserInput = {
    id?: string
    tenantId: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantMembershipUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type TenantMembershipUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantMembershipUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantDocumentCreateManyTenantInput = {
    id?: string
    category: string
    title: string
    description: string
    status: string
    source: string
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantAnalysisCreateManyTenantInput = {
    id?: string
    mode: string
    summary: string
    risks?: TenantAnalysisCreaterisksInput | string[]
    opportunities?: TenantAnalysisCreateopportunitiesInput | string[]
    priority?: string | null
    globalScore: number
    createdAt?: Date | string
    updatedAt?: Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantMembershipCreateManyTenantInput = {
    id?: string
    userId: string
    role?: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantDocumentUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantDocumentUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantDocumentUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAnalysisUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    risks?: TenantAnalysisUpdaterisksInput | string[]
    opportunities?: TenantAnalysisUpdateopportunitiesInput | string[]
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    globalScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    risks?: TenantAnalysisUpdaterisksInput | string[]
    opportunities?: TenantAnalysisUpdateopportunitiesInput | string[]
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    globalScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantAnalysisUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    summary?: StringFieldUpdateOperationsInput | string
    risks?: TenantAnalysisUpdaterisksInput | string[]
    opportunities?: TenantAnalysisUpdateopportunitiesInput | string[]
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    globalScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rawData?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TenantMembershipUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type TenantMembershipUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantMembershipUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingAttachmentCreateManySearchInput = {
    id?: string
    createdAt?: Date | string
  }

  export type RecruitingCandidateCreateManySearchInput = {
    id?: string
    candidateCode?: string | null
    fullName?: string | null
    email?: string | null
    receivedAt?: Date | string
  }

  export type RecruitingAttachmentUpdateWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingAttachmentUncheckedUpdateWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingAttachmentUncheckedUpdateManyWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCandidateUpdateWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCandidateUncheckedUpdateWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecruitingCandidateUncheckedUpdateManyWithoutSearchInput = {
    id?: StringFieldUpdateOperationsInput | string
    candidateCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}