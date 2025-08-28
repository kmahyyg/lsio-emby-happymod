/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Router, cors, error, json } from 'itty-router';

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
		format: json,
		finally: [corsify],
});

// add status check
router.get('/ystatus', () => {
  return new Response('OK', { status: 200 });
});

// add echo check
router.post('/reqlog', (req) => {
	console.log({"oriReq": {"url": req.url, "headers": Object.fromEntries(req.headers), "body": btoa(req.body)}});
  	return new Response('Please check backend log', { status: 200 });
});

// add all related emby route
router.all('/admin/service/registration/validateDevice', () => {
	return json({"cacheExpirationDays":3650,"message":"Device Valid","resultCode":"GOOD"});
});

router.all('/admin/service/registration/validate', () => {
	return json({"featId":"MBSupporter","registered":true,"expDate":"2099-01-01","key":""});
});

router.all('/admin/service/registration/getStatus', () => {
	return json({"deviceStatus":"","planType":"Lifetime","subscriptions":{}});
});

router.all('/admin/service/appstore/register', () => {
	return json({"featId":"","registered":true,"expDate":"2099-01-01","key":""});
});

router.all('/emby/Plugins/SecurityInfo', () => {
	return json({"SupporterKey":"","IsMBSupporter":true});
});

// add fallback for all other routes
router.all('*', () => new Response('This page is intended left for blank.'));

export default { ...router };