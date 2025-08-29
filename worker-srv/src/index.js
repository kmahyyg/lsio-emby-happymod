/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Router, cors, error, json, withContent } from 'itty-router';
import { env } from "cloudflare:workers";
import { createHash } from "node:crypto"; 

const isDebug = (env.CUR_ENV === "troubleshoot");

// allow cors to any domain
const { preflight, corsify } = cors({
	origin: (orig) => orig || '*',
	credentials: true,
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	exposeHeaders: ['Authorization'],
	allowHeaders: '*',
	maxAge: 3600,
});

const router = Router({
	before: [preflight],
	catch: error,
	finally: [corsify],
});


// util function
async function aLogDetailedRequest(req) {
	var fBodyData;
	if (req.body instanceof ReadableStream) {
		let tmpResp = new Response(req.body);
		let tmpBodyTxt = await tmpResp.text();
		fBodyData = btoa(tmpBodyTxt);
	} else {
		fBodyData = "unknown-internal-error";
	}
	console.log({ "oriReq": { "url": req.url, "headers": Object.fromEntries(req.headers), "bodyB64": fBodyData } });
}

function logDetailedRequest(req) {
	aLogDetailedRequest(req).then(() => { });
}

// calc ret-key
function calcRetKey(fKey) {
	const hash = createHash('md5');
	hash.update(fKey, 'utf8');
	return hash.digest('hex').toUpperCase();
}

// add status check
router.get('/ystatus', () => {
	return new Response('OK', { status: 200 });
});

// add licgen for MBSupporter
router.get('/licgen', (req) => {
	if (isDebug) { logDetailedRequest(req); }
	// get params
	let reqU = new URL(req.url);
	let lType = reqU.searchParams.get("featId") ? reqU.searchParams.get("featId") : "MBSupporter";
	let fKey = reqU.searchParams.get("systemId");
	if (!fKey) {
		return new Response('SystemID is missing', { status: 400 });
	}
	//
	// mbSupporter Key Generator
	//
	// SystemID/DeviceID: private static string GetNewId() => Guid.NewGuid().ToString("N");
	// featID: MBSupporter
	// secret: Ae3#fP!wi (v4.9.1.23, exposed via environment variable C_HMAC_SECRET)
	//
	//.PHPMd5Hash($"{feature}{serverId}Ae3#fP!wi");
	//
	// using (MD5 md5 = MD5.Create())
	// {
	//     byte[] bytes = Encoding.UTF8.GetBytes(pass);
	//     return BitConverter.ToString(md5.ComputeHash(bytes)).Replace("-", "");
	// }
	//
	let curSysOriK = lType + fKey + env.C_HMAC_SECRET;
	let fRetKey = calcRetKey(curSysOriK);
	return json({ "key": fRetKey });
});

// add echo check
router.post('/reqlog', (req) => {
	logDetailedRequest(req);
	return new Response('Please check backend log', { status: 200 });
});

// add all related emby route
router.all('/admin/service/registration/validateDevice', (r) => {
	if (isDebug) { logDetailedRequest(r); }
	return json({ "cacheExpirationDays": 3650, "message": "Device Valid", "resultCode": "GOOD" });
});

router.all('/admin/service/registration/validate', withContent, (r) => {
	if (isDebug) { logDetailedRequest(r); }
	let fRetFeatId = r.content.feature ? r.content.feature : "MBSupporter";
	return json({ "featId": fRetFeatId, "registered": true, "expDate": "2099-01-01", "key": "" });
});

router.all('/admin/service/registration/getStatus', (r) => {
	if (isDebug) { logDetailedRequest(r); }
	return json({ "deviceStatus": "", "planType": "Lifetime", "subscriptions": {} });
});

router.all('/admin/service/appstore/register', withContent, (r) => {
	if (isDebug) { logDetailedRequest(r); }
	// unclear for body param name, just send response
	let fRetFeatId = r.content.feature ? r.content.feature : "";
	return json({ "featId": fRetFeatId, "registered": true, "expDate": "2099-01-01", "key": "" });
});

router.all('/emby/Plugins/SecurityInfo', (r) => {
	if (isDebug) { logDetailedRequest(r); }
	return json({ "SupporterKey": "", "IsMBSupporter": true });
});

// add fallback for all other routes
router.all('*', () => new Response('This page is intended left for blank.'));

export default { ...router };