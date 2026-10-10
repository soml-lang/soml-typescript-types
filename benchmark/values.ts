import type {SomlDuration, SomlInstant, SomlInteger} from '../index.js';

export type Small = {
	name: 'api-gateway';
	port: SomlInteger<'8080'>;
	healthy: true;
};

export type Medium = Small & {
	routes: ['/health', '/v1'];
	limits: {retries: SomlInteger<'3'>; timeout: SomlDuration<'30s'>};
	cache: {enabled: false; capacity: SomlInteger<'1_024'>};
	release: SomlInstant<'2026-10-10T00:00:00Z'>;
	ratio: 1.25;
	owner: null;
};

export type Boundary = Small & {
	limits: {retries: SomlInteger<'3'>; timeout: SomlDuration<'30s'>};
	trace: [[[[[[[[[[[[[[['request']]]]]]]]]]]]]]];
};

export type Realistic = {
	name: 'api-gateway';
	title: 'API 🚀';
	description: 'The public API gateway terminates TLS, checks request credentials, and dispatches each request to an explicitly configured upstream. Health checks are handled locally so a dependency outage does not make the process appear unavailable. Requests include a trace identifier that remains stable across retries and is recorded in the application logs.\nOperators deploy this configuration to the production edge cluster after reviewing the route changes and the release timestamp. A deployment first updates one instance, waits for its readiness probe, and then replaces the remaining instances in small batches. Connections already in flight are allowed to finish before the instance stops accepting work.\nRate limits apply independently to authenticated accounts and anonymous clients. The gateway reports the remaining allowance in response headers and returns an explicit retry interval when an allowance is exhausted. Internal monitoring requests use a separate allowance so alerts continue to function while customer traffic is being limited.\nAccess logs include the route name, the upstream status, the elapsed request time, and the selected deployment region. They exclude authorization headers, session cookies, and request bodies. Aggregated latency measurements are retained separately from the sampled request logs so operators can investigate a regression without storing sensitive payloads.\nWhen an upstream becomes unavailable, the gateway retries only requests whose methods and route policy permit repetition. It uses the configured timeout as an overall deadline rather than restarting the timer for every attempt. A request that cannot be retried returns a clear dependency failure while the health endpoint continues to report the gateway process state.';
	message: 'Deployment 🚀 is ready.\nRegion: eu-west\tStatus: healthy';
	release: SomlInstant<'2026-10-10T08:30:15.123456789+02:00'>;
	ports: [SomlInteger<'8080'>, SomlInteger<'8443'>];
	permissions: [SomlInteger<'0x1FF'>, SomlInteger<'0o755'>, SomlInteger<'0b1010'>];
	limits: {retries: SomlInteger<'3'>; timeout: SomlDuration<'1m30.5s'>; backoff: SomlDuration<'250ms'>; capacity: SomlInteger<'1_024'>};
	tls: {enabled: true; domains: ['api.example.com', 'edge.example.com']; minimum: '1.3'};
	routes: [
		{id: 'health'; method: 'GET'; path: '/health'; upstream: 'local'; auth: false; timeout: SomlDuration<'100ms'>},
		{id: 'users'; method: 'GET'; path: '/v1/users'; upstream: 'accounts'; auth: true; timeout: SomlDuration<'5s'>},
		{id: 'events'; method: 'POST'; path: '/v1/events'; upstream: 'ingestion'; auth: true; timeout: SomlDuration<'10s'>},
	];
	metadata: {'build.number': SomlInteger<'42'>; deployment: 'production'; maintainer: 'André'};
	ratio: 0.75;
	owner: null;
};

type NestedValue<Count extends number, Value, Depth extends unknown[] = []> = Depth['length'] extends Count ? Value : NestedValue<Count, [Value], [...Depth, 0]>;

export type Deep = NestedValue<100, true>;
