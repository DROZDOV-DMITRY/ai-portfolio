import test from 'node:test';
import assert from 'node:assert/strict';
import {GET,POST,OPTIONS} from '../search-gateway/api/search.mjs';

test('GET health does not reveal secrets',async()=>{
 const r=await GET();const body=await r.json();assert.equal(r.status,200);assert.equal(body.connected,false);
});
test('POST disallows arbitrary origins',async()=>{
 const r=await POST(new Request('https://api.example/api/search',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:JSON.stringify({query:'приказ'})}));assert.equal(r.status,403);
});
test('POST refuses to consume GigaChat token before private configuration and approval',async()=>{
 const r=await POST(new Request('https://api.example/api/search',{method:'POST',headers:{origin:'https://drozdov-dmitry.github.io','content-type':'application/json'},body:JSON.stringify({query:'приказ'})}));assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'ai_not_configured'});
});
test('OPTIONS restricted to portfolio domain',async()=>{
 const good=await OPTIONS(new Request('https://api.example/api/search',{method:'OPTIONS',headers:{origin:'https://drozdov-dmitry.github.io'}}));const bad=await OPTIONS(new Request('https://api.example/api/search',{method:'OPTIONS',headers:{origin:'https://evil.example'}}));assert.equal(good.status,204);assert.equal(bad.status,403);
});
